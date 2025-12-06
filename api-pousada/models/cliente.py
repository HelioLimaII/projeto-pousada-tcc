# Em: api-pousada/models/cliente.py

from pydantic import BaseModel, Field
from typing import Optional

class Cliente(BaseModel):
    # Apenas o Nome é obrigatório (...)
    nome: str = Field(..., description="Nome completo do cliente")
    
    # Todos os outros campos são opcionais (default=None)
    cpf: Optional[str] = Field(default=None, description="CPF do cliente")
    rg: Optional[str] = Field(default=None, description="RG ou Passaporte do cliente")
    
    # Alterado para str para aceitar vazio caso não seja preenchido
    email: Optional[str] = Field(default=None, description="Email do cliente") 
    
    telefone: Optional[str] = Field(default=None, description="Telefone do cliente")
    
    # Endereço
    endereco: Optional[str] = Field(default=None, description="Endereço (Rua, Nº)")
    bairro: Optional[str] = Field(default=None, description="Bairro")
    cep: Optional[str] = Field(default=None, description="CEP")
    cidade: Optional[str] = Field(default=None, description="Cidade")
    estado: Optional[str] = Field(default=None, description="Estado")
    pais: Optional[str] = Field(default=None, description="País")
    
    observacoes: Optional[str] = Field(default=None, description="Observações sobre o cliente")

class UpdateCliente(BaseModel):
    nome: Optional[str] = None
    cpf: Optional[str] = None
    rg: Optional[str] = None
    email: Optional[str] = None
    telefone: Optional[str] = None
    endereco: Optional[str] = None
    bairro: Optional[str] = None
    cep: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    pais: Optional[str] = None
    observacoes: Optional[str] = None