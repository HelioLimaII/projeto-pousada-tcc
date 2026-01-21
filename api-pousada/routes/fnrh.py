from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from config.database import db 
from services.fnrh_service import fnrh_service
from bson import ObjectId
from datetime import datetime

router = APIRouter()

# --- MODELOS DE DADOS ---
class ReservaPayload(BaseModel):
    codigo_reserva: str
    data_entrada: str
    data_saida: str
    adultos: int = 1
    criancas: int = 0
    id_local: str # ID do MongoDB para vincular

class VinculoPayload(BaseModel):
    reserva_id_gov: str
    hospede_id_gov: str

# --- 1. ROTAS DE CONSULTA ---

@router.get("/consultar-cpf/{cpf}")
async def consultar_cpf(cpf: str):
    """Verifica se hóspede tem cadastro no Gov"""
    return await fnrh_service.buscar_hospede_gov(cpf)

@router.get("/listar")
async def listar_reservas_oficiais(
    pagina: int = 1, 
    inicio: str = None, 
    fim: str = None,
    situacao: str = None,
    codigo: str = None  # <--- NOVO PARÂMETRO
):
    """ESPELHO: Lista reservas com opção de busca por código"""
    
    # Repassa o 'codigo' para o service como 'numero_reserva'
    res = await fnrh_service.listar_reservas_gov(
        pagina=pagina, 
        data_inicio=inicio, 
        data_fim=fim, 
        situacao=situacao,
        numero_reserva=codigo
    )
    
    if not res["sucesso"]:
        return {"dados": [], "paginacao": {"total": 0}}
    
    return res

# --- 2. CRIAÇÃO E VÍNCULO ---

@router.post("/criar-reserva")
async def criar_reserva(dados: ReservaPayload):
    """Cria reserva no Gov e salva o ID no banco local"""
    
    # 1. Cria no Gov
    res = await fnrh_service.criar_reserva_gov(dados.dict())
    if not res["sucesso"]:
        raise HTTPException(status_code=400, detail=res["msg"])
    
    id_gov = res["reserva_id_gov"]
    
    # 2. Atualiza Local (Vincula ID Gov à Reserva Local)
    if dados.id_local:
        db.reservas.update_one(
            {"_id": ObjectId(dados.id_local)},
            {"$set": {
                "fnrh_reserva_id": id_gov,
                "fnrh_sincronizado": True,
                "status": "Confirmada" # Se criou no gov, está confirmada
            }}
        )
    
    return {"sucesso": True, "fnrh_reserva_id": id_gov}

@router.post("/vincular-hospede")
async def vincular_hospede(dados: VinculoPayload):
    """Vincula um hóspede (CPF) a uma reserva no Gov"""
    res = await fnrh_service.vincular_hospede(dados.reserva_id_gov, dados.hospede_id_gov)
    if not res["sucesso"]:
        raise HTTPException(status_code=400, detail=res["msg"])
    return res

# --- 3. AÇÕES DE STATUS (SYNC BIDIRECIONAL) ---

@router.post("/checkin-manual/{id_gov}")
async def checkin_manual(id_gov: str):
    """Botão VERDE (Check-in): Gov='Em Andamento', Local='Hospedado'"""
    
    # 1. Gov
    res = await fnrh_service.realizar_checkin_gov(id_gov)
    if not res["sucesso"]:
        raise HTTPException(status_code=400, detail=res["msg"])
    
    # 2. Local
    db.reservas.update_one(
        {"fnrh_reserva_id": id_gov},
        {"$set": {
            "status": "Hospedado", 
            "data_checkin_real": datetime.now()
        }}
    )
    return {"sucesso": True, "msg": "Check-in realizado e sincronizado."}

@router.post("/checkout-manual/{id_gov}")
async def checkout_manual(id_gov: str):
    """Botão VERDE (Checkout): Gov='Concluída', Local='Finalizada'"""
    
    # 1. Gov
    res = await fnrh_service.realizar_checkout_gov(id_gov)
    if not res["sucesso"]:
        raise HTTPException(status_code=400, detail=res["msg"])
    
    # 2. Local
    db.reservas.update_one(
        {"fnrh_reserva_id": id_gov},
        {"$set": {
            "status": "Finalizada", 
            "data_checkout_real": datetime.now()
        }}
    )
    return {"sucesso": True, "msg": "Check-out realizado e sincronizado."}

@router.post("/cancelar-manual/{id_gov}")
async def cancelar_manual(id_gov: str):
    """Botão VERMELHO (X): Gov='Cancelada', Local='Cancelada'"""
    
    # 1. Gov
    res = await fnrh_service.cancelar_reserva_gov(id_gov)
    if not res["sucesso"]:
        raise HTTPException(status_code=400, detail=res["msg"])
    
    # 2. Local
    db.reservas.update_one(
        {"fnrh_reserva_id": id_gov},
        {"$set": {"status": "Cancelada"}}
    )
    return {"sucesso": True, "msg": "Reserva cancelada em ambos os sistemas."}

@router.post("/desvincular-manual/{reserva_id}/{hospede_id}")
async def desvincular_manual(reserva_id: str, hospede_id: str):
    """Botão VERMELHO (Remover Hóspede)"""
    
    # 1. Gov
    res = await fnrh_service.desvincular_hospede(reserva_id, hospede_id)
    if not res["sucesso"]:
        raise HTTPException(status_code=400, detail=res["msg"])
    
    # 2. Local (Opcional: Registro de log ou flag)
    # Não alteramos o status da reserva inteira aqui, pois pode haver outros hóspedes
    
    return {"sucesso": True, "msg": "Hóspede desvinculado com sucesso."}

@router.get("/reserva/{id_gov}")
async def obter_reserva_completa(id_gov: str):
    """Busca a reserva completa (com lista de hóspedes) pelo ID"""
    res = await fnrh_service.obter_reserva_detalhada(id_gov)
    if not res["sucesso"]:
        raise HTTPException(status_code=400, detail=res["msg"])
    return res["dados"]

@router.get("/local-id/{id_gov}")
async def buscar_id_local_por_gov(id_gov: str):
    """Busca o ID da reserva local (MongoDB) usando o ID do Governo"""
    reserva = db.reservas.find_one({"fnrh_reserva_id": id_gov}, {"_id": 1})
    
    if reserva:
        return {"sucesso": True, "local_id": str(reserva["_id"])}
    
    # Se não achou, pode ser uma reserva antiga feita direto no site do Gov
    return {"sucesso": False, "msg": "Reserva não encontrada no banco local."}