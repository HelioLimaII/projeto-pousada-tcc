// Em: src/app/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Mail, Wifi, Coffee } from 'lucide-react' 
import Link from 'next/link'
import Image from 'next/image'

interface Quarto {
  id: string;
  numero: number;
  titulo: string;
  descricao: string;
  fotos: string[];
  status: string;
}

export default function HomePage() {
  const [quartosDestaque, setQuartosDestaque] = useState<Quarto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQuartosDestaque = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/quartos`);
        if (!response.ok) throw new Error('Falha ao buscar quartos');
        const data: Quarto[] = await response.json();
        setQuartosDestaque(data.slice(0, 3));
      } catch (error) {
        console.error('Erro ao buscar quartos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuartosDestaque();
  }, [])

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src="/imagem-pousada.jpg"
            alt="Pousada Zekas"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h2 className="text-5xl md:text-6xl font-bold mb-4">
            Bem-vindo à Pousada Zekas
          </h2>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Sua experiência de tranquilidade e conexão com a natureza
          </p>
          <Link href="/quartos">
            <Button size="lg" className="bg-[#008080] hover:bg-[#006666] text-white px-8 py-3 text-lg">
              Conheça Nossos Quartos
            </Button>
          </Link>
        </div>
      </section>

      {/* Quartos em Destaque */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-[#2F4F4F] mb-4">
            Nossas Acomodações em Destaque
          </h3>
          <p className="text-lg text-[#2F4F4F]/80 max-w-2xl mx-auto">
            Conheça alguns de nossos quartos mais procurados, cada um pensado para proporcionar máximo conforto e tranquilidade.
          </p>
        </div>
        {loading ? (
          <p className="text-center">Carregando acomodações...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {quartosDestaque.map((quarto) => (
              <Card key={quarto.id} className="overflow-hidden hover:shadow-lg transition-shadow border-[#6B8E23]/20">
                <div className="relative h-48">
                  <Image
                    src={quarto.fotos[0] || "/placeholder.png"}
                    alt={quarto.titulo}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-6 flex flex-col">
                  <h4 className="text-xl font-semibold text-[#2F4F4F] mb-2">
                    {quarto.titulo}
                  </h4>
                  <p className="text-[#2F4F4F]/80 mb-4 line-clamp-2 flex-grow">
                    {quarto.descricao}
                  </p>
                  <Link href={`/quartos/${quarto.id}`} className="mt-auto">
                    <Button className="w-full bg-[#6B8E23] hover:bg-[#5a7a1f] text-white">
                      Ver Detalhes
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Sobre a Pousada Zekas */}
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-[#2F4F4F] mb-6">
            Sobre a Pousada Zekas
          </h3>
          <p className="text-lg text-[#2F4F4F]/80 leading-relaxed mb-8">
            Localizada em meio à natureza exuberante, a Pousada Zekas oferece uma experiência única de hospedagem, 
            combinando o charme rústico com o conforto moderno. Nossos quartos foram cuidadosamente projetados para 
            proporcionar momentos de paz e descanso, enquanto você se reconecta com a natureza e consigo mesmo.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-16 h-16 bg-[#6B8E23]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-[#6B8E23]" />
              </div>
              <h4 className="font-semibold text-[#2F4F4F] mb-2">Localização Privilegiada</h4>
              <p className="text-[#2F4F4F]/70">Em meio à natureza, longe do agito da cidade</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-[#6B8E23]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coffee className="w-8 h-8 text-[#6B8E23]" />
              </div>
              <h4 className="font-semibold text-[#2F4F4F] mb-2">Café da Manhã</h4>
              <p className="text-[#2F4F4F]/70">Produtos frescos e regionais todos os dias</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-[#6B8E23]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wifi className="w-8 h-8 text-[#6B8E23]" />
              </div>
              <h4 className="font-semibold text-[#2F4F4F] mb-2">Comodidades Modernas</h4>
              <p className="text-[#2F4F4F]/70">Wi-Fi, ar-condicionado e tudo que você precisa</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contato Rápido */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-[#008080] rounded-2xl p-8 md:p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">
            Pronto para sua experiência na Pousada Zekas?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Entre em contato conosco e reserve já suas datas
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contato">
              <Button size="lg" variant="secondary" className="bg-white text-[#008080] hover:bg-gray-100">
                Fazer Reserva
              </Button>
            </Link>
            <a href="tel:+5511999999999">
              {/* BOTÃO CORRIGIDO AQUI */}
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-[#008080]">
                <Phone className="w-4 h-4 mr-2" />
                Ligar Agora
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
