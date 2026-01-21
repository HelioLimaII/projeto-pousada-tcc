// Arquivo: src/app/admin/fnrh/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Loader2, RefreshCw, ChevronLeft, ChevronRight, X } from 'lucide-react';
import FnrhDetailView from '@/components/ui/admin/FnrhDetailView';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import BookingModal from '@/components/ui/admin/BookingModal';

interface ReservaGov {
  id: string; 
  numero_reserva?: string;
  situacao_reserva_id?: string;
  data_entrada: string;
  data_saida: string;
  quantidade_hospede_adulto: number;
  quantidade_hospede_menor: number;
  [key: string]: any; 
}

export default function PainelFNRH() {
  const [reservas, setReservas] = useState<ReservaGov[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDetalhes, setLoadingDetalhes] = useState<string | null>(null);
  
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const itensPorPagina = 50;
  
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [buscaCodigo, setBuscaCodigo] = useState('');

  const [reservaDetalhada, setReservaDetalhada] = useState<{reserva: any, hospede: any} | null>(null);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [editingLocalId, setEditingLocalId] = useState<string | null>(null);

  // [CORREÇÃO] Envolvido em useCallback para evitar warning do useEffect
  const buscarReservas = useCallback(async (pagina = 1) => {
    setLoading(true);
    setPaginaAtual(pagina);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      let url = `${baseUrl}/fnrh/listar?pagina=${pagina}`;
      
      if (buscaCodigo) {
          url += `&codigo=${buscaCodigo}`;
      } else {
          if (dataInicio) url += `&inicio=${dataInicio}`;
          if (dataFim) url += `&fim=${dataFim}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      
      if (data.dados) {
          setReservas(data.dados);
          if (data.paginacao?.total) setTotalRegistros(data.paginacao.total);
          else setTotalRegistros(data.dados.length);
      } else {
          const lista = Array.isArray(data) ? data : [];
          setReservas(lista);
          setTotalRegistros(lista.length); 
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao buscar lista.');
    } finally {
      setLoading(false);
    }
  }, [buscaCodigo, dataInicio, dataFim]);

  const abrirDetalhes = async (reservaResumida: ReservaGov) => {
    setLoadingDetalhes(reservaResumida.id);
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        const res = await fetch(`${baseUrl}/fnrh/reserva/${reservaResumida.id}`);
        if (!res.ok) throw new Error("Falha ao buscar detalhes");
        const dadosCompletos = await res.json();
        
        const listaHospedes = dadosCompletos.hospedes || dadosCompletos.hospede || [];
        const hospedePrincipal = listaHospedes.length > 0 ? listaHospedes[0] : null;

        setReservaDetalhada({
            reserva: { ...reservaResumida, ...dadosCompletos },
            hospede: {
                nome: hospedePrincipal?.nome_completo || hospedePrincipal?.nome || 'Hóspede sem Nome',
                cpf: hospedePrincipal?.numero_documento || hospedePrincipal?.cpf || '---',
                nacionalidade: hospedePrincipal?.nacionalidade || 'Brasileiro',
                nascimento: hospedePrincipal?.data_nascimento || hospedePrincipal?.nascimento,
                genero: hospedePrincipal?.genero
            }
        });
    } catch (error) {
        console.error(error);
        alert("Não foi possível carregar os dados do hóspede.");
    } finally {
        setLoadingDetalhes(null);
    }
  };

  const handleEditarReserva = async () => {
    if (!reservaDetalhada) return;
    
    const govId = reservaDetalhada.reserva.id; 
    
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        const res = await fetch(`${baseUrl}/fnrh/local-id/${govId}`);
        const data = await res.json();

        if (data.sucesso && data.local_id) {
            setReservaDetalhada(null);
            setEditingLocalId(data.local_id); 
            setIsBookingModalOpen(true); 
        } else {
            alert("Reserva não encontrada no banco local.");
        }
    } catch (err) {
        console.error(err);
        alert("Erro ao tentar localizar reserva local.");
    }
  };

  useEffect(() => {
    buscarReservas(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPaginas = Math.ceil(totalRegistros / itensPorPagina);
  
  const getPaginasVisiveis = () => {
    const p = [];
    // [CORREÇÃO] Mudado de let para const conforme erro do log
    const inicio = Math.max(1, paginaAtual - 2);
    const fim = Math.min(totalPaginas, paginaAtual + 2);
    for (let i = inicio; i <= fim; i++) p.push(i);
    return p;
  };

  const formatData = (isoDate: string) => {
    if (!isoDate) return '--';
    return isoDate.split('T')[0].split('-').reverse().join('/');
  };
  const encontrarCodigo = (res: any) => res.numero_reserva || res.numeroReserva || res.codigo || res.id || 'SEM CÓDIGO';
  const encontrarSituacao = (res: any) => res.situacao_reserva_id || res.situacaoReservaId || res.status || 'DESCONHECIDO';
  const getStatusStyle = (status: string) => {
    switch(status?.toUpperCase()) {
      case 'CANCELADA': return 'bg-red-100 text-red-700 border border-red-200';
      case 'HOSPEDADO': case 'EM ANDAMENTO': return 'bg-green-100 text-green-700 border border-green-200';
      case 'CONCLUIDA': case 'FINALIZADA': return 'bg-blue-100 text-blue-700 border border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans text-slate-800">
      
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-light text-slate-700">Reservas <span className="font-bold text-blue-900">FNRH</span></h1>
          <p className="text-slate-500 text-sm mt-1">Exibindo {reservas.length} registros.</p>
        </div>
        <Button onClick={() => buscarReservas(1)} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? <Loader2 className="animate-spin mr-2 w-4 h-4"/> : <RefreshCw className="mr-2 w-4 h-4"/>}
            Atualizar Lista
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
             <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Buscar Código / ID</label>
             <div className="flex gap-2">
                <Input 
                    placeholder="Ex: teste10 ou BDBE2F" 
                    value={buscaCodigo} 
                    onChange={e => setBuscaCodigo(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && buscarReservas(1)}
                />
                <Button onClick={() => buscarReservas(1)}>
                    <Search className="w-4 h-4"/>
                </Button>
             </div>
        </div>

        <div className="w-[1px] h-10 bg-slate-200 mx-2 hidden md:block"></div>

        <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">De</label>
            <Input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} disabled={!!buscaCodigo} className="w-36"/>
        </div>
        <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Até</label>
            <Input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} disabled={!!buscaCodigo} className="w-36"/>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => buscarReservas(1)} disabled={!!buscaCodigo}>
                <Filter className="w-4 h-4 mr-2"/> Filtrar Data
            </Button>
            <Button variant="ghost" onClick={() => { setDataInicio(''); setDataFim(''); setBuscaCodigo(''); buscarReservas(1); }}>
                <X className="w-4 h-4 mr-1"/> Limpar
            </Button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm mb-4">
        <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                    <th className="p-4">Código</th>
                    <th className="p-4">Situação</th>
                    <th className="p-4">Entrada</th>
                    <th className="p-4">Saída</th>
                    <th className="p-4 text-center">Ações</th>
                </tr>
            </thead>
            <tbody>
                {loading && <tr><td colSpan={5} className="p-12 text-center text-slate-500">Carregando...</td></tr>}
                {!loading && reservas.length === 0 && <tr><td colSpan={5} className="p-12 text-center text-slate-500">Nenhum registro encontrado.</td></tr>}
                
                {reservas.map((res) => {
                    const codigo = encontrarCodigo(res);
                    const situacao = encontrarSituacao(res);
                    const entrada = res.data_entrada || res.dataEntrada;
                    const saida = res.data_saida || res.dataSaida;
                    const isRowLoading = loadingDetalhes === res.id;

                    return (
                        <tr key={res.id || codigo} className="border-b border-slate-100 hover:bg-blue-50 transition-colors">
                            <td className="p-4 font-medium text-slate-800 uppercase">{codigo}</td>
                            <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(situacao)}`}>{situacao}</span></td>
                            <td className="p-4 text-slate-600">{formatData(entrada)}</td>
                            <td className="p-4 text-slate-600">{formatData(saida)}</td>
                            <td className="p-4 text-center">
                                <Button 
                                    size="sm" 
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5 shadow-sm"
                                    onClick={() => abrirDetalhes(res)}
                                    disabled={!!loadingDetalhes}
                                >
                                    {isRowLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : <Search className="w-3 h-3 mr-1"/>}
                                    {isRowLoading ? '...' : 'Detalhar'}
                                </Button>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
          <div className="flex justify-center items-center gap-2 pb-8">
              <Button variant="outline" size="sm" onClick={() => buscarReservas(paginaAtual - 1)} disabled={paginaAtual === 1 || loading}><ChevronLeft className="w-4 h-4" /></Button>
              {getPaginasVisiveis().map(p => (
                  <Button key={p} variant={p === paginaAtual ? "default" : "outline"} size="sm" onClick={() => buscarReservas(p)} className={p === paginaAtual ? "bg-blue-600" : ""}>{p}</Button>
              ))}
              <Button variant="outline" size="sm" onClick={() => buscarReservas(paginaAtual + 1)} disabled={paginaAtual === totalPaginas || loading}><ChevronRight className="w-4 h-4" /></Button>
          </div>
      )}

      <Dialog open={!!reservaDetalhada} onOpenChange={(open) => !open && setReservaDetalhada(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white border-none shadow-2xl">
            <DialogTitle className="sr-only">Detalhes da Reserva</DialogTitle>
            {reservaDetalhada && (
                <div className="p-6">
                     <FnrhDetailView 
                        reserva={{
                            codigo: encontrarCodigo(reservaDetalhada.reserva),
                            fnrh_id: reservaDetalhada.reserva.id, 
                            status: encontrarSituacao(reservaDetalhada.reserva), 
                            checkin: formatData(reservaDetalhada.reserva.data_entrada || reservaDetalhada.reserva.dataEntrada),
                            checkout: formatData(reservaDetalhada.reserva.data_saida || reservaDetalhada.reserva.dataSaida),
                            adultos: reservaDetalhada.reserva.quantidade_hospede_adulto,
                            criancas: reservaDetalhada.reserva.quantidade_hospede_menor
                        }}
                        hospede={reservaDetalhada.hospede} 
                        onEdit={handleEditarReserva} 
                        onClose={() => { setReservaDetalhada(null); buscarReservas(paginaAtual); }}
                     />
                </div>
            )}
        </DialogContent>
      </Dialog>

      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => {
            setIsBookingModalOpen(false); 
            buscarReservas(paginaAtual);
        }} 
        onSave={() => {}}
        reservaId={editingLocalId}
        startEditing={true}
      />

    </div>
  );
}