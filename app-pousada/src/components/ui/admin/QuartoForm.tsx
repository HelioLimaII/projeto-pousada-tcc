'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Interface para os dados do formulário
interface QuartoFormData {
  numero: number;
  //titulo: string;
  descricao: string;
  preco_diaria: number;
  capacidade_hospedes: number;
  status: string;
  comodidades: string[];
}

// Interface para as props do componente
interface QuartoFormProps {
  initialData?: Partial<QuartoFormData>;
  onSubmit: (formData: globalThis.FormData) => void;
  isLoading: boolean;
}

export default function QuartoForm({ initialData = {}, onSubmit, isLoading }: QuartoFormProps) {
  const [formData, setFormData] = useState<QuartoFormData>({
    numero: initialData.numero || 0,
    //titulo: initialData.titulo || '',
    descricao: initialData.descricao || '',
    preco_diaria: initialData.preco_diaria || 0,
    capacidade_hospedes: initialData.capacidade_hospedes || 1,
    status: initialData.status || 'disponivel',
    comodidades: initialData.comodidades || [],
  });
  const [fotos, setFotos] = useState<FileList | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const finalValue = e.target.type === 'number' ? parseFloat(value) || 0 : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };
  
  const handleComodidadesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const comodidadesArray = e.target.value.split(',').map(item => item.trim());
    setFormData(prev => ({ ...prev, comodidades: comodidadesArray }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFotos(e.target.files);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();

    // Adiciona os campos de texto e números ao FormData
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'comodidades' && Array.isArray(value)) {
        // Trata o array de comodidades
        value.forEach(item => data.append(key, item));
      } else {
        // Trata os outros campos
        data.append(key, String(value));
      }
    });

    // Adiciona os arquivos de imagem
    if (fotos) {
      for (let i = 0; i < fotos.length; i++) {
        // [MODIFICAÇÃO AQUI]
        // Alterado de 'novas_fotos' para 'images' para alinhar com o plano do backend
        data.append('images', fotos[i]);
      }
    }
    onSubmit(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData.numero ? 'Editar Quarto' : 'Criar Novo Quarto'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Número do Quarto */}
          <div className="space-y-2">
            <Label htmlFor="numero">Número do Quarto</Label>
            <Input id="numero" name="numero" type="number" value={formData.numero} onChange={handleChange} required />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" name="descricao" value={formData.descricao} onChange={handleChange} />
          </div>
          
          {/* Preço e Capacidade */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preco_diaria">Preço da Diária (R$)</Label>
              <Input id="preco_diaria" name="preco_diaria" type="number" step="0.01" value={formData.preco_diaria} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacidade_hospedes">Capacidade de Hóspedes</Label>
              <Input id="capacidade_hospedes" name="capacidade_hospedes" type="number" value={formData.capacidade_hospedes} onChange={handleChange} />
            </div>
          </div>
          
          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select id="status" name="status" value={formData.status} onChange={handleChange} className="w-full h-10 px-3 border border-input rounded-md text-sm">
              <option value="disponivel">Disponível</option>
              <option value="ocupado">Ocupado</option>
              <option value="manutencao">Em Manutenção</option>
            </select>
          </div>

          {/* Comodidades */}
          <div className="space-y-2">
            <Label htmlFor="comodidades">Comodidades (separadas por vírgula)</Label>
            <Input id="comodidades" name="comodidades" type="text" value={formData.comodidades.join(', ')} onChange={handleComodidadesChange} />
          </div>

          {/* Upload de Fotos */}
          <div className="space-y-2">
            <Label htmlFor="fotos">Adicionar Novas Fotos</Label>
            <Input id="fotos" name="images" type="file" multiple onChange={handleFileChange} />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}