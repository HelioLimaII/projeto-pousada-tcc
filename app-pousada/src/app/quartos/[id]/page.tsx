// Em: src/app/quartos/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Wifi, Car, Coffee, Tv, Users, ArrowLeft, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'

// Definindo a URL base da sua API para carregar as imagens
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

export default function QuartoDetalhePage() {
  const params = useParams();
  const [quarto, setQuarto] = useState<Quarto | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Estado para o formulário de pré-reserva
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    rg: '',
    email: '',
    telefone: '',
    profissao: '',
    endereco: '',
    bairro: '',
    cep: '',
    cidade: '',
    estado: '',
    pais: '',
    placa_carro: '',
    checkin: '',
    checkout: '',
    observacoes: ''
  });

  useEffect(() => {
    const quartoId = params.id as string;
    if (quartoId) fetchQuarto(quartoId);
  }, [params.id]);

  const fetchQuarto = async (id: string) => {
    try {
      // Usamos a mesma URL base da API para buscar os dados do quarto
      const response = await fetch(`${API_BASE_URL}/quartos/${id}`);
      if (response.ok) {
        const data = await response.json();
        setQuarto(data);
      }
    } catch (error) {
      console.error('Erro ao buscar quarto:', error);
    } finally {
      setLoading(false);
    }
  };

  const getComodidadeIcon = (comodidade: string) => {
    switch (comodidade.toLowerCase()) {
      case 'wi-fi': case 'wifi': return <Wifi className="w-5 h-5 text-[#6B8E23]" />;
      case 'estacionamento': return <Car className="w-5 h-5 text-[#6B8E23]" />;
      case 'café da manhã': return <Coffee className="w-5 h-5 text-[#6B8E23]" />;
      case 'tv': return <Tv className="w-5 h-5 text-[#6B8E23]" />;
      default: return null;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.checkin || !formData.checkout || !formData.cpf) {
      // Usando um método de notificação mais moderno que alert, se disponível
      // Por enquanto, mantemos o alert por simplicidade
      alert('Por favor, preencha todos os campos obrigatórios (*)');
      return;
    }

    let message = `*SOLICITAÇÃO DE PRÉ-RESERVA - POUSADA ZEKAS*\n\n`;
    message += `*Hóspede:* ${formData.nome}\n`;
    message += `*Quarto:* ${quarto?.titulo} (Nº ${quarto?.numero})\n\n`;
    message += `*Período da Estadia:*\n`;
    message += `- Check-in: ${new Date(formData.checkin).toLocaleDateString('pt-BR')}\n`;
    message += `- Check-out: ${new Date(formData.checkout).toLocaleDateString('pt-BR')}\n\n`;
    message += `*Dados Pessoais:*\n`;
    message += `- CPF: ${formData.cpf}\n`;
    message += `- RG: ${formData.rg}\n`;
    message += `- Profissão: ${formData.profissao}\n\n`;
    message += `*Contato:*\n`;
    message += `- Telefone: ${formData.telefone}\n`;
    message += `- E-mail: ${formData.email}\n\n`;
    message += `*Endereço:*\n`;
    message += `- ${formData.endereco}, ${formData.bairro}\n`;
    message += `- ${formData.cidade} - ${formData.estado}, CEP: ${formData.cep}\n`;
    message += `- País: ${formData.pais}\n\n`;
    message += `*Outros:*\n`;
    message += `- Placa do Carro: ${formData.placa_carro || 'Não informado'}\n`;
    if (formData.observacoes) {
      message += `- Observações: ${formData.observacoes}\n`;
    }
    message += `\nAguardo confirmação da disponibilidade e próximos passos.`;

    const whatsappUrl = `https://wa.me/5583996872334?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p>A carregar quarto...</p></div>;
  }

  if (!quarto) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-bold text-[#2F4F4F] mb-4">Quarto não encontrado</h2>
          <Link href="/quartos"><Button className="bg-[#008080] hover:bg-[#006666] text-white">Voltar aos Quartos</Button></Link>
        </div>
      </div>
    );
  }

  const allImages = quarto.fotos.filter(Boolean);

  return (
    <div>
      <div className="bg-white border-b border-[#6B8E23]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/quartos" className="flex items-center text-[#008080] hover:text-[#006666] transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para a Galeria de Quartos
          </Link>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Galeria de Imagens */}
          <div className="space-y-4">
            <div className="relative h-96 rounded-lg overflow-hidden shadow-lg">
              {/* CORREÇÃO APLICADA AQUI */}
              <Image 
                src={allImages.length > 0 ? `${API_BASE_URL}${allImages[currentImageIndex]}` : "/placeholder.jpg"} 
                alt={`${quarto.titulo} - Imagem ${currentImageIndex + 1}`} 
                fill 
                className="object-cover" 
                priority
              />
            </div>
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {allImages.map((image, index) => (
                  <button key={index} onClick={() => setCurrentImageIndex(index)} className={`relative h-20 rounded-lg overflow-hidden border-2 transition-colors ${currentImageIndex === index ? 'border-[#008080]' : 'border-transparent'}`}>
                    {/* E AQUI TAMBÉM */}
                    <Image 
                      src={`${API_BASE_URL}${image}`} 
                      alt={`Miniatura ${index + 1}`} 
                      fill 
                      className="object-cover" 
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informações do Quarto + Formulário */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-[#2F4F4F] mb-4">{quarto.titulo}</h1>
              <p className="text-lg text-[#2F4F4F]/80 leading-relaxed">{quarto.descricao}</p>
            </div>
            <div className="flex items-center gap-6 py-4 border-y border-[#6B8E23]/20">
              <div className="flex items-center gap-2 text-[#2F4F4F]"><Users className="w-5 h-5" /><span>Até {quarto.capacidade_hospedes} hóspedes</span></div>
              <div className="text-2xl font-bold text-[#008080]">R$ {quarto.preco_diaria}<span className="text-base font-normal text-[#2F4F4F]/60 ml-1">/diária</span></div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[#2F4F4F] mb-4">Comodidades</h3>
              <div className="grid grid-cols-2 gap-3">
                {quarto.comodidades.map((comodidade) => (
                  <div key={comodidade} className="flex items-center gap-3 text-[#2F4F4F]">{getComodidadeIcon(comodidade)}<span>{comodidade}</span></div>
                ))}
              </div>
            </div>

            {/* Formulário */}
            <Card className="border-[#6B8E23]/20 bg-white">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-[#2F4F4F] mb-4 flex items-center gap-2"><MessageCircle className="w-5 h-5" />Solicitar Pré-Reserva via WhatsApp</h3>
                <form onSubmit={handleWhatsAppSubmit} className="space-y-4">

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="checkin">Check-in *</Label>
                      <Input id="checkin" name="checkin" type="date" value={formData.checkin} onChange={handleInputChange} required />
                    </div>
                    <div>
                      <Label htmlFor="checkout">Check-out *</Label>
                      <Input id="checkout" name="checkout" type="date" value={formData.checkout} onChange={handleInputChange} required />
                    </div>
                  </div>

                  <h4 className="text-lg font-medium text-[#2F4F4F] pt-2">Os seus Dados</h4>
                  <div>
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input id="nome" name="nome" value={formData.nome} onChange={handleInputChange} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cpf">CPF *</Label>
                      <Input id="cpf" name="cpf" value={formData.cpf} onChange={handleInputChange} required />
                    </div>
                    <div>
                      <Label htmlFor="rg">RG/Passaporte</Label>
                      <Input id="rg" name="rg" value={formData.rg} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input id="telefone" name="telefone" type="tel" value={formData.telefone} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="profissao">Profissão</Label>
                    <Input id="profissao" name="profissao" value={formData.profissao} onChange={handleInputChange} />
                  </div>

                  <h4 className="text-lg font-medium text-[#2F4F4F] pt-2">Endereço</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="endereco">Endereço (Rua, Nº)</Label>
                      <Input id="endereco" name="endereco" value={formData.endereco} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label htmlFor="bairro">Bairro</Label>
                      <Input id="bairro" name="bairro" value={formData.bairro} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="cep">CEP</Label>
                      <Input id="cep" name="cep" value={formData.cep} onChange={handleInputChange} />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input id="cidade" name="cidade" value={formData.cidade} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="estado">Estado</Label>
                      <Input id="estado" name="estado" value={formData.estado} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label htmlFor="pais">País</Label>
                      <Input id="pais" name="pais" value={formData.pais} onChange={handleInputChange} />
                    </div>
                  </div>

                  <h4 className="text-lg font-medium text-[#2F4F4F] pt-2">Outras Informações</h4>
                  <div>
                    <Label htmlFor="placa_carro">Placa do Carro (Opcional)</Label>
                    <Input id="placa_carro" name="placa_carro" value={formData.placa_carro} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="observacoes">Observações (Opcional)</Label>
                    <Textarea id="observacoes" name="observacoes" value={formData.observacoes} onChange={handleInputChange} placeholder="Alguma solicitação especial..." rows={3} />
                  </div>

                  <Button type="submit" className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" />Enviar Solicitação via WhatsApp
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

