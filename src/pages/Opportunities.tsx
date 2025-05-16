import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Download, Filter, Plus, Search, SlidersHorizontal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { 
  getOportunidadesCompletas, 
  exportOportunidadesToCSV,
  createOportunidade,
  updateOportunidade
} from '@/services/oportunidades.service';
import { supabase } from '@/integrations/supabase/client';
import { 
  OportunidadeCompleta, 
  EmpresaGrupo, 
  ParceiroExterno, 
  StatusOportunidade,
  Oportunidade
} from '@/integrations/supabase/types';

const Opportunities = () => {
  const navigate = useNavigate();
  const [oportunidades, setOportunidades] = useState<OportunidadeCompleta[]>([]);
  const [empresasGrupo, setEmpresasGrupo] = useState<EmpresaGrupo[]>([]);
  const [parceirosExternos, setParceirosExternos] = useState<ParceiroExterno[]>([]);
  const [statusOportunidades, setStatusOportunidades] = useState<StatusOportunidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterTipo, setFilterTipo] = useState<string>('');
  const [filterEmpresaOrigem, setFilterEmpresaOrigem] = useState<string>('');
  const [filterEmpresaDestino, setFilterEmpresaDestino] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Estados para o formulário de criação
  const [tipoOportunidade, setTipoOportunidade] = useState<'intragrupo' | 'externa_entrada' | 'externa_saida'>('intragrupo');
  const [dataEnvio, setDataEnvio] = useState<Date | undefined>(new Date());
  const [empresaOrigemId, setEmpresaOrigemId] = useState<string>('');
  const [empresaDestinoId, setEmpresaDestinoId] = useState<string>('');
  const [parceiroOrigemId, setParceiroOrigemId] = useState<string>('');
  const [parceirosDestinoIds, setParceirosDestinoIds] = useState<string[]>([]);
  const [targetCompanyName, setTargetCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [statusId, setStatusId] = useState<string>('');
  const [descricaoServicos, setDescricaoServicos] = useState('');
  const [nomeProjeto, setNomeProjeto] = useState('');
  const [valorPropostaMensal, setValorPropostaMensal] = useState<string>('');
  const [numeroAportes, setNumeroAportes] = useState<string>('');
  const [valorTotalProjeto, setValorTotalProjeto] = useState<string>('');
  const [quarter, setQuarter] = useState<string>('');
  const [mes, setMes] = useState<string>('');
  const [ano, setAno] = useState<string>('');
  
  // Carregar dados iniciais
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Buscar oportunidades
        const oportunidadesData = await getOportunidadesCompletas();
        setOportunidades(oportunidadesData);
        
        // Buscar empresas do grupo
        const { data: empresasData, error: empresasError } = await supabase
          .from('empresas_grupo')
          .select('*');
        
        if (empresasError) throw empresasError;
        setEmpresasGrupo(empresasData || []);
        
        // Buscar parceiros externos
        const { data: parceirosData, error: parceirosError } = await supabase
          .from('parceiros_externos')
          .select('*');
        
        if (parceirosError) throw parceirosError;
        setParceirosExternos(parceirosData || []);
        
        // Buscar status de oportunidades
        const { data: statusData, error: statusError } = await supabase
          .from('status_oportunidade')
          .select('*');
        
        if (statusError) throw statusError;
        setStatusOportunidades(statusData || []);
        
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Falha ao carregar dados. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filtrar oportunidades
  const filteredOportunidades = oportunidades.filter(op => {
    const matchesSearch = searchTerm === '' || 
      op.nome_empresa_lead.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (op.nome_contato_lead && op.nome_contato_lead.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (op.descricao_servicos && op.descricao_servicos.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (op.nome_projeto && op.nome_projeto.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === '' || op.status === filterStatus;
    const matchesTipo = filterTipo === '' || op.tipo_oportunidade === filterTipo;
    const matchesEmpresaOrigem = filterEmpresaOrigem === '' || op.empresa_origem === filterEmpresaOrigem;
    const matchesEmpresaDestino = filterEmpresaDestino === '' || op.empresa_destino === filterEmpresaDestino;
    
    return matchesSearch && matchesStatus && matchesTipo && matchesEmpresaOrigem && matchesEmpresaDestino;
  });
  
  // Exportar para CSV
  const handleExportCSV = async () => {
    try {
      const csvContent = await exportOportunidadesToCSV();
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `oportunidades_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Erro ao exportar CSV:', err);
      setError('Falha ao exportar dados para CSV. Por favor, tente novamente.');
    }
  };
  
  // Criar nova oportunidade
  const handleCreateOportunidade = async () => {
    try {
      if (!targetCompanyName || !dataEnvio || !statusId) {
        setError('Por favor, preencha todos os campos obrigatórios.');
        return;
      }
      
      // Preparar dados do lead
      const lead = {
        nome_empresa_lead: targetCompanyName,
        nome_contato_lead: contactName || null,
        email_lead: contactEmail || null,
        telefone_lead: contactPhone || null
      };
      
      // Preparar dados da oportunidade
      const oportunidade: Partial<Oportunidade> = {
        tipo_oportunidade: tipoOportunidade,
        data_envio_recebimento: dataEnvio.toISOString(),
        id_responsavel_envio_recebimento: 1, // ID do usuário atual (placeholder)
        id_status_atual: parseInt(statusId),
        descricao_servicos: descricaoServicos || null,
        nome_projeto: nomeProjeto || null,
        valor_proposta_mensal: valorPropostaMensal ? parseFloat(valorPropostaMensal) : null,
        numero_aportes: numeroAportes ? parseInt(numeroAportes) : null,
        valor_total_projeto: valorTotalProjeto ? parseFloat(valorTotalProjeto) : null,
        quarter_oportunidade: quarter || null,
        mes_oportunidade: mes ? parseInt(mes) : null,
        ano_oportunidade: ano ? parseInt(ano) : null
      };
      
      // Definir origem e destino com base no tipo de oportunidade
      if (tipoOportunidade === 'intragrupo') {
        oportunidade.id_empresa_origem_grupo = parseInt(empresaOrigemId);
        oportunidade.id_empresa_destino_grupo = parseInt(empresaDestinoId);
      } else if (tipoOportunidade === 'externa_entrada') {
        oportunidade.id_parceiro_origem_externo = parseInt(parceiroOrigemId);
        oportunidade.id_empresa_destino_grupo = parseInt(empresaDestinoId);
      } else if (tipoOportunidade === 'externa_saida') {
        oportunidade.id_empresa_origem_grupo = parseInt(empresaOrigemId);
        // parceirosDestinoIds são tratados separadamente
      }
      
      // Criar oportunidade
      await createOportunidade(
        oportunidade as Omit<Oportunidade, 'id_oportunidade' | 'data_criacao' | 'data_ultima_modificacao'>,
        lead,
        parceirosDestinoIds.map(id => parseInt(id))
      );
      
      // Fechar diálogo e recarregar dados
      setIsCreateDialogOpen(false);
      resetForm();
      
      // Recarregar oportunidades
      const oportunidadesData = await getOportunidadesCompletas();
      setOportunidades(oportunidadesData);
      
    } catch (err) {
      console.error('Erro ao criar oportunidade:', err);
      setError('Falha ao criar oportunidade. Por favor, tente novamente.');
    }
  };
  
  // Resetar formulário
  const resetForm = () => {
    setTipoOportunidade('intragrupo');
    setDataEnvio(new Date());
    setEmpresaOrigemId('');
    setEmpresaDestinoId('');
    setParceiroOrigemId('');
    setParceirosDestinoIds([]);
    setTargetCompanyName('');
    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setStatusId('');
    setDescricaoServicos('');
    setNomeProjeto('');
    setValorPropostaMensal('');
    setNumeroAportes('');
    setValorTotalProjeto('');
    setQuarter('');
    setMes('');
    setAno('');
  };
  
  // Renderizar status com cores
  const renderStatusBadge = (status: string) => {
    let color = 'bg-gray-500';
    
    switch (status.toLowerCase()) {
      case 'contato':
        color = 'bg-blue-500';
        break;
      case 'negociação':
        color = 'bg-yellow-500';
        break;
      case 'ganho':
        color = 'bg-green-500';
        break;
      case 'perdido':
        color = 'bg-red-500';
        break;
      case 'sem contato':
        color = 'bg-gray-500';
        break;
    }
    
    return (
      <Badge className={`${color} text-white`}>
        {status}
      </Badge>
    );
  };
  
  // Renderizar tipo de oportunidade
  const renderTipoBadge = (tipo: string) => {
    let color = '';
    let label = '';
    
    switch (tipo) {
      case 'intragrupo':
        color = 'bg-purple-500';
        label = 'Intragrupo';
        break;
      case 'externa_entrada':
        color = 'bg-green-500';
        label = 'Externa (Entrada)';
        break;
      case 'externa_saida':
        color = 'bg-blue-500';
        label = 'Externa (Saída)';
        break;
    }
    
    return (
      <Badge className={`${color} text-white`}>
        {label}
      </Badge>
    );
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Oportunidades</h1>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-2">
            <Download size={16} />
            Exportar CSV
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
            <Plus size={16} />
            Nova Oportunidade
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtre as oportunidades por diferentes critérios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Empresa, contato, projeto..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="filterStatus">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger id="filterStatus">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os status</SelectItem>
                  {statusOportunidades.map((status) => (
                    <SelectItem key={status.id_status} value={status.nome_status}>
                      {status.nome_status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="filterTipo">Tipo</Label>
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger id="filterTipo">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os tipos</SelectItem>
                  <SelectItem value="intragrupo">Intragrupo</SelectItem>
                  <SelectItem value="externa_entrada">Externa (Entrada)</SelectItem>
                  <SelectItem value="externa_saida">Externa (Saída)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="filterEmpresaOrigem">Empresa Origem</Label>
              <Select value={filterEmpresaOrigem} onValueChange={setFilterEmpresaOrigem}>
                <SelectTrigger id="filterEmpresaOrigem">
                  <SelectValue placeholder="Todas as empresas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as empresas</SelectItem>
                  {empresasGrupo.map((empresa) => (
                    <SelectItem key={empresa.id_empresa_grupo} value={empresa.nome_empresa}>
                      {empresa.nome_empresa}
                    </SelectItem>
                  ))}
                  {parceirosExternos.map((parceiro) => (
                    <SelectItem key={parceiro.id_parceiro_externo} value={parceiro.nome_parceiro}>
                      {parceiro.nome_parceiro}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="filterEmpresaDestino">Empresa Destino</Label>
              <Select value={filterEmpresaDestino} onValueChange={setFilterEmpresaDestino}>
                <SelectTrigger id="filterEmpresaDestino">
                  <SelectValue placeholder="Todas as empresas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as empresas</SelectItem>
                  {empresasGrupo.map((empresa) => (
                    <SelectItem key={empresa.id_empresa_grupo} value={empresa.nome_empresa}>
                      {empresa.nome_empresa}
                    </SelectItem>
                  ))}
                  {parceirosExternos.map((parceiro) => (
                    <SelectItem key={parceiro.id_parceiro_externo} value={parceiro.nome_parceiro}>
                      {parceiro.nome_parceiro}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableCaption>Lista de oportunidades ({filteredOportunidades.length})</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Empresa Lead</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOportunidades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Nenhuma oportunidade encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOportunidades.map((op) => (
                    <TableRow 
                      key={op.id_oportunidade} 
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => navigate(`/oportunidades/${op.id_oportunidade}`)}
                    >
                      <TableCell>{op.id_oportunidade}</TableCell>
                      <TableCell>{renderTipoBadge(op.tipo_oportunidade)}</TableCell>
                      <TableCell>{new Date(op.data_envio_recebimento).toLocaleDateString()}</TableCell>
                      <TableCell>{op.nome_empresa_lead}</TableCell>
                      <TableCell>{op.empresa_origem || op.parceiro_origem || '-'}</TableCell>
                      <TableCell>
                        {op.empresa_destino || 
                         (op.parceiros_destino && op.parceiros_destino.length > 0 
                          ? op.parceiros_destino.join(', ') 
                          : '-')}
                      </TableCell>
                      <TableCell>{renderStatusBadge(op.status)}</TableCell>
                      <TableCell>{op.nome_projeto || '-'}</TableCell>
                      <TableCell>
                        {op.valor_total_projeto 
                          ? `R$ ${op.valor_total_projeto.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {/* Diálogo de Criação de Oportunidade */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Oportunidade</DialogTitle>
            <DialogDescription>
              Preencha os dados para criar uma nova oportunidade.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
              <TabsTrigger value="details">Detalhes do Projeto</TabsTrigger>
              <TabsTrigger value="financial">Informações Financeiras</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipoOportunidade">Tipo de Oportunidade</Label>
                  <Select 
                    value={tipoOportunidade} 
                    onValueChange={(value) => setTipoOportunidade(value as any)}
                  >
                    <SelectTrigger id="tipoOportunidade">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="intragrupo">Intragrupo</SelectItem>
                      <SelectItem value="externa_entrada">Externa (Entrada)</SelectItem>
                      <SelectItem value="externa_saida">Externa (Saída)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dataEnvio">Data de Envio/Recebimento</Label>
                  <DatePicker 
                    date={dataEnvio} 
                    setDate={setDataEnvio} 
                    className="w-full"
                  />
                </div>
                
                {tipoOportunidade === 'intragrupo' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="empresaOrigem">Empresa de Origem</Label>
                      <Select 
                        value={empresaOrigemId} 
                        onValueChange={setEmpresaOrigemId}
                      >
                        <SelectTrigger id="empresaOrigem">
                          <SelectValue placeholder="Selecione a empresa" />
                        </SelectTrigger>
                        <SelectContent>
                          {empresasGrupo.map((empresa) => (
                            <SelectItem 
                              key={empresa.id_empresa_grupo} 
                              value={empresa.id_empresa_grupo.toString()}
                            >
                              {empresa.nome_empresa}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="empresaDestino">Empresa de Destino</Label>
                      <Select 
                        value={empresaDestinoId} 
                        onValueChange={setEmpresaDestinoId}
                      >
                        <SelectTrigger id="empresaDestino">
                          <SelectValue placeholder="Selecione a empresa" />
                        </SelectTrigger>
                        <SelectContent>
                          {empresasGrupo.map((empresa) => (
                            <SelectItem 
                              key={empresa.id_empresa_grupo} 
                              value={empresa.id_empresa_grupo.toString()}
                            >
                              {empresa.nome_empresa}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                
                {tipoOportunidade === 'externa_entrada' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="parceiroOrigem">Parceiro de Origem</Label>
                      <Select 
                        value={parceiroOrigemId} 
                        onValueChange={setParceiroOrigemId}
                      >
                        <SelectTrigger id="parceiroOrigem">
                          <SelectValue placeholder="Selecione o parceiro" />
                        </SelectTrigger>
                        <SelectContent>
                          {parceirosExternos.map((parceiro) => (
                            <SelectItem 
                              key={parceiro.id_parceiro_externo} 
                              value={parceiro.id_parceiro_externo.toString()}
                            >
                              {parceiro.nome_parceiro}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="empresaDestino">Empresa de Destino</Label>
                      <Select 
                        value={empresaDestinoId} 
                        onValueChange={setEmpresaDestinoId}
                      >
                        <SelectTrigger id="empresaDestino">
                          <SelectValue placeholder="Selecione a empresa" />
                        </SelectTrigger>
                        <SelectContent>
                          {empresasGrupo.map((empresa) => (
                            <SelectItem 
                              key={empresa.id_empresa_grupo} 
                              value={empresa.id_empresa_grupo.toString()}
                            >
                              {empresa.nome_empresa}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                
                {tipoOportunidade === 'externa_saida' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="empresaOrigem">Empresa de Origem</Label>
                      <Select 
                        value={empresaOrigemId} 
                        onValueChange={setEmpresaOrigemId}
                      >
                        <SelectTrigger id="empresaOrigem">
                          <SelectValue placeholder="Selecione a empresa" />
                        </SelectTrigger>
                        <SelectContent>
                          {empresasGrupo.map((empresa) => (
                            <SelectItem 
                              key={empresa.id_empresa_grupo} 
                              value={empresa.id_empresa_grupo.toString()}
                            >
                              {empresa.nome_empresa}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="parceirosDestino">Parceiros de Destino</Label>
                      <Select 
                        value={parceirosDestinoIds[0] || ''} 
                        onValueChange={(value) => setParceirosDestinoIds([value])}
                      >
                        <SelectTrigger id="parceirosDestino">
                          <SelectValue placeholder="Selecione o parceiro" />
                        </SelectTrigger>
                        <SelectContent>
                          {parceirosExternos.map((parceiro) => (
                            <SelectItem 
                              key={parceiro.id_parceiro_externo} 
                              value={parceiro.id_parceiro_externo.toString()}
                            >
                              {parceiro.nome_parceiro}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="targetCompanyName">Nome da Empresa Cliente</Label>
                  <Input
                    id="targetCompanyName"
                    value={targetCompanyName}
                    onChange={(e) => setTargetCompanyName(e.target.value)}
                    placeholder="Nome da empresa cliente"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactName">Nome do Contato</Label>
                  <Input
                    id="contactName"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Nome do contato"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email do Contato</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Telefone do Contato</Label>
                  <Input
                    id="contactPhone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={statusId} 
                    onValueChange={setStatusId}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOportunidades.map((status) => (
                        <SelectItem 
                          key={status.id_status} 
                          value={status.id_status.toString()}
                        >
                          {status.nome_status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="descricaoServicos">Descrição dos Serviços</Label>
                  <Textarea
                    id="descricaoServicos"
                    value={descricaoServicos}
                    onChange={(e) => setDescricaoServicos(e.target.value)}
                    placeholder="Descreva os serviços oferecidos"
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nomeProjeto">Nome do Projeto</Label>
                  <Input
                    id="nomeProjeto"
                    value={nomeProjeto}
                    onChange={(e) => setNomeProjeto(e.target.value)}
                    placeholder="Nome do projeto"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quarter">Quarter</Label>
                    <Select 
                      value={quarter} 
                      onValueChange={setQuarter}
                    >
                      <SelectTrigger id="quarter">
                        <SelectValue placeholder="Selecione o quarter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhum</SelectItem>
                        <SelectItem value={`Q1/${new Date().getFullYear()}`}>Q1/{new Date().getFullYear()}</SelectItem>
                        <SelectItem value={`Q2/${new Date().getFullYear()}`}>Q2/{new Date().getFullYear()}</SelectItem>
                        <SelectItem value={`Q3/${new Date().getFullYear()}`}>Q3/{new Date().getFullYear()}</SelectItem>
                        <SelectItem value={`Q4/${new Date().getFullYear()}`}>Q4/{new Date().getFullYear()}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mes">Mês</Label>
                    <Select 
                      value={mes} 
                      onValueChange={setMes}
                    >
                      <SelectTrigger id="mes">
                        <SelectValue placeholder="Selecione o mês" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhum</SelectItem>
                        <SelectItem value="1">Janeiro</SelectItem>
                        <SelectItem value="2">Fevereiro</SelectItem>
                        <SelectItem value="3">Março</SelectItem>
                        <SelectItem value="4">Abril</SelectItem>
                        <SelectItem value="5">Maio</SelectItem>
                        <SelectItem value="6">Junho</SelectItem>
                        <SelectItem value="7">Julho</SelectItem>
                        <SelectItem value="8">Agosto</SelectItem>
                        <SelectItem value="9">Setembro</SelectItem>
                        <SelectItem value="10">Outubro</SelectItem>
                        <SelectItem value="11">Novembro</SelectItem>
                        <SelectItem value="12">Dezembro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ano">Ano</Label>
                    <Select 
                      value={ano} 
                      onValueChange={setAno}
                    >
                      <SelectTrigger id="ano">
                        <SelectValue placeholder="Selecione o ano" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhum</SelectItem>
                        <SelectItem value={(new Date().getFullYear() - 1).toString()}>{new Date().getFullYear() - 1}</SelectItem>
                        <SelectItem value={new Date().getFullYear().toString()}>{new Date().getFullYear()}</SelectItem>
                        <SelectItem value={(new Date().getFullYear() + 1).toString()}>{new Date().getFullYear() + 1}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="financial" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valorPropostaMensal">Valor da Proposta Mensal (R$)</Label>
                  <Input
                    id="valorPropostaMensal"
                    type="number"
                    value={valorPropostaMensal}
                    onChange={(e) => setValorPropostaMensal(e.target.value)}
                    placeholder="0,00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="numeroAportes">Número de Aportes</Label>
                  <Input
                    id="numeroAportes"
                    type="number"
                    value={numeroAportes}
                    onChange={(e) => setNumeroAportes(e.target.value)}
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="valorTotalProjeto">Valor Total do Projeto (R$)</Label>
                  <Input
                    id="valorTotalProjeto"
                    type="number"
                    value={valorTotalProjeto}
                    onChange={(e) => setValorTotalProjeto(e.target.value)}
                    placeholder="0,00"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateOportunidade}>
              Criar Oportunidade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Opportunities;
