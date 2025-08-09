# Em: api-pousada/routes/quarto.py

from fastapi import APIRouter, Body, status, HTTPException, Response, Depends
from models.quarto import Quarto, UpdateQuarto
from config.database import collection_quartos
from bson import ObjectId
from auth import get_current_user
from models.usuario import UsuarioInDB

router = APIRouter()

# --- Função Auxiliar (ATUALIZADA) ---
# Adicionamos os novos campos para que a resposta da API seja completa.
def quarto_helper(quarto) -> dict:
    return {
        "id": str(quarto["_id"]),
        "numero": quarto["numero"],
        "titulo": quarto["titulo"],
        "descricao": quarto["descricao"],
        "fotos": quarto["fotos"],
        "status": quarto["status"],
        "preco_diaria": quarto.get("preco_diaria"),
        "capacidade_hospedes": quarto.get("capacidade_hospedes"),
        "comodidades": quarto.get("comodidades", []),
    }

# --- Rota GET para Listar Quartos (PÚBLICA) ---
@router.get("/quartos", response_description="Lista todos os quartos")
async def obter_todos_os_quartos():
    quartos = []
    for quarto in collection_quartos.find():
        quartos.append(quarto_helper(quarto))
    return quartos

# --- NOVA ROTA ADICIONADA: GET para buscar um quarto por ID (PÚBLICA) ---
@router.get("/quartos/{id}", response_description="Busca um quarto por ID")
async def buscar_quarto_por_id(id: str):
    """
    Retorna os dados de um único quarto a partir do seu ID.
    """
    quarto = collection_quartos.find_one({"_id": ObjectId(id)})
    if quarto:
        return quarto_helper(quarto)
    raise HTTPException(status_code=404, detail=f"Quarto com ID {id} não encontrado")


# --- Rota POST para Criar um Quarto (PROTEGIDA) ---
@router.post(
    "/quartos",
    response_description="Adiciona um novo quarto",
    status_code=status.HTTP_201_CREATED
)
async def criar_quarto(quarto: Quarto = Body(...), current_user: UsuarioInDB = Depends(get_current_user)):
    novo_quarto_dict = quarto.model_dump()
    resultado = collection_quartos.insert_one(novo_quarto_dict)
    quarto_criado = collection_quartos.find_one({"_id": resultado.inserted_id})
    if quarto_criado:
      return quarto_helper(quarto_criado)
    raise HTTPException(status_code=400, detail="Erro ao criar o quarto.")


# --- Rota PUT para Atualizar um Quarto (PROTEGIDA) ---
@router.put("/quartos/{id}", response_description="Atualiza um quarto")
async def atualizar_quarto(id: str, quarto_data: UpdateQuarto = Body(...), current_user: UsuarioInDB = Depends(get_current_user)):
    dados_para_atualizar = {k: v for k, v in quarto_data.model_dump().items() if v is not None}

    if len(dados_para_atualizar) >= 1:
        resultado = collection_quartos.update_one(
            {"_id": ObjectId(id)}, {"$set": dados_para_atualizar}
        )
        # Mesmo que a contagem de modificados seja 0, podemos querer retornar o estado atual.
        # Por isso, a busca é feita fora do if.
    
    quarto_atualizado = collection_quartos.find_one({"_id": ObjectId(id)})
    if quarto_atualizado:
        return quarto_helper(quarto_atualizado)
        
    raise HTTPException(status_code=404, detail=f"Quarto com ID {id} não encontrado")

# --- Rota DELETE para Deletar um Quarto (PROTEGIDA) ---
@router.delete("/quartos/{id}", response_description="Deleta um quarto")
async def deletar_quarto(id: str, current_user: UsuarioInDB = Depends(get_current_user)):
    resultado = collection_quartos.delete_one({"_id": ObjectId(id)})

    if resultado.deleted_count == 1:
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    raise HTTPException(status_code=404, detail=f"Quarto com ID {id} não encontrado")
