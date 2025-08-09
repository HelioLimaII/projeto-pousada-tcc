# Em: api-pousada/models/quarto.py

from pydantic import BaseModel, Field
from typing import List, Optional

class Quarto(BaseModel):
    numero: int = Field(...)
    titulo: str = Field(...)
    descricao: str = Field(...)
    fotos: List[str] = Field(default=[], description="A primeira foto é a principal.")
    status: str = Field(default="disponivel")
    # --- NOVOS CAMPOS ADICIONADOS ---
    preco_diaria: float = Field(..., gt=0, description="Preço da diária em BRL")
    capacidade_hospedes: int = Field(..., gt=0, description="Número máximo de hóspedes")
    comodidades: List[str] = Field(default=[], description="Lista de comodidades, ex: 'Wi-Fi', 'TV'")

class UpdateQuarto(BaseModel):
    numero: Optional[int] = None
    titulo: Optional[str] = None
    descricao: Optional[str] = None
    fotos: Optional[List[str]] = None
    status: Optional[str] = None
    # --- NOVOS CAMPOS ADICIONADOS ---
    preco_diaria: Optional[float] = None
    capacidade_hospedes: Optional[int] = None
    comodidades: Optional[List[str]] = None