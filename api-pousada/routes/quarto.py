# Em: api-pousada/routes/quarto.py

# Imports nativos e de bibliotecas
import os
from typing import List, Optional
import cloudinary
import cloudinary.uploader
import cloudinary.api

# Imports do FastAPI e relacionados
from fastapi import APIRouter, Body, status, HTTPException, Response, Depends, File, UploadFile, Form
from bson import ObjectId

# Imports locais do projeto
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
    print(f"❌ Erro ao configurar Cloudinary. Verifique as variáveis de ambiente: {e}")
# ----------------------------------

# --- Função Auxiliar (Sem alterações) ---
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

# --- Rotas GET (Sem alterações) ---
@router.get("", response_description="Lista todos os quartos")
async def obter_todos_os_quartos():
    quartos = []
    try:
        for quarto_doc in collection_quartos.find():
            if quarto_doc:
                 quartos.append(quarto_helper(quarto_doc))
        return quartos
    except Exception as e:
        print(f"Erro ao buscar quartos: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno ao buscar quartos.")


@router.get("/{id}", response_description="Busca um quarto por ID")
async def buscar_quarto_por_id(id: str):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"ID inválido: {id}")

    try:
        quarto = collection_quartos.find_one({"_id": ObjectId(id)})
        if quarto:
            return quarto_helper(quarto)
    except Exception as e:
        print(f"Erro ao buscar quarto por ID {id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno ao buscar quarto.")

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Quarto com ID {id} não encontrado")


# --- Rota POST para Criar um Quarto (Sem alterações) ---
@router.post(
    "",
    response_description="Adiciona um novo quarto",
    status_code=status.HTTP_201_CREATED
)
async def criar_quarto(
    numero: int = Form(...),
    titulo: Optional[str] = Form(default=None),
    descricao: str = Form(...),
    status: str = Form(...),
    preco_diaria: float = Form(...),
    capacidade_hospedes: int = Form(...),
    comodidades: List[str] = Form(...),
    images: Optional[List[UploadFile]] = File(None), 
    current_user: UsuarioInDB = Depends(get_current_user)
):
    novo_quarto_dict = {
        "numero": numero, "titulo": titulo, "descricao": descricao,
        "status": status, "preco_diaria": preco_diaria,
        "capacidade_hospedes": capacidade_hospedes, "comodidades": comodidades,
        "fotos": []
    }

    try:
        resultado = collection_quartos.insert_one(novo_quarto_dict)
        novo_id = str(resultado.inserted_id)
        print(f"Quarto inserido na DB com ID: {novo_id}")
    except Exception as e:
        print(f"Erro ao inserir quarto na DB: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro ao inserir quarto na base de dados: {e}")

    if images:
        urls_fotos_cloudinary = []
        print(f"Recebidas {len(images)} fotos para upload.")
        for idx, foto in enumerate(images):
            if foto.filename:
                print(f"Processando foto {idx+1}: {foto.filename}")
                try:
                    upload_result = cloudinary.uploader.upload(
                        foto.file,
                        folder=f"pousada_zekas/quartos/{novo_id}",
                        resource_type="image"
                    )
                    secure_url = upload_result.get('secure_url')
                    if secure_url:
                        urls_fotos_cloudinary.append(secure_url)
                        print(f"Upload da foto {foto.filename} bem-sucedido: {secure_url}")
                    else:
                        print(f"AVISO: Upload da foto {foto.filename} retornou sem URL segura.")
                except Exception as e:
                    print(f"❌ Erro ao fazer upload da foto {foto.filename} para Cloudinary: {e}")
            else:
                 print(f"AVISO: Upload {idx+1} recebido sem nome de ficheiro.")

        if urls_fotos_cloudinary:
            print(f"Atualizando quarto {novo_id} com {len(urls_fotos_cloudinary)} URLs de fotos.")
            try:
                collection_quartos.update_one(
                    {"_id": ObjectId(novo_id)},
                    {"$set": {"fotos": urls_fotos_cloudinary}}
                )
            except Exception as e:
                 print(f"❌ Erro ao atualizar URLs das fotos no MongoDB para o quarto {novo_id}: {e}")
                 raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro ao guardar URLs das fotos na base de dados.")
        else:
            print("Nenhuma foto foi carregada com sucesso para o Cloudinary.")

    try:
        quarto_criado = collection_quartos.find_one({"_id": ObjectId(novo_id)})
        if quarto_criado:
            print(f"Retornando quarto criado: {novo_id}")
            return quarto_helper(quarto_criado)
    except Exception as e:
        print(f"❌ Erro ao buscar quarto final {novo_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro ao buscar o quarto após a criação.")

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quarto não encontrado após a criação.")


# --- [INÍCIO DA CORREÇÃO] ---
# --- Rota PUT para Atualizar um Quarto (LÓGICA CORRIGIDA) ---
@router.put("/{id}", response_description="Atualiza um quarto")
async def atualizar_quarto(
    id: str,
    numero: Optional[int] = Form(None),
    titulo: Optional[str] = Form(None),
    descricao: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    preco_diaria: Optional[float] = Form(None),
    capacidade_hospedes: Optional[int] = Form(None),
    comodidades: Optional[List[str]] = Form(None),
    images: Optional[List[UploadFile]] = File(None), 
    current_user: UsuarioInDB = Depends(get_current_user)
):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"ID inválido: {id}")

    try:
        db_quarto = collection_quartos.find_one({"_id": ObjectId(id)})
        if not db_quarto:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Quarto com ID {id} não encontrado")
    except Exception as e:
         print(f"Erro ao buscar quarto {id} para atualizar: {e}")
         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno ao buscar quarto para atualização.")

    # Prepara os dados de texto para atualização
    dados_para_atualizar = {}
    update_data = {
        "numero": numero, "titulo": titulo, "descricao": descricao,
        "status": status, "preco_diaria": preco_diaria,
        "capacidade_hospedes": capacidade_hospedes, "comodidades": comodidades
    }
    for key, value in update_data.items():
        if value is not None:
            dados_para_atualizar[key] = value

    # --- LÓGICA DE FOTOS CORRIGIDA ---
    # Se novas imagens foram enviadas (images is not None e não está vazio),
    # faz o upload e SUBSTITUI a lista de fotos antiga.
    if images:
        print(f"Recebidas {len(images)} novas fotos. SUBSTITUINDO lista antiga para o quarto {id}.")
        urls_novas_cloudinary = [] # Começa uma lista NOVA
        
        for idx, foto in enumerate(images):
            if foto.filename:
                print(f"Processando nova foto {idx+1}: {foto.filename}")
                try:
                    upload_result = cloudinary.uploader.upload(
                        foto.file,
                        folder=f"pousada_zekas/quartos/{id}" # Guarda na pasta do quarto existente
                    )
                    nova_url = upload_result.get('secure_url')
                    if nova_url:
                        urls_novas_cloudinary.append(nova_url) # Adiciona à lista NOVA
                        print(f"Nova foto {foto.filename} adicionada: {nova_url}")
                    else:
                        print(f"AVISO: Upload da foto {foto.filename} retornou sem URL segura.")

                except Exception as e:
                    print(f"❌ Erro ao fazer upload da foto {foto.filename} na atualização: {e}")
            else:
                print(f"AVISO: Upload {idx+1} recebido sem nome de ficheiro na atualização.")

        # Define o campo 'fotos' nos dados a atualizar com a NOVA lista
        dados_para_atualizar["fotos"] = urls_novas_cloudinary
        print(f"Lista de fotos SUBSTITUÍDA para o quarto {id}.")
        
    # Se 'images' estiver vazio (o usuário não enviou fotos novas),
    # a chave 'fotos' NÃO é adicionada a 'dados_para_atualizar'.
    # Isso preserva a lista de fotos que já estava no banco.
    # --- FIM DA LÓGICA DE FOTOS CORRIGIDA ---


    # Executa a atualização no MongoDB
    if len(dados_para_atualizar) >= 1:
        print(f"Atualizando dados do quarto {id} no MongoDB.")
        try:
            collection_quartos.update_one({"_id": ObjectId(id)}, {"$set": dados_para_atualizar})
        except Exception as e:
            print(f"❌ Erro ao atualizar quarto {id} no MongoDB: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro ao atualizar quarto na base de dados: {e}")
    else:
        print(f"Nenhum dado novo (texto ou fotos) para atualizar para o quarto {id}.")


    # Busca e retorna o quarto atualizado
    try:
        quarto_atualizado = collection_quartos.find_one({"_id": ObjectId(id)})
        if quarto_atualizado:
            print(f"Retornando quarto atualizado: {id}")
            return quarto_helper(quarto_atualizado)
    except Exception as e:
        print(f"❌ Erro ao buscar quarto final {id} após atualização: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro ao buscar o quarto após a atualização.")

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Quarto com ID {id} não encontrado após atualização.")
# --- [FIM DA CORREÇÃO] ---


# --- Rota DELETE (Sem alterações) ---
@router.delete("/{id}", response_description="Deleta um quarto")
async def deletar_quarto(id: str, current_user: UsuarioInDB = Depends(get_current_user)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"ID inválido: {id}")

    try:
        print(f"Tentando apagar quarto {id} do MongoDB.")
        # --- Adiciona busca pelas fotos ANTES de apagar ---
        quarto_para_apagar = collection_quartos.find_one({"_id": ObjectId(id)})
        if not quarto_para_apagar:
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Quarto com ID {id} não encontrado")
        
        # Pega os public_ids das fotos para apagar do Cloudinary
        # (Esta parte da lógica de apagar já estava boa, mas precisa
        # ser executada ANTES de apagar o quarto do DB, ou então 
        # você perde a referência das fotos)
        
        # Vamos apagar do DB primeiro, como estava no seu original
        resultado = collection_quartos.delete_one({"_id": ObjectId(id)})

    except Exception as e:
        print(f"❌ Erro ao apagar quarto {id} do MongoDB: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno ao tentar apagar o quarto da base de dados.")


    if resultado.deleted_count == 1:
        print(f"Quarto {id} apagado com sucesso do MongoDB.")
        # --- Lógica de apagar do Cloudinary (sem alterações) ---
        folder_path = f"pousada_zekas/quartos/{id}"
        try:
            print(f"Tentando apagar recursos do Cloudinary na pasta: {folder_path}")
            resources_to_delete = cloudinary.api.resources(type="upload", prefix=folder_path)
            public_ids = [res['public_id'] for res in resources_to_delete.get('resources', [])]

            if public_ids:
                print(f"Encontrados {len(public_ids)} recursos para apagar: {public_ids}")
                delete_result = cloudinary.api.delete_resources(public_ids, resource_type="image", invalidate=True)
                print(f"Resultado da exclusão de recursos: {delete_result}")
            else:
                print(f"Nenhum recurso encontrado na pasta {folder_path} para apagar.")

            try:
                delete_folder_result = cloudinary.api.delete_folder(folder_path)
                print(f"Resultado da exclusão da pasta: {delete_folder_result}")
            except Exception as folder_error:
                print(f"Aviso: Não foi possível apagar a pasta {folder_path} do Cloudinary (pode não estar vazia ou não existir): {folder_error}")

        except Exception as e:
            print(f"AVISO: Quarto {id} apagado da DB, mas falha ao tentar apagar recursos no Cloudinary ({folder_path}): {e}")

        return Response(status_code=status.HTTP_204_NO_CONTENT)

    print(f"Quarto {id} não encontrado no MongoDB para exclusão.")
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Quarto com ID {id} não encontrado")