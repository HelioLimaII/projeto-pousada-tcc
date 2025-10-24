// Em: src/components/admin/ClienteForm.tsx
'use client';

import { useState, useEffect } from 'react'; // useEffect ainda pode ser necessário para outras coisas, mas não para initialData
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Interface para definir a estrutura dos dados do formulário
interface ClienteFormData {
  nome: string;
  cpf: string;
  rg: string;
  email: string;
  telefone: string;
  endereco: string;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
  pais: string;
  observacoes: string;
}

// Interface para definir as propriedades que o componente recebe
interface ClienteFormProps {
  initialData?: Partial<ClienteFormData>; // Dados iniciais para edição (opcional)
  onSubmit: (formData: ClienteFormData) => void; // Função chamada ao submeter
  isLoading: boolean; // Indica se está a carregar (para desativar botões)
}

export default function ClienteForm({ initialData = {}, onSubmit, isLoading }: ClienteFormProps) {
  // Estado para guardar os dados do formulário
  // A inicialização aqui é suficiente para definir os valores iniciais
  const [formData, setFormData] = useState<ClienteFormData>({
    nome: initialData.nome || '',
    cpf: initialData.cpf || '',
    rg: initialData.rg || '',
    email: initialData.email || '',
    telefone: initialData.telefone || '',
    endereco: initialData.endereco || '',
    bairro: initialData.bairro || '',
    cep: initialData.cep || '',
    cidade: initialData.cidade || '',
    estado: initialData.estado || '',
    pais: initialData.pais || '',
    observacoes: initialData.observacoes || '',
  });

  // *** O useEffect que causava o loop foi REMOVIDO ***
  // useEffect(() => {
  //   setFormData({ ... }); // Este bloco foi removido
  // }, [initialData]);

  // Função para atualizar o estado quando um campo do formulário muda
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Função chamada quando o formulário é submetido
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Impede o recarregamento da página
    onSubmit(formData); // Chama a função onSubmit passada como prop
  };

  return (
    <Card>
      <CardHeader>
        {/* Título dinâmico: Editar ou Adicionar */}
        <CardTitle>{initialData.nome ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input id="nome" name="nome" value={formData.nome} onChange={handleChange} required disabled={isLoading} />
          </div>

          {/* CPF e RG */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input id="cpf" name="cpf" value={formData.cpf} onChange={handleChange} disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rg">RG/Passaporte</Label>
              <Input id="rg" name="rg" value={formData.rg} onChange={handleChange} disabled={isLoading} />
            </div>
          </div>

          {/* Email e Telefone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" name="telefone" type="tel" value={formData.telefone} onChange={handleChange} disabled={isLoading} />
            </div>
          </div>

          {/* Endereço Completo */}
          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço (Rua, Nº)</Label>
            <Input id="endereco" name="endereco" value={formData.endereco} onChange={handleChange} disabled={isLoading} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bairro">Bairro</Label>
              <Input id="bairro" name="bairro" value={formData.bairro} onChange={handleChange} disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <Input id="cep" name="cep" value={formData.cep} onChange={handleChange} disabled={isLoading} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input id="cidade" name="cidade" value={formData.cidade} onChange={handleChange} disabled={isLoading} />
            </div>
          </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Input id="estado" name="estado" value={formData.estado} onChange={handleChange} disabled={isLoading} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="pais">País</Label>
              <Input id="pais" name="pais" value={formData.pais} onChange={handleChange} disabled={isLoading} />
            </div>
           </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea id="observacoes" name="observacoes" value={formData.observacoes} onChange={handleChange} disabled={isLoading} rows={3} />
          </div>

          {/* Botão de Submissão */}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'A guardar...' : 'Guardar Cliente'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}