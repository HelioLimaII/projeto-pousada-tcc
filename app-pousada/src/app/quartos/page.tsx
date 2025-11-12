// Em: src/app/quartos/page.tsx
// SEM 'use client' no topo

import QuartoCard from "@/components/ui/QuartoCard"; // Importa o seu componente de cartão
import { getQuartos } from '@/lib/api'; // Importa a função da API
import { Alert, AlertDescription } from '@/components/ui/alert'; // Para feedback de erro
import { AlertCircle } from 'lucide-react';

// Interface para os dados do quarto (pode ser partilhada)
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

// A função da página agora é 'async'
export default async function QuartosPage() {
  let todosQuartos: Quarto[] = [];
  let error: string | null = null;

  // Busca os dados diretamente no servidor
  try {
    todosQuartos = await getQuartos(); // Busca todos os quartos
  } catch (err) {
    console.error(err);
    error = 'Falha ao carregar a lista de quartos.';
  }

  return (
    <div className="min-h-screen bg-[#F5F5DC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-[#2F4F4F] sm:text-5xl">
            Nossas Acomodações
          </h1>
          <p className="mt-4 text-xl text-[#2F4F4F]/80">
            Explore nossos quartos e encontre o refúgio perfeito para sua estadia.
          </p>
        </div>

        {/* Grelha de Todos os Quartos */}
        {error && (
            <Alert variant="destructive" className="max-w-lg mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        
        {!error && todosQuartos.length > 0 && (
          <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 xl:gap-x-8">
            {todosQuartos.map((quarto) => (
              // O QuartoCard (corrigido na Fase 2) renderiza a imagem do Cloudinary
              <QuartoCard key={quarto.id} quarto={quarto} />
            ))}
          </div>
        )}
        
         {!error && todosQuartos.length === 0 && (
             <p className="text-center text-gray-500">Nenhum quarto encontrado no momento.</p>
         )}
      </div>
    </div>
  );
}