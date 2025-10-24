# Em: api-pousada/models/cliente.py
from pydantic import BaseModel, Field, EmailStr
from typing import Optional

class Cliente(BaseModel):
    nome: str = Field(..., description="Nome completo do cliente")
    cpf: Optional[str] = Field(None, description="CPF do cliente")
    rg: Optional[str] = Field(None, description="RG ou Passaporte do cliente")
    email: Optional[EmailStr] = Field(None, description="Email do cliente")
    telefone: Optional[str] = Field(None, description="Telefone do cliente")
    endereco: Optional[str] = Field(None, description="Endereço (Rua, Nº)")
    bairro: Optional[str] = Field(None, description="Bairro")
    cep: Optional[str] = Field(None, description="CEP")
    cidade: Optional[str] = Field(None, description="Cidade")
    estado: Optional[str] = Field(None, description="Estado")
    pais: Optional[str] = Field(None, description="País")
    observacoes: Optional[str] = Field(None, description="Observações sobre o cliente")

class UpdateCliente(BaseModel):
    nome: Optional[str] = None
    cpf: Optional[str] = None
    rg: Optional[str] = None
    email: Optional[EmailStr] = None
    telefone: Optional[str] = None
    endereco: Optional[str] = None
    bairro: Optional[str] = None
    cep: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    pais: Optional[str] = None
    observacoes: Optional[str] = None