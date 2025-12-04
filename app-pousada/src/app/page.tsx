// Em: src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
// Importa os ícones necessários
import { MapPin, Phone, Mail, Wifi, Coffee, Car, Wind, Tv, ShowerHead } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import QuartoCard from '@/components/ui/QuartoCard'; // **** Ajuste o caminho se necessário ****
import { getQuartos } from '@/lib/api';

// Interface Quarto (mantida)
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

export default function HomePage() {
  const [quartosDestaque, setQuartosDestaque] = useState<Quarto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Lógica para buscar quartos (mantida)
  useEffect(() => {
    const fetchQuartosDestaque = async () => {
      setLoading(true);
      setError('');
      try {
        const todosQuartos = await getQuartos();
        if (Array.isArray(todosQuartos)) {
            setQuartosDestaque(todosQuartos.slice(0, 3));
        } else {
            console.error("API não retornou um array de quartos:", todosQuartos);
            setError('Formato de dados inesperado recebido da API.');
            setQuartosDestaque([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao buscar quartos em destaque.');
        console.error('Erro ao buscar quartos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuartosDestaque();
  }, []);

  return (
    <div>
      {/* Hero Section (mantida) */}
      <section className="relative h-[70vh] flex items-center justify-center">
         {/* ... (código mantido) ... */}
         <div className="absolute inset-0">
           {/* LEMBRE-SE de substituir pela URL da sua imagem Cloudinary ou manter na pasta public se preferir */}
          <Image
            src="https://res.cloudinary.com/dd2qpbedy/image/upload/v1761314524/WhatsApp_Image_2022-03-10_at_07.14.40_3_eq5bvv.jpg"
            alt="Pousada Zekas"
            fill
            className="object-cover"
            priority
            quality={80}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h2 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">Bem-vindo à Pousada Zekas</h2>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto drop-shadow-md">Sua experiência de tranquilidade e conexão com a natureza</p>
          <Link href="/quartos"><Button size="lg" className="bg-[#008080] hover:bg-[#006666] text-white px-8 py-3 text-lg shadow-md hover:shadow-lg transition-shadow">Conheça Nossos Quartos</Button></Link>
        </div>
      </section>

      {/* Quartos em Destaque (mantido) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
         {/* ... (código mantido, usando QuartoCard) ... */}
         <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-[#2F4F4F] mb-4">Nossas Acomodações em Destaque</h3>
          <p className="text-lg text-[#2F4F4F]/80 max-w-2xl mx-auto">Conheça alguns de nossos quartos mais procurados.</p>
        </div>
        {loading ? ( <p className="text-center text-gray-500">A carregar acomodações...</p>
        ) : error ? ( <p className="text-center text-red-500">{error}</p>
        ) : quartosDestaque.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {quartosDestaque.map((quarto) => ( <QuartoCard key={quarto.id} quarto={quarto} /> ))}
          </div>
        ) : ( <p className="text-center text-gray-500">Nenhuma acomodação em destaque disponível.</p> )}
      </section>

      {/* Sobre a Pousada Zekas (MODIFICADO) */}
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center"> {/* Aumentado max-w para acomodar mais itens */}
          <h3 className="text-3xl font-bold text-[#2F4F4F] mb-6">
            Conforto e Natureza na Pousada Zekas
          </h3>
          <p className="text-lg text-[#2F4F4F]/80 leading-relaxed mb-12"> {/* Aumentado mb */}
            Desfrute de uma estadia tranquila em meio à natureza com as comodidades que você precisa para relaxar.
          </p>
          {/* Grelha de Comodidades Atualizada */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 text-center"> {/* Ajustada grelha responsiva */}
            {/* Localização */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-[#6B8E23]/10 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110">
                <MapPin className="w-8 h-8 text-[#6B8E23]" />
              </div>
              <h4 className="font-semibold text-base text-[#2F4F4F] mb-1">Localização</h4>
              <p className="text-sm text-[#2F4F4F]/70">Em meio à natureza</p>
            </div>
            {/* Café Grátis */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-[#6B8E23]/10 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110">
                <Coffee className="w-8 h-8 text-[#6B8E23]" />
              </div>
              <h4 className="font-semibold text-base text-[#2F4F4F] mb-1">Café da Manhã Grátis</h4>
              <p className="text-sm text-[#2F4F4F]/70">Produtos frescos e regionais</p>
            </div>
             {/* Estacionamento Grátis */}
             <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-[#6B8E23]/10 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110">
                <Car className="w-8 h-8 text-[#6B8E23]" />
              </div>
              <h4 className="font-semibold text-base text-[#2F4F4F] mb-1">Estacionamento Grátis</h4>
              <p className="text-sm text-[#2F4F4F]/70">Segurança para seu veículo</p>
            </div>
             {/* Wi-Fi */}
             <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-[#6B8E23]/10 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110">
                <Wifi className="w-8 h-8 text-[#6B8E23]" />
              </div>
              <h4 className="font-semibold text-base text-[#2F4F4F] mb-1">Wi-Fi</h4>
              <p className="text-sm text-[#2F4F4F]/70">Conecte-se com tranquilidade</p>
            </div>
             {/* Ar Condicionado */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-[#6B8E23]/10 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform hover:scale-110">
                <Wind className="w-8 h-8 text-[#6B8E23]" /> {/* Ícone para Ar Condicionado */}
              </div>
              <h4 className="font-semibold text-base text-[#2F4F4F] mb-1">Ar Condicionado</h4>
              <p className="text-sm text-[#2F4F4F]/70">Conforto térmico garantido</p>
            </div>
            {/* TV com Controle */}
             <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-[#6B8E23]/10 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform hover:scale-110">
                <Tv className="w-8 h-8 text-[#6B8E23]" />
              </div>
              <h4 className="font-semibold text-base text-[#2F4F4F] mb-1">TV com Controle</h4>
              <p className="text-sm text-[#2F4F4F]/70">Entretenimento no quarto</p>
            </div>
             {/* Chuveiro Elétrico */}
             <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-[#6B8E23]/10 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform hover:scale-110">
                <ShowerHead className="w-8 h-8 text-[#6B8E23]" /> {/* Ícone para Chuveiro */}
              </div>
              <h4 className="font-semibold text-base text-[#2F4F4F] mb-1">Chuveiro Elétrico</h4>
              <p className="text-sm text-[#2F4F4F]/70">Banho quente e relaxante</p>
            </div>
             {/* Pode adicionar mais itens aqui se precisar */}
          </div>
        </div>
      </section>

      {/* Contato Rápido (mantida) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* ... (código mantido) ... */}
         <div className="bg-[#008080] rounded-2xl p-8 md:p-12 text-center text-white shadow-lg">
          <h3 className="text-3xl font-bold mb-4">Pronto para sua experiência na Pousada Zekas?</h3>
          <p className="text-xl mb-8 opacity-90">Entre em contato conosco e reserve já suas datas</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contato"><Button size="lg" variant="secondary" className="bg-white text-[#008080] hover:bg-gray-100 shadow hover:shadow-md transition-all">Ver Contato e Reservar</Button></Link>
            <a href="tel:+5583993825342"><Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 shadow hover:shadow-md transition-all"><Phone className="w-4 h-4 mr-2" />Ligar Agora (WhatsApp)</Button></a>
          </div>
        </div>
      </section>
    </div>
  )
}

