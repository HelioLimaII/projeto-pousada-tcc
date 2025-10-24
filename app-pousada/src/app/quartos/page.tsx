// Em: src/app/quartos/page.tsx
'use client'; // Necessário para useEffect e useState

import { useState, useEffect } from 'react';
import QuartoCard from "@/components/ui/QuartoCard"; // Importa o seu componente de cartão
import { getQuartos } from '@/lib/api'; // Importa a função da API

// Interface para os dados do quarto (pode ser partilhada)
interface Quarto {
  id: string;
  numero: number;
  titulo: string;
  descricao: string;
  preco_diaria: number;
  capacidade_hospedes: number;
  fotos?: string[]; // Inclui o campo fotos
  comodidades: string[];
  status: string;
}

export default function QuartosPage() {
  const [todosQuartos, setTodosQuartos] = useState<Quarto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTodosQuartos = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getQuartos(); // Busca todos os quartos
        setTodosQuartos(data);
      } catch (err) {
        setError('Falha ao carregar a lista de quartos.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTodosQuartos();
  }, []); // Executa apenas uma vez

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
        {loading && <p className="text-center">A carregar quartos...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && !error && todosQuartos.length > 0 && (
          <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 xl:gap-x-8">
            {todosQuartos.map((quarto) => (
              // Usa o QuartoCard para renderizar cada quarto
              <QuartoCard key={quarto.id} quarto={quarto} />
            ))}
          </div>
        )}
         {!loading && todosQuartos.length === 0 && !error && (
             <p className="text-center text-gray-500">Nenhum quarto encontrado.</p>
         )}
      </div>
    </div>
  );
}
