# Em: api-pousada/routes/reserva.py

from fastapi import APIRouter, Body, status, HTTPException, Response, Depends, Query # status foi importado
from models.reserva import Reserva, UpdateReserva
# ADICIONA collection_clientes novamente
from config.database import collection_reservas, collection_quartos, collection_clientes
from auth import get_current_user
from models.usuario import UsuarioInDB
from bson import ObjectId
from datetime import datetime
import calendar
# Imports nativos e de bibliotecas
import os
import shutil
# ADICIONE 'List' AQUI
from typing import List, Optional


router = APIRouter()

# --- FUNÇÃO HELPER (ATUALIZADA) ---
def reserva_helper(reserva) -> dict:
    # Garante que campos opcionais não causem erro se não existirem no documento
    return {
        "id": str(reserva["_id"]),
        "id_quarto": reserva.get("id_quarto"), # Usa get para segurança
        "id_cliente": reserva.get("id_cliente"), # REINTRODUZIDO
        "hospede_nome": reserva.get("hospede_nome"),
        "data_checkin": reserva.get("data_checkin"),
        "data_checkout": reserva.get("data_checkout"),
        "status": reserva.get("status"),
        "valor_total": reserva.get("valor_total"),
        "observacoes": reserva.get("observacoes"),
    }

# --- ROTA PARA O MAPA DE RESERVAS (Sem alterações na lógica principal) ---
@router.get("/mapa", response_description="Busca quartos e reservas para o mapa")
async def obter_dados_mapa(
    ano: int = Query(..., description="Ano para buscar as reservas"),
    mes: int = Query(..., description="Mês para buscar as reservas (1-12)"),
    current_user: UsuarioInDB = Depends(get_current_user)
):
    try:
        primeiro_dia = datetime(ano, mes, 1)
        # Calcula o último dia do mês corretamente
        ultimo_dia_num = calendar.monthrange(ano, mes)[1]
        ultimo_dia = datetime(ano, mes, ultimo_dia_num, 23, 59, 59) # Inclui o dia inteiro

        quartos_cursor = collection_quartos.find().sort("numero", 1)
        quartos_com_reservas = []

        for quarto in quartos_cursor:
            quarto_id_str = str(quarto["_id"])

            # Query ajustada para garantir que pegue reservas que terminam no dia 1
            query_reservas = {
                "id_quarto": quarto_id_str,
                "data_checkin": {"$lte": ultimo_dia}, # Check-in antes ou no fim do mês
                "data_checkout": {"$gt": primeiro_dia} # Check-out estritamente DEPOIS do início do mês
            }

            reservas_cursor = collection_reservas.find(query_reservas)

            reservas_para_mapa = []
            for reserva in reservas_cursor:
                # Usa o hospede_nome já guardado na reserva (mais eficiente)
                reservas_para_mapa.append({
                    "id": str(reserva["_id"]),
                    "hospede_nome": reserva.get("hospede_nome", "Hóspede"),
                    "data_checkin": reserva["data_checkin"].strftime("%Y-%m-%d"),
                    "data_checkout": reserva["data_checkout"].strftime("%Y-%m-%d"),
                    "status": reserva["status"],
                })

            quartos_com_reservas.append({
                "id": str(quarto["_id"]),
                "numero": quarto.get("numero"),
                "titulo": quarto.get("titulo"),
                "reservas": reservas_para_mapa
            })

        return quartos_com_reservas

    except Exception as e:
        # É uma boa prática logar o erro real no servidor
        print(f"Erro ao obter dados do mapa: {e}")
        raise HTTPException(status_code=500, detail="Ocorreu um erro interno ao buscar dados do mapa.")


# --- ROTAS DE CRUD (ATUALIZADAS COM id_cliente e hospede_nome automático) ---

@router.post("", status_code=status.HTTP_201_CREATED, response_model=dict) # Adicionado response_model para clareza
async def criar_reserva(reserva: Reserva = Body(...), current_user: UsuarioInDB = Depends(get_current_user)):
    # Validações de quarto e cliente
    if not ObjectId.is_valid(reserva.id_quarto): raise HTTPException(status_code=400, detail="ID do quarto inválido")
    if not ObjectId.is_valid(reserva.id_cliente): raise HTTPException(status_code=400, detail="ID do cliente inválido")

    quarto = collection_quartos.find_one({"_id": ObjectId(reserva.id_quarto)})
    if not quarto: raise HTTPException(status_code=404, detail=f"Quarto com ID {reserva.id_quarto} não encontrado.")
    cliente = collection_clientes.find_one({"_id": ObjectId(reserva.id_cliente)})
    if not cliente: raise HTTPException(status_code=404, detail=f"Cliente com ID {reserva.id_cliente} não encontrado.")

    # Validação de conflito
    conflito = collection_reservas.find_one({
        "id_quarto": reserva.id_quarto,
        "status": {"$in": ["Confirmada", "Pendente"]}, # Apenas reservas ativas conflitam
        "data_checkout": {"$gt": reserva.data_checkin}, # Termina DEPOIS que a nova começa
        "data_checkin": {"$lt": reserva.data_checkout}  # Começa ANTES que a nova termine
    })
    if conflito: raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Este quarto já está reservado para o período.")

    # Preenche hospede_nome automaticamente e insere
    reserva_dict = reserva.model_dump()
    reserva_dict["hospede_nome"] = cliente.get("nome", "Nome não encontrado") # Busca o nome do cliente

    try:
        resultado = collection_reservas.insert_one(reserva_dict)
    except Exception as e:
         print(f"Erro ao inserir reserva no DB: {e}")
         raise HTTPException(status_code=500, detail="Erro ao guardar a reserva.")

    # Atualiza status do quarto se a reserva for confirmada
    if reserva.status == "Confirmada":
        try:
            collection_quartos.update_one({"_id": ObjectId(reserva.id_quarto)}, {"$set": {"status": "ocupado"}})
        except Exception as e:
            # Logar o erro, mas não necessariamente impedir a criação da reserva
             print(f"Aviso: Falha ao atualizar status do quarto {reserva.id_quarto} para ocupado: {e}")

    reserva_criada = collection_reservas.find_one({"_id": resultado.inserted_id})
    if not reserva_criada: # Confirmação extra
        raise HTTPException(status_code=500, detail="Erro ao recuperar a reserva criada.")

    return reserva_helper(reserva_criada)

@router.get("", response_description="Lista todas as reservas", response_model=List[dict]) # Adicionado response_model
async def listar_reservas(current_user: UsuarioInDB = Depends(get_current_user)):
    return [reserva_helper(reserva) for reserva in collection_reservas.find()]

@router.get("/{id}", response_description="Busca uma reserva por ID", response_model=dict) # Adicionado response_model
async def buscar_reserva_por_id(id: str, current_user: UsuarioInDB = Depends(get_current_user)):
    if not ObjectId.is_valid(id): raise HTTPException(status_code=400, detail="ID da reserva inválido")
    reserva = collection_reservas.find_one({"_id": ObjectId(id)})
    if reserva: return reserva_helper(reserva)
    raise HTTPException(status_code=404, detail=f"Reserva com ID {id} não encontrada")

@router.put("/{id}", response_description="Atualiza uma reserva", response_model=dict) # Adicionado response_model
async def atualizar_reserva(id: str, data: UpdateReserva = Body(...), current_user: UsuarioInDB = Depends(get_current_user)):
    if not ObjectId.is_valid(id): raise HTTPException(status_code=400, detail="ID da reserva inválido")
    dados_para_atualizar = {k: v for k, v in data.model_dump().items() if v is not None}
    if len(dados_para_atualizar) < 1: raise HTTPException(status_code=400, detail="Nenhum dado para atualizar")

    reserva_existente = collection_reservas.find_one({"_id": ObjectId(id)})
    if not reserva_existente: raise HTTPException(status_code=404, detail=f"Reserva com ID {id} não encontrada")

    # Atualiza hospede_nome se id_cliente mudar
    if "id_cliente" in dados_para_atualizar:
        if not ObjectId.is_valid(dados_para_atualizar["id_cliente"]): raise HTTPException(status_code=400, detail="ID do cliente inválido")
        novo_cliente = collection_clientes.find_one({"_id": ObjectId(dados_para_atualizar["id_cliente"])})
        if not novo_cliente: raise HTTPException(status_code=404, detail=f"Novo cliente com ID {dados_para_atualizar['id_cliente']} não encontrado.")
        dados_para_atualizar["hospede_nome"] = novo_cliente.get("nome", "Nome não encontrado")

    # Verifica conflito se datas ou quarto forem alterados
    checkin = dados_para_atualizar.get("data_checkin", reserva_existente.get("data_checkin"))
    checkout = dados_para_atualizar.get("data_checkout", reserva_existente.get("data_checkout"))
    id_quarto = dados_para_atualizar.get("id_quarto", reserva_existente.get("id_quarto"))

    # Apenas verifica conflito se datas ou quarto realmente mudaram
    if "data_checkin" in dados_para_atualizar or "data_checkout" in dados_para_atualizar or "id_quarto" in dados_para_atualizar:
        if "id_quarto" in dados_para_atualizar:
             if not ObjectId.is_valid(id_quarto): raise HTTPException(status_code=400, detail="ID do quarto inválido")
             quarto_valido = collection_quartos.find_one({"_id": ObjectId(id_quarto)})
             if not quarto_valido: raise HTTPException(status_code=404, detail=f"Novo quarto com ID {id_quarto} não encontrado.")

        conflito = collection_reservas.find_one({
            "_id": {"$ne": ObjectId(id)}, # Exclui a própria reserva
            "id_quarto": id_quarto,
            "status": {"$in": ["Confirmada", "Pendente"]},
            "data_checkout": {"$gt": checkin},
            "data_checkin": {"$lt": checkout}
        })
        if conflito: raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Conflito de datas com outra reserva.")

    try:
        collection_reservas.update_one({"_id": ObjectId(id)}, {"$set": dados_para_atualizar})
    except Exception as e:
        print(f"Erro ao atualizar reserva no DB: {e}")
        raise HTTPException(status_code=500, detail="Erro ao guardar as alterações da reserva.")

    reserva_atualizada = collection_reservas.find_one({"_id": ObjectId(id)}) # Busca novamente após atualizar

    # Atualiza status do quarto (lógica mantida)
    if "status" in dados_para_atualizar:
        novo_status_quarto = "disponivel"
        # Considera Check-in também como ocupado
        if dados_para_atualizar["status"] in ["Confirmada", "Check-in"]:
            novo_status_quarto = "ocupado"
        try:
            collection_quartos.update_one(
                {"_id": ObjectId(reserva_atualizada["id_quarto"])},
                {"$set": {"status": novo_status_quarto}}
            )
        except Exception as e:
            print(f"Aviso: Falha ao atualizar status do quarto {reserva_atualizada['id_quarto']} após reserva: {e}")


    return reserva_helper(reserva_atualizada)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar_reserva(id: str, current_user: UsuarioInDB = Depends(get_current_user)):
    if not ObjectId.is_valid(id): raise HTTPException(status_code=400, detail="ID da reserva inválido")

    # Opcional: antes de deletar, pegar dados da reserva para atualizar status do quarto
    reserva_para_deletar = collection_reservas.find_one({"_id": ObjectId(id)})

    resultado = collection_reservas.delete_one({"_id": ObjectId(id)})
    if resultado.deleted_count == 0:
        raise HTTPException(status_code=404, detail=f"Reserva com ID {id} não encontrada")

    # Se a reserva deletada estava Confirmada ou Check-in, tenta libertar o quarto
    if reserva_para_deletar and reserva_para_deletar.get("status") in ["Confirmada", "Check-in"]:
         try:
             # Verifica se há OUTRA reserva ativa para o mesmo quarto antes de libertar
             outra_reserva_ativa = collection_reservas.find_one({
                 "id_quarto": reserva_para_deletar["id_quarto"],
                 "status": {"$in": ["Confirmada", "Check-in"]},
                 "_id": {"$ne": ObjectId(id)} # Exclui a que acabamos de deletar
             })
             if not outra_reserva_ativa:
                 collection_quartos.update_one(
                     {"_id": ObjectId(reserva_para_deletar["id_quarto"])},
                     {"$set": {"status": "disponivel"}}
                 )
         except Exception as e:
             print(f"Aviso: Falha ao atualizar status do quarto {reserva_para_deletar['id_quarto']} após deletar reserva: {e}")


    return Response(status_code=status.HTTP_204_NO_CONTENT)

