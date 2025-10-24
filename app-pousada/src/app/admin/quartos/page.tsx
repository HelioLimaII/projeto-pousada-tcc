// Em: src/app/admin/quartos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getQuartos, deleteQuarto } from '@/lib/api'; // Funções da API
import { PlusCircle, Edit, Trash2, AlertCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Usa o componente Table
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge'; // Para exibir o status
import { Alert, AlertDescription } from '@/components/ui/alert'; // Para feedback de erro

// Interface para definir a estrutura de um objeto Quarto
interface Quarto {
  id: string;
  numero: number;
  titulo: string;
  status: string;
  preco_diaria: number;
  capacidade_hospedes: number;
}

export default function GerenciarQuartosPage() {
  const [quartos, setQuartos] = useState<Quarto[]>([]); // Estado para guardar a lista de quartos
  const [loading, setLoading] = useState(true); // Estado para indicar carregamento
  const [error, setError] = useState(''); // Estado para guardar mensagens de erro

  // Função assíncrona para buscar os quartos da API
  const fetchQuartos = async () => {
    setLoading(true); // Inicia o carregamento
    setError(''); // Limpa erros anteriores
    try {
      const data = await getQuartos(); // Chama a função da API
      setQuartos(data); // Atualiza o estado com os quartos recebidos
    } catch (err) {
      setError('Falha ao carregar quartos.'); // Define mensagem de erro
      console.error(err); // Loga o erro no console
    } finally {
      setLoading(false); // Finaliza o carregamento
    }
  };

  // Efeito que executa fetchQuartos quando o componente é montado
  useEffect(() => {
    fetchQuartos();
  }, []); // O array vazio [] garante que execute apenas uma vez

  // Função para lidar com o clique no botão de apagar
  const handleDelete = async (id: string) => {
    // Pede confirmação ao utilizador
    if (!window.confirm('Tem a certeza que deseja apagar este quarto? Esta ação não pode ser desfeita.')) {
      return; // Cancela se o utilizador não confirmar
    }
    try {
      await deleteQuarto(id); // Chama a função da API para apagar
      fetchQuartos(); // Recarrega a lista de quartos para refletir a alteração
    } catch (error) {
      alert('Erro ao apagar quarto.'); // Mostra um alerta simples em caso de erro
      console.error(error);
    }
  };

  // Função auxiliar para determinar a variante do Badge com base no status do quarto
  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status?.toLowerCase()) {
      case 'disponivel': return 'default'; // Verde (padrão do Badge)
      case 'ocupado': return 'secondary'; // Cinza
      case 'manutencao': return 'destructive'; // Vermelho
      default: return 'outline'; // Estilo de contorno para outros status
    }
  };

  return (
    <Card>
      {/* Cabeçalho do Card com título e botão Adicionar */}
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gerenciar Quartos</CardTitle>
        <Link href="/admin/quartos/novo">
          <Button size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            Adicionar Quarto
          </Button>
        </Link>
      </CardHeader>
      {/* Conteúdo do Card */}
      <CardContent>
        {/* Exibe mensagem de carregamento */}
        {loading && <p className="text-center text-gray-500 py-4">A carregar quartos...</p>}
        {/* Exibe mensagem de erro */}
        {error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        {/* Renderiza a tabela se não estiver a carregar e não houver erro */}
        {!loading && !error && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Capacidade</TableHead>
                <TableHead>Preço/Diária</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Mapeia a lista de quartos para criar as linhas da tabela */}
              {quartos.map((quarto) => (
                <TableRow key={quarto.id}>
                  <TableCell>{quarto.numero}</TableCell>
                  <TableCell>{quarto.titulo}</TableCell>
                  <TableCell>{quarto.capacidade_hospedes}</TableCell>
                  {/* Formata o preço com duas casas decimais */}
                  <TableCell>R$ {quarto.preco_diaria?.toFixed(2)}</TableCell>
                  <TableCell>
                    {/* Exibe o status como um Badge colorido */}
                    <Badge variant={getStatusVariant(quarto.status)}>
                      {quarto.status}
                    </Badge>
                  </TableCell>
                  {/* Botões de Ação (Editar e Apagar) */}
                  <TableCell className="text-right space-x-2">
                    <Link href={`/admin/quartos/editar/${quarto.id}`}>
                      <Button variant="outline" size="icon" title="Editar">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="destructive" size="icon" title="Apagar" onClick={() => handleDelete(quarto.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {/* Mensagem exibida se não houver quartos e não estiver a carregar/erro */}
         {(!loading && quartos.length === 0 && !error) && (
            <p className="text-center text-gray-500 py-4">Nenhum quarto encontrado.</p>
        )}
      </CardContent>
    </Card>
  );
}