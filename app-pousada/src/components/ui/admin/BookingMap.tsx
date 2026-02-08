'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Ban, CloudLightning, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BookingModal from './BookingModal';

interface Reserva {
  id: string;
  hospede_nome: string;
  data_checkin: string; 
  data_checkout: string; 
  status: 'Confirmada' | 'Pendente' | 'Check-in' | 'Check-out';
  fnrh_sincronizado?: boolean;
  fnrh_reserva_id?: string;
}

interface QuartoComReservas {
  id: string;
  numero: number;
  titulo: string;
  status?: string; 
  reservas: Reserva[];
}

export default function BookingMap() {
  const [data, setData] = useState<QuartoComReservas[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReservaId, setSelectedReservaId] = useState<string | null>(null);
  const [selectedQuartoId, setSelectedQuartoId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const ano = currentDate.getFullYear();
    const mes = currentDate.getMonth() + 1;
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/reservas/mapa?ano=${ano}&mes=${mes}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Falha ao obter dados do mapa.');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro.');
    } finally {
      setLoading(false);
    }
  }, [currentDate, API_BASE_URL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModalForNew = (quartoId: string, day: number) => {
    const quartoAlvo = data.find(q => q.id === quartoId);
    if (quartoAlvo && quartoAlvo.status === 'manutencao') {
        alert("⛔ AÇÃO BLOQUEADA\n\nEste quarto está em manutenção.");
        return; 
    }
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(date.toISOString().split('T')[0]);
    setSelectedQuartoId(quartoId);
    setSelectedReservaId(null);
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (reservaId: string) => {
    setSelectedDate(null);
    setSelectedQuartoId(null);
    setSelectedReservaId(reservaId);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => setIsModalOpen(false);
  const handleSave = () => fetchData();

  const daysInMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate(), [currentDate]);
  const monthName = useMemo(() => currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }), [currentDate]);

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(1);
      newDate.setMonth(prev.getMonth() + offset);
      return newDate;
    });
  };

  const getDayInfo = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isToday = date.getTime() === today.getTime();
    return { isWeekend, isToday };
  };

  const getStatusColor = (status: Reserva['status']) => {
    switch (status) {
      case 'Confirmada': return 'bg-green-600 hover:bg-green-700 border-green-700';
      case 'Pendente': return 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-600';
      case 'Check-in': return 'bg-blue-600 hover:bg-blue-700 border-blue-700';
      case 'Check-out': return 'bg-gray-500 hover:bg-gray-600 border-gray-600';
      default: return 'bg-purple-500 hover:bg-purple-600';
    }
  };

  // --- LÓGICA CORRIGIDA DE RENDERIZAÇÃO ---
  // Agora cria UM único bloco por reserva, em vez de um por dia.
  const renderReservationBlocksForDays = (reserva: Reserva) => {
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();

      // Datas UTC para evitar problemas de fuso
      const checkinDate = new Date(Date.UTC(
          parseInt(reserva.data_checkin.substring(0, 4)),
          parseInt(reserva.data_checkin.substring(5, 7)) - 1,
          parseInt(reserva.data_checkin.substring(8, 10))
      ));
      const checkoutDate = new Date(Date.UTC(
          parseInt(reserva.data_checkout.substring(0, 4)),
          parseInt(reserva.data_checkout.substring(5, 7)) - 1,
          parseInt(reserva.data_checkout.substring(8, 10))
      ));

      const startOfMonth = new Date(Date.UTC(currentYear, currentMonth, 1));
      const startOfNextMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 1));

      // Se a reserva não intercepta este mês, não renderiza nada
      if (checkoutDate <= startOfMonth || checkinDate >= startOfNextMonth) {
          return [];
      }

      // Calcula dia inicial e final dentro da grade do mês atual
      // Se checkin for antes do dia 1, começa no dia 1.
      let startDay = checkinDate < startOfMonth ? 1 : checkinDate.getUTCDate();
      
      // Se checkout for depois do fim do mês, vai até o último dia.
      // Se checkout for dentro do mês, usamos a data do checkout.
      // NOTA: No Grid, 'end' é a linha onde termina. 
      // Se checkout é dia 12, queremos cobrir a coluna 12 também? 
      // Geralmente check-out é meio dia, então visualmente cobre o dia 12.
      // Se a reserva é 10-12, ela ocupa as colunas 10, 11 e 12.
      const lastDayOfMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0)).getUTCDate();
      let endDay = checkoutDate >= startOfNextMonth ? lastDayOfMonth : checkoutDate.getUTCDate();

      // Ajuste de Grid: ColumnEnd é exclusivo. Se queremos ir até dia 12 (inclusive), End deve ser 13.
      const gridStart = startDay;
      const gridEnd = endDay + 1; 

      const titleInfo = `Hóspede: ${reserva.hospede_nome}
Entrada: ${reserva.data_checkin}
Saída: ${reserva.data_checkout}
Status: ${reserva.status}
FNRH: ${reserva.fnrh_sincronizado ? '✅ Enviado' : '⚠️ Pendente'}`;

      return (
          <div
              key={reserva.id}
              onClick={() => handleOpenModalForEdit(reserva.id)}
              className={`
                absolute top-[4px] bottom-[4px] left-[1px] right-[1px]
                rounded-md shadow-sm border border-white/20
                cursor-pointer transition-all flex items-center px-2
                overflow-hidden z-20
                ${getStatusColor(reserva.status)}
              `}
              style={{
                  gridColumnStart: gridStart,
                  gridColumnEnd: gridEnd,
              }}
              title={titleInfo}
          >
              <div className="flex items-center gap-1.5 w-full">
                  {/* ÍCONE DE SINCRONIA FNRH */}
                  {reserva.fnrh_sincronizado && (
                      <CloudLightning className="w-3.5 h-3.5 text-white fill-yellow-400 shrink-0" />
                  )}
                  
                  {/* NOME COM TRUNCATE PARA NÃO ESTOURAR */}
                  <span className="font-semibold text-xs text-white truncate whitespace-nowrap leading-tight">
                      {reserva.hospede_nome}
                  </span>
              </div>
          </div>
      );
  };

  return (
    <>
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-700 capitalize">{monthName}</h2>
              
              {/* LEGENDA RÁPIDA */}
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded border">
                  <div className="flex items-center gap-1">
                      <CloudLightning className="w-3 h-3 text-gray-400 fill-yellow-300" /> 
                      <span>= No Governo</span>
                  </div>
              </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCurrentDate(new Date())}>Hoje</Button>
            <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" onClick={() => changeMonth(1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <div
            className="grid gap-px bg-gray-200 relative"
            style={{
              // Largura mínima das células para não esmagar em telas pequenas
              gridTemplateColumns: `minmax(140px, auto) repeat(${daysInMonth}, minmax(40px, 1fr))`
            }}
          >
            {/* Header */}
            <div className="bg-gray-100 font-semibold p-2 sticky left-0 z-30 text-sm text-gray-600 border-r border-b border-gray-200 shadow-sm">Acomodação</div>
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const { isWeekend, isToday } = getDayInfo(day);
              return (
                <div key={day} className={`text-center flex flex-col justify-center font-medium p-1 text-xs border-b border-r border-gray-200 ${isWeekend ? 'bg-gray-100' : 'bg-white'} ${isToday ? 'bg-blue-50 ring-inset ring-2 ring-blue-500' : ''}`}>
                  <span>{day}</span>
                </div>
              );
            })}

            {/* Corpo */}
            {loading ? (
              <div style={{ gridColumn: `1 / -1`}} className="h-64 flex items-center justify-center bg-white"><Loader2 className="animate-spin mr-2"/> Carregando mapa...</div>
            ) : error ? (
              <div style={{ gridColumn: `1 / -1`}} className="h-64 flex items-center justify-center bg-white text-red-500">{error}</div>
            ) : data.length === 0 ? (
                 <div style={{ gridColumn: `1 / -1`}} className="h-64 flex items-center justify-center bg-white text-gray-500">Nenhum quarto encontrado.</div>
            ) : (
              data.map(quarto => {
                const isManutencao = quarto.status === 'manutencao';
                return (
                  <div key={quarto.id} className="contents group">
                      {/* Nome do Quarto */}
                      <div className={`p-3 border-r border-b border-gray-200 sticky left-0 z-20 text-sm flex flex-col justify-center shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] transition-colors ${isManutencao ? 'bg-gray-50' : 'bg-white group-hover:bg-slate-50'}`}>
                        <div className="flex items-center justify-between">
                            <p className={`truncate font-bold ${isManutencao ? 'text-gray-400' : 'text-gray-800'}`}>{quarto.titulo}</p>
                            {isManutencao && <Ban className="w-3 h-3 text-red-400" />}
                        </div>
                        <p className="text-xs text-gray-500">Quarto {quarto.numero}</p>
                        {isManutencao && (
                           <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded w-fit mt-1 font-bold uppercase">Bloqueado</span>
                        )}
                      </div>
                      
                      {/* Grid de Dias */}
                      <div
                        className={`col-start-2 col-span-full relative grid border-b border-gray-200 ${isManutencao ? 'bg-slate-50' : 'bg-white'}`}
                        style={{ 
                            gridTemplateColumns: `repeat(${daysInMonth}, minmax(40px, 1fr))`,
                            // Padrão listrado para manutenção
                            backgroundImage: isManutencao ? 'repeating-linear-gradient(45deg, transparent, transparent 10px, #f1f5f9 10px, #f1f5f9 20px)' : 'none'
                        }}
                      >
                        {/* Renderiza as células vazias para clique */}
                        {Array.from({ length: daysInMonth }, (_, i) => {
                          const day = i + 1;
                          const { isWeekend } = getDayInfo(day);
                          
                          if (isManutencao) {
                             return <div key={i} className="border-r border-gray-100 cursor-not-allowed h-16" title="Em Manutenção"></div>;
                          }

                          return (
                            <div key={i} className={`border-r border-gray-100 h-16 transition-colors cursor-pointer ${isWeekend ? 'bg-slate-50/50' : ''} hover:bg-blue-50`}
                              onClick={() => handleOpenModalForNew(quarto.id, day)}
                              title={`Novo: Quarto ${quarto.numero}, Dia ${day}`}></div>
                          );
                        })}

                        {/* Renderiza os BLOCOS DE RESERVA (sobrepostos via Absolute dentro do Grid Relativo) */}
                        {quarto.reservas.flatMap(renderReservationBlocksForDays)}
                      </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        reservaId={selectedReservaId}
        quartoId={selectedQuartoId}
        initialDate={selectedDate ?? undefined}
      />
    </>
  );
}