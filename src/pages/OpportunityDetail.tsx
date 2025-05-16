import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ArrowLeft, Calendar, Mail, Phone, User } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DatePicker } from "@/components/ui/date-picker";
import { 
  getOportunidadeById, 
  updateOportunidade,
  addObservacaoOportunidade,
  deleteOportunidade
} from '@/services/oportunidades.service';
import { supabase } from '@/integrations/supabase/client';
import { 
  OportunidadeCompleta, 
  EmpresaGrupo, 
  ParceiroExterno, 
  StatusOportunidade,
  Oportunidade,
  ObservacaoOportunidade
} from '@/integrations/supabase/types';

const OpportunityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [oportunidade, setOportunidade] = useState<OportunidadeCompleta | null>(null);
  const [observacoes, setObservacoes] = useState<ObservacaoOportunidade[]>([]);
  const [empresasGrupo, setEmpresasGrupo] = useState<EmpresaGrupo[]>([]);
  const [parceirosExternos, setParceirosExternos] = useState<ParceiroExterno[]>([]);
  const [statusOportunidades, setStatusOportunidades] = useState<StatusOportunidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [novaObservacao, setNovaObservacao] = useState('');
  
  // Estados para edição
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
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Buscar oportunidade
        const oportunidadeData = await getOportunidadeById(parseInt(id));
        if (!oportunidadeData) {
          throw new Error('Oportunidade não encontrada');
        }
        setOportunidade(oportunidadeData);
        
        // Inicializar estados de edição
        setTipoOportunidade(oportunidadeData.tipo_oportunidade);
        setDataEnvio(new Date(oportunidadeData.data_envio_recebimento));
        setTargetCompanyName(oportunidadeData.nome_empresa_lead);
        setContactName(oportunidadeData.nome_contato_lead || '');
        setContactEmail(oportunidadeData.email_lead || '');
        setContactPhone(oportunidadeData.telefone_lead || '');
        setDescricaoServicos(oportunidadeData.descricao_servicos || '');
        setNomeProjeto(oportunidadeData.nome_projeto || '');
        setValorPropostaMensal(oportunidadeData.valor_proposta_mensal?.toString() || '');
        setNumeroAportes(oportunidadeData.numero_aportes?.toString() || '');
        setValorTotalProjeto(oportunidadeData.valor_total_projeto?.toString() || '');
        setQuarter(oportunidadeData.quarter_oportunidade || '');
        setMes(oportunidadeData.mes_oportunidade?.toString() || '');
        setAno(oportunidadeData.ano_oportunidade?.toString() || '');
        
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
        
        // Definir IDs com base no tipo de oportunidade
        if (oportunidadeData.tipo_oportunidade === 'intragrupo') {
          const empresaOrigem = empresasData?.find(e => e.nome_empresa === oportunidadeData.empresa_origem);
          const empresaDestino = empresasData?.find(e => e.nome_empresa === oportunidadeData.empresa_destino);
          
          if (empresaOrigem) setEmpresaOrigemId(empresaOrigem.id_empresa_grupo.toString());
          if (empresaDestino) setEmpresaDestinoId(empresaDestino.id_empresa_grupo.toString());
        } else if (oportunidadeData.tipo_oportunidade === 'externa_entrada') {
          const parceiroOrigem = parceirosData?.find(p => p.nome_parceiro === oportunidadeData.parceiro_origem);
          const empresaDestino = empresasData?.find(e => e.nome_empresa === oportunidadeData.empresa_destino);
          
          if (parceiroOrigem) setParceiroOrigemId(parceiroOrigem.id_parceiro_externo.toString());
          if (empresaDestino) setEmpresaDestinoId(empresaDestino.id_empresa_grupo.toString());
        } else if (oportunidadeData.tipo_oportunidade === 'externa_saida') {
          const empresaOrigem = empresasData?.find(e => e.nome_empresa === oportunidadeData.empresa_origem);
          
          if (empresaOrigem) setEmpresaOrigemId(empresaOrigem.id_empresa_grupo.toString());
          
          if (oportunidadeData.parceiros_destino && oportunidadeData.parceiros_destino.length > 0) {
            const parceiroIds = oportunidadeData.parceiros_destino.map(nome => {
              const parceiro = parceirosData?.find(p => p.nome_parceiro === nome);
              return parceiro ? parceiro.id_parceiro_externo.toString() : '';
            }).filter(id => id !== '');
            
            setParceirosDestinoIds(parceiroIds);
          }
        }
        
        // Definir status ID
        const status = statusData?.find(s => s.nome_status === oportunidadeData.status);
        if (status) setStatusId(status.id_status.toString());
        
        // Buscar observações
        const { data: observacoesData, error: observacoesError } = await supabase
          .from('observacoes_oportunidade')
          .select(`
            id_observacao,
            id_oportunidade,
            id_usuario_autor,
            texto_observacao,
            data_criacao,
            usuarios (nome_usuario)
          `)
          .eq('id_oportunidade', id)
          .order('data_criacao', { ascending: false });
        
        if (observacoesError) throw observacoesError;
        setObservacoes(observacoesData || []);
        
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Falha ao carregar dados. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // Salvar alterações
  const handleSaveChanges = async () => {
    if (!id || !oportunidade) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Preparar dados do lead
      const lead = {
        nome_empresa_lead: targetCompanyName,
        nome_contato_lead: contactName || null,
        email_lead: contactEmail || null,
        telefone_lead: contactPhone || null
      };
      
      // Preparar dados da oportunidade
      const oportunidadeUpdate: Partial<Oportunidade> = {
        tipo_oportunidade: tipoOportunidade,
        data_envio_recebimento: dataEnvio?.toISOString() || new Date().toISOString(),
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
        oportunidadeUpdate.id_empresa_origem_grupo = parseInt(empresaOrigemId);
        oportunidadeUpdate.id_empresa_destino_grupo = parseInt(empresaDestinoId);
        oportunidadeUpdate.id_parceiro_origem_externo = null;
      } else if (tipoOportunidade === 'externa_entrada') {
        oportunidadeUpdate.id_parceiro_origem_externo = parseInt(parceiroOrigemId);
        oportunidadeUpdate.id_empresa_destino_grupo = parseInt(empresaDestinoId);
        oportunidadeUpdate.id_empresa_origem_grupo = null;
      } else if (tipoOportunidade === 'externa_saida') {
        oportunidadeUpdate.id_empresa_origem_grupo = parseInt(empresaOrigemId);
        oportunidadeUpdate.id_empresa_destino_grupo = null;
        oportunidadeUpdate.id_parceiro_origem_externo = null;
        // parceirosDestinoIds são tratados separadamente
      }
      
      // Atualizar oportunidade
      await updateOportunidade(
        parseInt(id),
        oportunidadeUpdate,
        lead,
        parceirosDestinoIds.map(id => parseInt(id))
      );
      
      // Recarregar dados
      const oportunidadeData = await getOportunidadeById(parseInt(id));
      setOportunidade(oportunidadeData);
      
      // Sair do modo de edição
      setIsEditing(false);
      
    } catch (err) {
      console.error('Erro ao salvar alterações:', err);
      setError('Falha ao salvar alterações. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Adicionar observação
  const handleAddObservacao = async () => {
    if (!id || !novaObservacao.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Adicionar observação
      await addObservacaoOportunidade(
        parseInt(id),
        1, // ID do usuário atual (placeholder)
        novaObservacao.trim()
      );
      
      // Limpar campo
      setNovaObservacao('');
      
      // Recarregar observações
      const { data, error: observacoesError } = await supabase
        .from('observacoes_oportunidade')
        .select(`
          id_observacao,
          id_oportunidade,
          id_usuario_autor,
          texto_observacao,
          data_criacao,
          usuarios (nome_usuario)
        `)
        .eq('id_oportunidade', id)
        .order('data_criacao', { ascending: false });
      
      if (observacoesError) throw observacoesError;
      setObservacoes(data || []);
      
    } catch (err) {
      console.error('Erro ao adicionar observação:', err);
      setError('Falha ao adicionar observação. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Excluir oportunidade
  const handleDeleteOportunidade = async () => {
    if (!id || !window.confirm('Tem certeza que deseja excluir esta oportunidade? Esta ação não pode ser desfeita.')) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Excluir oportunidade
      await deleteOportunidade(parseInt(id));
      
      // Redirecionar para lista de oportunidades
      navigate('/oportunidades');
      
    } catch (err) {
      console.error('Erro ao excluir oportunidade:', err);
      setError('Falha ao excluir oportunidade. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
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
  
  if (loading && !oportunidade) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (error && !oportunidade) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/oportunidades')} className="flex items-center gap-2">
          <ArrowLeft size={16} />
          Voltar para Oportunidades
        </Button>
      </div>
    );
  }
  
  if (!oportunidade) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>Oportunidade não encontrada</AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/oportunidades')} className="flex items-center gap-2">
          <ArrowLeft size={16} />
          Voltar para Oportunidades
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/oportunidades')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">
            Oportunidade #{oportunidade.id_oportunidade}
          </h1>
          {renderTipoBadge(oportunidade.tipo_oportunidade)}
          {renderStatusBadge(oportunidade.status)}
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveChanges}>
                Salvar Alterações
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Editar
              </Button>
              <Button variant="destructive" onClick={handleDeleteOportunidade}>
                Excluir
              </Button>
            </>
          )}
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="project">Projeto</TabsTrigger>
              <TabsTrigger value="financial">Financeiro</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes da Oportunidade</CardTitle>
                  <CardDescription>Informações básicas sobre a oportunidade</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isEditing ? (
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
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Tipo</h3>
                        <p className="text-lg">{renderTipoBadge(oportunidade.tipo_oportunidade)}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Data</h3>
                        <p className="text-lg flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(oportunidade.data_envio_recebimento).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Origem</h3>
                        <p className="text-lg">{oportunidade.empresa_origem || oportunidade.parceiro_origem || '-'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Destino</h3>
                        <p className="text-lg">
                          {oportunidade.empresa_destino || 
                           (oportunidade.parceiros_destino && oportunidade.parceiros_destino.length > 0 
                            ? oportunidade.parceiros_destino.join(', ') 
                            : '-')}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Responsável</h3>
                        <p className="text-lg">{oportunidade.nome_responsavel}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                        <p className="text-lg">{renderStatusBadge(oportunidade.status)}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-2">Dados do Lead</h3>
                    
                    {isEditing ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="targetCompanyName">Nome da Empresa</Label>
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
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Empresa</h3>
                          <p className="text-lg">{oportunidade.nome_empresa_lead}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Contato</h3>
                          <p className="text-lg flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {oportunidade.nome_contato_lead || '-'}
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                          <p className="text-lg flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {oportunidade.email_lead || '-'}
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Telefone</h3>
                          <p className="text-lg flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {oportunidade.telefone_lead || '-'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="project">
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes do Projeto</CardTitle>
                  <CardDescription>Informações sobre o projeto e serviços</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isEditing ? (
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nomeProjeto">Nome do Projeto</Label>
                        <Input
                          id="nomeProjeto"
                          value={nomeProjeto}
                          onChange={(e) => setNomeProjeto(e.target.value)}
                          placeholder="Nome do projeto"
                        />
                      </div>
                      
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
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Nome do Projeto</h3>
                        <p className="text-lg">{oportunidade.nome_projeto || '-'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Descrição dos Serviços</h3>
                        <p className="text-lg whitespace-pre-line">{oportunidade.descricao_servicos || '-'}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Quarter</h3>
                          <p className="text-lg">{oportunidade.quarter_oportunidade || '-'}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Mês</h3>
                          <p className="text-lg">
                            {oportunidade.mes_oportunidade 
                              ? new Date(0, oportunidade.mes_oportunidade - 1).toLocaleString('pt-BR', { month: 'long' })
                              : '-'}
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Ano</h3>
                          <p className="text-lg">{oportunidade.ano_oportunidade || '-'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="financial">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Financeiras</CardTitle>
                  <CardDescription>Valores e condições financeiras do projeto</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isEditing ? (
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
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Valor Mensal</h3>
                        <p className="text-lg">
                          {oportunidade.valor_proposta_mensal 
                            ? `R$ ${oportunidade.valor_proposta_mensal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`
                            : '-'}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Número de Aportes</h3>
                        <p className="text-lg">{oportunidade.numero_aportes || '-'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Valor Total</h3>
                        <p className="text-lg font-bold">
                          {oportunidade.valor_total_projeto 
                            ? `R$ ${oportunidade.valor_total_projeto.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`
                            : '-'}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Observações</CardTitle>
              <CardDescription>Histórico de observações e comentários</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="novaObservacao">Nova Observação</Label>
                <Textarea
                  id="novaObservacao"
                  value={novaObservacao}
                  onChange={(e) => setNovaObservacao(e.target.value)}
                  placeholder="Adicione uma observação..."
                  rows={3}
                />
                <Button 
                  onClick={handleAddObservacao}
                  disabled={!novaObservacao.trim()}
                  className="w-full"
                >
                  Adicionar Observação
                </Button>
              </div>
              
              <div className="border-t pt-4 space-y-4 max-h-[400px] overflow-y-auto">
                {observacoes.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhuma observação registrada.
                  </p>
                ) : (
                  observacoes.map((obs) => (
                    <div key={obs.id_observacao} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">
                          {obs.usuarios?.nome_usuario || 'Usuário'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(obs.data_criacao).toLocaleString()}
                        </div>
                      </div>
                      <p className="whitespace-pre-line">{obs.texto_observacao}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
              <CardDescription>Datas e registros do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Data de Criação</h3>
                <p className="text-base">
                  {new Date(oportunidade.data_criacao).toLocaleString()}
                </p>
              </div>
              
              {oportunidade.data_ultima_modificacao && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Última Modificação</h3>
                  <p className="text-base">
                    {new Date(oportunidade.data_ultima_modificacao).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetail;
