# Em: api-pousada/models/cliente.py

from pydantic import BaseModel, Field
from typing import Optional

class Cliente(BaseModel):
    # --- Obrigatório ---
    nome: str = Field(..., description="Nome completo do cliente")
    
    # --- Documentos (Mantidos para compatibilidade com Front-end) ---
    cpf: Optional[str] = Field(default=None, description="CPF do cliente")
    rg: Optional[str] = Field(default=None, description="RG ou Passaporte")
    
    # --- Contato ---
    email: Optional[str] = Field(default=None, description="Email do cliente") 
    telefone: Optional[str] = Field(default=None, description="Telefone do cliente")
    
    # --- Novos Campos Exigidos pelo FNRH ---
    data_nascimento: Optional[str] = Field(default=None, description="Formato AAAA-MM-DD")
    genero: Optional[str] = Field(default=None, description="M = Masculino, F = Feminino")
    nacionalidade: Optional[str] = Field(default="BR", description="Código do País (BR, AR, etc.)")
    
    # --- Endereço Básico (Mantido) ---
    endereco: Optional[str] = Field(default=None, description="Endereço completo unificado")
    
    # --- Endereço Detalhado (Para FNRH) ---
    endereco_logradouro: Optional[str] = Field(default=None, description="Rua, Avenida, etc.")
    endereco_numero: Optional[str] = Field(default=None, description="Número")
    endereco_complemento: Optional[str] = Field(default=None, description="Apto, Bloco")
    endereco_bairro: Optional[str] = Field(default=None, description="Bairro")
    endereco_cep: Optional[str] = Field(default=None, description="CEP")
    endereco_cidade: Optional[str] = Field(default=None, description="Cidade")
    endereco_estado: Optional[str] = Field(default=None, description="Estado (UF)")
    endereco_pais: Optional[str] = Field(default="BR", description="País")
    
    # --- Controle ---
    observacoes: Optional[str] = Field(default=None, description="Observações")
    fnrh_id: Optional[str] = Field(default=None, description="ID do hóspede no sistema do governo")

class UpdateCliente(BaseModel):
    nome: Optional[str] = None
    cpf: Optional[str] = None
    rg: Optional[str] = None
    email: Optional[str] = None
    telefone: Optional[str] = None
    data_nascimento: Optional[str] = None
    genero: Optional[str] = None
    nacionalidade: Optional[str] = None
    endereco: Optional[str] = None
    endereco_logradouro: Optional[str] = None
    endereco_numero: Optional[str] = None
    endereco_complemento: Optional[str] = None
    endereco_bairro: Optional[str] = None
    endereco_cep: Optional[str] = None
    endereco_cidade: Optional[str] = None
    endereco_estado: Optional[str] = None
    endereco_pais: Optional[str] = None
    observacoes: Optional[str] = None
    fnrh_id: Optional[str] = None