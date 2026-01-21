'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { MessageCircle, CalendarCheck } from 'lucide-react';

interface ReservationActionProps {
  quartoNumero: number;
}

export default function ReservationAction({ quartoNumero }: ReservationActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [dias, setDias] = useState(0);

  // Número do WhatsApp (apenas números)
  const TELEFONE_POUSADA = "5583993825342"; 

  // Calcula a quantidade de dias automaticamente
  useEffect(() => {
    if (checkIn && checkOut) {
      const inicio = new Date(checkIn);
      const fim = new Date(checkOut);
      
      // Diferença em milissegundos
      const diffTime = fim.getTime() - inicio.getTime();
      // Converte para dias
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      setDias(diffDays > 0 ? diffDays : 0);
    } else {
      setDias(0);
    }
  }, [checkIn, checkOut]);

  const handleWhatsAppRedirect = () => {
    if (!nome || !checkIn || !checkOut) {
      alert("Por favor, preencha todos os campos para continuar.");
      return;
    }

    if (dias <= 0) {
      alert("A data de saída deve ser posterior à data de entrada.");
      return;
    }

    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      const [ano, mes, dia] = dateStr.split('-');
      return `${dia}/${mes}/${ano}`;
    };

    // Monta a mensagem para o WhatsApp
    const mensagem = `Olá! 👋\n\nGostaria de solicitar uma reserva na Pousada Zekas.\n\n` +
      `*🏠 Quarto:* ${quartoNumero}\n` +
      `*👤 Cliente:* ${nome}\n` +
      `*📅 Check-in:* ${formatDate(checkIn)}\n` +
      `*📅 Check-out:* ${formatDate(checkOut)}\n` +
      `*🌙 Diárias:* ${dias}\n\n` +
      `Aguardo a confirmação da disponibilidade e valores.`;

    const url = `https://wa.me/${TELEFONE_POUSADA}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          size="lg"
          className="w-full bg-[#008080] hover:bg-[#006666] text-white text-lg font-semibold shadow-md transition-all hover:scale-[1.02]"
        >
          <CalendarCheck className="mr-2 h-5 w-5" />
          Solicitar Reserva
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-[#2F4F4F] text-xl flex items-center gap-2">
            Reservar Quarto {quartoNumero}
          </DialogTitle>
          <DialogDescription>
            Informe as datas desejadas para verificarmos a disponibilidade no WhatsApp.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nome" className="text-[#2F4F4F]">Nome Completo</Label>
            <Input 
              id="nome" 
              value={nome} 
              onChange={(e) => setNome(e.target.value)} 
              placeholder="Ex: Seu Nome"
              className="bg-gray-50"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="checkin" className="text-[#2F4F4F]">Entrada</Label>
              <Input 
                id="checkin" 
                type="date" 
                value={checkIn} 
                onChange={(e) => setCheckIn(e.target.value)}
                className="bg-gray-50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="checkout" className="text-[#2F4F4F]">Saída</Label>
              <Input 
                id="checkout" 
                type="date" 
                value={checkOut} 
                onChange={(e) => setCheckOut(e.target.value)}
                className="bg-gray-50"
              />
            </div>
          </div>

          {dias > 0 ? (
            <div className="bg-[#f0fdf4] p-3 rounded-md border border-green-200 mt-1">
              <p className="text-sm text-green-700 font-medium text-center">
                Estadia de {dias} {dias === 1 ? 'diária' : 'diárias'}
              </p>
            </div>
          ) : checkOut && (
            <div className="bg-red-50 p-2 rounded-md border border-red-100">
               <p className="text-xs text-red-600 text-center">Data de saída inválida</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            onClick={handleWhatsAppRedirect} 
            className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Enviar no WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}