# Em: api-pousada/models/usuario.py

from pydantic import BaseModel

# Modelo para representar os dados do usuário no banco de dados
class UsuarioInDB(BaseModel):
    username: str
    hashed_password: str

# Modelo para a resposta do token que será enviada após o login
class Token(BaseModel):
    access_token: str
    token_type: str