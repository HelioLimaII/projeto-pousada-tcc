'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import QuartoForm from '@/components/ui/admin/QuartoForm';
import { createQuarto } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function NovoQuartoPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError('');
    try {
      await createQuarto(formData);
      // Usando alert para feedback simples, pode ser trocado por um toast/notificação
      alert('Quarto criado com sucesso!');
      router.push('/admin/dashboard');
    } catch (err) {
      setError('Falha ao criar o quarto. Verifique os dados e tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Link href="/admin/dashboard" className="flex items-center text-sm text-gray-600 hover:text-black">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para o Dashboard
      </Link>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <QuartoForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
