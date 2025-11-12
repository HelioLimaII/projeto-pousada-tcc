// Em: src/app/quartos/[id]/page.tsx
// (Este continua a ser um Componente de Servidor)

import { getQuartoById } from '@/lib/api'; 
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Users, Wifi, Car, Coffee, Tv } from 'lucide-react'; 
import Link from 'next/link';

// --- [CORREÇÃO] ---
// Removemos os imports do 'Image' e 'Carousel' daqui...
// ...e importamos o nosso novo Componente de Cliente.
import QuartoImageCarousel from '@/components/ui/QuartoImageCarousel';
// ------------------

// (A interface Quarto, QuartosDetalhesProps, e getComodidadeIcon 
// permanecem exatamente iguais)
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
/*
interface QuartosDetalhesProps {
  params: {
    id: string;
  };
}
  */
const getComodidadeIcon = (comodidade: string) => {
  const com = comodidade.trim().toLowerCase();
  if (com === 'wi-fi' || com === 'wifi') { return <Wifi className="w-5 h-5 mr-2 text-[#6B8E23]" />; }
  if (com === 'estacionamento') { return <Car className="w-5 h-5 mr-2 text-[#6B8E23]" />; }
  if (com === 'café da manhã') { return <Coffee className="w-5 h-5 mr-2 text-[#6B8E23]" />; }
  if (com === 'tv') { return <Tv className="w-5 h-5 mr-2 text-[#6B8E23]" />; }
  return null; 
};


export default async function QuartosDetalhesPage({ params }: { params: { id: string } }) {
  // (Toda a lógica de 'fetch' e 'error' permanece igual)
  const { id } = params;
  let quarto: Quarto | null = null;
  let error: string | null = null;

  try {
    quarto = await getQuartoById(id);
  } catch (err) {
    console.error(err);
    error = 'Falha ao carregar os detalhes deste quarto.';
  }

  if (error || !quarto) {
    return (
      <div className="max-w-lg mx-auto my-20">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Quarto não encontrado.'}</AlertDescription>
        </Alert>
        <Link href="/quartos" className="mt-4 inline-block">
          <Button variant="outline">Voltar para todos os quartos</Button>
        </Link>
      </div>
    );
  }

  const isDisponivel = quarto.status?.toLowerCase() === 'disponivel';
  // [CORREÇÃO] Apenas preparamos os dados para o componente de cliente
  const fotos = quarto.fotos || [];

  return (
    <div className="min-h-screen bg-[#F5F5DC] py-12">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden md:grid md:grid-cols-2">

          {/* Coluna da Esquerda: Carrossel de Imagens */}
          <div className="p-4 sm:p-6">
            {/* [CORREÇÃO] Usamos o nosso novo componente de cliente
              e passamos os dados (que são "seguros") como props.
            */}
            <QuartoImageCarousel fotos={fotos} titulo={quarto.titulo} />
          </div>

          {/* Coluna da Direita: Informações e Reserva */}
          {/* (Esta secção permanece 100% igual) */}
          <div className="p-6 md:p-8 flex flex-col">
            <h1 className="text-3xl font-bold text-[#2F4F4F] mb-2">{quarto.titulo}</h1>
            <p className="text-lg text-[#2F4F4F]/80 mb-6">{quarto.descricao}</p>

            <div className="mb-6 border-y py-4">
              <h3 className="text-lg font-semibold text-[#2F4F4F] mb-3">Comodidades</h3>
              <ul className="grid grid-cols-2 gap-2 text-gray-700">
                <li className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-[#6B8E23]" />
                  Até {quarto.capacidade_hospedes} hóspedes
                </li>
                {quarto.comodidades.map((comodidade, i) => {
                  const icon = getComodidadeIcon(comodidade);
                  return (
                    <li key={i} className="flex items-center">
                      {icon} {comodidade}
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="mt-auto">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-3xl font-bold text-[#008080]">
                  R$ {quarto.preco_diaria?.toFixed(2)}
                </span>
                <span className="text-md text-[#2F4F4F]/60">/diária</span>
              </div>

              <Button
                size="lg"
                className="w-full bg-[#6B8E23] hover:bg-[#5a7a1f] text-white text-lg disabled:bg-gray-400"
                disabled={!isDisponivel}
              >
                {isDisponivel ? 'Reservar Agora' : 'Indisponível'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}