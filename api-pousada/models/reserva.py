# Em: api-pousada/models/reserva.py

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Reserva(BaseModel):
    id_quarto: str = Field(..., description="ID do quarto que está sendo reservado")
    id_cliente: str = Field(..., description="ID do cliente selecionado para a reserva") # REINTRODUZIDO
    hospede_nome: Optional[str] = Field(None, description="Nome do hóspede (será preenchido automaticamente)") # Torna opcional na entrada, mas será guardado
    data_checkin: datetime = Field(..., description="Data e hora do check-in")
    data_checkout: datetime = Field(..., description="Data e hora do check-out")
    status: str = Field(default="Pendente", description="Status: Pendente, Confirmada, Check-in, Check-out")
    valor_total: Optional[float] = Field(None, gt=0, description="Valor total da reserva") # Torna opcional para flexibilidade
    observacoes: Optional[str] = Field(None, description="Observações internas da reserva")

class UpdateReserva(BaseModel):
    id_quarto: Optional[str] = None
    id_cliente: Optional[str] = None # REINTRODUZIDO
    hospede_nome: Optional[str] = None # Permite atualizar se necessário, mas idealmente é automático
    data_checkin: Optional[datetime] = None
    data_checkout: Optional[datetime] = None
    status: Optional[str] = None
    valor_total: Optional[float] = None
    observacoes: Optional[str] = None

