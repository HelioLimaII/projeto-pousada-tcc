# Em: api-pousada/routes/quarto.py

# Imports nativos e de bibliotecas
import os
import shutil
from typing import List, Optional

# Imports do FastAPI e relacionados
from fastapi import APIRouter, Body, status, HTTPException, Response, Depends, File, UploadFile, Form
from bson import ObjectId

# Imports locais do projeto
from models.quarto import Quarto, UpdateQuarto
from config.database import collection_quartos
from auth import get_current_user
from models.usuario import UsuarioInDB

router = APIRouter()

# --- Função Auxiliar (Sem alterações) ---
def quarto_helper(quarto) -> dict:
    return {
        "id": str(quarto["_id"]),
        "numero": quarto.get("numero"), # Usar .get() para segurança
        "titulo": quarto.get("titulo"),
        "descricao": quarto.get("descricao"),
        "fotos": quarto.get("fotos", []),
        "status": quarto.get("status"),
        "preco_diaria": quarto.get("preco_diaria"),
        "capacidade_hospedes": quarto.get("capacidade_hospedes"),
        "comodidades": quarto.get("comodidades", []),
    }

# --- Rotas GET ---
# CORREÇÃO: Caminho alterado de "/quartos" para ""
@router.get("", response_description="Lista todos os quartos")
async def obter_todos_os_quartos():
    quartos = []
    # Usar um loop mais seguro com verificação
    for quarto_doc in collection_quartos.find():
        if quarto_doc: # Garante que o documento existe
             quartos.append(quarto_helper(quarto_doc))
    return quartos

# CORREÇÃO: Caminho alterado de "/quartos/{id}" para "/{id}"
@router.get("/{id}", response_description="Busca um quarto por ID")
async def buscar_quarto_por_id(id: str):
    # Validação do ObjectId para evitar erros 500 se o ID for inválido
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"ID inválido: {id}")
        
    quarto = collection_quartos.find_one({"_id": ObjectId(id)})
    if quarto:
        return quarto_helper(quarto)
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Quarto com ID {id} não encontrado")


# --- Rota POST para Criar um Quarto ---
# CORREÇÃO: Caminho alterado de "/quartos" para ""
@router.post(
    "", # Caminho vazio
    response_description="Adiciona um novo quarto",
    status_code=status.HTTP_201_CREATED
)
async def criar_quarto(
    # ... (parâmetros mantidos)
    numero: int = Form(...),
    titulo: str = Form(...),
    descricao: str = Form(...),
    status: str = Form(...),
    preco_diaria: float = Form(...),
    capacidade_hospedes: int = Form(...),
    comodidades: List[str] = Form(...),
    novas_fotos: Optional[List[UploadFile]] = File(None),
    current_user: UsuarioInDB = Depends(get_current_user)
):
    # ... (lógica mantida)
    novo_quarto_dict = {
        "numero": numero, "titulo": titulo, "descricao": descricao,
        "status": status, "preco_diaria": preco_diaria,
        "capacidade_hospedes": capacidade_hospedes, "comodidades": comodidades,
        "fotos": []
    }
    resultado = collection_quartos.insert_one(novo_quarto_dict)
    novo_id = str(resultado.inserted_id)
    if novas_fotos:
        caminhos_fotos = []
        upload_dir = os.path.join("static", "images", "quartos", novo_id)
        os.makedirs(upload_dir, exist_ok=True)
        for foto in novas_fotos:
            file_path = os.path.join(upload_dir, foto.filename)
            with open(file_path, "wb") as buffer: shutil.copyfileobj(foto.file, buffer)
            url_path = file_path.replace("\\", "/")
            caminhos_fotos.append(f"/{url_path}")
        collection_quartos.update_one({"_id": ObjectId(novo_id)}, {"$set": {"fotos": caminhos_fotos}})
    quarto_criado = collection_quartos.find_one({"_id": ObjectId(novo_id)})
    if quarto_criado: return quarto_helper(quarto_criado)
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Erro ao criar o quarto.")


# --- Rota PUT para Atualizar um Quarto ---
# CORREÇÃO: Caminho alterado de "/quartos/{id}" para "/{id}"
@router.put("/{id}", response_description="Atualiza um quarto")
async def atualizar_quarto(
    id: str,
    # ... (parâmetros mantidos)
    numero: Optional[int] = Form(None),
    titulo: Optional[str] = Form(None),
    descricao: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    preco_diaria: Optional[float] = Form(None),
    capacidade_hospedes: Optional[int] = Form(None),
    comodidades: Optional[List[str]] = Form(None),
    novas_fotos: Optional[List[UploadFile]] = File(None),
    current_user: UsuarioInDB = Depends(get_current_user)
):
    # ... (lógica mantida)
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"ID inválido: {id}")
    db_quarto = collection_quartos.find_one({"_id": ObjectId(id)})
    if not db_quarto: raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Quarto com ID {id} não encontrado")
    dados_para_atualizar = {}
    update_data = {
        "numero": numero, "titulo": titulo, "descricao": descricao,
        "status": status, "preco_diaria": preco_diaria,
        "capacidade_hospedes": capacidade_hospedes, "comodidades": comodidades
    }
    for key, value in update_data.items():
        if value is not None: dados_para_atualizar[key] = value
    if novas_fotos:
        caminhos_fotos_existentes = db_quarto.get("fotos", []) or []
        upload_dir = os.path.join("static", "images", "quartos", id)
        os.makedirs(upload_dir, exist_ok=True)
        for foto in novas_fotos:
            file_path = os.path.join(upload_dir, foto.filename)
            with open(file_path, "wb") as buffer: shutil.copyfileobj(foto.file, buffer)
            url_path = file_path.replace("\\", "/")
            if f"/{url_path}" not in caminhos_fotos_existentes: caminhos_fotos_existentes.append(f"/{url_path}")
        dados_para_atualizar["fotos"] = caminhos_fotos_existentes
    if len(dados_para_atualizar) >= 1:
        collection_quartos.update_one({"_id": ObjectId(id)}, {"$set": dados_para_atualizar})
    quarto_atualizado = collection_quartos.find_one({"_id": ObjectId(id)})
    return quarto_helper(quarto_atualizado)


# --- Rota DELETE para Deletar um Quarto ---
# CORREÇÃO: Caminho alterado de "/quartos/{id}" para "/{id}"
@router.delete("/{id}", response_description="Deleta um quarto")
async def deletar_quarto(id: str, current_user: UsuarioInDB = Depends(get_current_user)):
    # ... (lógica mantida)
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"ID inválido: {id}")
    resultado = collection_quartos.delete_one({"_id": ObjectId(id)})
    if resultado.deleted_count == 1:
        shutil.rmtree(os.path.join("static", "images", "quartos", id), ignore_errors=True)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Quarto com ID {id} não encontrado")

