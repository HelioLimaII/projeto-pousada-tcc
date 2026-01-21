'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    createReserva, updateReserva, getReservaById, getClientes, getQuartos, deleteReserva
} from '@/lib/api';
import { X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

import FnrhCheckinButton from '@/components/ui/admin/FnrhCheckinButton';
import FnrhDetailView from '@/components/ui/admin/FnrhDetailView';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  reservaId?: string | null;
  quartoId?: string | null;
  initialDate?: string;
  startEditing?: boolean; // [NOVO] Prop para forçar o modo de edição
}

interface Cliente {
  id: string;
  nome: string;
  cpf?: string; 
  fnrh_id?: string;
}

interface Quarto {
    id: string;
    numero: number;
    titulo: string;
    status: string;
    preco_diaria: number; 
}

const calcularDias = (inicio: string, fim: string) => {
  if (!inicio || !fim) return 0;
  const start = new Date(inicio);
  const end = new Date(fim);
  const diff = end.getTime() - start.getTime();
  const days = Math.ceil(diff / (1000 * 3600 * 24));
  return days > 0 ? days : 0;
};

export default function BookingModal({ 
  isOpen, onClose, onSave, reservaId, quartoId, initialDate, startEditing 
}: ModalProps) {
  const [formData, setFormData] = useState({
    id_cliente: '',
    id_quarto: '',
    data_checkin: '',
    data_checkout: '',
    status: 'Pendente',
    codigo_reserva: '', 
    valor_total: 0, 
    observacoes: '',
  });

  const [fnrhIdGov, setFnrhIdGov] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [valorDiaria, setValorDiaria] = useState<number>(0);
  const [diasEstadia, setDiasEstadia] = useState<number>(0);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [quartos, setQuartos] = useState<Quarto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [error, setError] = useState('');

  const clienteSelecionado = clientes.find(c => c.id === formData.id_cliente);

  useEffect(() => {
    const dias = calcularDias(formData.data_checkin, formData.data_checkout);
    setDiasEstadia(dias);
    const totalCalculado = dias * valorDiaria;
    setFormData(prev => ({ ...prev, valor_total: totalCalculado }));
  }, [formData.data_checkin, formData.data_checkout, valorDiaria]);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setIsLoading(true);
      setIsLoadingLists(true);
      setFnrhIdGov(null);
      
      // [ALTERAÇÃO] Se startEditing for true, força o modo de edição
      setIsEditing(!!startEditing); 

      Promise.all([getClientes(), getQuartos()])
        .then(([clientesData, quartosData]) => {
          setClientes(clientesData);
          setQuartos(quartosData);
          return quartosData; 
        })
        .then((quartosCarregados) => {
          if (reservaId) {
            return getReservaById(reservaId).then(data => {
              const dias = calcularDias(data.data_checkin.split('T')[0], data.data_checkout.split('T')[0]);
              const diariaCalculada = dias > 0 ? (data.valor_total || 0) / dias : 0;
              setValorDiaria(diariaCalculada);
              
              if (data.fnrh_reserva_id) {
                  setFnrhIdGov(data.fnrh_reserva_id);
              }

              setFormData({
                id_cliente: data.id_cliente || '',
                id_quarto: data.id_quarto || '',
                data_checkin: data.data_checkin.split('T')[0],
                data_checkout: data.data_checkout.split('T')[0],
                status: data.status,
                codigo_reserva: data.codigo_reserva || reservaId.slice(-6).toUpperCase(),
                valor_total: data.valor_total || 0,
                observacoes: data.observacoes || '',
              });
            });
          } 
          else {
            let precoInicial = 0;
            if (quartoId) {
              const quartoPre = quartosCarregados.find((q: Quarto) => q.id === quartoId);
              if (quartoPre) precoInicial = quartoPre.preco_diaria;
            }
            setValorDiaria(precoInicial);
            setFormData({
              id_cliente: '',
              id_quarto: quartoId || '',
              data_checkin: initialDate || '',
              data_checkout: initialDate || '', 
              status: 'Pendente',
              codigo_reserva: '',
              valor_total: 0,
              observacoes: '',
            });
          }
        })
        .catch((err) => {
            console.error(err);
            setError('Falha ao carregar dados.');
        })
        .finally(() => {
            setIsLoadingLists(false);
            setIsLoading(false);
        });
    }
  }, [isOpen, reservaId, quartoId, initialDate, startEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDiariaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValorDiaria(parseFloat(e.target.value) || 0);
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'id_quarto') {
        const quartoSelecionado = quartos.find(q => q.id === value);
        if (quartoSelecionado) setValorDiaria(quartoSelecionado.preco_diaria || 0);
    }
  };

  const handleDelete = async () => {
    if (!reservaId) return;
    if (confirm('Tem certeza que deseja EXCLUIR essa reserva do mapa permanentemente?')) {
        setIsLoading(true);
        try {
            await deleteReserva(reservaId);
            onSave();
            onClose();
        } catch (err) {
            console.error(err);
            setError('Erro ao excluir reserva.');
            setIsLoading(false);
        }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_cliente || !formData.id_quarto || !formData.data_checkin || !formData.data_checkout) {
        setError('Campos obrigatórios faltando.');
        return;
    }
    setIsLoading(true);
    try {
      if (reservaId) await updateReserva(reservaId, formData);
      else await createReserva(formData);
      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // --- MODO DE VISUALIZAÇÃO FNRH ---
  // Exibe visualização APENAS SE temos ID Gov E NÃO ESTAMOS FORÇANDO EDIÇÃO (startEditing false)
  if (reservaId && fnrhIdGov && !isEditing && !isLoading) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8 overflow-hidden relative">
                <div className="absolute top-2 right-2 z-10">
                    <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5"/></Button>
                </div>
                
                <div className="p-8">
                    <FnrhDetailView 
                        reserva={{
                            codigo: formData.codigo_reserva,
                            fnrh_id: fnrhIdGov,
                            status: formData.status, 
                            checkin: formData.data_checkin.split('-').reverse().join('/'),
                            checkout: formData.data_checkout.split('-').reverse().join('/'),
                            adultos: 1, 
                            criancas: 0
                        }}
                        hospede={{
                            nome: clienteSelecionado?.nome || 'Hóspede',
                            cpf: clienteSelecionado?.cpf || '',
                            nascimento: '12/09/2001', 
                            nacionalidade: 'Brasileiro',
                            genero: 'Masculino'
                        }}
                        onEdit={() => setIsEditing(true)} 
                        onClose={() => { onSave(); onClose(); }}
                    />
                </div>
            </div>
        </div>
    );
  }

  // --- MODO FORMULÁRIO PADRÃO ---
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg my-8">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{reservaId ? 'Editar Reserva' : 'Nova Reserva'}</h2>
            {isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    Voltar p/ Visualização
                </Button>
            )}
        </div>

        {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}

        {!isLoading && !isLoadingLists && (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <Label>Cliente *</Label>
              <Select name="id_cliente" value={formData.id_cliente} onValueChange={(v) => handleSelectChange('id_cliente', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div><Label>Check-in</Label><Input type="date" name="data_checkin" value={formData.data_checkin} onChange={handleChange} /></div>
               <div><Label>Check-out</Label><Input type="date" name="data_checkout" value={formData.data_checkout} onChange={handleChange} /></div>
            </div>

            <div>
              <Label>Quarto *</Label>
              <Select name="id_quarto" value={formData.id_quarto} onValueChange={(v) => handleSelectChange('id_quarto', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {quartos.map(q => (
                    <SelectItem key={q.id} value={q.id}>
                      Quarto {q.numero} - {q.titulo} (R$ {q.preco_diaria})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
                <Label>Situação da Reserva</Label>
                <Select name="status" value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Confirmada">Confirmada</SelectItem>
                    <SelectItem value="Hospedado">Hospedado (Check-in)</SelectItem>
                    <SelectItem value="Finalizada">Finalizada (Check-out)</SelectItem>
                    <SelectItem value="Cancelada">Cancelada</SelectItem>
                </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded">
                <div>
                    <Label className="text-xs text-gray-500">Valor Diária</Label>
                    <div className="flex items-center">
                        <span className="mr-1 text-sm">R$</span>
                        <Input type="number" step="0.01" value={valorDiaria} onChange={handleDiariaChange} className="h-8" />
                    </div>
                </div>
                <div className="text-right">
                    <Label className="text-xs text-gray-500">Total ({diasEstadia} dias)</Label>
                    <div className="text-lg font-bold text-green-700">
                        R$ {formData.valor_total.toFixed(2)}
                    </div>
                </div>
            </div>

            <div>
               <Label>Observações</Label>
               <Textarea name="observacoes" value={formData.observacoes} onChange={handleChange} />
            </div>

            {reservaId && !fnrhIdGov && (
              <div className="border-t pt-4 mt-4">
                <Label className="mb-2 block text-gray-700 font-bold">Integração Governamental (FNRH)</Label>
                <FnrhCheckinButton
                    reservaId={reservaId}
                    defaultDates={{ checkin: formData.data_checkin, checkout: formData.data_checkout }}
                    defaultClienteCpf={clienteSelecionado?.cpf}
                    onSuccess={() => {
                        alert("Sincronizado! A tela será atualizada para o painel FNRH.");
                        onSave(); 
                        onClose(); 
                    }}
                />
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t mt-4">
               {reservaId ? (
                   <Button type="button" variant="destructive" onClick={handleDelete}>
                       Excluir Reserva
                   </Button>
               ) : (
                   <div></div>
               )}

               <div className="flex gap-2">
                   <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                   <Button type="submit">Guardar Reserva</Button>
               </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}