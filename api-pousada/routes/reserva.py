# Arquivo: api-pousada/routes/reserva.py

from fastapi import APIRouter, Body, status, HTTPException, Response, Depends, Query
from models.reserva import Reserva, UpdateReserva
from config.database import collection_reservas, collection_quartos, collection_clientes
from auth import get_current_user
from models.usuario import UsuarioInDB
from bson import ObjectId
from datetime import datetime
import calendar
from typing import List, Optional

router = APIRouter()

# --- FUNÇÃO HELPER (CORRIGIDA) ---
def reserva_helper(reserva) -> dict:
    return {
        "id": str(reserva["_id"]),
        "id_quarto": reserva.get("id_quarto"),
        "id_cliente": reserva.get("id_cliente"),
        "hospede_nome": reserva.get("hospede_nome"),
        "data_checkin": reserva.get("data_checkin"),
        "data_checkout": reserva.get("data_checkout"),
        "status": reserva.get("status"),
        "valor_total": reserva.get("valor_total"),
        "observacoes": reserva.get("observacoes"),
        # [CORREÇÃO] Adicionando os campos FNRH para o Frontend receber
        "fnrh_reserva_id": reserva.get("fnrh_reserva_id"),
        "fnrh_sincronizado": reserva.get("fnrh_sincronizado", False),
    }

# --- ROTA PARA O MAPA DE RESERVAS (CORRIGIDA) ---
@router.get("/mapa", response_description="Busca quartos e reservas para o mapa")
async def obter_dados_mapa(
    ano: int = Query(..., description="Ano para buscar as reservas"),
    mes: int = Query(..., description="Mês para buscar as reservas (1-12)"),
    current_user: UsuarioInDB = Depends(get_current_user)
):
    try:
        primeiro_dia = datetime(ano, mes, 1)
        ultimo_dia_num = calendar.monthrange(ano, mes)[1]
        ultimo_dia = datetime(ano, mes, ultimo_dia_num, 23, 59, 59)

        # Busca todos os quartos
        quartos_cursor = collection_quartos.find().sort("numero", 1)
        quartos_com_reservas = []

        for quarto in quartos_cursor:
            quarto_id_str = str(quarto["_id"])

            # Busca reservas que caem dentro do mês visualizado
            query_reservas = {
                "id_quarto": quarto_id_str,
                "data_checkin": {"$lte": ultimo_dia}, 
                "data_checkout": {"$gt": primeiro_dia}
            }

            reservas_cursor = collection_reservas.find(query_reservas)

            reservas_para_mapa = []
            for reserva in reservas_cursor:
                reservas_para_mapa.append({
                    "id": str(reserva["_id"]),
                    "hospede_nome": reserva.get("hospede_nome", "Hóspede"),
                    "data_checkin": reserva["data_checkin"].strftime("%Y-%m-%d"),
                    "data_checkout": reserva["data_checkout"].strftime("%Y-%m-%d"),
                    "status": reserva["status"],
                    # [CORREÇÃO] Adicionando campos FNRH para o Mapa mostrar o ícone de nuvem
                    "fnrh_reserva_id": reserva.get("fnrh_reserva_id"),
                    "fnrh_sincronizado": reserva.get("fnrh_sincronizado", False),
                })

            quartos_com_reservas.append({
                "id": str(quarto["_id"]),
                "numero": quarto.get("numero"),
                "titulo": quarto.get("titulo", f"Quarto {quarto.get('numero')}"),
                "status": quarto.get("status", "disponivel"),
                "reservas": reservas_para_mapa
            })

        return quartos_com_reservas

    except Exception as e:
        print(f"Erro ao obter dados do mapa: {e}")
        raise HTTPException(status_code=500, detail="Ocorreu um erro interno ao buscar dados do mapa.")


# --- ROTAS DE CRUD ---

@router.post("", status_code=status.HTTP_201_CREATED, response_model=dict)
async def criar_reserva(reserva: Reserva = Body(...), current_user: UsuarioInDB = Depends(get_current_user)):
    # 1. Validações básicas
    if not ObjectId.is_valid(reserva.id_quarto): raise HTTPException(status_code=400, detail="ID do quarto inválido")
    if not ObjectId.is_valid(reserva.id_cliente): raise HTTPException(status_code=400, detail="ID do cliente inválido")

    quarto = collection_quartos.find_one({"_id": ObjectId(reserva.id_quarto)})
    if not quarto: raise HTTPException(status_code=404, detail="Quarto não encontrado.")
    
    if quarto.get("status") == "manutencao":
        raise HTTPException(status_code=400, detail="Este quarto está em manutenção e não pode receber reservas.")

    cliente = collection_clientes.find_one({"_id": ObjectId(reserva.id_cliente)})
    if not cliente: raise HTTPException(status_code=404, detail="Cliente não encontrado.")

    # 2. Verifica conflito de datas
    conflito = collection_reservas.find_one({
        "id_quarto": reserva.id_quarto,
        "status": {"$in": ["Confirmada", "Pendente", "Check-in"]}, 
        "data_checkout": {"$gt": reserva.data_checkin}, 
        "data_checkin": {"$lt": reserva.data_checkout}
    })
    if conflito: raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Este quarto já possui uma reserva para este período.")

    # 3. Prepara e Salva
    reserva_dict = reserva.model_dump()
    reserva_dict["hospede_nome"] = cliente.get("nome", "Nome não encontrado")

    try:
        resultado = collection_reservas.insert_one(reserva_dict)
    except Exception as e:
         print(f"Erro DB: {e}")
         raise HTTPException(status_code=500, detail="Erro ao salvar a reserva.")

    reserva_criada = collection_reservas.find_one({"_id": resultado.inserted_id})
    return reserva_helper(reserva_criada)

@router.get("", response_model=List[dict])
async def listar_reservas(current_user: UsuarioInDB = Depends(get_current_user)):
    return [reserva_helper(reserva) for reserva in collection_reservas.find()]

@router.get("/{id}", response_model=dict)
async def buscar_reserva_por_id(id: str, current_user: UsuarioInDB = Depends(get_current_user)):
    if not ObjectId.is_valid(id): raise HTTPException(status_code=400, detail="ID inválido")
    reserva = collection_reservas.find_one({"_id": ObjectId(id)})
    if reserva: return reserva_helper(reserva)
    raise HTTPException(status_code=404, detail="Reserva não encontrada")

@router.put("/{id}", response_model=dict)
async def atualizar_reserva(id: str, data: UpdateReserva = Body(...), current_user: UsuarioInDB = Depends(get_current_user)):
    if not ObjectId.is_valid(id): raise HTTPException(status_code=400, detail="ID inválido")
    
    dados_para_atualizar = {k: v for k, v in data.model_dump().items() if v is not None}
    if not dados_para_atualizar: raise HTTPException(status_code=400, detail="Nenhum dado para atualizar")

    reserva_existente = collection_reservas.find_one({"_id": ObjectId(id)})
    if not reserva_existente: raise HTTPException(status_code=404, detail="Reserva não encontrada")

    if "id_cliente" in dados_para_atualizar:
        if not ObjectId.is_valid(dados_para_atualizar["id_cliente"]): raise HTTPException(status_code=400, detail="ID cliente inválido")
        novo_cliente = collection_clientes.find_one({"_id": ObjectId(dados_para_atualizar["id_cliente"])})
        if novo_cliente: dados_para_atualizar["hospede_nome"] = novo_cliente.get("nome")

    checkin = dados_para_atualizar.get("data_checkin", reserva_existente.get("data_checkin"))
    checkout = dados_para_atualizar.get("data_checkout", reserva_existente.get("data_checkout"))
    id_quarto = dados_para_atualizar.get("id_quarto", reserva_existente.get("id_quarto"))

    if any(k in dados_para_atualizar for k in ["data_checkin", "data_checkout", "id_quarto"]):
        conflito = collection_reservas.find_one({
            "_id": {"$ne": ObjectId(id)},
            "id_quarto": id_quarto,
            "status": {"$in": ["Confirmada", "Pendente", "Check-in"]},
            "data_checkout": {"$gt": checkin},
            "data_checkin": {"$lt": checkout}
        })
        if conflito: raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Conflito de datas com outra reserva.")

    try:
        collection_reservas.update_one({"_id": ObjectId(id)}, {"$set": dados_para_atualizar})
    except Exception as e:
        print(f"Erro DB: {e}")
        raise HTTPException(status_code=500, detail="Erro ao atualizar reserva.")

    # Retorna o objeto atualizado usando o helper corrigido
    return reserva_helper(collection_reservas.find_one({"_id": ObjectId(id)}))

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar_reserva(id: str, current_user: UsuarioInDB = Depends(get_current_user)):
    if not ObjectId.is_valid(id): raise HTTPException(status_code=400, detail="ID inválido")

    resultado = collection_reservas.delete_one({"_id": ObjectId(id)})
    if resultado.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reserva não encontrada")
    
    return Response(status_code=status.HTTP_204_NO_CONTENT)