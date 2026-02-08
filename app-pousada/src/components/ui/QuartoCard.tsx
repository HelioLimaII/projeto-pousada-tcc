'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from 'lucide-react';

interface Quarto {
  id: string;
  numero: number;
  titulo: string | null;
  descricao: string;
  preco_diaria: number;
  capacidade_hospedes: number;
  fotos?: string[]; 
  comodidades: string[];
  status: string;
}

const StatusBadge = ({ status }: { status: string }) => {
  const statusInfo: Record<string, { text: string, color: string }> = {
    disponivel: { text: "Disponível", color: "bg-green-500" },
    ocupado: { text: "Ocupado", color: "bg-red-500" },
    manutencao: { text: "Manutenção", color: "bg-yellow-500 text-black" }, 
  };
  
  const normalizedStatus = status?.toLowerCase() || '';
  const info = statusInfo[normalizedStatus] || { text: status || 'Indefinido', color: "bg-gray-400" };

  return (
    <span className={`inline-block ${info.color} text-white px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-sm`}>
      {info.text}
    </span>
  );
};

export default function QuartoCard({ quarto }: { quarto: Quarto }) {
  const isDisponivel = quarto.status?.toLowerCase() === 'disponivel';
  
  const PLACEHOLDER_URL = "https://placehold.co/600x400/e2e8f0/1e293b?text=Sem+Foto";
  const [imgSrc, setImgSrc] = useState(PLACEHOLDER_URL);

  useEffect(() => {
    if (quarto.fotos && quarto.fotos.length > 0) {
      setImgSrc(quarto.fotos[0]);
    } else {
      setImgSrc(PLACEHOLDER_URL);
    }
  }, [quarto.fotos]);

  return (
    <Card className="overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 border border-gray-200 group h-full bg-white">
      <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-100">
        <Link href={`/quartos/${quarto.id}`} className="block w-full h-full">
            <Image
              src={imgSrc} 
              alt={`Foto do Quarto ${quarto.numero}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={() => setImgSrc(PLACEHOLDER_URL)}
              priority={false}
            />
        </Link>
        <div className="absolute top-3 left-3 z-10">
          <StatusBadge status={quarto.status} />
        </div>
      </div>

      <CardContent className="p-4 flex flex-col flex-grow">
        <div className="mb-2">
            <h3 className="text-xl font-bold text-[#2F4F4F] truncate">
                Quarto {quarto.numero}
            </h3>
            <p className="text-sm font-medium text-[#6B8E23] truncate h-5">
                {quarto.titulo || 'Acomodação Standard'}
            </p>
        </div>

        <p className="text-sm text-[#2F4F4F]/80 mb-3 line-clamp-2 flex-grow">
          {quarto.descricao || 'Sem descrição disponível.'}
        </p>

        {/* Alteração: Removido o 'justify-between' e a div de preço */}
        <div className="flex items-center text-sm mb-4 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-[#2F4F4F]/80">
            <Users className="w-4 h-4 text-[#6B8E23]" />
            <span className="font-medium">Até {quarto.capacidade_hospedes} pessoas</span>
          </div>
        </div>

        <div className="mt-auto">
          <Link href={`/quartos/${quarto.id}`} className="w-full block">
             <Button
              className={`w-full transition-colors font-semibold ${
                isDisponivel 
                  ? "bg-[#6B8E23] hover:bg-[#5a7a1f] text-white shadow-md hover:shadow-lg" 
                  : "bg-gray-200 text-gray-500 cursor-not-allowed hover:bg-gray-200"
              }`}
              disabled={!isDisponivel}
            >
              {isDisponivel ? 'Reservar Agora' : 'Indisponível'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}