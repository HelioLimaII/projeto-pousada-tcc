'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle, CloudLightning, ShieldCheck, Trash2, Hash, UserSearch, LogIn, LogOut } from 'lucide-react';
import { 
    getClientes, 
    getQuartos, 
    getReservaById, 
    createReserva, 
    updateReserva, 
    deleteReserva, 
    // Integração
    buscarPreCheckinGov,
    criarReservaFnrh,
    vincularHospedeFnrh,
    listarReservasFnrh,
    realizarCheckinFnrh,
    realizarCheckoutFnrh
} from '@/lib/api';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  reservaId?: string | null;
  quartoId?: string | null;
  initialDate?: string;
}

export default function BookingModal({ 
  isOpen, 
  onClose, 
  onSave, 
  reservaId, 
  quartoId, 
  initialDate 
}: BookingModalProps) {
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sendingGov, setSendingGov] = useState(false);
  const [processingAction, setProcessingAction] = useState(false); // Estado para Checkin/Checkout
  
  const [clientes, setClientes] = useState<any[]>([]);
  const [quartos, setQuartos] = useState<any[]>([]);

  const [fnrhCodigo, setFnrhCodigo] = useState('');
  const [cpfParaEnvio, setCpfParaEnvio] = useState(''); 

  const [formData, setFormData] = useState({
    id_cliente: '',
    id_quarto: quartoId || '',
    data_checkin: initialDate || '',
    data_checkout: initialDate || '',
    status: 'Pendente',
    valor_total: 0, 
    valor_diaria: 0, 
    observacoes: '',
    fnrh_reserva_id: null as string | null,
    fnrh_sincronizado: false
  });

  // Carregamento Inicial
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [clientesData, quartosData] = await Promise.all([getClientes(), getQuartos()]);
          setClientes(clientesData);
          setQuartos(quartosData);

          if (quartoId && !reservaId) {
             const q = quartosData.find((x: any) => x._id === quartoId || x.id === quartoId);
             if (q) setFormData(prev => ({ ...prev, id_quarto: quartoId, valor_diaria: q.preco_diaria || 0 }));
          }
        } catch (error) { console.error(error); }
      };
      fetchData();
    }
  }, [isOpen, quartoId, reservaId]);

  // Carregar Reserva Existente
  useEffect(() => {
    if (isOpen && reservaId) {
      setLoading(true);
      getReservaById(reservaId)
        .then((data) => {
          const start = new Date(data.data_checkin);
          const end = new Date(data.data_checkout);
          const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;
          const diariaEstimada = data.valor_total / diffDays;

          setFormData({
            id_cliente: data.id_cliente,
            id_quarto: data.id_quarto,
            data_checkin: data.data_checkin.split('T')[0],
            data_checkout: data.data_checkout.split('T')[0],
            status: data.status,
            valor_total: data.valor_total,
            valor_diaria: diariaEstimada, 
            observacoes: data.observacoes || '',
            fnrh_reserva_id: data.fnrh_reserva_id,
            fnrh_sincronizado: !!data.fnrh_reserva_id
          });
          
          setFnrhCodigo(reservaId.slice(-6).toUpperCase());
        })
        .finally(() => setLoading(false));
    } else if (isOpen && !reservaId) {
        setFormData(prev => ({
            ...prev,
            data_checkin: initialDate || '',
            data_checkout: initialDate || '',
            status: 'Pendente',
            observacoes: '',
            fnrh_reserva_id: null,
            fnrh_sincronizado: false
        }));
        setFnrhCodigo('');
        setCpfParaEnvio('');
    }
  }, [isOpen, reservaId, initialDate]);

  // Preencher CPF ao selecionar cliente
  useEffect(() => {
      if (formData.id_cliente && clientes.length > 0) {
          const cliente = clientes.find(c => (c._id || c.id) === formData.id_cliente);
          if (cliente && (cliente.cpf || cliente.documento)) {
              const cpfLimpo = (cliente.cpf || cliente.documento).replace(/\D/g, '');
              setCpfParaEnvio(cpfLimpo);
          }
      }
  }, [formData.id_cliente, clientes]);

  // Cálculo Valor
  useEffect(() => {
    if (formData.data_checkin && formData.data_checkout && formData.valor_diaria) {
        const start = new Date(formData.data_checkin);
        const end = new Date(formData.data_checkout);
        let diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 1) diffDays = 0; 
        setFormData(prev => ({ ...prev, valor_total: diffDays * prev.valor_diaria }));
    }
  }, [formData.data_checkin, formData.data_checkout, formData.valor_diaria]);

  const handleQuartoChange = (novoIdQuarto: string) => {
      const quarto = quartos.find(q => q._id === novoIdQuarto || q.id === novoIdQuarto);
      const preco = quarto ? quarto.preco_diaria : 0;
      setFormData(prev => ({ ...prev, id_quarto: novoIdQuarto, valor_diaria: preco }));
  };

  const handleSalvarLocal = async () => {
    setSaving(true);
    try {
      const payload = { ...formData, valor_total: Number(formData.valor_total) };
      if (reservaId) {
        await updateReserva(reservaId, payload);
      } else {
        await createReserva(payload);
      }
      onSave(); 
      onClose(); 
    } catch (error) {
      alert("Erro ao salvar reserva.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleExcluir = async () => {
      if (!reservaId) return;
      if (confirm("Tem certeza que deseja excluir esta reserva localmente?")) {
          setDeleting(true);
          try {
              await deleteReserva(reservaId);
              onSave(); 
              onClose(); 
          } catch (error) {
              console.error(error);
              alert("Erro ao excluir reserva.");
          } finally {
              setDeleting(false);
          }
      }
  };

  // --- AÇÃO: ENVIAR PARA FNRH ---
  const handleEnviarFNRH = async () => {
      if (!reservaId) return alert("Salve a reserva antes de enviar.");
      if (!fnrhCodigo) return alert("O Código da Reserva é obrigatório.");
      if (!cpfParaEnvio || cpfParaEnvio.length < 11) return alert("Informe um CPF válido.");

      const codigoNormalizado = fnrhCodigo.toUpperCase().trim();
      setSendingGov(true);

      try {
          const buscaGov = await buscarPreCheckinGov(cpfParaEnvio);
          if (!buscaGov.sucesso || !buscaGov.hospede) {
              setSendingGov(false);
              return alert(`❌ ERRO: Pré-checkin não encontrado para CPF ${cpfParaEnvio}.`);
          }
          const dadosHospedeGov = buscaGov.hospede;
          const idHospedeReal = dadosHospedeGov.id || dadosHospedeGov.hospede_id;
          
          if (!idHospedeReal) {
              setSendingGov(false);
              return alert("Erro Interno: Hóspede sem ID.");
          }

          let idReservaGov = null;

          try {
              const resReserva = await criarReservaFnrh({
                  codigo_reserva: codigoNormalizado,
                  data_entrada: formData.data_checkin,
                  data_saida: formData.data_checkout,
                  adultos: 1, criancas: 0, id_local: reservaId
              });
              if (resReserva.sucesso) idReservaGov = resReserva.fnrh_reserva_id;
          } catch (createError: any) {
              const erroMsg = createError.message || "";
              if (erroMsg.includes("já existe") || erroMsg.includes("já cadastrada")) {
                  const listagem = await listarReservasFnrh(1, codigoNormalizado);
                  if (listagem.sucesso && listagem.dados && listagem.dados.length > 0) {
                      const reservaEncontrada = listagem.dados.find((r: any) => 
                          (r.numero_reserva === codigoNormalizado) || (r.reserva?.numero_reserva === codigoNormalizado)
                      ) || listagem.dados[0];
                      idReservaGov = reservaEncontrada.id || reservaEncontrada.reserva_id || reservaEncontrada.reserva?.id;
                  }
                  if (!idReservaGov) throw new Error("Reserva já existe, mas não conseguimos recuperar o ID.");
              } else {
                  throw createError;
              }
          }

          if (idReservaGov) {
              try { await vincularHospedeFnrh(idReservaGov, idHospedeReal); } catch (e) { console.warn(e); }
              
              setFormData(prev => ({ ...prev, fnrh_sincronizado: true, fnrh_reserva_id: idReservaGov }));
              try { await updateReserva(reservaId, { fnrh_sincronizado: true, fnrh_reserva_id: idReservaGov }); } catch (e) {}
              
              alert(`✅ SUCESSO! Reserva sincronizada.`);
              onSave(); 
          }
      } catch (error: any) {
          alert("Erro: " + error.message);
      } finally {
          setSendingGov(false);
      }
  };

  // --- NOVAS AÇÕES: CHECK-IN / CHECK-OUT ---
  const handleFazerCheckinGov = async () => {
      if (!formData.fnrh_reserva_id) return;
      if (!confirm(`Confirmar ENTRADA (Check-in) no Governo?`)) return;

      setProcessingAction(true);
      try {
          // [CORREÇÃO] Gera data ISO e envia no body da requisição
          const agora = new Date().toISOString();
          await realizarCheckinFnrh(formData.fnrh_reserva_id, agora);
          
          setFormData(prev => ({ ...prev, status: 'Check-in' }));
          await updateReserva(reservaId!, { status: 'Check-in' });
          alert("Check-in realizado com sucesso!");
          onSave();
      } catch (error: any) {
          alert("Erro Check-in: " + error.message);
      } finally {
          setProcessingAction(false);
      }
  };

  const handleFazerCheckoutGov = async () => {
      if (!formData.fnrh_reserva_id) return;
      if (!confirm(`Confirmar SAÍDA (Check-out) no Governo?`)) return;

      setProcessingAction(true);
      try {
          // [CORREÇÃO] Gera data ISO e envia no body da requisição
          const agora = new Date().toISOString();
          await realizarCheckoutFnrh(formData.fnrh_reserva_id, agora);
          
          setFormData(prev => ({ ...prev, status: 'Check-out' }));
          await updateReserva(reservaId!, { status: 'Check-out' });
          alert("Check-out realizado com sucesso!");
          onSave();
      } catch (error: any) {
          alert("Erro Check-out: " + error.message);
      } finally {
          setProcessingAction(false);
      }
  };

  const getDias = () => {
      if (!formData.data_checkin || !formData.data_checkout) return 0;
      const start = new Date(formData.data_checkin);
      const end = new Date(formData.data_checkout);
      const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
              {reservaId ? 'Gerenciar Reserva' : 'Nova Reserva'}
              {formData.fnrh_sincronizado && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1 border border-green-200">
                      <ShieldCheck className="w-3 h-3"/> FNRH Ativo
                  </span>
              )}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-gray-400" /></div>
        ) : (
          <div className="space-y-6 py-2">
            
            {/* DADOS LOCAIS */}
            <div className="space-y-4">
                <div className="grid gap-2">
                    <Label>Cliente (Local) *</Label>
                    <Select value={formData.id_cliente} onValueChange={(val) => setFormData({...formData, id_cliente: val})}>
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>
                        {clientes.map((c: any) => (
                            <SelectItem key={c._id || c.id} value={c._id || c.id}>
                                {c.nome} - CPF: {c.cpf || '---'}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Entrada</Label>
                        <Input type="date" value={formData.data_checkin} onChange={(e) => setFormData({...formData, data_checkin: e.target.value})}/>
                    </div>
                    <div className="grid gap-2">
                        <Label>Saída</Label>
                        <Input type="date" value={formData.data_checkout} onChange={(e) => setFormData({...formData, data_checkout: e.target.value})}/>
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label>Quarto *</Label>
                    <Select value={formData.id_quarto} onValueChange={handleQuartoChange}>
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>
                        {quartos.map((q: any) => (
                            <SelectItem key={q._id || q.id} value={q._id || q.id}>Quarto {q.numero} ({q.status})</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4 items-end">
                    <div className="grid gap-2">
                        <Label>Valor Diária</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-500 text-sm">R$</span>
                            <Input type="number" className="pl-9" value={formData.valor_diaria} onChange={(e) => setFormData({...formData, valor_diaria: Number(e.target.value)})}/>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border flex justify-between items-center h-10">
                        <span className="text-xs text-gray-500">Total ({getDias()} dias)</span>
                        <span className="font-bold text-green-700">R$ {formData.valor_total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* INTEGRAÇÃO FNRH */}
            {reservaId && (
                <div className="border-t pt-4 mt-4">
                    <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <CloudLightning className="w-4 h-4 text-blue-600"/>
                        Integração Governamental (FNRH)
                    </h3>
                    
                    {formData.fnrh_sincronizado ? (
                        <div className="bg-green-50 border border-green-200 rounded-md p-3">
                            <div className="flex items-start gap-3 mb-4">
                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5"/>
                                <div>
                                    <p className="text-sm font-semibold text-green-800">Sincronização Concluída</p>
                                    <p className="text-xs text-green-700 mt-1">
                                        ID Gov: <span className="font-mono">{formData.fnrh_reserva_id}</span>
                                    </p>
                                </div>
                            </div>

                            {/* --- BOTÕES DE AÇÃO --- */}
                            <div className="flex gap-2 border-t border-green-200 pt-3">
                                {formData.status !== 'Check-in' && formData.status !== 'Check-out' && (
                                    <Button 
                                        onClick={handleFazerCheckinGov} 
                                        disabled={processingAction}
                                        className="bg-green-600 hover:bg-green-700 text-white w-full h-9 text-xs"
                                    >
                                        {processingAction ? <Loader2 className="animate-spin mr-2 h-3 w-3"/> : <LogIn className="mr-2 h-3 w-3"/>}
                                        Realizar Check-in
                                    </Button>
                                )}

                                {formData.status === 'Check-in' && (
                                    <Button 
                                        onClick={handleFazerCheckoutGov} 
                                        disabled={processingAction}
                                        className="bg-blue-600 hover:bg-blue-700 text-white w-full h-9 text-xs"
                                    >
                                        {processingAction ? <Loader2 className="animate-spin mr-2 h-3 w-3"/> : <LogOut className="mr-2 h-3 w-3"/>}
                                        Realizar Check-out
                                    </Button>
                                )}

                                {formData.status === 'Check-out' && (
                                    <div className="w-full text-center text-xs text-gray-500 font-medium py-1 bg-gray-100 rounded">
                                        Check-out Finalizado
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-4">
                            <div>
                                <Label className="text-xs text-slate-500 mb-1 block">1. CPF do Hóspede (Pré-Checkin)</Label>
                                <div className="relative">
                                    <UserSearch className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400"/>
                                    <Input value={cpfParaEnvio} onChange={(e) => setCpfParaEnvio(e.target.value)} className="pl-9 bg-white border-blue-200" placeholder="Digite o CPF..."/>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                                <div className="flex-1 w-full">
                                    <Label className="text-xs text-slate-500 mb-1 block">2. Código da Reserva</Label>
                                    <div className="relative">
                                        <Hash className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400"/>
                                        <Input value={fnrhCodigo} onChange={(e) => setFnrhCodigo(e.target.value)} className="pl-9 bg-white" placeholder="Ex: RES123"/>
                                    </div>
                                </div>
                                <Button onClick={handleEnviarFNRH} disabled={sendingGov || !fnrhCodigo || !cpfParaEnvio} className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto min-w-[160px]">
                                    {sendingGov ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <CloudLightning className="mr-2 h-4 w-4"/>}
                                    {sendingGov ? 'Enviando...' : '3. Enviar e Vincular'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
          </div>
        )}

        <DialogFooter className="mt-4 border-t pt-4 flex sm:justify-between flex-col-reverse sm:flex-row gap-2">
            <div className="flex-1">
                {reservaId && (
                    <Button variant="destructive" onClick={handleExcluir} disabled={saving || deleting} className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 w-full sm:w-auto">
                        {deleting ? <Loader2 className="animate-spin h-4 w-4"/> : <Trash2 className="h-4 w-4 mr-2"/>} Excluir
                    </Button>
                )}
            </div>
            <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={onClose} disabled={saving || deleting}>Fechar</Button>
                <Button onClick={handleSalvarLocal} disabled={saving || deleting || !formData.id_cliente || !formData.id_quarto} className="bg-[#111827] text-white">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} {reservaId ? 'Salvar Alterações' : 'Criar Reserva'}
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}