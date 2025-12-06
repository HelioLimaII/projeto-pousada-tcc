// Em: src/app/contato/page.tsx

'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react'

export default function ContatoPage() {
  // 1. Estado do formulário
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    // telefone: '', // REMOVIDO
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
    adultos: '2', // Valor padrão
    criancas: '0', // Valor padrão
    mensagem: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // 2. Handler para o WhatsApp (VALIDAÇÃO)
  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // [MODIFICAÇÃO] Validação: Telefone removido da verificação
    if (!formData.nome || !formData.checkin || !formData.checkout || !formData.adultos || formData.criancas === '') {
      alert('Por favor, preencha os campos obrigatórios: Nome, Datas, Adultos e Crianças.')
      setIsSubmitting(false)
      return
    }

    // Validação de lógica de datas
    if (new Date(formData.checkout) <= new Date(formData.checkin)) {
      alert('A data de saída deve ser posterior à data de entrada.')
      setIsSubmitting(false)
      return
    }

    // Formata a data para dd/mm/aaaa
    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      const [ano, mes, dia] = dateStr.split('-');
      return `${dia}/${mes}/${ano}`;
    };

    let message = `Olá! Gostaria de fazer uma pré-reserva na Pousada Zekas.\n`
    
    message += `\n*👤 Dados Pessoais:*`
    message += `\n- Nome: ${formData.nome}`
    // Telefone removido da mensagem, pois já aparece no WhatsApp do remetente
    message += `\n- Email: ${formData.email || 'Não informado'}`
    
    // Campos opcionais de documento
    if (formData.rg || formData.cpf) {
        message += `\n- CPF/RG: ${formData.cpf || formData.rg}`
    }

    message += `\n\n*📅 Dados da Estadia:*`
    // [MODIFICAÇÃO] Labels alteradas na mensagem também
    message += `\n- Entrada: ${formatDate(formData.checkin)}`
    message += `\n- Saída: ${formatDate(formData.checkout)}`
    message += `\n- Adultos: ${formData.adultos}`
    message += `\n- Crianças: ${formData.criancas}`

    if (formData.placaVeiculo) {
      message += `\n- Placa do Veículo: ${formData.placaVeiculo}`
    }
    
    // Campos opcionais de endereço (Só envia se preenchido)
    if (formData.endereco || formData.cidade || formData.cep) {
        message += `\n\n*📍 Endereço:*`
        if(formData.endereco) message += `\n- Rua: ${formData.endereco}`
        if(formData.bairro) message += `\n- Bairro: ${formData.bairro}`
        if(formData.cidade) message += `\n- Cidade/UF: ${formData.cidade}/${formData.estado}`
        if(formData.cep) message += `\n- CEP: ${formData.cep}`
    }

    if (formData.mensagem) {
      message += `\n\n*💬 Mensagem Adicional:*\n${formData.mensagem}`
    }

    message += `\n\nAguardo a confirmação!`

    const numeroWhatsApp = "5583993825342"; 
    const whatsappUrl = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    
    setTimeout(() => {
      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-[#2F4F4F] mb-4">
            Faça sua Pré-Reserva
          </h2>
          <p className="text-lg text-[#2F4F4F]/80 max-w-2xl mx-auto">
            Preencha os dados abaixo para solicitar sua reserva. Confirmaremos a disponibilidade pelo WhatsApp.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Coluna da Esquerda: Formulário */}
          <div className="space-y-8">
            <Card className="border-[#6B8E23]/20">
              <CardContent className="p-6">
                <h3 className="text-2xl font-semibold text-[#2F4F4F] mb-6 flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-[#008080]" />
                  Dados da Solicitação
                </h3>
                
                {/* 3. Formulário */}
                <form onSubmit={handleWhatsAppSubmit} className="space-y-4">
                  {/* --- 1. Dados Pessoais --- */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="nome">Nome Completo *</Label>
                      <Input id="nome" name="nome" value={formData.nome} onChange={handleInputChange} placeholder="Seu nome completo" required />
                    </div>
                    
                    {/* [MODIFICAÇÃO] Campo Telefone removido */}
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="seu@email.com" />
                    </div>
                    {/* Campos opcionais de documento */}
                    <div>
                      <Label htmlFor="cpf">CPF (Opcional)</Label>
                      <Input id="cpf" name="cpf" value={formData.cpf} onChange={handleInputChange} placeholder="000.000.000-00" />
                    </div>
                    <div>
                      <Label htmlFor="rg">RG (Opcional)</Label>
                      <Input id="rg" name="rg" value={formData.rg} onChange={handleInputChange} />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="profissao">Profissão (Opcional)</Label>
                      <Input id="profissao" name="profissao" value={formData.profissao} onChange={handleInputChange} />
                    </div>
                  </div>

                  {/* --- 2. Estadia (OBRIGATÓRIO) --- */}
                  <div className="border-t border-[#6B8E23]/20 pt-4 mt-4">
                    <h4 className="text-lg font-medium text-[#2F4F4F] mb-4">
                      Informações da Estadia
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        {/* [MODIFICAÇÃO] Label alterada para "Dia de entrada" */}
                        <Label htmlFor="checkin">Dia de entrada *</Label>
                        <Input id="checkin" name="checkin" type="date" value={formData.checkin} onChange={handleInputChange} required />
                      </div>
                      <div>
                        {/* [MODIFICAÇÃO] Label alterada para "Dia de saída" */}
                        <Label htmlFor="checkout">Dia de saída *</Label>
                        <Input id="checkout" name="checkout" type="date" value={formData.checkout} onChange={handleInputChange} required />
                      </div>

                      <div>
                        <Label htmlFor="adultos">Adultos *</Label>
                        <select 
                          id="adultos" 
                          name="adultos" 
                          value={formData.adultos} 
                          onChange={handleInputChange} 
                          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          required
                        >
                          <option value="1">1 Adulto</option>
                          <option value="2">2 Adultos</option>
                          <option value="3">3 Adultos</option>
                          <option value="4">4 Adultos</option>
                          <option value="5">5+ Adultos</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="criancas">Crianças *</Label>
                        <select 
                          id="criancas" 
                          name="criancas" 
                          value={formData.criancas} 
                          onChange={handleInputChange} 
                          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          required
                        >
                          <option value="0">0 Crianças</option>
                          <option value="1">1 Criança</option>
                          <option value="2">2 Crianças</option>
                          <option value="3">3 Crianças</option>
                          <option value="4">4+ Crianças</option>
                        </select>
                      </div>
                      
                      <div className="md:col-span-2">
                        <Label htmlFor="placaVeiculo">Placa do Veículo (Opcional)</Label>
                        <Input id="placaVeiculo" name="placaVeiculo" value={formData.placaVeiculo} onChange={handleInputChange} placeholder="ABC-1234" />
                      </div>
                    </div>
                  </div>

                  {/* --- 3. Endereço (OPCIONAL) --- */}
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

                  <div>
                    <Label htmlFor="mensagem">Mensagem Adicional</Label>
                    <Textarea id="mensagem" name="mensagem" value={formData.mensagem} onChange={handleInputChange} placeholder="Alguma observação ou pedido especial?" rows={4} />
                  </div>

                  {/* --- Botão de Envio --- */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button type="submit" disabled={isSubmitting} className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white flex items-center justify-center gap-2 h-12 text-lg">
                      <MessageCircle className="w-5 h-5" />
                      {isSubmitting ? 'Processando...' : 'Enviar Solicitação via WhatsApp'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Coluna da Direita: Contato e Mapa (Mantido igual) */}
          <div className="space-y-8">
            <Card className="border-[#6B8E23]/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-[#2F4F4F] mb-4">
                  Canais de Atendimento
                </h3>
                <div className="space-y-4">
                  <a href="tel:+5583993825342" className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#6B8E23]/5 transition-colors group">
                    <div className="w-10 h-10 bg-[#008080]/10 rounded-full flex items-center justify-center group-hover:bg-[#008080]/20 transition-colors">
                      <Phone className="w-5 h-5 text-[#008080]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#2F4F4F]">(83) 99382-5342</p>
                      <p className="text-sm text-[#2F4F4F]/70">Ligação</p>
                    </div>
                  </a>
                  <a href="mailto:faleconosco@pousadazekas.com.br" className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#6B8E23]/5 transition-colors group">
                    <div className="w-10 h-10 bg-[#6B8E23]/10 rounded-full flex items-center justify-center group-hover:bg-[#6B8E23]/20 transition-colors">
                      <Mail className="w-5 h-5 text-[#6B8E23]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#2F4F4F]">faleconosco@pousadazekas.com.br</p>
                      <p className="text-sm text-[#2F4F4F]/70">E-mail</p>
                    </div>
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#6B8E23]/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-[#2F4F4F] mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#008080]" />
                  Localização
                </h3>
                <div className="space-y-4">
                  <p className="text-[#2F4F4F]/80">
                    R. Joaquim Francisco da Silva - Jacumã<br />
                    Conde - PB, 58322-000
                  </p>
                  <div className="relative h-64 rounded-lg overflow-hidden border border-gray-200">
                     <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3958.096377470234!2d-34.80826292415164!3d-7.229666671010799!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7ac931446867d7d%3A0x8e2d11055768c5d6!2sPousada%20Zekas!5e0!3m2!1spt-BR!2sbr!4v1709820000000!5m2!1spt-BR!2sbr"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}