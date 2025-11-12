# Em: api-pousada/auth.py

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext # Importa o CryptContext
from datetime import datetime, timedelta, timezone # Garante que temos todos os imports
from config.database import collection_usuarios
from models.usuario import UsuarioInDB
import os

# --- Configuração do Passlib (Contexto de Senha) ---
# Define o 'bcrypt' como o esquema de hash padrão
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- Configuração do OAuth2 ---
# Define a rota onde o cliente vai enviar o username/password (a sua rota de login)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

# --- Configuração do JWT (Token) ---
SECRET_KEY = os.getenv("SECRET_KEY", "uma_chave_secreta_padrao_para_teste") # Lê a chave do .env
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 # O token expira em 60 minutos

# --- Funções de Autenticação (COM A CORREÇÃO) ---

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica se a senha fornecida (plain) bate com o hash.
    [CORRIGIDO] Trunca a senha para 72 caracteres para evitar o erro do bcrypt.
    """
    try:
        # Trunca a senha para 72 caracteres ANTES de verificar
        return pwd_context.verify(plain_password[:72], hashed_password)
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    """
    Gera um hash para a senha fornecida.
    [CORRIGIDO] Trunca a senha para 72 caracteres para evitar o erro do bcrypt.
    """
    # Trunca a senha para 72 caracteres ANTES de criar o hash
    return pwd_context.hash(password[:72])

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """Cria um novo token de acesso (JWT)."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Dependência do FastAPI: Valida o token e retorna os dados do utilizador.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user_data = collection_usuarios.find_one({"username": username})
    
    if user_data is None:
        raise credentials_exception
        
    # Converte o documento do MongoDB para o modelo Pydantic
    user = UsuarioInDB(**user_data)
    
    return user