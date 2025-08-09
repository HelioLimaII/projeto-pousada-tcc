# Em: api-pousada/routes/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from auth import create_access_token, verify_password, get_password_hash
from config.database import collection_usuarios
from models.usuario import Token, UsuarioInDB

router = APIRouter()


@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    # Busca o usuário no banco de dados
    user = collection_usuarios.find_one({"username": form_data.username})

    # Verifica se o usuário existe e se a senha está correta
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Define o tempo de expiração do token
    access_token_expires = timedelta(minutes=30)

    # Cria o token de acesso
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


# --- NOVA ROTA ADICIONADA ---
@router.post("/registrar", response_model=UsuarioInDB, status_code=status.HTTP_201_CREATED)
async def registrar_usuario(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Cria um novo usuário no banco. A senha será criptografada.
    Endpoint para facilitar a criação do primeiro gerente.
    """
    # Verifica se o usuário já existe para evitar duplicatas
    if collection_usuarios.find_one({"username": form_data.username}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nome de usuário já existe.",
        )
        
    # Cria o objeto do usuário com a senha criptografada
    user_in_db = UsuarioInDB(
        username=form_data.username,
        hashed_password=get_password_hash(form_data.password)
    )
    
    # Insere o novo usuário no banco de dados
    collection_usuarios.insert_one(user_in_db.model_dump())
    
    return user_in_db