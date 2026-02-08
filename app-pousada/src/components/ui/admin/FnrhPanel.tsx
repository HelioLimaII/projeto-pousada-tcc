'use client';

import { useState, useEffect } from 'react';
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Loader2, RefreshCw, Search, CalendarDays, Users, FileText, 
    ArrowRight, ArrowLeft 
} from 'lucide-react';
import { listarReservasFnrh } from '@/lib/api';

export default function FnrhPanel() {
    const [reservas, setReservas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagina, setPagina] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [filtroCodigo, setFiltroCodigo] = useState('');

    const carregarDados = async () => {
        setLoading(true);
        try {
            // Chama a API que busca direto no Governo
            const resposta = await listarReservasFnrh(pagina, filtroCodigo);
            
            if (resposta.sucesso) {
                setReservas(resposta.dados || []);
                // Calcula total de páginas (API retorna total de registros)
                const totalRegistros = resposta.paginacao?.total || 0;
                setTotalPaginas(Math.ceil(totalRegistros / 20) || 1); // 20 itens por página
            } else {
                setReservas([]);
            }
        } catch (error) {
            console.error("Erro ao buscar FNRH:", error);
            alert("Erro ao conectar com o Governo via API.");
        } finally {
            setLoading(false);
        }
    };

    // Carrega ao iniciar ou mudar de página
    useEffect(() => {
        carregarDados();
    }, [pagina]);

    const handleBuscar = () => {
        setPagina(1); // Volta pra primeira página ao filtrar
        carregarDados();
    };

    // Função para definir a cor do status
    const getStatusBadge = (status: string) => {
        const s = status?.toUpperCase() || '';
        if (s.includes('CHECKIN') || s === 'HOSPEDADO') return <Badge className="bg-blue-600">Hospedado</Badge>;
        if (s.includes('CHECKOUT') || s === 'FINALIZADA') return <Badge className="bg-gray-600">Finalizada</Badge>;
        if (s.includes('CANCEL')) return <Badge variant="destructive">Cancelada</Badge>;
        if (s.includes('NO') && s.includes('SHOW')) return <Badge variant="destructive">No-Show</Badge>;
        return <Badge variant="outline" className="text-green-700 border-green-600 bg-green-50">Confirmada</Badge>;
    };

    // Formata data BR
    const formatData = (dataIso: string) => {
        if (!dataIso) return '--';
        return new Date(dataIso).toLocaleDateString('pt-BR');
    };

    return (
        <div className="space-y-6 p-2">
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-700"/>
                                Reservas Oficiais (FNRH)
                            </CardTitle>
                            <CardDescription>
                                Lista em tempo real direto do Ministério do Turismo
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={carregarDados} disabled={loading}>
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}/>
                            Atualizar
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filtros */}
                    <div className="flex gap-2 mb-6 max-w-sm">
                        <Input 
                            placeholder="Buscar por código..." 
                            value={filtroCodigo}
                            onChange={(e) => setFiltroCodigo(e.target.value)}
                        />
                        <Button onClick={handleBuscar} disabled={loading}>
                            <Search className="w-4 h-4"/>
                        </Button>
                    </div>

                    {/* Tabela */}
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead>Código</TableHead>
                                    <TableHead>Hóspede Principal</TableHead>
                                    <TableHead>Entrada</TableHead>
                                    <TableHead>Saída</TableHead>
                                    <TableHead>Pessoas</TableHead>
                                    <TableHead>Situação</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            <div className="flex justify-center items-center gap-2 text-gray-500">
                                                <Loader2 className="animate-spin w-5 h-5"/> Buscando dados no Governo...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : reservas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                                            Nenhuma reserva encontrada no período.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    reservas.map((reserva: any) => (
                                        <TableRow key={reserva.id || reserva.numero_reserva}>
                                            <TableCell className="font-mono font-medium">
                                                {reserva.numero_reserva || '---'}
                                            </TableCell>
                                            <TableCell>
                                                {/* A API pode retornar lista de hóspedes ou nome direto */}
                                                {reserva.hospede_principal?.nome || 
                                                 (reserva.hospedes && reserva.hospedes[0]?.nome) || 
                                                 'Não informado'}
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <CalendarDays className="w-3 h-3"/>
                                                    {formatData(reserva.data_entrada)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                {formatData(reserva.data_saida)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-gray-600">
                                                    <Users className="w-3 h-3"/>
                                                    {reserva.quantidade_hospede_adulto || 1} adt
                                                    {reserva.quantidade_hospede_menor > 0 && ` + ${reserva.quantidade_hospede_menor} cri`}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(reserva.situacao_reserva?.descricao || reserva.situacao)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Paginação */}
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-xs text-gray-500">
                            Página {pagina} de {totalPaginas}
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setPagina(p => Math.max(1, p - 1))}
                                disabled={pagina === 1 || loading}
                            >
                                <ArrowLeft className="w-4 h-4 mr-1"/> Anterior
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setPagina(p => p + 1)}
                                disabled={pagina >= totalPaginas || loading}
                            >
                                Próximo <ArrowRight className="w-4 h-4 ml-1"/>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}