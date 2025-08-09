# Em: api-pousada/auth.py

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from typing import Optional
import os
from dotenv import load_dotenv
from config.database import collection_usuarios
from models.usuario import UsuarioInDB

load_dotenv()

# --- Configuração de Segurança ---
# Chave secreta para "assinar" os tokens. Mantenha-a segura!
# Rode `openssl rand -hex 32` no terminal para gerar uma nova.
SECRET_KEY = os.getenv("SECRET_KEY", "uma_chave_secreta_padrao_para_teste")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Contexto para criptografia de senhas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Esquema de autenticação que o FastAPI usará na documentação
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# --- Funções ---
def verify_password(plain_password, hashed_password):
    """Verifica se a senha plana corresponde à senha criptografada."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Gera o hash de uma senha."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Cria um novo token de acesso JWT."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- NOVA FUNÇÃO "DEPENDÊNCIA" ---
async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Dependência para validar o token e retornar os dados do usuário.
    Será nosso "segurança" em cada rota protegida.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decodifica o token JWT
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Busca o usuário no banco de dados
    user = collection_usuarios.find_one({"username": username})
    if user is None:
        raise credentials_exception
        
    return UsuarioInDB(**user)