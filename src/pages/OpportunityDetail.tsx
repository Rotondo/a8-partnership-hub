
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { 
  ArrowLeft, Calendar, Trash2, Send, Building2, Users, User, FileSpreadsheet, 
  ArrowRightLeft, PanelRight, Clock, Tag, MessageSquare, Pencil
} from "lucide-react";
import { getOportunidadeById, getEmpresasGrupo, getParceirosExternos, getStatusOportunidades } from '@/services/oportunidades.service';
import { updateOportunidade } from '@/services/oportunidades.service';
import { addObservacaoOportunidade } from '@/services/oportunidades.service';
import { deleteOportunidade } from '@/services/oportunidades.service';
import { 
  OportunidadeCompleta, 
  EmpresaGrupo, 
  ParceiroExterno, 
  StatusOportunidade, 
  Oportunidade,
  ObservacaoOportunidade
} from '@/types/supabase-extended';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const OpportunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [oportunidade, setOportunidade] = useState<OportunidadeCompleta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [empresas, setEmpresas] = useState<EmpresaGrupo[]>([]);
  const [parceiros, setParceiros] = useState<ParceiroExterno[]>([]);
  const [statusOptions, setStatusOptions] = useState<StatusOportunidade[]>([]);
  const [observacoes, setObservacoes] = useState<ObservacaoOportunidade[]>([]);
  const [novaObservacao, setNovaObservacao] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Oportunidade>>({});
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  // Carregar dados da oportunidade
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Testar utilizando mock data até que a API esteja disponível
        if (!id) {
          throw new Error('ID da oportunidade não fornecido');
        }
        
        // Carregar dados da oportunidade
        const oportunidadeData = await getOportunidadeById(parseInt(id));
        if (!oportunidadeData) {
          throw new Error('Oportunidade não encontrada');
        }
        
        setOportunidade(oportunidadeData);
        setFormData({
          descricao_servicos: oportunidadeData.descricao_servicos,
          nome_projeto: oportunidadeData.nome_projeto,
          valor_proposta_mensal: oportunidadeData.valor_proposta_mensal,
          numero_aportes: oportunidadeData.numero_aportes,
          valor_total_projeto: oportunidadeData.valor_total_projeto,
          quarter_oportunidade: oportunidadeData.quarter_oportunidade,
          mes_oportunidade: oportunidadeData.mes_oportunidade,
          ano_oportunidade: oportunidadeData.ano_oportunidade,
          observacoes: oportunidadeData.observacoes,
          id_status_atual: oportunidadeData.id_status_atual
        });
        
        // Carregar empresas do grupo
        const empresasData = await getEmpresasGrupo();
        setEmpresas(empresasData);
        
        // Carregar parceiros externos
        const parceirosData = await getParceirosExternos();
        setParceiros(parceirosData);
        
        // Carregar opções de status
        const statusData = await getStatusOportunidades();
        setStatusOptions(statusData);
        
        // Carregar observações da oportunidade
        try {
          // Use mock data for observations until the API is available
          const mockObservacoes: ObservacaoOportunidade[] = [
            {
              id_observacao: 1,
              id_oportunidade: parseInt(id),
              id_usuario: 1,
              conteudo: "Primeira observação de exemplo para a oportunidade.",
              data_criacao: "2023-01-15T10:30:00Z",
              usuarios: { nome_usuario: "João Silva" }
            },
            {
              id_observacao: 2,
              id_oportunidade: parseInt(id),
              id_usuario: 2,
              conteudo: "Segunda observação de exemplo para acompanhamento do caso.",
              data_criacao: "2023-01-17T14:45:00Z",
              usuarios: { nome_usuario: "Maria Souza" }
            }
          ];
          
          setObservacoes(mockObservacoes);
        } catch (obsError) {
          console.error('Erro ao carregar observações:', obsError);
        }
        
      } catch (err) {
        console.error('Erro ao carregar detalhes da oportunidade:', err);
        setError('Falha ao carregar detalhes da oportunidade. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // Função para adicionar uma nova observação
  const handleAddObservacao = async () => {
    if (!novaObservacao.trim() || !oportunidade) {
      return;
    }
    
    try {
      // ID do usuário atual (simulado)
      const idUsuario = 1;
      
      // Adicionar nova observação
      const novaObs = await addObservacaoOportunidade(
        oportunidade.id_oportunidade,
        idUsuario,
        novaObservacao.trim()
      );
      
      // Atualizar estado local
      setObservacoes([novaObs, ...observacoes]);
      setNovaObservacao('');
      
      toast({
        title: "Observação adicionada",
        description: "Sua observação foi adicionada com sucesso.",
      });
      
    } catch (err) {
      console.error('Erro ao adicionar observação:', err);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao adicionar a observação. Tente novamente.",
      });
    }
  };
  
  // Função para salvar alterações na oportunidade
  const handleSaveChanges = async () => {
    if (!oportunidade) return;
    
    try {
      // Atualizar oportunidade
      const updatedOpportunity = await updateOportunidade(
        oportunidade.id_oportunidade,
        formData
      );
      
      // Atualizar estado local
      setOportunidade(updatedOpportunity);
      setEditMode(false);
      
      toast({
        title: "Alterações salvas",
        description: "As alterações foram salvas com sucesso.",
      });
      
    } catch (err) {
      console.error('Erro ao salvar alterações:', err);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao salvar as alterações. Tente novamente.",
      });
    }
  };
  
  // Função para excluir oportunidade
  const handleDeleteOpportunity = async () => {
    if (!oportunidade) return;
    
    try {
      await deleteOportunidade(oportunidade.id_oportunidade);
      
      toast({
        title: "Oportunidade excluída",
        description: "A oportunidade foi excluída com sucesso.",
      });
      
      // Navegar de volta para a lista de oportunidades
      navigate('/opportunities');
      
    } catch (err) {
      console.error('Erro ao excluir oportunidade:', err);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao excluir a oportunidade. Tente novamente.",
      });
      setShowConfirmDelete(false);
    }
  };
  
  // Função para lidar com mudanças nos campos do formulário
  const handleFormChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (error || !oportunidade) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-destructive/15 text-destructive p-4 rounded-md">
          <h3 className="font-medium">Erro</h3>
          <p>{error || 'Oportunidade não encontrada'}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/opportunities')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para a lista
          </Button>
        </div>
      </div>
    );
  }
  
  const statusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'contato': return 'bg-blue-500';
      case 'negociação': return 'bg-amber-500';
      case 'ganho': return 'bg-green-500';
      case 'perdido': return 'bg-red-500';
      case 'sem contato': return 'bg-gray-500';
      default: return 'bg-slate-500';
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };
  
  const tipoOportunidadeLabel = (tipo: string) => {
    switch (tipo) {
      case 'intragrupo': return 'Intragrupo';
      case 'externa_entrada': return 'Externa (Entrada)';
      case 'externa_saida': return 'Externa (Saída)';
      default: return tipo;
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/opportunities')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{oportunidade.nome_projeto || 'Oportunidade sem título'}</h1>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Criada em {formatDate(oportunidade.data_criacao || '')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <Button variant="outline" onClick={() => setEditMode(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveChanges}>
                Salvar Alterações
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setEditMode(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setShowConfirmDelete(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Modal de confirmação de exclusão */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[400px]">
            <CardHeader>
              <CardTitle>Confirmar exclusão</CardTitle>
              <CardDescription>
                Tem certeza que deseja excluir esta oportunidade? Esta ação não pode ser desfeita.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowConfirmDelete(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteOpportunity}>
                Excluir Oportunidade
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
      
      {/* Conteúdo principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna da esquerda - Detalhes da oportunidade */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Detalhes da Oportunidade</CardTitle>
                <Badge 
                  className={`${statusColor(oportunidade.status)}`}
                >
                  {oportunidade.status}
                </Badge>
              </div>
              <Badge variant="outline" className="mt-2">
                {tipoOportunidadeLabel(oportunidade.tipo_oportunidade)}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Lead</h3>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{oportunidade.nome_empresa_lead}</span>
                </div>
                {oportunidade.nome_contato_lead && (
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{oportunidade.nome_contato_lead}</span>
                  </div>
                )}
                {oportunidade.email_lead && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Email: {oportunidade.email_lead}
                  </div>
                )}
                {oportunidade.telefone_lead && (
                  <div className="text-sm text-muted-foreground">
                    Telefone: {oportunidade.telefone_lead}
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Fluxo da Oportunidade</h3>
                {oportunidade.tipo_oportunidade === 'intragrupo' && (
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5 text-muted-foreground rotate-90 lg:rotate-0" />
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-2">
                      <div className="p-3 bg-accent rounded-md">
                        <div className="text-xs text-muted-foreground">De:</div>
                        <div className="font-medium">{oportunidade.empresa_origem}</div>
                      </div>
                      <div className="p-3 bg-accent rounded-md">
                        <div className="text-xs text-muted-foreground">Para:</div>
                        <div className="font-medium">{oportunidade.empresa_destino}</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {oportunidade.tipo_oportunidade === 'externa_entrada' && (
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5 text-muted-foreground rotate-90 lg:rotate-0" />
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-2">
                      <div className="p-3 bg-accent rounded-md">
                        <div className="text-xs text-muted-foreground">De:</div>
                        <div className="font-medium">{oportunidade.parceiro_origem}</div>
                      </div>
                      <div className="p-3 bg-accent rounded-md">
                        <div className="text-xs text-muted-foreground">Para:</div>
                        <div className="font-medium">{oportunidade.empresa_destino}</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {oportunidade.tipo_oportunidade === 'externa_saida' && (
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5 text-muted-foreground rotate-90 lg:rotate-0" />
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-2">
                      <div className="p-3 bg-accent rounded-md">
                        <div className="text-xs text-muted-foreground">De:</div>
                        <div className="font-medium">{oportunidade.empresa_origem}</div>
                      </div>
                      <div className="p-3 bg-accent rounded-md">
                        <div className="text-xs text-muted-foreground">Para:</div>
                        <div className="font-medium">
                          {oportunidade.parceiros_destino?.join(', ') || '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-4">
                  <div className="text-xs text-muted-foreground">Responsável:</div>
                  <div className="font-medium">{oportunidade.nome_responsavel || '-'}</div>
                </div>
              </div>
              
              <Separator />
              
              {/* Informações do Projeto - Editáveis */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Detalhes do Projeto</h3>
                {editMode ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="nome_projeto">Nome do Projeto</Label>
                        <Input 
                          id="nome_projeto"
                          value={formData.nome_projeto || ''}
                          onChange={(e) => handleFormChange('nome_projeto', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select 
                          value={String(formData.id_status_atual)} 
                          onValueChange={(value) => handleFormChange('id_status_atual', Number(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um status" />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem 
                                key={status.id_status} 
                                value={String(status.id_status)}
                              >
                                {status.nome_status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="valor_mensal">Valor Mensal (R$)</Label>
                        <Input 
                          id="valor_mensal"
                          type="number"
                          value={formData.valor_proposta_mensal || ''}
                          onChange={(e) => handleFormChange('valor_proposta_mensal', Number(e.target.value))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="aportes">Número de Aportes</Label>
                        <Input 
                          id="aportes"
                          type="number"
                          value={formData.numero_aportes || ''}
                          onChange={(e) => handleFormChange('numero_aportes', Number(e.target.value))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="valor_total">Valor Total (R$)</Label>
                        <Input 
                          id="valor_total"
                          type="number"
                          value={formData.valor_total_projeto || ''}
                          onChange={(e) => handleFormChange('valor_total_projeto', Number(e.target.value))}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="quarter">Quarter</Label>
                        <Select 
                          value={formData.quarter_oportunidade || ''} 
                          onValueChange={(value) => handleFormChange('quarter_oportunidade', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um quarter" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Q1">Q1</SelectItem>
                            <SelectItem value="Q2">Q2</SelectItem>
                            <SelectItem value="Q3">Q3</SelectItem>
                            <SelectItem value="Q4">Q4</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="mes">Mês</Label>
                        <Select 
                          value={formData.mes_oportunidade?.toString() || ''} 
                          onValueChange={(value) => handleFormChange('mes_oportunidade', Number(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um mês" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                              <SelectItem key={month} value={month.toString()}>
                                {new Date(0, month - 1).toLocaleString('default', { month: 'long' })}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ano">Ano</Label>
                        <Input 
                          id="ano"
                          type="number"
                          value={formData.ano_oportunidade || ''}
                          onChange={(e) => handleFormChange('ano_oportunidade', Number(e.target.value))}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="descricao_servicos">Descrição dos Serviços</Label>
                      <Textarea 
                        id="descricao_servicos"
                        value={formData.descricao_servicos || ''}
                        onChange={(e) => handleFormChange('descricao_servicos', e.target.value)}
                        className="min-h-[100px]"
                        placeholder="Descreva os serviços oferecidos nesta oportunidade"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="observacoes">Observações Gerais</Label>
                      <Textarea 
                        id="observacoes"
                        value={formData.observacoes || ''}
                        onChange={(e) => handleFormChange('observacoes', e.target.value)}
                        className="min-h-[100px]"
                        placeholder="Adicione observações gerais sobre a oportunidade"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <div className="text-xs text-muted-foreground">Nome do Projeto</div>
                        <div className="font-medium">{oportunidade.nome_projeto || '-'}</div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-muted-foreground">Status</div>
                        <div>
                          <Badge className={`${statusColor(oportunidade.status)}`}>
                            {oportunidade.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <div className="text-xs text-muted-foreground">Valor Mensal</div>
                        <div className="font-medium">
                          {oportunidade.valor_proposta_mensal 
                            ? `R$ ${oportunidade.valor_proposta_mensal.toLocaleString('pt-BR')}` 
                            : '-'}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-muted-foreground">Número de Aportes</div>
                        <div className="font-medium">{oportunidade.numero_aportes || '-'}</div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-muted-foreground">Valor Total do Projeto</div>
                        <div className="font-medium">
                          {oportunidade.valor_total_projeto 
                            ? `R$ ${oportunidade.valor_total_projeto.toLocaleString('pt-BR')}` 
                            : '-'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <div className="text-xs text-muted-foreground">Quarter</div>
                        <div className="font-medium">{oportunidade.quarter_oportunidade || '-'}</div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-muted-foreground">Mês</div>
                        <div className="font-medium">
                          {oportunidade.mes_oportunidade 
                            ? new Date(0, oportunidade.mes_oportunidade - 1).toLocaleString('default', { month: 'long' }) 
                            : '-'}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-muted-foreground">Ano</div>
                        <div className="font-medium">{oportunidade.ano_oportunidade || '-'}</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Descrição dos Serviços</div>
                      <div className="p-3 bg-accent rounded-md">
                        {oportunidade.descricao_servicos || 'Sem descrição de serviços'}
                      </div>
                    </div>
                    
                    {oportunidade.observacoes && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Observações Gerais</div>
                        <div className="p-3 bg-accent rounded-md">
                          {oportunidade.observacoes}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Histórico de Observações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Textarea 
                  value={novaObservacao} 
                  onChange={(e) => setNovaObservacao(e.target.value)}
                  placeholder="Adicione uma nova observação sobre esta oportunidade..." 
                  className="flex-1"
                />
                <Button 
                  className="self-end"
                  onClick={handleAddObservacao}
                  disabled={!novaObservacao.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </Button>
              </div>
              
              <Separator />
              
              {observacoes.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  Nenhuma observação registrada para esta oportunidade.
                </div>
              ) : (
                <div className="space-y-4">
                  {observacoes.map((obs) => (
                    <div key={obs.id_observacao} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">{obs.usuarios?.nome_usuario || 'Usuário'}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(obs.data_criacao)}
                        </div>
                      </div>
                      <p className="text-sm">{obs.conteudo}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Coluna da direita - Painéis laterais */}
        <div className="space-y-6">
          {/* Timeline de Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Status da Oportunidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-4 top-0 h-full w-px bg-muted-foreground/20"></div>
                
                <div className="space-y-8">
                  {['Contato', 'Negociação', 'Proposta', 'Ganho'].map((status, index) => {
                    const isActive = index === 1; // Simulando que o status atual é "Negociação"
                    return (
                      <div key={status} className="relative pl-10">
                        <div className={`absolute left-2 w-4 h-4 rounded-full border-2 ${
                          isActive 
                            ? 'bg-primary border-primary' 
                            : index < 1 ? 'bg-primary/20 border-primary' : 'bg-background border-muted-foreground/30'
                        }`}>
                          {isActive && <div className="absolute inset-0 rounded-full animate-ping bg-primary/30"></div>}
                        </div>
                        <div className={`font-medium ${isActive ? 'text-primary' : index < 1 ? '' : 'text-muted-foreground/70'}`}>
                          {status}
                        </div>
                        {isActive && (
                          <div className="text-sm text-muted-foreground mt-1">
                            Atualizado em 15/05/2023
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Informações rápidas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <PanelRight className="h-5 w-5" />
                Informações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-muted-foreground">ID da Oportunidade</div>
                  <div className="font-medium">#{oportunidade.id_oportunidade}</div>
                </div>
                
                <div>
                  <div className="text-xs text-muted-foreground">Data de Envio/Recebimento</div>
                  <div className="font-medium">
                    {formatDate(oportunidade.data_envio_recebimento)}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-muted-foreground">Última Atualização</div>
                  <div className="font-medium">
                    {oportunidade.data_ultima_modificacao 
                      ? formatDate(oportunidade.data_ultima_modificacao)
                      : 'Não disponível'}
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    Oportunidade
                  </Badge>
                  
                  <Badge variant="outline" className="flex items-center gap-1">
                    <FileSpreadsheet className="h-3 w-3" />
                    Projeto
                  </Badge>
                  
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Lead
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Ações rápidas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Enviar Email ao Cliente
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetail;
