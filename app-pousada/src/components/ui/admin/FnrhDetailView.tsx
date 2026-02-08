// src/components/ui/admin/FnrhDetailView.tsx

'use client';

import { useState } from 'react';
import { 
  UserPlus, Pencil, QrCode, X, User, 
  ChevronDown, ChevronUp, LogIn, LogOut, UserX 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Helper para fetch
const apiFetch = async (url: string, method = 'POST') => {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}${url}`, { 
        method, 
        headers: { 
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        } 
    });
    if (!res.ok) throw new Error('Erro na requisição');
    return res.json();
};

interface Props {
  reserva: {
    codigo: string;
    fnrh_id: string; 
    status: string; // "Criada", "Hospedado", "Cancelada"
    checkin: string; 
    checkout: string;
    adultos: number;
    criancas: number;
  };
  hospede: {
    nome: string;
    cpf: string;
    nascimento?: string;
    nacionalidade?: string;
    genero?: string;
  };
  onEdit: () => void;  
  onClose: () => void; 
}

export default function FnrhDetailView({ reserva, hospede, onEdit, onClose }: Props) {
  const [loading, setLoading] = useState('');
  const [expanded, setExpanded] = useState(true); // Começa expandido para ver os dados

  // --- AÇÕES GERAIS (TOPO) ---
  const handleCancelarReserva = async () => {
    if (!confirm('Tem certeza que deseja CANCELAR esta reserva no Governo?')) return;
    setLoading('cancelar_reserva');
    try {
        await apiFetch(`/fnrh/cancelar-manual/${reserva.fnrh_id}`);
        alert('Reserva cancelada com sucesso!');
        onClose();
    } catch (error) {
        alert('Erro ao cancelar.');
    } finally {
        setLoading('');
    }
  };

  const handleQrCode = () => {
    alert(`QR Code da reserva ${reserva.codigo}`);
  };

  // --- AÇÕES DO HÓSPEDE (CHECKIN / CHECKOUT) ---
  const handleCheckinHospede = async () => {
    if (!confirm(`Confirmar entrada (Check-in) de ${hospede.nome}?`)) return;
    setLoading('checkin');
    try {
        await apiFetch(`/fnrh/checkin-manual/${reserva.fnrh_id}`);
        alert('Check-in realizado com sucesso!');
        onClose();
    } catch (error) {
        alert('Erro ao realizar check-in.');
    } finally {
        setLoading('');
    }
  };

  const handleCheckoutHospede = async () => {
    if (!confirm(`Confirmar saída (Check-out) de ${hospede.nome}?`)) return;
    setLoading('checkout');
    try {
        await apiFetch(`/fnrh/checkout-manual/${reserva.fnrh_id}`);
        alert('Check-out realizado com sucesso!');
        onClose();
    } catch (error) {
        alert('Erro ao realizar check-out.');
    } finally {
        setLoading('');
    }
  };

  const handleRemoverHospede = async () => {
    if (!confirm('Deseja realmente remover este hóspede?')) return;
    alert('Funcionalidade de remover hóspede será implementada.');
  };

  // Cores de status baseadas nos prints
  const statusColor = reserva.status === 'Cancelada' ? 'text-red-600' : 
                      reserva.status === 'Hospedado' || reserva.status === 'Em Andamento' ? 'text-green-600' : 'text-slate-600';

  // Verifica se já está hospedado para mudar os botões
  const isHospedado = reserva.status === 'Hospedado' || reserva.status === 'Em Andamento';
  const isFinalizada = reserva.status === 'Finalizada';

  return (
    <div className="bg-white font-sans text-slate-800 p-2">
      
      {/* 1. CABEÇALHO E AÇÕES (Igual Print 2) */}
      <div className="flex justify-between items-start mb-8 border-b pb-4">
        <div>
           <h1 className="text-3xl text-slate-600 font-light tracking-tight">
             Reserva <span className="text-slate-300 mx-2 text-2xl">|</span> 
             <span className="font-normal text-slate-700 uppercase">{reserva.codigo}</span>
           </h1>
        </div>

        {/* Botões Circulares (Usei title nativo para evitar erro de Tooltip) */}
        <div className="flex gap-2">
            <button title="Novo Hóspede" className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shadow-sm">
                <UserPlus className="w-5 h-5" />
            </button>
            <button onClick={onEdit} title="Alterar Reserva" className="w-10 h-10 rounded-full bg-white border border-blue-200 text-blue-600 flex items-center justify-center hover:bg-slate-50 transition shadow-sm">
                <Pencil className="w-5 h-5" />
            </button>
            <button onClick={handleQrCode} title="Gerar QR Code" className="w-10 h-10 rounded-full bg-white border border-blue-200 text-blue-600 flex items-center justify-center hover:bg-slate-50 transition shadow-sm">
                <QrCode className="w-5 h-5" />
            </button>
            <button onClick={handleCancelarReserva} title="Cancelar Reserva" className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition shadow-sm">
                <X className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* 2. DADOS DA RESERVA */}
      <div className="mb-10">
        <h2 className="text-xl font-normal text-slate-600 mb-6">Dados da Reserva</h2>
        <div className="grid grid-cols-4 gap-y-8 gap-x-4 text-sm">
            <div className="col-span-2">
                <p className="font-bold text-slate-700 mb-1">Código</p>
                <p className="text-slate-600 uppercase">{reserva.codigo}</p>
            </div>
            <div className="col-span-2">
                <p className="font-bold text-slate-700 mb-1">Situação</p>
                <p className={`${statusColor} capitalize font-medium`}>{reserva.status}</p>
            </div>
            <div>
                <p className="font-bold text-slate-700 mb-1">Entrada</p>
                <p className="text-slate-600">{reserva.checkin}</p>
            </div>
            <div>
                <p className="font-bold text-slate-700 mb-1">Saída</p>
                <p className="text-slate-600">{reserva.checkout}</p>
            </div>
            <div>
                <p className="font-bold text-slate-700 mb-1">Adultos</p>
                <p className="text-slate-600">{reserva.adultos}</p>
            </div>
            <div>
                <p className="font-bold text-slate-700 mb-1">Menores</p>
                <p className="text-slate-600">{reserva.criancas}</p>
            </div>
        </div>
      </div>

      {/* 3. LISTA DE HÓSPEDES */}
      <div>
        <h2 className="text-xl font-normal text-slate-600 mb-4">Lista de Hóspedes</h2>
        
        <div className="border border-slate-200 rounded-md bg-white shadow-sm overflow-hidden">
            
            {/* Cabeçalho do Card */}
            <div 
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center">
                        <User className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-700 uppercase tracking-wide">
                        {hospede.nome}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    {/* Badge Azul conforme print */}
                    <span className="bg-blue-600 text-white text-[11px] font-bold px-3 py-1 rounded">
                        {isHospedado ? 'Check-in realizado' : 'Pré-checkin realizado'}
                    </span>
                    {expanded ? <ChevronUp className="text-blue-600 w-5 h-5"/> : <ChevronDown className="text-blue-600 w-5 h-5"/>}
                </div>
            </div>

            {/* Conteúdo Expandido */}
            {expanded && (
                <div className="p-6 border-t border-slate-100 bg-white animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-3 gap-y-6 gap-x-4 text-sm mb-8">
                        <div><p className="font-bold text-slate-700 mb-1">Nome</p><p className="text-slate-600 uppercase">{hospede.nome}</p></div>
                        <div><p className="font-bold text-slate-700 mb-1">Tipo do Documento</p><p className="text-slate-600">CPF</p></div>
                        <div><p className="font-bold text-slate-700 mb-1">Check-in</p><p className="text-slate-600">{isHospedado || isFinalizada ? reserva.checkin + ' 14:00' : 'Não realizado'}</p></div>
                        
                        <div><p className="font-bold text-slate-700 mb-1">Gênero</p><p className="text-slate-600">{hospede.genero || 'Masculino'}</p></div>
                        <div><p className="font-bold text-slate-700 mb-1">Número do Documento</p><p className="text-slate-600">{hospede.cpf}</p></div>
                        <div><p className="font-bold text-slate-700 mb-1">Check-out</p><p className="text-slate-600">{isFinalizada ? 'Realizado' : 'Não realizado'}</p></div>
                        
                        <div><p className="font-bold text-slate-700 mb-1">Nacionalidade</p><p className="text-slate-600">{hospede.nacionalidade || 'Brasileiro'}</p></div>
                        <div><p className="font-bold text-slate-700 mb-1">Data de Nascimento</p><p className="text-slate-600">{hospede.nascimento || '12/09/2001'}</p></div>
                        <div></div>
                    </div>

                    {/* BOTÕES DE AÇÃO (Dinâmicos conforme Status) */}
                    <div className="flex justify-end gap-3 mt-4 border-t pt-4">
                        
                        {/* Se já fez check-in, mostra CHECKOUT (Verde) e ALTERAR (Azul) */}
                        {isHospedado ? (
                            <>
                                <Button 
                                    onClick={handleCheckoutHospede}
                                    disabled={loading === 'checkout'}
                                    className="bg-[#417042] hover:bg-[#365e37] text-white font-bold px-6"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Checkout
                                </Button>
                                <Button variant="outline" onClick={onEdit} className="bg-[#2d52c7] hover:bg-[#2341a1] text-white border-none font-bold px-6">
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Alterar
                                </Button>
                            </>
                        ) : (
                            /* Se NÃO fez check-in, mostra CHECKIN (Verde), ALTERAR (Azul), REMOVER (Vermelho) */
                            <>
                                <Button 
                                    onClick={handleCheckinHospede}
                                    disabled={loading === 'checkin' || isFinalizada}
                                    className="bg-[#417042] hover:bg-[#365e37] text-white font-bold px-6"
                                >
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Checkin
                                </Button>

                                <Button variant="outline" onClick={onEdit} className="bg-[#2d52c7] hover:bg-[#2341a1] text-white border-none font-bold px-6">
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Alterar
                                </Button>

                                <Button variant="destructive" onClick={handleRemoverHospede} className="bg-[#cc3930] hover:bg-[#a82f27] text-white font-bold px-6">
                                    <UserX className="w-4 h-4 mr-2" />
                                    Remover Hóspede
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}