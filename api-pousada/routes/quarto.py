# Arquivo: api-pousada/routes/quarto.py

import os
from typing import List, Optional
import cloudinary
import cloudinary.uploader
import cloudinary.api

# Imports do FastAPI
from fastapi import APIRouter, Body, status, HTTPException, Response, Depends, File, UploadFile, Form
from fastapi.encoders import jsonable_encoder
from bson import ObjectId

# Imports locais
from models.quarto import Quarto, UpdateQuarto
from config.database import collection_quartos
from auth import get_current_user
from models.usuario import UsuarioInDB

router = APIRouter()

# --- Configuração do Cloudinary ---
try:
    cloudinary.config(
      cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"),
      api_key = os.getenv("CLOUDINARY_API_KEY"),
      api_secret = os.getenv("CLOUDINARY_API_SECRET"),
      secure = True
    )
    print("✅ Configuração do Cloudinary carregada.")
except Exception as e:
    print(f"❌ Erro ao configurar Cloudinary: {e}")

# --- Função Auxiliar ---
def quarto_helper(quarto) -> dict:
    fotos = quarto.get("fotos", [])
    if fotos is None:
        fotos = []

    return {
        "id": str(quarto["_id"]),
        "numero": quarto.get("numero"),
        "titulo": quarto.get("titulo"),
        "descricao": quarto.get("descricao"),
        "fotos": fotos,
        "status": quarto.get("status"),
        "preco_diaria": quarto.get("preco_diaria"),
        "capacidade_hospedes": quarto.get("capacidade_hospedes"),
        "comodidades": quarto.get("comodidades", []),
    }

# --- Rotas GET ---
@router.get("", response_description="Lista todos os quartos")
async def obter_todos_os_quartos():
    quartos = []
    try:
        for quarto_doc in collection_quartos.find():
            quartos.append(quarto_helper(quarto_doc))
        return quartos
    except Exception as e:
        print(f"Erro ao buscar quartos: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao buscar quartos.")

@router.get("/{id}", response_description="Busca um quarto por ID")
async def buscar_quarto_por_id(id: str):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="ID inválido")

    quarto = collection_quartos.find_one({"_id": ObjectId(id)})
    if quarto:
        return quarto_helper(quarto)
    
    raise HTTPException(status_code=404, detail="Quarto não encontrado")

# --- Rota POST (Criar) ---
@router.post("", response_description="Adiciona um novo quarto", status_code=status.HTTP_201_CREATED)
async def criar_quarto(
    numero: int = Form(...),
    titulo: Optional[str] = Form(None),
    descricao: str = Form(...),
    status: str = Form(...),
    preco_diaria: float = Form(...),
    capacidade_hospedes: int = Form(...),
    # Recebe lista de imagens no POST
    images: List[UploadFile] = File(None), 
    current_user: UsuarioInDB = Depends(get_current_user)
):
    novo_quarto_dict = {
        "numero": numero, "titulo": titulo, "descricao": descricao,
        "status": status, "preco_diaria": preco_diaria,
        "capacidade_hospedes": capacidade_hospedes, 
        "comodidades": [],
        "fotos": []
    }

    # 1. Insere no Banco primeiro para ter o ID
    try:
        resultado = collection_quartos.insert_one(novo_quarto_dict)
        novo_id = str(resultado.inserted_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao inserir na DB: {e}")

    # 2. Upload das Imagens (se houver)
    if images:
        urls_fotos = []
        for foto in images:
            if foto.filename:
                try:
                    upload_result = cloudinary.uploader.upload(
                        foto.file,
                        folder=f"pousada_zekas/quartos/{novo_id}",
                        resource_type="image"
                    )
                    urls_fotos.append(upload_result.get('secure_url'))
                except Exception as e:
                    print(f"Erro upload imagem POST: {e}")

        # Atualiza o quarto com as URLs
        if urls_fotos:
            collection_quartos.update_one(
                {"_id": ObjectId(novo_id)},
                {"$set": {"fotos": urls_fotos}}
            )

    # 3. Retorna o quarto criado
    quarto_criado = collection_quartos.find_one({"_id": ObjectId(novo_id)})
    return quarto_helper(quarto_criado)


# --- Rota PUT (Atualizar) - CORRIGIDA ---
@router.put("/{id}", response_description="Atualiza um quarto")
async def atualizar_quarto(
    id: str,
    # Dados opcionais via Form
    numero: Optional[int] = Form(None),
    titulo: Optional[str] = Form(None),
    descricao: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    preco_diaria: Optional[float] = Form(None),
    capacidade_hospedes: Optional[int] = Form(None),
    # Arquivos novos via UploadFile
    novas_fotos: List[UploadFile] = File(None), 
    current_user: UsuarioInDB = Depends(get_current_user)
):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="ID inválido")

    # 1. Monta dados de texto para atualizar
    update_data = {}
    if numero is not None: update_data["numero"] = numero
    if titulo is not None: update_data["titulo"] = titulo
    if descricao is not None: update_data["descricao"] = descricao
    if status is not None: update_data["status"] = status
    if preco_diaria is not None: update_data["preco_diaria"] = preco_diaria
    if capacidade_hospedes is not None: update_data["capacidade_hospedes"] = capacidade_hospedes

    # 2. Processa Imagens Novas (se houver)
    if novas_fotos:
        urls_novas = []
        for foto in novas_fotos:
            if foto.filename:
                try:
                    upload_result = cloudinary.uploader.upload(
                        foto.file,
                        folder=f"pousada_zekas/quartos/{id}"
                    )
                    url = upload_result.get('secure_url')
                    if url:
                        urls_novas.append(url)
                except Exception as e:
                    print(f"Erro upload imagem PUT: {e}")
        
        # Se subiu fotos, ADICIONA ao array existente ($push)
        if urls_novas:
            collection_quartos.update_one(
                {"_id": ObjectId(id)},
                {"$push": {"fotos": {"$each": urls_novas}}}
            )

    # 3. Atualiza os dados de texto (se houver)
    if update_data:
        collection_quartos.update_one(
            {"_id": ObjectId(id)},
            {"$set": update_data}
        )

    # 4. Retorna o resultado final
    quarto_atualizado = collection_quartos.find_one({"_id": ObjectId(id)})
    if quarto_atualizado:
        return quarto_helper(quarto_atualizado)
    
    raise HTTPException(status_code=404, detail="Quarto não encontrado após update")


# --- Rota DELETE (Apagar) ---
@router.delete("/{id}", response_description="Deleta um quarto")
async def deletar_quarto(id: str, current_user: UsuarioInDB = Depends(get_current_user)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="ID inválido")

    # Verifica se existe antes de apagar
    if not collection_quartos.find_one({"_id": ObjectId(id)}):
         raise HTTPException(status_code=404, detail="Quarto não encontrado")
    
    # Deleta do Mongo
    resultado = collection_quartos.delete_one({"_id": ObjectId(id)})

    if resultado.deleted_count == 1:
        # Tenta limpar Cloudinary (opcional, não quebra se falhar)
        folder_path = f"pousada_zekas/quartos/{id}"
        try:
            resources = cloudinary.api.resources(type="upload", prefix=folder_path)
            ids = [r['public_id'] for r in resources.get('resources', [])]
            if ids:
                cloudinary.api.delete_resources(ids, invalidate=True)
            cloudinary.api.delete_folder(folder_path)
        except Exception as e:
            print(f"Aviso: Erro ao limpar Cloudinary: {e}")

        return Response(status_code=status.HTTP_204_NO_CONTENT)

    raise HTTPException(status_code=500, detail="Erro ao deletar quarto")