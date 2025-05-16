
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Search, Download, ArrowUpDown } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { Oportunidade } from "@/types";
import { oportunidadeService } from "@/services/supabaseService";
import { Badge } from "@/components/ui/badge";

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR');
};

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState<Oportunidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOpportunities, setFilteredOpportunities] = useState<Oportunidade[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Oportunidade | 'sourceName' | 'targetName' | 'partnerName' | 'status' | 'lead',
    direction: 'asc' | 'desc'
  }>({ key: 'data_envio', direction: 'desc' });

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        const data = await oportunidadeService.getAll();
        setOpportunities(data);
        setFilteredOpportunities(data);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar oportunidades:", error);
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  useEffect(() => {
    // Filtrar oportunidades baseado no termo de busca
    if (searchTerm) {
      const filtered = opportunities.filter((opp) => {
        const searchString = searchTerm.toLowerCase();
        const sourceName = opp.empresas_grupo_origem?.nome || '';
        const targetName = opp.empresas_grupo_destino?.nome || '';
        const partnerName = opp.parceiros_externos?.nome || '';
        const leadName = opp.leads?.nome_empresa || '';
        const leadContact = opp.leads?.nome_contato || '';
        const status = opp.status_oportunidade?.nome || '';

        return (
          sourceName.toLowerCase().includes(searchString) ||
          targetName.toLowerCase().includes(searchString) ||
          partnerName.toLowerCase().includes(searchString) ||
          leadName.toLowerCase().includes(searchString) ||
          leadContact.toLowerCase().includes(searchString) ||
          status.toLowerCase().includes(searchString) ||
          (opp.observacoes && opp.observacoes.toLowerCase().includes(searchString))
        );
      });
      setFilteredOpportunities(filtered);
    } else {
      setFilteredOpportunities(opportunities);
    }
  }, [searchTerm, opportunities]);

  const handleSort = (key: typeof sortConfig.key) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    
    const sortedOpps = [...filteredOpportunities].sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      // Determinar os valores a serem comparados com base na chave
      switch(key) {
        case 'data_envio':
          aValue = a.data_envio ? new Date(a.data_envio).getTime() : 0;
          bValue = b.data_envio ? new Date(b.data_envio).getTime() : 0;
          break;
        case 'sourceName':
          aValue = a.empresas_grupo_origem?.nome || '';
          bValue = b.empresas_grupo_origem?.nome || '';
          break;
        case 'targetName':
          aValue = a.empresas_grupo_destino?.nome || '';
          bValue = b.empresas_grupo_destino?.nome || '';
          break;
        case 'partnerName':
          aValue = a.parceiros_externos?.nome || '';
          bValue = b.parceiros_externos?.nome || '';
          break;
        case 'lead':
          aValue = a.leads?.nome_empresa || '';
          bValue = b.leads?.nome_empresa || '';
          break;
        case 'status':
          aValue = a.status_oportunidade?.nome || '';
          bValue = b.status_oportunidade?.nome || '';
          break;
        default:
          aValue = a[key] || '';
          bValue = b[key] || '';
      }
      
      // Ordenação
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredOpportunities(sortedOpps);
  };

  const getStatusBadge = (status: string) => {
    let className = '';
    
    switch (status.toLowerCase()) {
      case 'nova':
        className = 'bg-blue-100 text-blue-800';
        break;
      case 'em andamento':
        className = 'bg-yellow-100 text-yellow-800';
        break;
      case 'ganha':
        className = 'bg-green-100 text-green-800';
        break;
      case 'perdida':
        className = 'bg-red-100 text-red-800';
        break;
      case 'em espera':
        className = 'bg-purple-100 text-purple-800';
        break;
      default:
        className = 'bg-gray-100 text-gray-800';
    }
    
    return <Badge className={className}>{status}</Badge>;
  };

  const getOpportunityTypeLabel = (type: string) => {
    switch(type) {
      case 'intragrupo':
        return 'Intragrupo';
      case 'externa_entrada':
        return 'Externa (Entrada)';
      case 'externa_saida':
        return 'Externa (Saída)';
      default:
        return type;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Oportunidades</h1>
        <Button variant="outline" className="gap-2">
          <Plus size={16} />
          Nova Oportunidade
        </Button>
      </div>
      
      <p className="mb-4 text-muted-foreground">
        Gerencie e monitore todas as oportunidades de parceria do grupo A&eight e parceiros externos.
      </p>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar oportunidades..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter size={16} />
            Filtros
          </Button>
          <Button variant="outline" className="gap-2">
            <Download size={16} />
            Exportar
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">Carregando oportunidades...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <div className="flex items-center cursor-pointer" onClick={() => handleSort('data_envio')}>
                        Data
                        <ArrowUpDown size={14} className="ml-1" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center cursor-pointer" onClick={() => handleSort('tipo_oportunidade')}>
                        Tipo
                        <ArrowUpDown size={14} className="ml-1" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center cursor-pointer" onClick={() => handleSort('sourceName')}>
                        Origem
                        <ArrowUpDown size={14} className="ml-1" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center cursor-pointer" onClick={() => handleSort('targetName')}>
                        Destino
                        <ArrowUpDown size={14} className="ml-1" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center cursor-pointer" onClick={() => handleSort('lead')}>
                        Lead/Cliente
                        <ArrowUpDown size={14} className="ml-1" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center cursor-pointer" onClick={() => handleSort('status')}>
                        Status
                        <ArrowUpDown size={14} className="ml-1" />
                      </div>
                    </TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOpportunities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Nenhuma oportunidade encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOpportunities.map((opp) => (
                      <TableRow key={opp.id}>
                        <TableCell>{formatDate(opp.data_envio)}</TableCell>
                        <TableCell>{getOpportunityTypeLabel(opp.tipo_oportunidade)}</TableCell>
                        <TableCell>
                          {opp.tipo_oportunidade === 'externa_entrada' 
                            ? opp.parceiros_externos?.nome 
                            : opp.empresas_grupo_origem?.nome}
                        </TableCell>
                        <TableCell>
                          {opp.tipo_oportunidade === 'externa_saida'
                            ? opp.oportunidade_parceiro_saida && opp.oportunidade_parceiro_saida.length > 0
                              ? opp.oportunidade_parceiro_saida.map(p => p.parceiros_externos?.nome).join(', ')
                              : '-'
                            : opp.empresas_grupo_destino?.nome || '-'}
                        </TableCell>
                        <TableCell>{opp.leads?.nome_empresa}</TableCell>
                        <TableCell>
                          {getStatusBadge(opp.status_oportunidade?.nome || '')}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                •••
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/opportunities/${opp.id}`}>Ver Detalhes</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>Editar</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Opportunities;
