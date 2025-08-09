// Em: src/components/QuartoCard.tsx
'use client'

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// Garanta que todos os ícones que você quer usar estão importados aqui
import { Wifi, Car, Coffee, Tv, Users } from 'lucide-react';

// Interface para definir a "forma" dos dados do quarto, alinhada com o back-end
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

// Função auxiliar para mapear nomes de comodidades para seus ícones
const getComodidadeIcon = (comodidade: string) => {
  switch (comodidade.toLowerCase()) {
    case 'wi-fi':
    case 'wifi':
      return <Wifi className="w-4 h-4 text-[#6B8E23]" />;
    case 'estacionamento':
      return <Car className="w-4 h-4 text-[#6B8E23]" />;
    case 'café da manhã':
      return <Coffee className="w-4 h-4 text-[#6B8E23]" />;
    case 'tv':
      return <Tv className="w-4 h-4 text-[#6B8E23]" />;
    default:
      return null; // Retorna nada se não encontrar um ícone
  }
};

// O componente principal do Card
export default function QuartoCard({ quarto }: { quarto: Quarto }) {
  return (
    <Card className="overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 border-[#6B8E23]/20 group">
      {/* Imagem Clicável */}
      <Link href={`/quartos/${quarto.id}`}>
        <div className="relative h-64 overflow-hidden">
          <Image
            src={quarto.fotos[0] || "/placeholder-5t9d5.png"}
            alt={quarto.titulo}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      {/* Conteúdo do Card */}
      <CardContent className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-[#2F4F4F] mb-2">{quarto.titulo}</h3>
        
        <p className="text-[#2F4F4F]/80 mb-4 line-clamp-3 flex-grow">
          {quarto.descricao}
        </p>

        {/* Seção de Comodidades */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4 h-10 items-center">
          {(quarto.comodidades || []).slice(0, 4).map((item) => (
            <div key={item} className="flex items-center gap-1 text-sm text-[#2F4F4F]/80">
              {getComodidadeIcon(item)}
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Seção de Preço e Capacidade */}
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
        
        {/* Botão de Ação */}
        <div className="mt-auto pt-4 border-t border-gray-200/60">
          <Link href={`/quartos/${quarto.id}`}>
            <Button className="w-full bg-[#6B8E23] hover:bg-[#5a7a1f] text-white transition-colors">
              Ver Detalhes e Reservar
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
