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
} from "@/components/ui/select"; // Importa o Select do shadcn/ui
import {
    createReserva,
    updateReserva,
    deleteReserva,
    getReservaById,
    getClientes, // Função para buscar clientes
    getQuartos    // Função para buscar quartos
} from '@/lib/api';
import { X, AlertCircle } from 'lucide-react'; // Importa AlertCircle
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link'; // Importa o Link

// --- Interfaces ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  reservaId?: string | null;
  quartoId?: string | null; // ID do quarto pré-selecionado ao clicar no mapa
  initialDate?: string;
}

interface Cliente { // Interface para dados do cliente
  id: string;
  nome: string;
}

interface Quarto { // Interface para dados do quarto
    id: string;
    numero: number;
    titulo: string;
    status: string; // Para mostrar se está disponível, ocupado, etc.
}


export default function BookingModal({ isOpen, onClose, onSave, reservaId, quartoId, initialDate }: ModalProps) {
  // --- Estados do Formulário ---
  const [formData, setFormData] = useState({
    id_cliente: '', // Campo para o ID do cliente selecionado
    id_quarto: '',  // Campo para o ID do quarto selecionado
    data_checkin: '',
    data_checkout: '',
    status: 'Pendente',
    valor_total: 0,
    observacoes: '',
  });
  const [clientes, setClientes] = useState<Cliente[]>([]); // Lista de clientes para o select
  const [quartos, setQuartos] = useState<Quarto[]>([]);   // Lista de quartos para o select
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLists, setIsLoadingLists] = useState(false); // Loading para as listas
  const [error, setError] = useState('');

  // --- Carregar Dados (Listas e Reserva existente) ---
  useEffect(() => {
    if (isOpen) {
      setError('');
      setIsLoading(true); // Loading principal
      setIsLoadingLists(true); // Loading das listas

      // Busca clientes e quartos em paralelo
      Promise.all([getClientes(), getQuartos()])
        .then(([clientesData, quartosData]) => {
          setClientes(clientesData);
          setQuartos(quartosData);
        })
        .catch(() => setError('Falha ao carregar lista de clientes ou quartos.'))
        .finally(() => setIsLoadingLists(false));

      // Carrega dados da reserva se estiver em modo de edição
      if (reservaId) {
        getReservaById(reservaId)
          .then(data => {
            setFormData({
              id_cliente: data.id_cliente || '',
              id_quarto: data.id_quarto || '', // Carrega o quarto da reserva
              data_checkin: data.data_checkin.split('T')[0],
              data_checkout: data.data_checkout.split('T')[0],
              status: data.status,
              valor_total: data.valor_total || 0,
              observacoes: data.observacoes || '',
            });
          })
          .catch(() => setError('Falha ao carregar dados da reserva.'))
          .finally(() => setIsLoading(false)); // Finaliza loading principal
      }
      // Modo Criação
      else {
        setFormData({
          id_cliente: '',
          id_quarto: quartoId || '', // Pré-seleciona o quarto se veio do mapa
          data_checkin: initialDate || '',
          data_checkout: initialDate || '',
          status: 'Pendente',
          valor_total: 0,
          observacoes: '',
        });
        setIsLoading(false); // Finaliza loading principal
      }
    }
  }, [isOpen, reservaId, quartoId, initialDate]); // Dependências atualizadas

  // --- Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // [CORRIGIDO] Removida a diretiva @ts-expect-error desnecessária
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  // Handlers específicos para os Selects
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validação básica
    if (!formData.id_cliente || !formData.id_quarto || !formData.data_checkin || !formData.data_checkout) {
        setError('Cliente, Quarto, Check-in e Check-out são obrigatórios.');
        return;
    }
    // Validação de datas
    if (new Date(formData.data_checkout) <= new Date(formData.data_checkin)) {
      setError('A data de Check-out deve ser posterior à data de Check-in.');
      return;
    }

    setIsLoading(true);
    setError('');

    // Prepara os dados para enviar (apenas os necessários)
    const dataToSubmit = {
      id_cliente: formData.id_cliente,
      id_quarto: formData.id_quarto,
      data_checkin: formData.data_checkin,
      data_checkout: formData.data_checkout,
      status: formData.status,
      valor_total: formData.valor_total || null, // Envia null se for 0 ou vazio
      observacoes: formData.observacoes || null, // Envia null se vazio
    };

    try {
      if (reservaId) {
        // Agora 'dataToSubmit' é compatível com 'ReservaUpdatePayload'
        await updateReserva(reservaId, dataToSubmit);
      } else {
        // E também é compatível com 'ReservaPayload' (desde que todos os campos obrigatórios estejam lá)
        await createReserva(dataToSubmit);
      }
      onSave(); // Recarrega o mapa
      onClose(); // Fecha o modal
    } catch (err) {
      // [CORRIGIDO] Removida a diretiva @ts-expect-error desnecessária
      setError(err instanceof Error ? err.message : 'Ocorreu um erro.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    // ... (lógica de apagar mantida)
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

        {/* Mostra loading enquanto busca dados */}
        {(isLoading || isLoadingLists) && <p className="text-center text-gray-500 my-4">A carregar...</p>}

        {/* Só mostra o formulário quando os dados estiverem prontos */}
        {!isLoading && !isLoadingLists && (
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Seleção de Cliente */}
            <div>
              <Label htmlFor="id_cliente">Cliente *</Label>
              <Select
                name="id_cliente"
                value={formData.id_cliente}
                // Adiciona tipo 'string' ao parâmetro value
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
               <Link href="/admin/clientes/novo" className="text-xs text-blue-600 hover:underline mt-1 inline-block" target="_blank"> {/* Abre em nova aba */}
                 + Adicionar novo cliente
               </Link>
            </div>

            {/* Seleção de Quarto */}
            <div>
              <Label htmlFor="id_quarto">Quarto *</Label>
              <Select
                name="id_quarto"
                value={formData.id_quarto}
                 // Adiciona tipo 'string' ao parâmetro value
                onValueChange={(value: string) => handleSelectChange('id_quarto', value)}
                required
                // Desabilita se o quarto foi pré-selecionado pelo mapa (modo criação)
                disabled={isLoading || (!!quartoId && !reservaId)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um quarto..." />
                </SelectTrigger>
                <SelectContent>
                  {quartos.length > 0 ? (
                    quartos.map(q => (
                      <SelectItem key={q.id} value={q.id}>
                        Nº {q.numero} - {q.titulo} ({q.status})
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

            {/* Status e Valor */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  name="status"
                  value={formData.status}
                   // Adiciona tipo 'string' ao parâmetro value
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
              <div>
                <Label htmlFor="valor_total">Valor Total (R$)</Label>
                <Input id="valor_total" name="valor_total" type="number" step="0.01" value={formData.valor_total} onChange={handleChange} disabled={isLoading}/>
              </div>
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

