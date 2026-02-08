# Em: api-pousada/models/reserva.py

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Reserva(BaseModel):
    id_quarto: str = Field(..., description="ID do quarto que está sendo reservado")
    id_cliente: str = Field(..., description="ID do cliente selecionado para a reserva")
    hospede_nome: Optional[str] = Field(None, description="Nome do hóspede (será preenchido automaticamente)")
    data_checkin: datetime = Field(..., description="Data e hora do check-in")
    data_checkout: datetime = Field(..., description="Data e hora do check-out")
    status: str = Field(default="Pendente", description="Status: Pendente, Confirmada, Check-in, Check-out")
    valor_total: Optional[float] = Field(None, gt=0, description="Valor total da reserva")
    observacoes: Optional[str] = Field(None, description="Observações internas da reserva")
    
    # --- NOVOS CAMPOS FNRH (Adicionados) ---
    fnrh_reserva_id: Optional[str] = Field(None, description="ID oficial da reserva no sistema do Governo (FNRH)")
    fnrh_sincronizado: bool = Field(default=False, description="Indica se a reserva já foi enviada/sincronizada com sucesso")

class UpdateReserva(BaseModel):
    id_quarto: Optional[str] = None
    id_cliente: Optional[str] = None
    hospede_nome: Optional[str] = None
    data_checkin: Optional[datetime] = None
    data_checkout: Optional[datetime] = None
    status: Optional[str] = None
    valor_total: Optional[float] = None
    observacoes: Optional[str] = None
    
    # --- NOVOS CAMPOS FNRH (Para atualização) ---
    fnrh_reserva_id: Optional[str] = None
    fnrh_sincronizado: Optional[bool] = None