# Em: api-pousada/routes/quarto.py

# Imports nativos e de bibliotecas
import os
# import shutil # Não precisamos mais para guardar ficheiros
from typing import List, Optional
import cloudinary # Importa a biblioteca base
import cloudinary.uploader # Importa o uploader específico
import cloudinary.api    # Importa a API (para apagar, se necessário)

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
# Lê as credenciais das variáveis de ambiente que configurámos no Render
# Garanta que as variáveis CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
# estão definidas no ambiente do seu serviço Render.
try:
    cloudinary.config(
      cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"),
      api_key = os.getenv("CLOUDINARY_API_KEY"),
      api_secret = os.getenv("CLOUDINARY_API_SECRET"),
      secure = True # Garante que as URLs geradas usem HTTPS
    )
    print("✅ Configuração do Cloudinary carregada.")
except Exception as e:
    print(f"❌ Erro ao configurar Cloudinary. Verifique as variáveis de ambiente: {e}")
    # Considerar lançar uma exceção aqui se o Cloudinary for essencial
# ----------------------------------

# --- Função Auxiliar (Sem alterações na lógica principal) ---
def quarto_helper(quarto) -> dict:
    # Garante que 'fotos' existe e é uma lista, mesmo que seja None no DB
    fotos = quarto.get("fotos", [])
    if fotos is None:
        fotos = []

    return {
        "id": str(quarto["_id"]),
        "numero": quarto.get("numero"),
        "titulo": quarto.get("titulo"),
        "descricao": quarto.get("descricao"),
        "fotos": fotos, # Usa a lista garantida
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
        # Usar um loop mais seguro com verificação
        for quarto_doc in collection_quartos.find():
            if quarto_doc: # Garante que o documento existe
                 quartos.append(quarto_helper(quarto_doc))
        return quartos
    except Exception as e:
        print(f"Erro ao buscar quartos: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno ao buscar quartos.")


@router.get("/{id}", response_description="Busca um quarto por ID")
async def buscar_quarto_por_id(id: str):
    # Validação do ObjectId para evitar erros 500 se o ID for inválido
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


# --- Rota POST para Criar um Quarto (Modificada para Cloudinary) ---
@router.post(
    "", # Caminho vazio
    response_description="Adiciona um novo quarto",
    status_code=status.HTTP_201_CREATED
)
async def criar_quarto(
    numero: int = Form(...),
    titulo: str = Form(...),
    descricao: str = Form(...),
    status: str = Form(...),
    preco_diaria: float = Form(...),
    capacidade_hospedes: int = Form(...),
    comodidades: List[str] = Form(...),
    novas_fotos: Optional[List[UploadFile]] = File(None), # Recebe as fotos
    current_user: UsuarioInDB = Depends(get_current_user)
):
    # Cria o dicionário do quarto sem as fotos inicialmente
    novo_quarto_dict = {
        "numero": numero, "titulo": titulo, "descricao": descricao,
        "status": status, "preco_diaria": preco_diaria,
        "capacidade_hospedes": capacidade_hospedes, "comodidades": comodidades,
        "fotos": [] # Começa com lista vazia
    }

    # Insere o quarto na base de dados para obter o ID
    try:
        resultado = collection_quartos.insert_one(novo_quarto_dict)
        novo_id = str(resultado.inserted_id)
        print(f"Quarto inserido na DB com ID: {novo_id}")
    except Exception as e:
        print(f"Erro ao inserir quarto na DB: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro ao inserir quarto na base de dados: {e}")

    # Processa as fotos, se houver
    if novas_fotos:
        urls_fotos_cloudinary = []
        print(f"Recebidas {len(novas_fotos)} fotos para upload.")
        for idx, foto in enumerate(novas_fotos):
            if foto.filename: # Garante que há um ficheiro
                print(f"Processando foto {idx+1}: {foto.filename}")
                try:
                    # Faz o upload para o Cloudinary
                    # 'folder' organiza os uploads na sua conta Cloudinary
                    upload_result = cloudinary.uploader.upload(
                        foto.file, # Envia o conteúdo do ficheiro
                        folder=f"pousada_zekas/quartos/{novo_id}", # Ex: pousada_zekas/quartos/60b...
                        resource_type="image" # Garante que é tratado como imagem
                    )
                    # Guarda a URL segura (HTTPS) retornada pelo Cloudinary
                    secure_url = upload_result.get('secure_url')
                    if secure_url:
                        urls_fotos_cloudinary.append(secure_url)
                        print(f"Upload da foto {foto.filename} bem-sucedido: {secure_url}")
                    else:
                        print(f"AVISO: Upload da foto {foto.filename} retornou sem URL segura.")

                except Exception as e:
                    # Se uma foto falhar, reportamos o erro e continuamos (ou paramos)
                    print(f"❌ Erro ao fazer upload da foto {foto.filename} para Cloudinary: {e}")
                    # Decide se quer parar todo o processo ou apenas ignorar esta foto
                    # raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro ao fazer upload da foto {foto.filename}")
            else:
                 print(f"AVISO: Upload {idx+1} recebido sem nome de ficheiro.") # Log para ficheiros vazios

        # Se houve uploads bem-sucedidos, atualiza o documento no MongoDB com as URLs
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

    # Busca o quarto final (com ou sem fotos) para retornar ao cliente
    try:
        quarto_criado = collection_quartos.find_one({"_id": ObjectId(novo_id)})
        if quarto_criado:
            print(f"Retornando quarto criado: {novo_id}")
            return quarto_helper(quarto_criado)
    except Exception as e:
        print(f"❌ Erro ao buscar quarto final {novo_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro ao buscar o quarto após a criação.")

    # Se não encontrar o quarto após a criação (improvável)
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quarto não encontrado após a criação.")


# --- Rota PUT para Atualizar um Quarto (Modificada para Cloudinary) ---
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
    novas_fotos: Optional[List[UploadFile]] = File(None), # Recebe novas fotos
    current_user: UsuarioInDB = Depends(get_current_user)
):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"ID inválido: {id}")

    # Busca o quarto existente
    try:
        db_quarto = collection_quartos.find_one({"_id": ObjectId(id)})
        if not db_quarto:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Quarto com ID {id} não encontrado")
    except Exception as e:
         print(f"Erro ao buscar quarto {id} para atualizar: {e}")
         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno ao buscar quarto para atualização.")


    # Prepara os dados normais para atualização (ignora campos None)
    dados_para_atualizar = {}
    update_data = {
        "numero": numero, "titulo": titulo, "descricao": descricao,
        "status": status, "preco_diaria": preco_diaria,
        "capacidade_hospedes": capacidade_hospedes, "comodidades": comodidades
    }
    for key, value in update_data.items():
        if value is not None:
            dados_para_atualizar[key] = value

    # Processa as novas fotos, adicionando-as à lista existente
    urls_fotos_atuais = db_quarto.get("fotos", []) or [] # Pega a lista atual ou uma lista vazia
    if novas_fotos:
        print(f"Recebidas {len(novas_fotos)} novas fotos para o quarto {id}.")
        for idx, foto in enumerate(novas_fotos):
            if foto.filename:
                print(f"Processando nova foto {idx+1}: {foto.filename}")
                try:
                    upload_result = cloudinary.uploader.upload(
                        foto.file,
                        folder=f"pousada_zekas/quartos/{id}" # Guarda na pasta do quarto existente
                    )
                    nova_url = upload_result.get('secure_url')
                    if nova_url and nova_url not in urls_fotos_atuais: # Adiciona apenas se for nova
                        urls_fotos_atuais.append(nova_url)
                        print(f"Nova foto {foto.filename} adicionada: {nova_url}")
                    elif nova_url:
                         print(f"URL da foto {foto.filename} já existe, ignorando.")
                    else:
                        print(f"AVISO: Upload da foto {foto.filename} retornou sem URL segura.")

                except Exception as e:
                    print(f"❌ Erro ao fazer upload da foto {foto.filename} na atualização: {e}")
                    # Decide se queres parar ou continuar
                    # raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro ao fazer upload da foto {foto.filename}")
            else:
                print(f"AVISO: Upload {idx+1} recebido sem nome de ficheiro na atualização.")

        # Define o campo 'fotos' nos dados a atualizar com a lista combinada
        dados_para_atualizar["fotos"] = urls_fotos_atuais
        print(f"Lista de fotos atualizada para o quarto {id}.")

    # Executa a atualização na base de dados apenas se houver algo para atualizar
    if len(dados_para_atualizar) >= 1:
        print(f"Atualizando dados do quarto {id} no MongoDB.")
        try:
            collection_quartos.update_one({"_id": ObjectId(id)}, {"$set": dados_para_atualizar})
        except Exception as e:
            print(f"❌ Erro ao atualizar quarto {id} no MongoDB: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro ao atualizar quarto na base de dados: {e}")
    else:
        print(f"Nenhum dado para atualizar para o quarto {id} (apenas fotos?).")

    # Busca e retorna o quarto atualizado
    try:
        quarto_atualizado = collection_quartos.find_one({"_id": ObjectId(id)})
        if quarto_atualizado:
            print(f"Retornando quarto atualizado: {id}")
            return quarto_helper(quarto_atualizado)
    except Exception as e:
        print(f"❌ Erro ao buscar quarto final {id} após atualização: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro ao buscar o quarto após a atualização.")

    # Se não encontrar o quarto após a atualização (muito improvável)
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Quarto com ID {id} não encontrado após atualização.")


# --- Rota DELETE para Deletar um Quarto (Modificada para Cloudinary) ---
@router.delete("/{id}", response_description="Deleta um quarto")
async def deletar_quarto(id: str, current_user: UsuarioInDB = Depends(get_current_user)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"ID inválido: {id}")

    # Primeiro, apaga o quarto da base de dados MongoDB
    try:
        print(f"Tentando apagar quarto {id} do MongoDB.")
        resultado = collection_quartos.delete_one({"_id": ObjectId(id)})
    except Exception as e:
        print(f"❌ Erro ao apagar quarto {id} do MongoDB: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno ao tentar apagar o quarto da base de dados.")


    if resultado.deleted_count == 1:
        print(f"Quarto {id} apagado com sucesso do MongoDB.")
        # Se apagou da DB, TENTA apagar os recursos associados no Cloudinary
        folder_path = f"pousada_zekas/quartos/{id}"
        try:
            # Apaga todos os recursos (imagens) dentro da pasta especificada
            print(f"Tentando apagar recursos do Cloudinary na pasta: {folder_path}")
            # Usar list=True pode ser necessário se houver muitos recursos
            resources_to_delete = cloudinary.api.resources(type="upload", prefix=folder_path)
            public_ids = [res['public_id'] for res in resources_to_delete.get('resources', [])]

            if public_ids:
                print(f"Encontrados {len(public_ids)} recursos para apagar: {public_ids}")
                delete_result = cloudinary.api.delete_resources(public_ids, resource_type="image", invalidate=True)
                print(f"Resultado da exclusão de recursos: {delete_result}")
            else:
                print(f"Nenhum recurso encontrado na pasta {folder_path} para apagar.")

            # Tenta apagar a pasta (só funciona se estiver vazia)
            try:
                delete_folder_result = cloudinary.api.delete_folder(folder_path)
                print(f"Resultado da exclusão da pasta: {delete_folder_result}")
            except Exception as folder_error:
                # É comum falhar se a exclusão de recursos ainda não terminou ou se nunca existiu
                print(f"Aviso: Não foi possível apagar a pasta {folder_path} do Cloudinary (pode não estar vazia ou não existir): {folder_error}")

        except Exception as e:
            # Se falhar ao interagir com o Cloudinary, não consideramos um erro fatal,
            # apenas registamos para limpeza manual posterior.
            print(f"AVISO: Quarto {id} apagado da DB, mas falha ao tentar apagar recursos no Cloudinary ({folder_path}): {e}")

        return Response(status_code=status.HTTP_204_NO_CONTENT) # Sucesso

    # Se não encontrou o quarto para apagar no MongoDB
    print(f"Quarto {id} não encontrado no MongoDB para exclusão.")
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Quarto com ID {id} não encontrado")
