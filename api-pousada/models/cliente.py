# Em: api-pousada/models/cliente.py

from pydantic import BaseModel, Field
from typing import Optional

class Cliente(BaseModel):
    nome: str = Field(...)
    cep: str = Field(...)
    rg: str = Field(...)
    cpf: str = Field(...)
    placa_carro: Optional[str] = None

class UpdateCliente(BaseModel):
    nome: Optional[str] = None
    cep: Optional[str] = None
    rg: Optional[str] = None
    cpf: Optional[str] = None
    placa_carro: Optional[str] = None