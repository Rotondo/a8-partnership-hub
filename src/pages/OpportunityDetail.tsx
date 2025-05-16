
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  FileText, 
  MessageSquare, 
  History, 
  ExternalLink, 
  AlertCircle,
  Loader2 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { oportunidadeService, historicoAlteracoesService, observacaoOportunidadeService, anexoOportunidadeService } from "@/services/supabaseService";
import { Oportunidade, HistoricoAlteracoesOportunidade, ObservacaoOportunidade, AnexoOportunidade } from "@/types";

const OpportunityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [oportunidade, setOportunidade] = useState<Oportunidade | null>(null);
  const [historico, setHistorico] = useState<HistoricoAlteracoesOportunidade[]>([]);
  const [observacoes, setObservacoes] = useState<ObservacaoOportunidade[]>([]);
  const [anexos, setAnexos] = useState<AnexoOportunidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOportunidadeData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        
        // Buscar dados da oportunidade
        const oppData = await oportunidadeService.getById(Number(id));
        if (!oppData) {
          setError("Oportunidade não encontrada");
          setLoading(false);
          return;
        }
        setOportunidade(oppData);
        
        // Buscar histórico
        const historicoData = await historicoAlteracoesService.getByOportunidadeId(Number(id));
        setHistorico(historicoData);
        
        // Buscar observações
        const obsData = await observacaoOportunidadeService.getByOportunidadeId(Number(id));
        setObservacoes(obsData);
        
        // Buscar anexos
        const anexosData = await anexoOportunidadeService.getByOportunidadeId(Number(id));
        setAnexos(anexosData);
        
        setLoading(false);
      } catch (err) {
        console.error("Erro ao buscar detalhes da oportunidade:", err);
        setError("Erro ao buscar detalhes da oportunidade");
        setLoading(false);
      }
    };

    fetchOportunidadeData();
  }, [id]);

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando dados da oportunidade...</span>
      </div>
    );
  }

  if (error || !oportunidade) {
    return (
      <div className="p-6">
        <Card className="p-6 bg-red-50 text-red-600">
          <CardHeader>
            <CardTitle>Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || "Oportunidade não encontrada"}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.history.back()}>
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            Oportunidade #{oportunidade.id}
          </h1>
          <p className="text-muted-foreground">
            {getOpportunityTypeLabel(oportunidade.tipo_oportunidade)} | Criada em {formatDate(oportunidade.data_criacao)}
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button variant="outline">Editar</Button>
          <Button variant="destructive">Excluir</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {getStatusBadge(oportunidade.status_oportunidade?.nome || '')}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Responsável
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {oportunidade.usuarios?.nome_completo || "-"}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Data de Envio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {formatDate(oportunidade.data_envio)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informações da Oportunidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">Origem</h3>
                <p>
                  {oportunidade.tipo_oportunidade === 'externa_entrada' 
                    ? oportunidade.parceiros_externos?.nome
                    : oportunidade.empresas_grupo_origem?.nome}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-1">Destino</h3>
                <p>
                  {oportunidade.tipo_oportunidade === 'externa_saida'
                    ? oportunidade.oportunidade_parceiro_saida && oportunidade.oportunidade_parceiro_saida.length > 0
                      ? oportunidade.oportunidade_parceiro_saida.map(p => p.parceiros_externos?.nome).join(', ')
                      : '-'
                    : oportunidade.empresas_grupo_destino?.nome || '-'}
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-1">Observações</h3>
                <p>{oportunidade.observacoes || "Nenhuma observação adicional."}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Dados do Lead</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">Empresa</h3>
                <p>{oportunidade.leads?.nome_empresa}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-1">Contato</h3>
                <p>{oportunidade.leads?.nome_contato}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-1">Email</h3>
                <p>{oportunidade.leads?.email || "-"}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-1">Telefone</h3>
                <p>{oportunidade.leads?.telefone || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="historico" className="mb-8">
        <TabsList>
          <TabsTrigger value="historico" className="flex items-center gap-2">
            <History size={16} />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="observacoes" className="flex items-center gap-2">
            <MessageSquare size={16} />
            Observações
          </TabsTrigger>
          <TabsTrigger value="anexos" className="flex items-center gap-2">
            <FileText size={16} />
            Anexos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="historico" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Alterações</CardTitle>
            </CardHeader>
            <CardContent>
              {historico.length === 0 ? (
                <p className="text-muted-foreground">Nenhum registro histórico disponível.</p>
              ) : (
                <div className="space-y-4">
                  {historico.map((item) => (
                    <div key={item.id} className="border-l-2 border-gray-300 pl-4 py-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">
                          {item.usuarios?.nome_completo || "Usuário"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(item.data_modificacao)}
                        </span>
                      </div>
                      <p>{item.descricao_modificacao}</p>
                      {item.campo_modificado && (
                        <div className="text-sm text-muted-foreground mt-1">
                          <span className="font-medium">Campo:</span> {item.campo_modificado},
                          <span className="font-medium ml-2">De:</span> {item.valor_anterior || "-"},
                          <span className="font-medium ml-2">Para:</span> {item.valor_novo || "-"}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="observacoes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              {observacoes.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma observação disponível.</p>
              ) : (
                <div className="space-y-4">
                  {observacoes.map((obs) => (
                    <div key={obs.id} className="bg-muted p-4 rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold">{obs.usuarios?.nome_completo || "Usuário"}</div>
                        <div className="text-xs text-muted-foreground">{formatDate(obs.data_criacao)}</div>
                      </div>
                      <p>{obs.conteudo}</p>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6">
                <Button variant="outline" disabled className="w-full">
                  Adicionar Observação
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="anexos" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between">
                <span>Anexos</span>
                <Button variant="outline" disabled size="sm">
                  Adicionar Anexo
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {anexos.length === 0 ? (
                <p className="text-muted-foreground">Nenhum anexo disponível.</p>
              ) : (
                <div className="space-y-2">
                  {anexos.map((anexo) => (
                    <div key={anexo.id} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center gap-2">
                        <FileText size={20} className="text-muted-foreground" />
                        <div>
                          <div className="font-medium">{anexo.nome_arquivo}</div>
                          <div className="text-xs text-muted-foreground">
                            Enviado por {anexo.usuarios?.nome_completo || "Usuário"} em {formatDate(anexo.data_upload)}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={anexo.url_arquivo} target="_blank" rel="noopener noreferrer">
                          <Download size={16} />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OpportunityDetail;
