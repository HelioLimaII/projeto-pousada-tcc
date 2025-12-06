// Em: src/app/quartos/[id]/page.tsx

import { getQuartoById } from '@/lib/api'; 
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react'; 
import Link from 'next/link';
import QuartoImageCarousel from '@/components/ui/QuartoImageCarousel';
import ReservationAction from '@/components/ui/ReservationAction'; 

// Interface para os dados do quarto
interface Quarto {
  id: string;
  numero: number;
  titulo: string;
  descricao: string;
  capacidade_hospedes: number;
  fotos?: string[];
  status: string;
  // preco_diaria e comodidades foram removidos do uso visual
}

// Definição correta para Next.js 15
interface Props {
  params: Promise<{ id: string }>;
}

export default async function QuartosDetalhesPage({ params }: Props) {
  const { id } = await params;
  
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
  const fotos = quarto.fotos || [];

  return (
    <div className="min-h-screen bg-[#F5F5DC] py-12">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden md:grid md:grid-cols-2">

          {/* Coluna da Esquerda: Carrossel de Imagens */}
          <div className="p-4 sm:p-6">
            <QuartoImageCarousel fotos={fotos} titulo={`Quarto ${quarto.numero}`} />
          </div>

          {/* Coluna da Direita: Informações e Reserva */}
          <div className="p-6 md:p-8 flex flex-col">
            
            <h1 className="text-4xl font-bold text-[#2F4F4F] mb-2">
              Quarto {quarto.numero}
            </h1>
            
            {quarto.titulo && (
              <h2 className="text-xl text-[#6B8E23] font-medium mb-4">{quarto.titulo}</h2>
            )}

            <p className="text-lg text-[#2F4F4F]/80 mb-6 leading-relaxed">
              {quarto.descricao}
            </p>

            {/* [MODIFICADO] Apenas capacidade, sem comodidades */}
            <div className="mb-6 border-y py-6">
              <p className="text-lg text-[#2F4F4F] font-medium">
                  Capacidade: Até {quarto.capacidade_hospedes} hóspedes
              </p>
            </div>

            <div className="mt-auto pt-4">
              
              {/* [MODIFICADO] Sem preço, apenas botão */}
              
              {isDisponivel ? (
                <ReservationAction 
                  quartoNumero={quarto.numero} 
                />
              ) : (
                <Button
                  size="lg"
                  className="w-full bg-gray-300 text-gray-500 text-lg cursor-not-allowed"
                  disabled
                >
                  Indisponível no momento
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}