// Em: src/components/admin/BookingMap.tsx
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BookingModal from './BookingModal';

// --- Interfaces de Tipos (sem alterações) ---
interface Reserva {
  id: string;
  hospede_nome: string;
  data_checkin: string; // Formato "YYYY-MM-DD"
  data_checkout: string; // Formato "YYYY-MM-DD"
  status: 'Confirmada' | 'Pendente' | 'Check-in' | 'Check-out';
}
interface QuartoComReservas {
  id: string;
  numero: number;
  titulo: string;
  reservas: Reserva[];
}

export default function BookingMap() {
  const [data, setData] = useState<QuartoComReservas[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Estados para gerir o Modal (sem alterações) ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReservaId, setSelectedReservaId] = useState<string | null>(null);
  const [selectedQuartoId, setSelectedQuartoId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // --- Lógica de Obter Dados (sem alterações) ---
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

  // --- Funções de Gestão do Modal (sem alterações) ---
  const handleOpenModalForNew = (quartoId: string, day: number) => {
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

  // --- Lógica de Datas (sem alterações) ---
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

  // --- Funções de Renderização (sem alterações no getStatusColor) ---
  const getStatusColor = (status: Reserva['status']) => {
    switch (status) {
      case 'Confirmada': return 'bg-green-500 hover:bg-green-600';
      case 'Pendente': return 'bg-yellow-400 hover:bg-yellow-500 text-gray-800';
      case 'Check-in': return 'bg-blue-500 hover:bg-blue-600';
      case 'Check-out': return 'bg-gray-400 hover:bg-gray-500';
      default: return 'bg-purple-500 hover:bg-purple-600';
    }
  };

  // --- FUNÇÃO renderReservationBlocksForDays ---
  // REMOVIDA a anotação explícita ': JSX.Element[]'
  const renderReservationBlocksForDays = (reserva: Reserva) => {
      const blocks: React.ReactElement[] = []; // Deixa o TypeScript inferir o tipo

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

      const startOfMonth = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), 1));
      const endOfMonthDate = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth() + 1, 0));
      const startOfNextMonth = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

      if (checkoutDate <= startOfMonth || checkinDate >= startOfNextMonth) {
          return blocks;
      }

      const firstVisibleDayNum = checkinDate < startOfMonth ? 1 : checkinDate.getUTCDate();
      // O último dia a renderizar é o dia DO checkout, limitado ao fim do mês
      const lastVisibleDayNum = checkoutDate > endOfMonthDate
                                ? daysInMonth
                                : checkoutDate.getUTCDate();

      // Itera do primeiro dia visível ATÉ o último dia visível (incluindo checkout)
      for (let day = firstVisibleDayNum; day <= lastVisibleDayNum; day++) {
           if (day < 1 || day > daysInMonth) continue; // Segurança

          blocks.push(
              <div
                  key={`${reserva.id}-${day}`}
                  onClick={() => handleOpenModalForEdit(reserva.id)}
                  className={`absolute h-[calc(100%-4px)] top-[2px] mx-[1px] p-1 text-white text-xs rounded shadow-md cursor-pointer transition-colors flex items-center justify-center ${getStatusColor(reserva.status)}`}
                  style={{
                      gridColumnStart: day,
                      gridColumnEnd: day + 1, // Cada bloco ocupa 1 coluna
                      zIndex: 10,
                  }}
                  title={`Editar reserva de: ${reserva.hospede_nome}\nStatus: ${reserva.status}\nCheck-in: ${reserva.data_checkin}\nCheck-out: ${reserva.data_checkout}`}
              >
                  <p className="font-semibold text-[10px] leading-tight text-center break-words max-h-full overflow-hidden">
                      {reserva.hospede_nome}
                  </p>
              </div>
          );
      }

      return blocks;
  };


  // --- JSX do Componente (Alteração aqui) ---
  return (
    <>
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-700 capitalize">{monthName}</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCurrentDate(new Date())}>Hoje</Button>
            <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" onClick={() => changeMonth(1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* Grelha */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <div
            className="grid gap-px bg-gray-200 relative"
            style={{
              gridTemplateColumns: `minmax(120px, 1.5fr) repeat(${daysInMonth}, minmax(45px, 1fr))`
            }}
          >
            {/* Header da Grelha --- MODIFICAÇÃO AQUI --- */}
            <div className="bg-gray-100 font-semibold p-2 sticky left-0 z-30 text-sm text-gray-600 border-r border-b border-gray-200">Dias</div>
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const { isWeekend, isToday } = getDayInfo(day);
              return (
                <div key={day} className={`text-center font-medium p-2 text-sm border-b border-r border-gray-200 ${isWeekend ? 'bg-gray-200' : 'bg-gray-100'} ${isToday ? 'ring-2 ring-blue-500 z-10' : ''}`}>
                  {day}
                </div>
              );
            })}

            {/* Linhas de Quartos */}
            {loading ? (
              <div style={{ gridColumn: `1 / -1`}} className="h-64 flex items-center justify-center bg-white">A carregar mapa...</div>
            ) : error ? (
              <div style={{ gridColumn: `1 / -1`}} className="h-64 flex items-center justify-center bg-white text-red-500">{error}</div>
            ) : data.length === 0 ? (
                 <div style={{ gridColumn: `1 / -1`}} className="h-64 flex items-center justify-center bg-white text-gray-500">Nenhum quarto encontrado.</div>
            ) : (
              data.map(quarto => (
                <div key={quarto.id} className="contents">
                    {/* Esta é a célula que descreve a *linha* (ainda é um quarto) */}
                    <div className="font-semibold p-2 border-r border-b border-gray-200 sticky left-0 bg-white z-20 text-sm flex flex-col justify-center">
                      <p className="truncate font-bold text-gray-700">{quarto.titulo}</p>
                      <p className="text-xs text-gray-500">Nº {quarto.numero}</p>
                    </div>
                    {/* Este é o contentor para os dias e reservas dessa linha */}
                    <div
                      className="col-start-2 col-span-full relative grid border-b border-gray-200"
                      style={{ gridTemplateColumns: `repeat(${daysInMonth}, minmax(45px, 1fr))`}}
                    >
                      {/* Células clicáveis */}
                      {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const { isWeekend } = getDayInfo(day);
                        return (
                          <div
                            key={i}
                            className={`h-14 border-r border-gray-200 hover:bg-blue-100 transition-colors cursor-pointer ${isWeekend ? 'bg-gray-50' : 'bg-white'}`}
                            onClick={() => handleOpenModalForNew(quarto.id, day)}
                            title={`Criar reserva - Quarto ${quarto.numero}, Dia ${day}`}
                          ></div>
                        );
                      })}
                      {/* Renderiza blocos diários */}
                      {quarto.reservas.flatMap(renderReservationBlocksForDays)}
                    </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
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
