// Em: src/components/ui/admin/QuartoForm.tsx
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface QuartoFormData {
  numero: number;
  descricao: string;
  preco_diaria: number;
  capacidade_hospedes: number;
  status: string;
  fotos?: string[]; // Para exibir as fotos que já existem
}

interface QuartoFormProps {
  initialData?: Partial<QuartoFormData>;
  onSubmit: (formData: FormData) => void;
  isLoading: boolean;
}

export default function QuartoForm({ initialData = {}, onSubmit, isLoading }: QuartoFormProps) {
  const [formData, setFormData] = useState<QuartoFormData>({
    numero: initialData.numero || 0,
    descricao: initialData.descricao || '',
    preco_diaria: initialData.preco_diaria || 0,
    capacidade_hospedes: initialData.capacidade_hospedes || 1,
    status: initialData.status || 'disponivel',
    fotos: initialData.fotos || [],
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const finalValue = e.target.type === 'number' ? parseFloat(value) || 0 : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  // Lógica melhorada de seleção de arquivos com Preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);

      // Gera URLs temporárias para mostrar o preview
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();

    // 1. Adiciona campos de texto
    data.append('numero', String(formData.numero));
    data.append('descricao', formData.descricao);
    data.append('preco_diaria', String(formData.preco_diaria));
    data.append('capacidade_hospedes', String(formData.capacidade_hospedes));
    data.append('status', formData.status);

    // 2. Adiciona as imagens com o nome correto esperado pelo Backend
    // Se initialData.numero existe, estamos EDITANDO (PUT) -> Backend espera 'novas_fotos'
    // Se não, estamos CRIANDO (POST) -> Backend espera 'images'
    const fieldName = initialData.numero ? 'novas_fotos' : 'images';

    selectedFiles.forEach((file) => {
      data.append(fieldName, file);
    });

    onSubmit(data);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData.numero ? 'Editar Quarto' : 'Criar Novo Quarto'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero">Número do Quarto</Label>
              <Input id="numero" name="numero" type="number" value={formData.numero} onChange={handleChange} required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select id="status" name="status" value={formData.status} onChange={handleChange} className="w-full h-10 px-3 border border-input rounded-md text-sm bg-white" disabled={isLoading}>
                <option value="disponivel">Disponível</option>
                <option value="ocupado">Ocupado</option>
                <option value="manutencao">Em Manutenção</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" name="descricao" value={formData.descricao} onChange={handleChange} rows={3} disabled={isLoading} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preco_diaria">Preço da Diária (R$)</Label>
              <Input id="preco_diaria" name="preco_diaria" type="number" step="0.01" value={formData.preco_diaria} onChange={handleChange} disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacidade_hospedes">Capacidade de Hóspedes</Label>
              <Input id="capacidade_hospedes" name="capacidade_hospedes" type="number" value={formData.capacidade_hospedes} onChange={handleChange} disabled={isLoading} />
            </div>
          </div>

          {/* Seção de Upload de Fotos Melhorada */}
          <div className="space-y-4 border-t pt-4">
            <Label className="text-lg font-semibold">Fotos</Label>
            
            {/* Exibe Fotos Já Existentes (Se estiver editando) */}
            {initialData.fotos && initialData.fotos.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Fotos Atuais:</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {initialData.fotos.map((foto, idx) => (
                    <div key={idx} className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden border">
                      <Image src={foto} alt="Foto atual" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Área de Seleção */}
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Clique para adicionar novas fotos</p>
              <input 
                id="fotos"
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange}
              />
            </div>

            {/* Previews das Novas Fotos Selecionadas */}
            {previews.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mt-4">
                {previews.map((src, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border shadow-sm group">
                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" disabled={isLoading} className="w-full bg-[#003366] text-white hover:bg-[#002244]">
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
            ) : (
              'Salvar Quarto'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}