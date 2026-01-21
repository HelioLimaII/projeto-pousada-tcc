// Arquivo: src/components/ui/admin/FnrhCheckinButton.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const apiFetch = async (url: string, options?: RequestInit) => {
    const token = localStorage.getItem('accessToken');
    const headers = { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}${url}`, { ...options, headers });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Erro na requisição');
    }
    return res.json();
};

interface Props {
  reservaId: string;
  defaultDates: { checkin: string, checkout: string };
  defaultClienteCpf?: string;
  onSuccess?: () => void;
}

export default function FnrhCheckinButton({ reservaId, defaultDates, defaultClienteCpf, onSuccess }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [cpfBusca, setCpfBusca] = useState(defaultClienteCpf || '');
  const [loadingBusca, setLoadingBusca] = useState(false);
  const [hospedeGov, setHospedeGov] = useState<any>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    origem: 'MEIOHOSPEDAGEM',
    codigo: '',
    checkin: defaultDates.checkin,
    checkout: defaultDates.checkout,
    adultos: 1,
    criancas: 0
  });
  const [loadingEnvio, setLoadingEnvio] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const handleBuscar = async () => {
    if(!cpfBusca) return setError("Digite um CPF.");
    setLoadingBusca(true);
    setError('');
    setHospedeGov(null);
    
    try {
      const dados = await apiFetch(`/fnrh/buscar/${cpfBusca}`);
      setHospedeGov(dados);
      // Preenche código padrão com ID da reserva (6 últimos chars)
      setFormData(prev => ({ ...prev, codigo: reservaId.slice(-6).toUpperCase() })); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingBusca(false);
    }
  };

  const handleExecutar = async () => {
    if(!hospedeGov) return;
    setLoadingEnvio(true);
    setError('');

    try {
      await apiFetch('/fnrh/executar', {
        method: 'POST',
        body: JSON.stringify({
            reserva_local_id: reservaId,
            cpf_cliente: cpfBusca,
            // [CORREÇÃO] O campo do ID varia, o diagnóstico mostrou 'hospede_id'
            fnrh_hospede_id: hospedeGov.hospede_id || hospedeGov.id, 
            origem_reserva: formData.origem,
            codigo_reserva: formData.codigo,
            data_entrada: formData.checkin,
            data_saida: formData.checkout,
            adultos: formData.adultos,
            criancas: formData.criancas
        })
      });
      setSucesso(true);
      if(onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingEnvio(false);
    }
  };

  if (sucesso) {
    return (
        <div className="mt-4 p-4 bg-green-50 text-green-700 rounded border border-green-200 flex items-center gap-2">
            <CheckCircle className="w-5 h-5"/>
            <span className="font-bold">Check-in FNRH Realizado!</span>
        </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full mt-4 bg-[#003366] hover:bg-[#002244] text-white">
            Integrar Gov.br (FNRH)
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Integração FNRH</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
            
            <div className="flex gap-2 items-end bg-gray-50 p-3 rounded">
                <div className="flex-1">
                    <Label>CPF do Hóspede (Pré-Checkin)</Label>
                    <Input 
                        value={cpfBusca} 
                        onChange={e => setCpfBusca(e.target.value)} 
                        placeholder="Digite apenas números"
                    />
                </div>
                <Button onClick={handleBuscar} disabled={loadingBusca}>
                    {loadingBusca ? <Loader2 className="animate-spin w-4 h-4"/> : <Search className="w-4 h-4"/>}
                </Button>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="w-4 h-4"/>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {hospedeGov && (
                <div className="border rounded-md p-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 mb-2 text-green-700 bg-green-50 p-2 rounded">
                        <CheckCircle className="w-4 h-4"/>
                        {/* [CORREÇÃO] Usando .nome direto, conforme diagnóstico */}
                        <span className="text-sm font-bold">Encontrado: {hospedeGov.nome}</span>
                    </div>

                    <div>
                        <Label>Origem da Reserva *</Label>
                        <div className="flex gap-2 mt-1">
                            <Button 
                                type="button"
                                variant={formData.origem === 'MEIOHOSPEDAGEM' ? 'default' : 'outline'}
                                onClick={() => setFormData({...formData, origem: 'MEIOHOSPEDAGEM'})}
                                className="flex-1"
                            >
                                Meio de Hospedagem
                            </Button>
                            <Button 
                                type="button"
                                variant={formData.origem === 'OTA' ? 'default' : 'outline'}
                                onClick={() => setFormData({...formData, origem: 'OTA'})}
                                className="flex-1"
                            >
                                OTA
                            </Button>
                        </div>
                    </div>

                    <div>
                        <Label>Código da Reserva *</Label>
                        <Input 
                            value={formData.codigo} 
                            onChange={e => setFormData({...formData, codigo: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Entrada *</Label>
                            <Input type="date" value={formData.checkin} onChange={e => setFormData({...formData, checkin: e.target.value})} />
                        </div>
                        <div>
                            <Label>Saída *</Label>
                            <Input type="date" value={formData.checkout} onChange={e => setFormData({...formData, checkout: e.target.value})} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Adultos</Label>
                            <Input type="number" min="1" value={formData.adultos} onChange={e => setFormData({...formData, adultos: parseInt(e.target.value)})} />
                        </div>
                        <div>
                            <Label>Crianças</Label>
                            <Input type="number" min="0" value={formData.criancas} onChange={e => setFormData({...formData, criancas: parseInt(e.target.value)})} />
                        </div>
                    </div>

                    <Button onClick={handleExecutar} disabled={loadingEnvio} className="w-full bg-green-600 hover:bg-green-700 text-white mt-4">
                        {loadingEnvio ? <Loader2 className="animate-spin mr-2"/> : null}
                        Confirmar e Enviar FNRH
                    </Button>
                </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}