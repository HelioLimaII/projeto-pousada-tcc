// Em: src/app/admin/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// 1. Trocamos 'axios' pelo nosso novo cliente de API centralizado
import apiClient from '@/api'; 

// Definindo um tipo para o objeto Quarto para usar com TypeScript
interface Quarto {
  id: string;
  numero: number;
  titulo: string;
  status: 'disponivel' | 'ocupado' | 'manutencao';
}

export default function AdminDashboardPage() {
  const [quartos, setQuartos] = useState<Quarto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchQuartos = async () => {
    try {
      // 2. A chamada agora é mais simples. A URL base já está configurada no apiClient.
      const response = await apiClient.get('/quartos');
      setQuartos(response.data);
    } catch (err) {
      setError('Falha ao carregar os dados dos quartos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuartos();
  }, []);

  const handleStatusChange = async (quartoId: string, novoStatus: string) => {
    try {
      // 3. A chamada PUT também foi simplificada. O token de autorização é adicionado automaticamente pelo apiClient.
      await apiClient.put(
        `/quartos/${quartoId}`,
        { status: novoStatus }
      );

      // Atualiza a lista na tela instantaneamente
      setQuartos(quartosAtuais => 
        quartosAtuais.map(quarto => 
          quarto.id === quartoId ? { ...quarto, status: novoStatus as Quarto['status'] } : quarto
        )
      );
    } catch (err) {
      setError("Falha ao atualizar o status. Sua sessão pode ter expirado.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/login');
  };

  if (loading) return <p>Carregando dashboard...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#2F4F4F]">Painel do Gerente</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Sair
        </button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-[#2F4F4F] mb-4">Gerenciamento de Quartos</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b-2 border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left">Número</th>
                <th className="px-4 py-2 text-left">Título</th>
                <th className="px-4 py-2 text-left">Status Atual</th>
                <th className="px-4 py-2 text-left">Mudar Status</th>
              </tr>
            </thead>
            <tbody>
              {quartos.map((quarto) => (
                <tr key={quarto.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-2">{quarto.numero}</td>
                  <td className="px-4 py-2">{quarto.titulo}</td>
                  <td className="px-4 py-2 font-medium">{quarto.status}</td>
                  <td className="px-4 py-2">
                    <select 
                      value={quarto.status}
                      onChange={(e) => handleStatusChange(quarto.id, e.target.value)}
                      className="p-2 border rounded-md"
                    >
                      <option value="disponivel">Disponível</option>
                      <option value="ocupado">Ocupado</option>
                      <option value="manutencao">Em Manutenção</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}