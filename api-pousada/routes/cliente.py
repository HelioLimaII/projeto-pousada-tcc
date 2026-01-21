# Em: api-pousada/routes/cliente.py
from fastapi import APIRouter, Body, status, HTTPException, Response, Depends
from models.cliente import Cliente, UpdateCliente
from config.database import collection_clientes
from auth import get_current_user
from models.usuario import UsuarioInDB
from bson import ObjectId

router = APIRouter()

# Helper genérico para converter qualquer cliente do Mongo para Dict
def fix_mongo_id(doc):
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc

# --- Rotas CRUD ---

@router.post("", status_code=status.HTTP_201_CREATED)
async def criar_cliente(cliente_data: Cliente = Body(...), current_user: UsuarioInDB = Depends(get_current_user)):
    # model_dump() pega TODOS os campos definidos no model (incluindo fnrh, nascimento, etc)
    cliente_dict = cliente_data.model_dump()
    
    resultado = collection_clientes.insert_one(cliente_dict)
    cliente_criado = collection_clientes.find_one({"_id": resultado.inserted_id})
    
    if cliente_criado:
        return fix_mongo_id(cliente_criado)
    raise HTTPException(status_code=400, detail="Erro ao criar cliente.")

@router.get("", response_description="Lista todos os clientes")
async def listar_clientes(current_user: UsuarioInDB = Depends(get_current_user)):
    # Retorna TUDO que está no banco, sem filtrar campos manualmente
    return [fix_mongo_id(cliente) for cliente in collection_clientes.find()]

@router.get("/{id}", response_description="Busca um cliente por ID")
async def buscar_cliente_por_id(id: str, current_user: UsuarioInDB = Depends(get_current_user)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="ID inválido")
        
    cliente = collection_clientes.find_one({"_id": ObjectId(id)})
    if cliente:
        return fix_mongo_id(cliente)
    raise HTTPException(status_code=404, detail=f"Cliente com ID {id} não encontrado")

@router.put("/{id}", response_description="Atualiza um cliente")
async def atualizar_cliente(id: str, data: UpdateCliente = Body(...), current_user: UsuarioInDB = Depends(get_current_user)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="ID inválido")

    # exclude_unset=True garante que só atualizamos o que foi enviado
    dados_para_atualizar = data.model_dump(exclude_unset=True)
    
    if len(dados_para_atualizar) >= 1:
        collection_clientes.update_one({"_id": ObjectId(id)}, {"$set": dados_para_atualizar})
    
    cliente_atualizado = collection_clientes.find_one({"_id": ObjectId(id)})
    if cliente_atualizado:
        return fix_mongo_id(cliente_atualizado)
    raise HTTPException(status_code=404, detail=f"Cliente com ID {id} não encontrado")

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar_cliente(id: str, current_user: UsuarioInDB = Depends(get_current_user)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="ID inválido")
        
    resultado = collection_clientes.delete_one({"_id": ObjectId(id)})
    if resultado.deleted_count == 0:
        raise HTTPException(status_code=404, detail=f"Cliente com ID {id} não encontrado")
    return Response(status_code=status.HTTP_204_NO_CONTENT)