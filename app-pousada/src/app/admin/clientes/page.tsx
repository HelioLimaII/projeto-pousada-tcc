// Em: src/app/admin/clientes/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
// Make sure these functions are correctly exported from @/lib/api
import { getClientes, deleteCliente } from '@/lib/api';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
// Table component removed as it's not installed
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
}

export default function GerenciarClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchClientes = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getClientes();
      setClientes(data);
    } catch (err) {
      setError('Falha ao carregar clientes. Verifique se a API está a correr e se o ficheiro api.ts está correto.'); // Added hint
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem a certeza que deseja apagar este cliente? Esta ação não pode ser desfeita.')) {
      return;
    }
    try {
      await deleteCliente(id);
      fetchClientes(); // Recarrega a lista
    } catch (error) {
      alert('Erro ao apagar cliente.');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gerenciar Clientes</CardTitle>
        <Link href="/admin/clientes/novo">
          <Button size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            Adicionar Cliente
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {loading && <p>A carregar clientes...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          // Replaced shadcn Table with standard HTML table + Tailwind
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cliente.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.email || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.telefone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Link href={`/admin/clientes/editar/${cliente.id}`}>
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(cliente.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
         {(!loading && clientes.length === 0 && !error) && (
            <p className="text-center text-gray-500 py-4">Nenhum cliente encontrado.</p>
        )}
      </CardContent>
    </Card>
  );
}

