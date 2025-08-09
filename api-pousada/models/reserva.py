# Em: api-pousada/models/reserva.py

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Reserva(BaseModel):
    id_quarto: str = Field(..., description="ID do quarto que está sendo reservado")
    id_cliente: str = Field(..., description="ID do cliente que fez a reserva")
    data_checkin: datetime = Field(..., description="Data e hora do check-in")
    data_checkout: datetime = Field(..., description="Data e hora do check-out")
    status: str = Field(default="Pendente", description="Status: Pendente, Confirmada, Cancelada, Finalizada")
    valor_total: float = Field(..., gt=0, description="Valor total da reserva")

class UpdateReserva(BaseModel):
    id_quarto: Optional[str] = None
    id_cliente: Optional[str] = None
    data_checkin: Optional[datetime] = None
    data_checkout: Optional[datetime] = None
    status: Optional[str] = None
    valor_total: Optional[float] = None