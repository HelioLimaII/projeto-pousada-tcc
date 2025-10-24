// Em: src/app/admin/clientes/novo/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ClienteForm from '@/components/ui/admin/ClienteForm'; // Importa o formulário de cliente
import { createCliente } from '@/lib/api'; // Importa a função da API
import { ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Interface para definir a estrutura dos dados do formulário
// Idealmente, esta interface seria partilhada entre as páginas e o formulário
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

export default function NovoClientePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Função chamada quando o formulário é submetido
  const handleSubmit = async (formData: ClienteFormData) => {
    setIsLoading(true);
    setError('');
    try {
      await createCliente(formData); // Chama a função da API para criar o cliente
      alert('Cliente adicionado com sucesso!'); // Feedback simples
      router.push('/admin/clientes'); // Redireciona para a lista de clientes
    } catch (err: unknown) { // Captura erros
      setError(err instanceof Error ? err.message : 'Falha ao adicionar cliente.');
      console.error(err);
    } finally {
      setIsLoading(false); // Garante que o estado de loading é removido
    }
  };

  return (
    <div className="space-y-4">
      {/* Link para voltar à lista de clientes */}
      <Link href="/admin/clientes" className="flex items-center text-sm text-gray-600 hover:text-black mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para Clientes
      </Link>
      
      {/* Exibe mensagem de erro se houver */}
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      
      {/* Renderiza o formulário de cliente, passando a função handleSubmit */}
      <ClienteForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}

