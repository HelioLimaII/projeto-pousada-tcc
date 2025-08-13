// Em: src/components/QuartoCard.tsx
'use client'

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wifi, Car, Coffee, Tv, Users } from 'lucide-react';

interface Quarto {
  id: string;
  numero: number;
  titulo: string;
  descricao: string;
  preco_diaria: number;
  capacidade_hospedes: number;
  fotos: string[];
  comodidades: string[];
  status: string;
}

const getComodidadeIcon = (comodidade: string) => {
  // ... (código da função getComodidadeIcon)
};

// --- NOVA FUNÇÃO PARA ESTILIZAR O STATUS ---
const StatusBadge = ({ status }: { status: string }) => {
  const statusInfo = {
    disponivel: { text: "Disponível", color: "bg-green-500" },
    ocupado: { text: "Ocupado", color: "bg-red-500" },
    manutencao: { text: "Em Manutenção", color: "bg-yellow-500" },
  };

  const info = statusInfo[status.toLowerCase() as keyof typeof statusInfo] || { text: status, color: "bg-gray-500" };

  return (
    <span className={`${info.color} text-white px-3 py-1 rounded-full text-xs font-medium`}>
      {info.text}
    </span>
  );
};

export default function QuartoCard({ quarto }: { quarto: Quarto }) {
  const isDisponivel = quarto.status.toLowerCase() === 'disponivel';

  return (
    <Card className="overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 border-[#6B8E23]/20 group">
      <div className="relative h-64 overflow-hidden">
        <Link href={`/quartos/${quarto.id}`}>
          <Image
            src={quarto.fotos[0] || "/placeholder-5t9d5.png"}
            alt={quarto.titulo}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        {/* --- ETIQUETA DE STATUS ADICIONADA AQUI --- */}
        <div className="absolute top-4 left-4">
          <StatusBadge status={quarto.status} />
        </div>
      </div>
      
      <CardContent className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-[#2F4F4F] mb-2">{quarto.titulo}</h3>
        <p className="text-[#2F4F4F]/80 mb-4 line-clamp-3 flex-grow">{quarto.descricao}</p>
        
        {/* ... (código das comodidades, preço e capacidade) ... */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 text-sm text-[#2F4F4F]/70">
            <Users className="w-4 h-4" />
            <span>Até {quarto.capacidade_hospedes} hóspedes</span>
          </div>
          <span className="text-2xl font-bold text-[#008080]">
            R$ {quarto.preco_diaria}
            <span className="text-base font-normal text-[#2F4F4F]/60 ml-1">/diária</span>
          </span>
        </div>
        
        <div className="mt-auto pt-4 border-t border-gray-200/60">
          <Link href={`/quartos/${quarto.id}`}>
            {/* --- LÓGICA DO BOTÃO ATUALIZADA --- */}
            <Button 
              className="w-full bg-[#6B8E23] hover:bg-[#5a7a1f] text-white transition-colors disabled:bg-gray-400"
              disabled={!isDisponivel}
            >
              {isDisponivel ? 'Ver Detalhes e Reservar' : 'Indisponível'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
