// Em: src/components/ui/QuartoCard.tsx
'use client'

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wifi, Car, Coffee, Tv, Users } from 'lucide-react';

// A URL base da API NÃO é mais necessária para as imagens
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Quarto {
  id: string;
  numero: number;
  titulo: string;
  descricao: string;
  preco_diaria: number;
  capacidade_hospedes: number;
  fotos?: string[]; 
  comodidades: string[];
  status: string;
}

// ... (getComodidadeIcon não foi alterado) ...
const getComodidadeIcon = (comodidade: string) => {
  switch (comodidade?.toLowerCase()) {
    case 'wi-fi': case 'wifi': return <Wifi className="w-4 h-4 mr-1 text-[#6B8E23]" />;
    case 'estacionamento': return <Car className="w-4 h-4 mr-1 text-[#6B8E23]" />;
    case 'café da manhã': return <Coffee className="w-4 h-4 mr-1 text-[#6B8E23]" />;
    case 'tv': return <Tv className="w-4 h-4 mr-1 text-[#6B8E23]" />;
    default: return null;
  }
};

// ... (StatusBadge não foi alterado) ...
const StatusBadge = ({ status }: { status: string }) => {
  const statusInfo = {
    disponivel: { text: "Disponível", color: "bg-green-500" },
    ocupado: { text: "Ocupado", color: "bg-red-500" },
    manutencao: { text: "Manutenção", color: "bg-yellow-500 text-black" }, 
  };
  const info = statusInfo[status?.toLowerCase() as keyof typeof statusInfo] || { text: status || 'Indefinido', color: "bg-gray-400" };

  return (
    <span className={`inline-block ${info.color} text-white px-2.5 py-0.5 rounded-full text-xs font-semibold`}>
      {info.text}
    </span>
  );
};

export default function QuartoCard({ quarto }: { quarto: Quarto }) {
  const isDisponivel = quarto.status?.toLowerCase() === 'disponivel';

  // --- [CORREÇÃO APLICADA] ---
  // A URL agora vem DIRETAMENTE do banco de dados (Cloudinary)
  const imageUrl = (quarto.fotos && quarto.fotos.length > 0)
                   ? quarto.fotos[0] // É a URL completa: "https://res.cloudinary.com/..."
                   : "/placeholder-5t9d5.png"; // Fallback local

  return (
    <Card className="overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 border border-gray-200 group h-full">
      <div className="relative h-48 sm:h-56 overflow-hidden">
        <Link href={`/quartos/${quarto.id}`} className="block w-full h-full">
            <Image
              src={imageUrl} // Agora usa a URL correta do Cloudinary
              alt={`Foto principal do quarto ${quarto.titulo}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-5t9d5.png'; }}
              priority={false}
            />
        </Link>
        <div className="absolute top-3 left-3 z-10">
          <StatusBadge status={quarto.status} />
        </div>
      </div>

      <CardContent className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-[#2F4F4F] mb-1 truncate">{quarto.titulo}</h3>
        <p className="text-sm text-[#2F4F4F]/80 mb-3 line-clamp-2 flex-grow">{quarto.descricao}</p>

        <div className="flex items-center justify-between text-sm mb-3">
          <div className="flex items-center gap-1 text-[#2F4F4F]/80">
            <Users className="w-4 h-4 text-[#6B8E23]" />
            <span>Até {quarto.capacidade_hospedes}</span>
          </div>
          <span className="text-lg font-bold text-[#008080]">
            R$ {quarto.preco_diaria?.toFixed(2)}
            <span className="text-xs font-normal text-[#2F4F4F]/60 ml-1">/diária</span>
          </span>
        </div>

        <div className="mt-auto pt-3 border-t border-gray-200/60">
          <Link href={`/quartos/${quarto.id}`}>
             <Button
              className="w-full bg-[#6B8E23] hover:bg-[#5a7a1f] text-white transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={!isDisponivel}
              aria-label={isDisponivel ? `Ver detalhes do quarto ${quarto.titulo}` : `Quarto ${quarto.titulo} indisponível`}
            >
              {isDisponivel ? 'Ver Detalhes' : 'Indisponível'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}