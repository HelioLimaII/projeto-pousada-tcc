# Em: api-pousada/routes/reserva.py

from fastapi import APIRouter, Body, status, HTTPException, Response, Depends
from models.reserva import Reserva, UpdateReserva
from config.database import collection_reservas, collection_quartos, collection_clientes
from auth import get_current_user
from models.usuario import UsuarioInDB
from bson import ObjectId

router = APIRouter()

def reserva_helper(reserva) -> dict:
    return {
        "id": str(reserva["_id"]),
        "id_quarto": reserva["id_quarto"],
        "id_cliente": reserva["id_cliente"],
        "data_checkin": reserva["data_checkin"],
        "data_checkout": reserva["data_checkout"],
        "status": reserva["status"],
        "valor_total": reserva["valor_total"],
    }

@router.post("/reservas", status_code=status.HTTP_201_CREATED)
async def criar_reserva(reserva: Reserva = Body(...), current_user: UsuarioInDB = Depends(get_current_user)):
    # Validação: Verificar se o cliente e o quarto existem (já tínhamos isso)
    if not collection_clientes.find_one({"_id": ObjectId(reserva.id_cliente)}):
        raise HTTPException(status_code=404, detail=f"Cliente com ID {reserva.id_cliente} não encontrado.")
    quarto = collection_quartos.find_one({"_id": ObjectId(reserva.id_quarto)})
    if not quarto:
        raise HTTPException(status_code=404, detail=f"Quarto com ID {reserva.id_quarto} não encontrado.")

    # --- NOVA REGRA DE NEGÓCIO: VERIFICAÇÃO DE CONFLITO DE DATAS ---
    # Procura por reservas para o MESMO quarto, que estejam ATIVAS ('Confirmada' ou 'Pendente')
    # e cujas datas se sobreponham com o novo período de reserva.
    conflito = collection_reservas.find_one({
        "id_quarto": reserva.id_quarto,
        "status": {"$in": ["Confirmada", "Pendente"]},
        "data_checkout": {"$gt": reserva.data_checkin},  # A reserva existente termina DEPOIS que a nova começa
        "data_checkin": {"$lt": reserva.data_checkout}   # E a reserva existente começa ANTES que a nova termine
    })

    if conflito:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, # 409 Conflict é o status ideal para isso
            detail="Este quarto já está reservado para o período selecionado."
        )
    
    resultado = collection_reservas.insert_one(reserva.model_dump())
    
    # --- NOVA REGRA DE NEGÓCIO: ATUALIZAR STATUS DO QUARTO ---
    # Se a reserva for confirmada, o quarto fica ocupado
    if reserva.status == "Confirmada":
        collection_quartos.update_one(
            {"_id": ObjectId(reserva.id_quarto)},
            {"$set": {"status": "ocupado"}}
        )

    reserva_criada = collection_reservas.find_one({"_id": resultado.inserted_id})
    return reserva_helper(reserva_criada)

@router.get("/reservas")
async def listar_reservas(current_user: UsuarioInDB = Depends(get_current_user)):
    reservas = []
    for reserva in collection_reservas.find():
        reservas.append(reserva_helper(reserva))
    return reservas

@router.put("/reservas/{id}")
async def atualizar_reserva(id: str, data: UpdateReserva = Body(...), current_user: UsuarioInDB = Depends(get_current_user)):
    dados_para_atualizar = {k: v for k, v in data.model_dump().items() if v is not None}

    if len(dados_para_atualizar) >= 1:
        # Se as datas estão sendo alteradas, precisamos verificar o conflito
        if "data_checkin" in dados_para_atualizar or "data_checkout" in dados_para_atualizar:
            reserva_existente = collection_reservas.find_one({"_id": ObjectId(id)})
            
            # Pega as datas da atualização ou as datas já existentes se não forem alteradas
            checkin = dados_para_atualizar.get("data_checkin", reserva_existente["data_checkin"])
            checkout = dados_para_atualizar.get("data_checkout", reserva_existente["data_checkout"])
            id_quarto = dados_para_atualizar.get("id_quarto", reserva_existente["id_quarto"])

            conflito = collection_reservas.find_one({
                "_id": {"$ne": ObjectId(id)}, # IMPORTANTE: Exclui a própria reserva da verificação
                "id_quarto": id_quarto,
                "status": {"$in": ["Confirmada", "Pendente"]},
                "data_checkout": {"$gt": checkin},
                "data_checkin": {"$lt": checkout}
            })

            if conflito:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Conflito de datas com outra reserva existente."
                )

        collection_reservas.update_one({"_id": ObjectId(id)}, {"$set": dados_para_atualizar})
    
    reserva_atualizada = collection_reservas.find_one({"_id": ObjectId(id)})
    if reserva_atualizada:
        # Se o status da reserva foi alterado, podemos atualizar o status do quarto
        if "status" in dados_para_atualizar:
            novo_status_quarto = "disponivel"
            if dados_para_atualizar["status"] == "Confirmada":
                novo_status_quarto = "ocupado"
            
            collection_quartos.update_one(
                {"_id": ObjectId(reserva_atualizada["id_quarto"])},
                {"$set": {"status": novo_status_quarto}}
            )

        return reserva_helper(reserva_atualizada)
            
    raise HTTPException(status_code=404, detail=f"Reserva com ID {id} não encontrada")


@router.delete("/reservas/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar_reserva(id: str, current_user: UsuarioInDB = Depends(get_current_user)):
    resultado = collection_reservas.delete_one({"_id": ObjectId(id)})
    if resultado.deleted_count == 0:
        raise HTTPException(status_code=404, detail=f"Reserva com ID {id} não encontrada")
    return Response(status_code=status.HTTP_204_NO_CONTENT)