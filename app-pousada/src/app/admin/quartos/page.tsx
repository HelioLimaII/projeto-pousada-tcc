// Em: src/app/admin/quartos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getQuartos, deleteQuarto } from '@/lib/api'; 
import { PlusCircle, Edit, Trash2, AlertCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge'; 
import { Alert, AlertDescription } from '@/components/ui/alert'; 

interface Quarto {
  id: string;
  numero: number;
  titulo: string;
  status: string;
  preco_diaria: number;
  capacidade_hospedes: number;
}

export default function GerenciarQuartosPage() {
  const [quartos, setQuartos] = useState<Quarto[]>([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(''); 

  const fetchQuartos = async () => {
    setLoading(true); 
    setError(''); 
    try {
      const data = await getQuartos(); 
      setQuartos(data); 
    } catch (err) {
      setError('Falha ao carregar quartos.'); 
      console.error(err); 
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchQuartos();
  }, []); 

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem a certeza que deseja apagar este quarto? Esta ação não pode ser desfeita.')) {
      return; 
    }
    try {
      await deleteQuarto(id); 
      fetchQuartos(); 
    } catch (error) {
      alert('Erro ao apagar quarto.'); 
      console.error(error);
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status?.toLowerCase()) {
      case 'disponivel': return 'default'; 
      case 'ocupado': return 'secondary'; 
      case 'manutencao': return 'destructive'; 
      default: return 'outline'; 
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gerenciar Quartos</CardTitle>
        <Link href="/admin/quartos/novo">
          <Button size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            Adicionar Quarto
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-center text-gray-500 py-4">A carregar quartos...</p>}
        {error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        {!loading && !error && (
          <Table>
            <TableHeader>
              <TableRow>
                {/* [MODIFICAÇÃO] Coluna Título removida */}
                <TableHead>Número</TableHead>
                <TableHead>Capacidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quartos.map((quarto) => (
                <TableRow key={quarto.id}>
                  <TableCell>{quarto.numero}</TableCell>
                  {/* [MODIFICAÇÃO] Célula Título removida */}
                  <TableCell>{quarto.capacidade_hospedes} Pessoas</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(quarto.status)}>
                      {quarto.status}
                    </Badge>
                  </TableCell>
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
         {(!loading && quartos.length === 0 && !error) && (
            <p className="text-center text-gray-500 py-4">Nenhum quarto encontrado.</p>
        )}
      </CardContent>
    </Card>
  );
}