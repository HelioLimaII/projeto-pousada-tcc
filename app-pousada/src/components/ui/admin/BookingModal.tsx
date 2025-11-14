// Em: src/components/admin/BookingModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
    createReserva,
    updateReserva,
    deleteReserva,
    getReservaById,
    getClientes,
    getQuartos
} from '@/lib/api';
import { X, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

// --- Interfaces ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  reservaId?: string | null;
  quartoId?: string | null;
  initialDate?: string;
}

interface Cliente {
  id: string;
  nome: string;
}

interface Quarto {
    id: string;
    numero: number;
    titulo: string;
    status: string;
    preco_diaria: number; // [NOVO] Necessário para o cálculo inicial
}

// Função auxiliar para calcular a diferença de dias
const calcularDias = (inicio: string, fim: string) => {
  if (!inicio || !fim) return 0;
  const start = new Date(inicio);
  const end = new Date(fim);
  // Diferença em milissegundos dividida por ms em um dia
  const diff = end.getTime() - start.getTime();
  const days = Math.ceil(diff / (1000 * 3600 * 24));
  return days > 0 ? days : 0;
};

export default function BookingModal({ isOpen, onClose, onSave, reservaId, quartoId, initialDate }: ModalProps) {
  // --- Estados do Formulário ---
  const [formData, setFormData] = useState({
    id_cliente: '',
    id_quarto: '',
    data_checkin: '',
    data_checkout: '',
    status: 'Pendente',
    valor_total: 0, // Este valor agora é calculado, não digitado diretamente
    observacoes: '',
  });

  // [NOVO] Estado para controlar o valor unitário da diária
  const [valorDiaria, setValorDiaria] = useState<number>(0);
  const [diasEstadia, setDiasEstadia] = useState<number>(0);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [quartos, setQuartos] = useState<Quarto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [error, setError] = useState('');

  // --- [NOVO] Efeito para calcular o total automaticamente ---
  useEffect(() => {
    const dias = calcularDias(formData.data_checkin, formData.data_checkout);
    setDiasEstadia(dias);
    
    // O total é calculado baseados nos dias * valor da diária
    const totalCalculado = dias * valorDiaria;
    
    setFormData(prev => ({
      ...prev,
      valor_total: totalCalculado
    }));
  }, [formData.data_checkin, formData.data_checkout, valorDiaria]);

  // --- Carregar Dados ---
  useEffect(() => {
    if (isOpen) {
      setError('');
      setIsLoading(true);
      setIsLoadingLists(true);

      Promise.all([getClientes(), getQuartos()])
        .then(([clientesData, quartosData]) => {
          setClientes(clientesData);
          setQuartos(quartosData);
          return quartosData; // Retorna quartos para usar no encadeamento se necessário
        })
        .then((quartosCarregados) => {
          // Se for edição
          if (reservaId) {
            return getReservaById(reservaId).then(data => {
              const dias = calcularDias(data.data_checkin.split('T')[0], data.data_checkout.split('T')[0]);
              
              // Tenta calcular a diária baseada no total salvo / dias
              // Se dias for 0, usa 0 para evitar divisão por zero
              const diariaCalculada = dias > 0 ? (data.valor_total || 0) / dias : 0;

              setValorDiaria(diariaCalculada);

              setFormData({
                id_cliente: data.id_cliente || '',
                id_quarto: data.id_quarto || '',
                data_checkin: data.data_checkin.split('T')[0],
                data_checkout: data.data_checkout.split('T')[0],
                status: data.status,
                valor_total: data.valor_total || 0,
                observacoes: data.observacoes || '',
              });
            });
          } 
          // Se for criação
          else {
            // Se veio com quarto pré-selecionado (clique no mapa), tenta pegar o preço dele
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
              data_checkout: initialDate || '', // Check-out começa igual check-in por padrão
              status: 'Pendente',
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
  }, [isOpen, reservaId, quartoId, initialDate]);

  // --- Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // [NOVO] Handler exclusivo para a diária (que não está no formData diretamente)
  const handleDiariaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    setValorDiaria(val);
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    // [NOVO] Se mudou o quarto, atualiza o valor da diária com o preço base do quarto
    if (name === 'id_quarto') {
        const quartoSelecionado = quartos.find(q => q.id === value);
        if (quartoSelecionado) {
            setValorDiaria(quartoSelecionado.preco_diaria || 0);
        }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_cliente || !formData.id_quarto || !formData.data_checkin || !formData.data_checkout) {
        setError('Cliente, Quarto, Check-in e Check-out são obrigatórios.');
        return;
    }
    if (new Date(formData.data_checkout) <= new Date(formData.data_checkin)) {
      setError('A data de Check-out deve ser posterior à data de Check-in.');
      return;
    }

    setIsLoading(true);
    setError('');

    const dataToSubmit = {
      ...formData,
      valor_total: formData.valor_total || null,
      observacoes: formData.observacoes || null,
    };

    try {
      if (reservaId) {
        await updateReserva(reservaId, dataToSubmit);
      } else {
        await createReserva(dataToSubmit);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (reservaId && window.confirm('Tem a certeza que deseja apagar esta reserva?')) {
      setIsLoading(true);
      try {
        await deleteReserva(reservaId);
        onSave();
        onClose();
      } catch (err) {
        setError('Falha ao apagar a reserva.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg my-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{reservaId ? 'Editar Reserva' : 'Nova Reserva'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {(isLoading || isLoadingLists) && <p className="text-center text-gray-500 my-4">A carregar...</p>}

        {!isLoading && !isLoadingLists && (
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Cliente */}
            <div>
              <Label htmlFor="id_cliente">Cliente *</Label>
              <Select
                name="id_cliente"
                value={formData.id_cliente}
                onValueChange={(value: string) => handleSelectChange('id_cliente', value)}
                required
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {clientes.length > 0 ? (
                     clientes.map(cliente => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500">Nenhum cliente cadastrado.</div>
                  )}
                </SelectContent>
              </Select>
               <Link href="/admin/clientes/novo" className="text-xs text-blue-600 hover:underline mt-1 inline-block" target="_blank">
                 + Adicionar novo cliente
               </Link>
            </div>

            {/* Quarto */}
            <div>
              <Label htmlFor="id_quarto">Quarto *</Label>
              <Select
                name="id_quarto"
                value={formData.id_quarto}
                onValueChange={(value: string) => handleSelectChange('id_quarto', value)}
                required
                disabled={isLoading || (!!quartoId && !reservaId)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um quarto..." />
                </SelectTrigger>
                <SelectContent>
                  {quartos.length > 0 ? (
                    quartos.map(q => (
                      <SelectItem key={q.id} value={q.id}>
                        Nº {q.numero} - {q.titulo} (R$ {q.preco_diaria})
                      </SelectItem>
                    ))
                  ) : (
                     <div className="p-2 text-sm text-gray-500">Nenhum quarto encontrado.</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Datas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data_checkin">Check-in *</Label>
                <Input id="data_checkin" name="data_checkin" type="date" value={formData.data_checkin} onChange={handleChange} required disabled={isLoading}/>
              </div>
              <div>
                <Label htmlFor="data_checkout">Check-out *</Label>
                <Input id="data_checkout" name="data_checkout" type="date" value={formData.data_checkout} onChange={handleChange} required disabled={isLoading}/>
              </div>
            </div>

            {/* Status e Cálculo de Valor */}
            <div className="grid grid-cols-2 gap-4 items-end">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  name="status"
                  value={formData.status}
                  onValueChange={(value: string) => handleSelectChange('status', value)}
                  disabled={isLoading}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                        <SelectItem value="Confirmada">Confirmada</SelectItem>
                        <SelectItem value="Check-in">Check-in</SelectItem>
                        <SelectItem value="Check-out">Check-out</SelectItem>
                    </SelectContent>
                </Select>
              </div>

              {/* Campo editável da Diária */}
              <div>
                <Label htmlFor="valor_diaria">Valor Diária (R$)</Label>
                <Input 
                    id="valor_diaria" 
                    type="number" 
                    step="0.01" 
                    value={valorDiaria} 
                    onChange={handleDiariaChange} 
                    disabled={isLoading}
                />
              </div>
            </div>

            {/* [NOVO] Mostrador do Total Calculado (Apenas Leitura) */}
            <div className="bg-gray-50 p-3 rounded-md border border-gray-200 flex justify-between items-center">
                <span className="text-sm text-gray-600 font-medium">Total Estimado ({diasEstadia} diárias):</span>
                <span className="text-lg font-bold text-green-700">
                    R$ {formData.valor_total.toFixed(2)}
                </span>
            </div>

            {/* Observações */}
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Ex: Chega tarde, precisa de berço, etc."
                rows={3}
              />
            </div>

            {/* Botões */}
            <div className="flex justify-between items-center pt-4">
              <div>
                {reservaId && (
                  <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading}>
                    {isLoading ? 'A apagar...' : 'Apagar'}
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'A guardar...' : 'Guardar Reserva'}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}