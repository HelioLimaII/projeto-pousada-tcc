// Em: src/components/ui/admin/ClienteForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Interface atualizada com campos do FNRH e Legado
interface ClienteFormData {
  nome: string;
  email: string;
  telefone: string;
  
  // Documentos
  cpf: string; // [ADICIONADO] Necessário para compatibilidade com Backend
  rg: string;  // [ADICIONADO]
  tipo_documento: string; // CPF, PASSAPORTE, RG, OUTROS
  numero_documento: string; 
  orgao_expedidor: string;

  // Dados Pessoais FNRH
  data_nascimento: string;
  genero: string; // M ou F
  nacionalidade: string; // BR ou código

  // Endereço Detalhado (Novo padrão)
  endereco_logradouro: string;
  endereco_numero: string;
  endereco_complemento: string;
  endereco_bairro: string;
  endereco_cep: string;
  endereco_cidade: string;
  endereco_estado: string;
  endereco_pais: string;
  
  observacoes: string;
}

// Interface para definir as propriedades que o componente recebe
interface ClienteFormProps {
  initialData?: Partial<ClienteFormData>; // Aceita parcial para compatibilidade
  onSubmit: (formData: ClienteFormData) => void;
  isLoading: boolean;
}

export default function ClienteForm({ initialData = {}, onSubmit, isLoading }: ClienteFormProps) {
  
  // Estado inicial mapeando dados antigos para a nova estrutura se necessário
  const [formData, setFormData] = useState<ClienteFormData>({
    nome: initialData.nome || '',
    email: initialData.email || '',
    telefone: initialData.telefone || '',
    
    // [ADICIONADO] Inicialização dos campos específicos
    cpf: initialData.cpf || '',
    rg: initialData.rg || '',

    // Tenta usar os campos novos, se não tiver, usa os antigos (como 'cpf') como fallback
    tipo_documento: initialData.tipo_documento || 'CPF',
    numero_documento: initialData.numero_documento || (initialData as any).cpf || '',
    orgao_expedidor: initialData.orgao_expedidor || '',
    
    data_nascimento: initialData.data_nascimento || '',
    genero: initialData.genero || '',
    nacionalidade: initialData.nacionalidade || 'BR',
    
    // Endereço: Mapeia campos antigos (endereco, bairro, cep...) para os novos
    endereco_logradouro: initialData.endereco_logradouro || (initialData as any).endereco || '',
    endereco_numero: initialData.endereco_numero || '',
    endereco_complemento: initialData.endereco_complemento || '',
    endereco_bairro: initialData.endereco_bairro || (initialData as any).bairro || '',
    endereco_cep: initialData.endereco_cep || (initialData as any).cep || '',
    endereco_cidade: initialData.endereco_cidade || (initialData as any).cidade || '',
    endereco_estado: initialData.endereco_estado || (initialData as any).estado || '',
    endereco_pais: initialData.endereco_pais || (initialData as any).pais || 'BR',
    
    observacoes: initialData.observacoes || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // [LÓGICA DE SINCRONIZAÇÃO]
    // Copia o numero_documento para cpf ou rg dependendo do tipo selecionado
    // Isso garante que o backend receba o campo 'cpf' preenchido corretamente.
    const dadosParaEnviar = { ...formData };

    if (dadosParaEnviar.tipo_documento === 'CPF') {
        dadosParaEnviar.cpf = dadosParaEnviar.numero_documento;
    } else if (dadosParaEnviar.tipo_documento === 'RG') {
        dadosParaEnviar.rg = dadosParaEnviar.numero_documento;
    }

    onSubmit(dadosParaEnviar);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData.nome ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* --- BLOCO 1: Identificação Básica --- */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-1">Dados Pessoais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input id="nome" name="nome" value={formData.nome} onChange={handleChange} required disabled={isLoading} placeholder="Igual ao documento" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="data_nascimento">Data de Nascimento (FNRH)</Label>
                <Input type="date" id="data_nascimento" name="data_nascimento" value={formData.data_nascimento} onChange={handleChange} disabled={isLoading} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="genero">Gênero</Label>
                <Select name="genero" value={formData.genero} onValueChange={(v) => handleSelectChange('genero', v)} disabled={isLoading}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nacionalidade">Nacionalidade</Label>
                <Select name="nacionalidade" value={formData.nacionalidade} onValueChange={(v) => handleSelectChange('nacionalidade', v)} disabled={isLoading}>
                  <SelectTrigger><SelectValue placeholder="País" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BR">Brasil</SelectItem>
                    <SelectItem value="AR">Argentina</SelectItem>
                    <SelectItem value="US">Estados Unidos</SelectItem>
                    <SelectItem value="PT">Portugal</SelectItem>
                    <SelectItem value="UY">Uruguai</SelectItem>
                    <SelectItem value="PY">Paraguai</SelectItem>
                    <SelectItem value="OUTRO">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} disabled={isLoading} />
              </div>
            </div>
             
             <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" name="telefone" value={formData.telefone} onChange={handleChange} disabled={isLoading} />
             </div>
          </div>

          {/* --- BLOCO 2: Documentação --- */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-1">Documentação</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="space-y-2">
                <Label htmlFor="tipo_documento">Tipo Doc.</Label>
                <Select name="tipo_documento" value={formData.tipo_documento} onValueChange={(v) => handleSelectChange('tipo_documento', v)} disabled={isLoading}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CPF">CPF</SelectItem>
                    <SelectItem value="PASSAPORTE">Passaporte</SelectItem>
                    <SelectItem value="RG">RG (Identidade)</SelectItem>
                    <SelectItem value="OUTROS">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero_documento">Número do Documento</Label>
                <Input id="numero_documento" name="numero_documento" value={formData.numero_documento} onChange={handleChange} disabled={isLoading} placeholder="Apenas números" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgao_expedidor">Órgão Expedidor (se RG)</Label>
                <Input id="orgao_expedidor" name="orgao_expedidor" value={formData.orgao_expedidor} onChange={handleChange} disabled={isLoading} placeholder="Ex: SSP/PB" />
              </div>
            </div>
          </div>

          {/* --- BLOCO 3: Endereço Detalhado --- */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-1">Endereço Residencial</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1 space-y-2">
                <Label htmlFor="endereco_cep">CEP</Label>
                <Input id="endereco_cep" name="endereco_cep" value={formData.endereco_cep} onChange={handleChange} disabled={isLoading} />
              </div>
              <div className="md:col-span-3 space-y-2">
                <Label htmlFor="endereco_logradouro">Rua / Logradouro</Label>
                <Input id="endereco_logradouro" name="endereco_logradouro" value={formData.endereco_logradouro} onChange={handleChange} disabled={isLoading} />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endereco_numero">Número</Label>
                <Input id="endereco_numero" name="endereco_numero" value={formData.endereco_numero} onChange={handleChange} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endereco_complemento">Complemento</Label>
                <Input id="endereco_complemento" name="endereco_complemento" value={formData.endereco_complemento} onChange={handleChange} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endereco_bairro">Bairro</Label>
                <Input id="endereco_bairro" name="endereco_bairro" value={formData.endereco_bairro} onChange={handleChange} disabled={isLoading} />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               <div className="space-y-2">
                <Label htmlFor="endereco_cidade">Cidade</Label>
                <Input id="endereco_cidade" name="endereco_cidade" value={formData.endereco_cidade} onChange={handleChange} disabled={isLoading} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="endereco_estado">Estado (UF)</Label>
                <Input id="endereco_estado" name="endereco_estado" value={formData.endereco_estado} onChange={handleChange} disabled={isLoading} maxLength={2} placeholder="Ex: PB" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="endereco_pais">País</Label>
                <Input id="endereco_pais" name="endereco_pais" value={formData.endereco_pais} onChange={handleChange} disabled={isLoading} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea id="observacoes" name="observacoes" value={formData.observacoes} onChange={handleChange} disabled={isLoading} rows={2} />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full bg-[#003366] hover:bg-[#002244] text-white">
            {isLoading ? 'Salvando...' : 'Salvar Dados do Cliente'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}