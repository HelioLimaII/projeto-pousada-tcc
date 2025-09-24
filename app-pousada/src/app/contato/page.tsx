// Em: src/app/contato/page.tsx

'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, Clock, MessageCircle, Send } from 'lucide-react'
import Link from 'next/link'

export default function ContatoPage() {
  // 1. Adicionados novos campos ao estado inicial do formulário
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    rg: '',
    cpf: '',
    profissao: '',
    endereco: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    placaVeiculo: '',
    checkin: '',
    checkout: '',
    hospedes: '2',
    mensagem: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // 2. Atualizado o corpo da mensagem para WhatsApp e Email para incluir os novos campos
  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    if (!formData.nome || !formData.telefone) {
      alert('Por favor, preencha pelo menos seu nome e telefone.')
      setIsSubmitting(false)
      return
    }

    let message = `Olá! Gostaria de solicitar informações ou fazer uma reserva na Pousada Zekas.\n`
    
    message += `\n*Dados Pessoais:*`
    message += `\n- Nome: ${formData.nome}`
    message += `\n- Email: ${formData.email || 'Não informado'}`
    message += `\n- Telefone: ${formData.telefone}`
    message += `\n- RG/Passaporte: ${formData.rg || 'Não informado'}`
    message += `\n- CPF: ${formData.cpf || 'Não informado'}`
    message += `\n- Profissão: ${formData.profissao || 'Não informado'}`
    
    message += `\n\n*Endereço:*`
    message += `\n- Endereço: ${formData.endereco || 'Não informado'}`
    message += `\n- Bairro: ${formData.bairro || 'Não informado'}`
    message += `\n- Cidade: ${formData.cidade || 'Não informado'}`
    message += `\n- Estado: ${formData.estado || 'Não informado'}`
    message += `\n- CEP: ${formData.cep || 'Não informado'}`

    if (formData.placaVeiculo) {
      message += `\n\n- Placa do Veículo: ${formData.placaVeiculo}`
    }

    if (formData.checkin && formData.checkout) {
      message += `\n\n*Interesse em Reserva:*`
      message += `\n- Check-in: ${new Date(formData.checkin).toLocaleDateString('pt-BR')}`
      message += `\n- Check-out: ${new Date(formData.checkout).toLocaleDateString('pt-BR')}`
      message += `\n- Número de hóspedes: ${formData.hospedes}`
    }

    if (formData.mensagem) {
      message += `\n\n*Mensagem Adicional:*\n${formData.mensagem}`
    }

    message += `\n\nAguardo retorno!`

    const numeroWhatsApp = "5583996872334"; // Substitua pelo número real
    const whatsappUrl = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    
    setTimeout(() => {
      setIsSubmitting(false)
    }, 1000)
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome || !formData.email) {
      alert('Por favor, preencha pelo menos seu nome e email.')
      return
    }
    
    const subject = 'Solicitação de Reserva/Contato - Pousada Zekas'
    
    let body = `Dados Pessoais:%0D%0A`
    body += `Nome: ${formData.nome}%0D%0A`
    body += `Email: ${formData.email}%0D%0A`
    body += `Telefone: ${formData.telefone || 'Não informado'}%0D%0A`
    body += `RG/Passaporte: ${formData.rg || 'Não informado'}%0D%0A`
    body += `CPF: ${formData.cpf || 'Não informado'}%0D%0A`
    body += `Profissão: ${formData.profissao || 'Não informado'}%0D%0A%0D%0A`

    body += `Endereço:%0D%0A`
    body += `Logradouro: ${formData.endereco || 'Não informado'}%0D%0A`
    body += `Bairro: ${formData.bairro || 'Não informado'}%0D%0A`
    body += `Cidade: ${formData.cidade || 'Não informado'}%0D%0A`
    body += `Estado: ${formData.estado || 'Não informado'}%0D%0A`
    body += `CEP: ${formData.cep || 'Não informado'}%0D%0A%0D%0A`
    
    if(formData.placaVeiculo) {
      body += `Placa do Veículo: ${formData.placaVeiculo}%0D%0A%0D%0A`
    }
    
    if (formData.checkin && formData.checkout) {
      body += `Interesse em Reserva:%0D%0A`
      body += `Check-in: ${new Date(formData.checkin).toLocaleDateString('pt-BR')}%0D%0A`
      body += `Check-out: ${new Date(formData.checkout).toLocaleDateString('pt-BR')}%0D%0A`
      body += `Hóspedes: ${formData.hospedes}%0D%0A%0D%0A`
    }
    
    if (formData.mensagem) {
      body += `Mensagem Adicional:%0D%0A${formData.mensagem}`
    }
    
    const emailPousada = "contato@pousadazekas.com.br"; // Substitua pelo email real
    const mailtoUrl = `mailto:${emailPousada}?subject=${subject}&body=${body}`
    window.location.href = mailtoUrl
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-[#2F4F4F] mb-4">
            Entre em Contato Conosco
          </h2>
          <p className="text-lg text-[#2F4F4F]/80 max-w-2xl mx-auto">
            Estamos aqui para ajudar você a planejar sua estadia perfeita na Pousada Zekas. 
            Preencha o formulário abaixo para solicitar informações ou fazer sua reserva.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Coluna da Esquerda: Formulário e Contato Direto */}
          <div className="space-y-8">
            <Card className="border-[#6B8E23]/20">
              <CardContent className="p-6">
                <h3 className="text-2xl font-semibold text-[#2F4F4F] mb-6 flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-[#008080]" />
                  Solicitar Informações ou Reserva
                </h3>
                
                {/* 3. Formulário atualizado com os novos campos */}
                <form onSubmit={handleWhatsAppSubmit} className="space-y-4">
                  {/* --- Dados Pessoais --- */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome">Nome Completo *</Label>
                      <Input id="nome" name="nome" value={formData.nome} onChange={handleInputChange} placeholder="Seu nome completo" required />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="seu@email.com" />
                    </div>
                    <div>
                      <Label htmlFor="telefone">Telefone/WhatsApp *</Label>
                      <Input id="telefone" name="telefone" type="tel" value={formData.telefone} onChange={handleInputChange} placeholder="(11) 99999-9999" required />
                    </div>
                     <div>
                      <Label htmlFor="profissao">Profissão</Label>
                      <Input id="profissao" name="profissao" value={formData.profissao} onChange={handleInputChange} placeholder="Sua profissão" />
                    </div>
                    <div>
                      <Label htmlFor="rg">RG / Passaporte</Label>
                      <Input id="rg" name="rg" value={formData.rg} onChange={handleInputChange} placeholder="Número do documento" />
                    </div>
                    <div>
                      <Label htmlFor="cpf">CPF</Label>
                      <Input id="cpf" name="cpf" value={formData.cpf} onChange={handleInputChange} placeholder="000.000.000-00" />
                    </div>
                  </div>
                  
                  {/* --- Endereço --- */}
                   <div className="border-t border-[#6B8E23]/20 pt-4 mt-4">
                    <h4 className="text-lg font-medium text-[#2F4F4F] mb-4">
                      Endereço (Opcional)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="endereco">Endereço</Label>
                        <Input id="endereco" name="endereco" value={formData.endereco} onChange={handleInputChange} placeholder="Rua, Av, etc., Número" />
                      </div>
                       <div>
                        <Label htmlFor="bairro">Bairro</Label>
                        <Input id="bairro" name="bairro" value={formData.bairro} onChange={handleInputChange} placeholder="Seu bairro" />
                      </div>
                       <div>
                        <Label htmlFor="cep">CEP</Label>
                        <Input id="cep" name="cep" value={formData.cep} onChange={handleInputChange} placeholder="00000-000" />
                      </div>
                       <div>
                        <Label htmlFor="cidade">Cidade</Label>
                        <Input id="cidade" name="cidade" value={formData.cidade} onChange={handleInputChange} placeholder="Sua cidade" />
                      </div>
                       <div>
                        <Label htmlFor="estado">Estado</Label>
                        <Input id="estado" name="estado" value={formData.estado} onChange={handleInputChange} placeholder="Seu estado" />
                      </div>
                    </div>
                  </div>

                  {/* --- Estadia --- */}
                  <div className="border-t border-[#6B8E23]/20 pt-4">
                    <h4 className="text-lg font-medium text-[#2F4F4F] mb-4">
                      Informações da Estadia (Opcional)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="checkin">Check-in</Label>
                        <Input id="checkin" name="checkin" type="date" value={formData.checkin} onChange={handleInputChange} />
                      </div>
                      <div>
                        <Label htmlFor="checkout">Check-out</Label>
                        <Input id="checkout" name="checkout" type="date" value={formData.checkout} onChange={handleInputChange} />
                      </div>
                      <div>
                        <Label htmlFor="hospedes">Hóspedes</Label>
                        <select id="hospedes" name="hospedes" value={formData.hospedes} onChange={handleInputChange} className="w-full px-3 py-2 border border-[#6B8E23]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080]">
                          <option value="1">1 pessoa</option>
                          <option value="2">2 pessoas</option>
                          <option value="3">3 pessoas</option>
                          <option value="4">4 pessoas</option>
                          <option value="5">5+ pessoas</option>
                        </select>
                      </div>
                      <div className="md:col-span-3">
                        <Label htmlFor="placaVeiculo">Placa do Veículo</Label>
                        <Input id="placaVeiculo" name="placaVeiculo" value={formData.placaVeiculo} onChange={handleInputChange} placeholder="ABC-1234" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="mensagem">Mensagem Adicional</Label>
                    <Textarea id="mensagem" name="mensagem" value={formData.mensagem} onChange={handleInputChange} placeholder="Alguma observação ou pedido especial?" rows={4} />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button type="submit" disabled={isSubmitting} className="flex-1 bg-[#25D366] hover:bg-[#20BA5A] text-white flex items-center justify-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      {isSubmitting ? 'Enviando...' : 'Enviar via WhatsApp'}
                    </Button>
                    <Button type="button" onClick={handleEmailSubmit} variant="outline" className="flex-1 border-[#008080] text-[#008080] hover:bg-[#008080] hover:text-white flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" />
                      Enviar por Email
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            {/* Informações de Contato Direto (sem alterações) */}
            <Card className="border-[#6B8E23]/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-[#2F4F4F] mb-4">
                  Contato Direto
                </h3>
                <div className="space-y-4">
                  <a href="tel:+5583996872334" className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#6B8E23]/5 transition-colors group">
                    <div className="w-10 h-10 bg-[#008080]/10 rounded-full flex items-center justify-center group-hover:bg-[#008080]/20 transition-colors">
                      <Phone className="w-5 h-5 text-[#008080]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#2F4F4F]">(11) 99999-9999</p>
                      <p className="text-sm text-[#2F4F4F]/70">Clique para ligar</p>
                    </div>
                  </a>
                  <a href="https://wa.me/5583996872334" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#25D366]/5 transition-colors group">
                    <div className="w-10 h-10 bg-[#25D366]/10 rounded-full flex items-center justify-center group-hover:bg-[#25D366]/20 transition-colors">
                      <MessageCircle className="w-5 h-5 text-[#25D366]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#2F4F4F]">WhatsApp</p>
                      <p className="text-sm text-[#2F4F4F]/70">Conversar agora</p>
                    </div>
                  </a>
                  <a href="mailto:contato@pousadazekas.com.br" className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#6B8E23]/5 transition-colors group">
                    <div className="w-10 h-10 bg-[#6B8E23]/10 rounded-full flex items-center justify-center group-hover:bg-[#6B8E23]/20 transition-colors">
                      <Mail className="w-5 h-5 text-[#6B8E23]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#2F4F4F]">contato@pousadazekas.com.br</p>
                      <p className="text-sm text-[#2F4F4F]/70">Enviar email</p>
                    </div>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna da Direita (sem alterações) */}
          <div className="space-y-8">
            <Card className="border-[#6B8E23]/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-[#2F4F4F] mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#008080]" />
                  Nossa Localização
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-[#2F4F4F]">Endereço:</p>
                    <p className="text-[#2F4F4F]/80">
                      Rua da Natureza, 123<br />
                      Serra da Mantiqueira<br />
                      CEP: 12345-678
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[#2F4F4F]">
                    <Clock className="w-4 h-4" />
                    <div>
                      <p className="font-medium">Horário de Atendimento:</p>
                      <p className="text-sm text-[#2F4F4F]/80">
                        Segunda a Domingo: 7h às 22h
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#6B8E23]/20">
              <CardContent className="p-0">
                <div className="relative h-80 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3656.448598130907!2d-46.63472368502207!3d-23.588249368469487!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce5a2b2ed7f3a1%3A0xab35da2f5ca62674!2sSão%20Paulo%2C%20SP!5e0!3m2!1spt!2sbr!4v1635959492000!5m2!1spt!2sbr"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Localização da Pousada Zekas"
                  ></iframe>
                </div>
                <div className="p-4 bg-[#6B8E23]/5">
                  <p className="text-sm text-[#2F4F4F]/80 text-center">
                    📍 Localizada em meio à natureza exuberante da Serra da Mantiqueira
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#6B8E23]/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-[#2F4F4F] mb-4">
                  Como Chegar
                </h3>
                <div className="space-y-3 text-[#2F4F4F]/80">
                  <div>
                    <p className="font-medium text-[#2F4F4F]">🚗 De Carro:</p>
                    <p className="text-sm">
                      Saída pela Rodovia Fernão Dias, seguir placas para Serra da Mantiqueira. 
                      Aproximadamente 2h de São Paulo.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-[#2F4F4F]">🚌 Transporte Público:</p>
                    <p className="text-sm">
                      Ônibus até a cidade mais próxima, depois transfer (consulte disponibilidade).
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-[#2F4F4F]">✈️ Aeroporto:</p>
                    <p className="text-sm">
                      Aeroporto de Guarulhos: 2h30 de carro<br />
                      Aeroporto de Congonhas: 2h15 de carro
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section (sem alterações) */}
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-[#2F4F4F] mb-4">
            Pronto para Sua Experiência na Natureza?
          </h3>
          <p className="text-lg text-[#2F4F4F]/80 mb-8">
            Não perca tempo! Entre em contato conosco agora e garante sua reserva na Pousada Zekas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://wa.me/5583996872334" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-[#25D366] hover:bg-[#20BA5A] text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                WhatsApp Agora
              </Button>
            </a>
            <Link href="/quartos">
              <Button size="lg" variant="outline" className="border-[#008080] text-[#008080] hover:bg-[#008080] hover:text-white">
                Ver Nossos Quartos
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}