// Em: src/app/admin/clientes/editar/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import ClienteForm from '@/components/ui/admin/ClienteForm';
// Certifique-se que estas funções existem e estão exportadas em /lib/api.ts
import { getClienteById, updateCliente } from '@/lib/api'; 
import { ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Interface parcial para os dados do formulário (pode vir de um ficheiro partilhado)
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

// Interface completa que a API retorna (inclui o ID)
interface Cliente extends ClienteFormData {
    id: string; 
}


export default function EditarClientePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [cliente, setCliente] = useState<Partial<Cliente> | null>(null); // Pode ser Partial porque vem da API
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      setError('');
      getClienteById(id)
        .then((data: Cliente) => setCliente(data)) // Tipagem explícita para 'data'
        .catch((err: Error) => { // Tipagem explícita para 'err'
            setError('Falha ao carregar dados do cliente.');
            console.error(err);
        })
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const handleSubmit = async (formData: ClienteFormData) => { // Tipagem explícita para 'formData'
    setIsLoading(true);
    setError('');
    try {
      await updateCliente(id, formData);
      alert('Cliente atualizado com sucesso!');
      router.push('/admin/clientes');
    } catch (err: unknown) { // Tipagem explícita para 'err' (pode ser 'any' ou 'Error' também)
      setError(err instanceof Error ? err.message : 'Falha ao atualizar cliente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !cliente) {
    return <p>A carregar cliente...</p>;
  }

  return (
    <div className="space-y-4">
      <Link href="/admin/clientes" className="flex items-center text-sm text-gray-600 hover:text-black mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para Clientes
      </Link>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      {/* Passa initialData corretamente tipado */}
      {cliente && (
        <ClienteForm 
          initialData={cliente} 
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
        />
      )}
      {!cliente && !isLoading && !error && (
        <p className="text-center text-gray-500">Cliente não encontrado.</p>
      )}
    </div>
  );
}
