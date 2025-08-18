// Em: src/app/quartos/page.tsx

import QuartoCard from "@/components/ui/QuartoCard";

// A interface permanece a mesma
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

async function getQuartos() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const res = await fetch(`${apiUrl}/quartos`, { cache: 'no-store' });
    if (!res.ok) {
        console.error("Falha ao buscar quartos da API");
        return [];
    }
    const data: Quarto[] = await res.json();
    return data; // MODIFICAÇÃO: Removemos o filtro, agora retorna todos os quartos
}

export default async function QuartosPage() {
  const todosOsQuartos = await getQuartos();

  return (
    <div>
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-[#2F4F4F] mb-4">Conheça Nossas Acomodações</h2>
          <p className="text-lg text-[#2F4F4F]/80 max-w-2xl mx-auto">
            Cada quarto foi cuidadosamente projetado para oferecer máximo conforto e uma experiência única.
          </p>
        </div>
      </section>

      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {todosOsQuartos.length === 0 ? (
          <div className="text-center py-16"><p>Nenhum quarto cadastrado no momento.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {todosOsQuartos.map((quarto) => (
              <QuartoCard key={quarto.id} quarto={quarto} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}