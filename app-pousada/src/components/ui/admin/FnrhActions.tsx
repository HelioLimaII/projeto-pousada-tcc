//src/components/ui/admin/FnrhActions.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, LogIn, LogOut, XCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const apiFetch = async (url: string) => {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}${url}`, { 
        method: 'POST', 
        headers: { 
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        } 
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Erro na requisição');
    }
    return res.json();
};

interface Props {
    idGov: string;
}

export default function FnrhActions({ idGov }: Props) {
    const [loading, setLoading] = useState('');
    const [msg, setMsg] = useState({ type: '', text: '' });

    const handleAction = async (action: 'checkin' | 'checkout' | 'cancelar') => {
        const labels = { checkin: 'Check-in (Entrada)', checkout: 'Check-out (Saída)', cancelar: 'Cancelar Reserva' };
        
        if (!confirm(`Deseja enviar ${labels[action]} para o Governo?`)) return;
        
        setLoading(action);
        setMsg({ type: '', text: '' });
        
        try {
            await apiFetch(`/fnrh/${action}-manual/${idGov}`);
            setMsg({ type: 'success', text: `Sucesso: ${labels[action]} realizado!` });
        } catch (error: any) {
            setMsg({ type: 'error', text: error.message });
        } finally {
            setLoading('');
        }
    };

    return (
        <div className="mt-4 p-4 bg-slate-50 border rounded-md">
            <div className="flex justify-between items-center mb-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Controles FNRH
                </p>
                <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                    <CheckCircle className="w-3 h-3" /> Sincronizado
                </div>
            </div>
            
            <div className="flex gap-2 flex-wrap">
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white flex-1" onClick={() => handleAction('checkin')} disabled={!!loading}>
                    {loading === 'checkin' ? <Loader2 className="w-4 h-4 animate-spin"/> : <LogIn className="w-4 h-4 mr-2"/>}
                    Entrada
                </Button>

                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white flex-1" onClick={() => handleAction('checkout')} disabled={!!loading}>
                    {loading === 'checkout' ? <Loader2 className="w-4 h-4 animate-spin"/> : <LogOut className="w-4 h-4 mr-2"/>}
                    Saída
                </Button>

                <Button size="sm" variant="destructive" className="flex-none" onClick={() => handleAction('cancelar')} disabled={!!loading}>
                    {loading === 'cancelar' ? <Loader2 className="w-4 h-4 animate-spin"/> : <XCircle className="w-4 h-4"/>}
                </Button>
            </div>

            {msg.text && (
                <Alert className={`mt-3 ${msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    <AlertDescription className="text-xs font-semibold">{msg.text}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}