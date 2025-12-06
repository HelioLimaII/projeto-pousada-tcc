// Em: src/components/ui/ReservationAction.tsx

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
import { MessageCircle } from 'lucide-react';

// [CORREÇÃO] Removemos 'precoDiaria' da interface
interface ReservationActionProps {
  quartoNumero: number;
}

// [CORREÇÃO] Removemos 'precoDiaria' dos argumentos da função
export default function ReservationAction({ quartoNumero }: ReservationActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [dias, setDias] = useState(0);
  
  // O total estimado foi removido pois o preço agora é sob consulta

  const TELEFONE_POUSADA = "5583993825342"; 

  // Calcula apenas a quantidade de dias
  useEffect(() => {
    if (checkIn && checkOut) {
      const inicio = new Date(checkIn);
      const fim = new Date(checkOut);
      const diffTime = fim.getTime() - inicio.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        setDias(diffDays);
      } else {
        setDias(0);
      }
    }
  }, [checkIn, checkOut]);

  const handleWhatsAppRedirect = () => {
    if (!nome || !checkIn || !checkOut) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    const formatDate = (dateStr: string) => {
      const [ano, mes, dia] = dateStr.split('-');
      return `${dia}/${mes}/${ano}`;
    };

    // Mensagem formatada sem valores monetários
    const mensagem = `Olá! 👋\n\nGostaria de solicitar uma reserva na Pousada Zekas.\n\n` +
      `*🏠 Quarto:* ${quartoNumero}\n` +
      `*👤 Cliente:* ${nome}\n` +
      `*📅 Check-in:* ${formatDate(checkIn)}\n` +
      `*📅 Check-out:* ${formatDate(checkOut)}\n` +
      `*🌙 Diárias:* ${dias}\n\n` +
      `Aguardo o valor e a confirmação.`;

    const url = `https://wa.me/${TELEFONE_POUSADA}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          size="lg"
          className="w-full bg-[#6B8E23] hover:bg-[#5a7a1f] text-white text-lg font-semibold shadow-md transition-all hover:scale-105"
        >
          Solicitar Reserva - Quarto {quartoNumero}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#F5F5DC]">
        <DialogHeader>
          <DialogTitle className="text-[#2F4F4F] text-xl">Solicitar Reserva - Quarto {quartoNumero}</DialogTitle>
          <DialogDescription>
            Preencha seus dados para consultar a disponibilidade no WhatsApp.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nome" className="text-[#2F4F4F]">Seu Nome Completo</Label>
            <Input 
              id="nome" 
              value={nome} 
              onChange={(e) => setNome(e.target.value)} 
              placeholder="Ex: João da Silva"
              className="bg-white"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="checkin" className="text-[#2F4F4F]">Dia de entrada</Label>
              <Input 
                id="checkin" 
                type="date" 
                value={checkIn} 
                onChange={(e) => setCheckIn(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="checkout" className="text-[#2F4F4F]">Dia de saída</Label>
              <Input 
                id="checkout" 
                type="date" 
                value={checkOut} 
                onChange={(e) => setCheckOut(e.target.value)}
                className="bg-white"
              />
            </div>
          </div>

          {dias > 0 && (
            <div className="bg-white p-3 rounded-md border border-[#6B8E23]/30 mt-2">
              <div className="flex justify-between items-center text-sm text-gray-600 font-medium">
                <span>Estadia de {dias} {dias === 1 ? 'diária' : 'diárias'}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleWhatsAppRedirect} className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold">
            <MessageCircle className="w-5 h-5 mr-2" />
            Consultar no WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}