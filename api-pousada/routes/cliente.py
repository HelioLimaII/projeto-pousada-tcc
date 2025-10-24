# Em: api-pousada/routes/cliente.py
from fastapi import APIRouter, Body, status, HTTPException, Response, Depends
from models.cliente import Cliente, UpdateCliente
from config.database import collection_clientes
from auth import get_current_user
from models.usuario import UsuarioInDB
from bson import ObjectId

router = APIRouter()

# --- Função Helper ---
def cliente_helper(cliente) -> dict:
    return {
        "id": str(cliente["_id"]),
        "nome": cliente.get("nome"),
        "cpf": cliente.get("cpf"),
        "rg": cliente.get("rg"),
        "email": cliente.get("email"),
        "telefone": cliente.get("telefone"),
        "endereco": cliente.get("endereco"),
        "bairro": cliente.get("bairro"),
        "cep": cliente.get("cep"),
        "cidade": cliente.get("cidade"),
        "estado": cliente.get("estado"),
        "pais": cliente.get("pais"),
        "observacoes": cliente.get("observacoes"),
    }

# --- Rotas CRUD ---

@router.post("", status_code=status.HTTP_201_CREATED, response_model=dict)
async def criar_cliente(cliente_data: Cliente = Body(...), current_user: UsuarioInDB = Depends(get_current_user)):
    cliente_dict = cliente_data.model_dump()
    resultado = collection_clientes.insert_one(cliente_dict)
    cliente_criado = collection_clientes.find_one({"_id": resultado.inserted_id})
    if cliente_criado:
        return cliente_helper(cliente_criado)
    raise HTTPException(status_code=400, detail="Erro ao criar cliente.")

@router.get("", response_description="Lista todos os clientes")
async def listar_clientes(current_user: UsuarioInDB = Depends(get_current_user)):
    return [cliente_helper(cliente) for cliente in collection_clientes.find()]

@router.get("/{id}", response_description="Busca um cliente por ID")
async def buscar_cliente_por_id(id: str, current_user: UsuarioInDB = Depends(get_current_user)):
    cliente = collection_clientes.find_one({"_id": ObjectId(id)})
    if cliente:
        return cliente_helper(cliente)
    raise HTTPException(status_code=404, detail=f"Cliente com ID {id} não encontrado")

@router.put("/{id}", response_description="Atualiza um cliente")
async def atualizar_cliente(id: str, data: UpdateCliente = Body(...), current_user: UsuarioInDB = Depends(get_current_user)):
    dados_para_atualizar = {k: v for k, v in data.model_dump().items() if v is not None}
    if len(dados_para_atualizar) >= 1:
        collection_clientes.update_one({"_id": ObjectId(id)}, {"$set": dados_para_atualizar})
    
    cliente_atualizado = collection_clientes.find_one({"_id": ObjectId(id)})
    if cliente_atualizado:
        return cliente_helper(cliente_atualizado)
    raise HTTPException(status_code=404, detail=f"Cliente com ID {id} não encontrado")

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar_cliente(id: str, current_user: UsuarioInDB = Depends(get_current_user)):
    resultado = collection_clientes.delete_one({"_id": ObjectId(id)})
    if resultado.deleted_count == 0:
        raise HTTPException(status_code=404, detail=f"Cliente com ID {id} não encontrado")
    return Response(status_code=status.HTTP_204_NO_CONTENT)