'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import QuartoForm from '@/components/ui/admin/QuartoForm';
import { getQuartoById, updateQuarto } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Definindo a interface para garantir a tipagem dos dados do quarto
interface Quarto {
  id: string;
  numero: number;
  titulo: string;
  descricao: string;
  preco_diaria: number;
  capacidade_hospedes: number;
  status: string;
  comodidades: string[];
}

export default function EditarQuartoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string; // Pega o ID da URL

  const [quarto, setQuarto] = useState<Quarto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Efeito para buscar os dados do quarto quando a página carrega
  useEffect(() => {
    if (id) {
      setIsLoading(true);
      getQuartoById(id)
        .then(data => setQuarto(data))
        .catch(err => {
          setError('Não foi possível carregar os dados do quarto.');
          console.error(err);
        })
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError('');
    try {
      await updateQuarto(id, formData);
      alert('Quarto atualizado com sucesso!');
      router.push('/admin/dashboard');
    } catch (err) {
      setError('Falha ao atualizar o quarto. Verifique os dados.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !quarto) {
    return <p>Carregando dados do quarto...</p>;
  }

  return (
    <div className="space-y-4">
      <Link href="/admin/dashboard" className="flex items-center text-sm text-gray-600 hover:text-black">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para o Dashboard
      </Link>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      
      {/* O formulário só é renderizado quando os dados do quarto estiverem prontos */}
      {quarto && (
        <QuartoForm 
          initialData={quarto} 
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
        />
      )}
    </div>
  );
}
