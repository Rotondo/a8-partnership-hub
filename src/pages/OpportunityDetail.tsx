import React, { useEffect, useState, useCallback } from "react"; // Adicionado useCallback
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Edit, Mail, Phone, Paperclip, Calendar, FileText, AlertTriangle, Download, Upload, Trash2, Loader2 } from "lucide-react"; // Adicionado Upload, Trash2, Loader2
import { supabase } from "@/integrations/supabase/client"; // Adicionado
import { Oportunidade, StatusOportunidade, HistoricoAlteracoesOportunidade, ObservacaoOportunidade, AnexoOportunidade, Lead } from "@/types"; // Ajustado e adicionado tipos
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Função para formatar data
const formatDate = (dateString: string | Date) => {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const OpportunityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [opportunity, setOpportunity] = useState<Oportunidade | null>(null);
  const [history, setHistory] = useState<HistoricoAlteracoesOportunidade[]>([]);
  const [notes, setNotes] = useState<ObservacaoOportunidade[]>([]);
  const [attachments, setAttachments] = useState<AnexoOportunidade[]>([]);
  const [statusOptions, setStatusOptions] = useState<StatusOportunidade[]>([]); 

  const [loading, setLoading] = useState(true);
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [newStatusId, setNewStatusId] = useState<number | null>(null);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [addNoteOpen, setAddNoteOpen] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isConfirmDeleteAttachmentOpen, setIsConfirmDeleteAttachmentOpen] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<AnexoOportunidade | null>(null);

  const fetchOpportunityDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      // Fetch Oportunidade
      const { data: oppData, error: oppError } = await supabase
        .from("oportunidades")
        .select(`
          *,
          leads (*),
          empresas_grupo_origem:empresa_origem_id (id, nome),
          empresas_grupo_destino:empresa_destino_id (id, nome),
          parceiros_externos:parceiro_externo_id (id, nome),
          status_oportunidade:status_id (id, nome),
          usuarios:id_responsavel_envio_recebimento (id, nome_completo)
        `)
        .eq("id", parseInt(id))
        .single();

      if (oppError) throw oppError;
      setOpportunity(oppData as Oportunidade);

      // Fetch Histórico
      const { data: histData, error: histError } = await supabase
        .from("historico_alteracoes_oportunidade")
        .select("*, usuarios:id_usuario_modificacao (nome_completo)")
        .eq("oportunidade_id", parseInt(id))
        .order("data_modificacao", { ascending: false });
      if (histError) throw histError;
      setHistory(histData || []);

      // Fetch Observações
      const { data: notesData, error: notesError } = await supabase
        .from("observacoes_oportunidade")
        .select("*, usuarios:id_usuario (nome_completo)")
        .eq("oportunidade_id", parseInt(id))
        .order("data_criacao", { ascending: false });
      if (notesError) throw notesError;
      setNotes(notesData || []);

      // Fetch Anexos
      const { data: attachData, error: attachError } = await supabase
        .from("anexos_oportunidade")
        .select("*, usuarios:id_usuario_upload (nome_completo)")
        .eq("oportunidade_id", parseInt(id))
        .order("data_upload", { ascending: false });
      if (attachError) throw attachError;
      setAttachments(attachData || []);

      // Fetch Status Options
      const { data: statusData, error: statusErr } = await supabase.from("status_oportunidade").select("*");
      if (statusErr) throw statusErr;
      setStatusOptions(statusData || []);

    } catch (error) {
      console.error("Erro ao buscar detalhes da oportunidade:", error);
      toast.error("Falha ao carregar detalhes da oportunidade.");
      setOpportunity(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOpportunityDetails();
  }, [fetchOpportunityDetails]);

  const handleStatusUpdate = async () => {
    if (!newStatusId || !opportunity) return;
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      toast.error("Usuário não autenticado.");
      return;
    }

    const oldStatusName = opportunity.status_oportunidade?.nome || "Desconhecido";
    const newStatusObj = statusOptions.find(s => s.id === newStatusId);
    const newStatusName = newStatusObj?.nome || "Desconhecido";

    try {
      // 1. Atualizar Oportunidade
      const { error: updateError } = await supabase
        .from("oportunidades")
        .update({ status_id: newStatusId })
        .eq("id", opportunity.id);
      if (updateError) throw updateError;

      // 2. Adicionar ao Histórico
      const { error: historyError } = await supabase
        .from("historico_alteracoes_oportunidade")
        .insert({
          oportunidade_id: opportunity.id,
          id_usuario_modificacao: userData.user.id,
          campo_modificado: "status_id",
          valor_anterior: opportunity.status_id?.toString() || null,
          valor_novo: newStatusId.toString(),
          descricao_modificacao: `Status alterado de '${oldStatusName}' para '${newStatusName}'`
        });
      if (historyError) throw historyError;

      toast.success(`Status da oportunidade atualizado para ${newStatusName}`);
      setStatusUpdateOpen(false);
      setNewStatusId(null);
      fetchOpportunityDetails(); // Recarregar dados
    } catch (error: any) {
      console.error("Erro ao atualizar status:", error);
      toast.error(`Falha ao atualizar status: ${error.message}`);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteContent.trim() || !opportunity) return;
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      toast.error("Usuário não autenticado.");
      return;
    }
    try {
      // 1. Adicionar Observação
      const { error: noteError } = await supabase
        .from("observacoes_oportunidade")
        .insert({
          oportunidade_id: opportunity.id,
          id_usuario: userData.user.id,
          conteudo: newNoteContent,
        });
      if (noteError) throw noteError;

      // 2. Adicionar ao Histórico (opcional, mas bom para rastreabilidade)
      const { error: historyError } = await supabase
        .from("historico_alteracoes_oportunidade")
        .insert({
          oportunidade_id: opportunity.id,
          id_usuario_modificacao: userData.user.id,
          campo_modificado: "observacao",
          descricao_modificacao: "Nova observação adicionada.",
          valor_novo: newNoteContent.substring(0, 255) // Limitar para o campo de histórico
        });
      // Não tratar erro de histórico como crítico para a nota
      if (historyError) console.warn("Erro ao adicionar nota ao histórico:", historyError);

      toast.success("Nota adicionada com sucesso");
      setAddNoteOpen(false);
      setNewNoteContent("");
      fetchOpportunityDetails(); // Recarregar dados
    } catch (error: any) {
      console.error("Erro ao adicionar nota:", error);
      toast.error(`Falha ao adicionar nota: ${error.message}`);
    }
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFileToUpload(event.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!fileToUpload || !opportunity) return;
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      toast.error("Usuário não autenticado.");
      return;
    }
    setUploadingFile(true);
    try {
      const fileExt = fileToUpload.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `oportunidade_${opportunity.id}/${fileName}`;

      // 1. Upload para Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("anexos_oportunidades") // Nome do seu bucket
        .upload(filePath, fileToUpload);
      if (uploadError) throw uploadError;

      // 2. Obter URL pública
      const { data: publicUrlData } = supabase.storage
        .from("anexos_oportunidades")
        .getPublicUrl(filePath);
      
      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error("Não foi possível obter a URL pública do arquivo.");
      }

      // 3. Adicionar registro na tabela anexos_oportunidade
      const { error: dbError } = await supabase
        .from("anexos_oportunidade")
        .insert({
          oportunidade_id: opportunity.id,
          id_usuario_upload: userData.user.id,
          nome_arquivo: fileToUpload.name,
          url_arquivo: publicUrlData.publicUrl,
          tipo_arquivo: fileToUpload.type,
          tamanho_arquivo: fileToUpload.size,
          path_storage: filePath // Guardar o path para facilitar a exclusão
        });
      if (dbError) throw dbError;

      // 4. Adicionar ao Histórico
      await supabase.from("historico_alteracoes_oportunidade").insert({
        oportunidade_id: opportunity.id,
        id_usuario_modificacao: userData.user.id,
        campo_modificado: "anexo",
        descricao_modificacao: `Anexo '${fileToUpload.name}' adicionado.`,
      });

      toast.success("Arquivo enviado com sucesso!");
      setFileToUpload(null);
      fetchOpportunityDetails(); // Recarregar
    } catch (error: any) {
      console.error("Erro no upload do arquivo:", error);
      toast.error(`Falha no upload: ${error.message}`);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteAttachment = async () => {
    if (!attachmentToDelete || !opportunity) return;
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      toast.error("Usuário não autenticado.");
      return;
    }
    try {
      // 1. Deletar do Supabase Storage
      if (attachmentToDelete.path_storage) {
        const { error: storageError } = await supabase.storage
          .from("anexos_oportunidades")
          .remove([attachmentToDelete.path_storage]);
        if (storageError) console.warn("Erro ao deletar arquivo do storage, pode já ter sido removido:", storageError);
      }

      // 2. Deletar da tabela anexos_oportunidade
      const { error: dbError } = await supabase
        .from("anexos_oportunidade")
        .delete()
        .eq("id", attachmentToDelete.id);
      if (dbError) throw dbError;

      // 3. Adicionar ao Histórico
      await supabase.from("historico_alteracoes_oportunidade").insert({
        oportunidade_id: opportunity.id,
        id_usuario_modificacao: userData.user.id,
        campo_modificado: "anexo",
        descricao_modificacao: `Anexo '${attachmentToDelete.nome_arquivo}' removido.`,
      });

      toast.success("Anexo removido com sucesso!");
      fetchOpportunityDetails(); // Recarregar
    } catch (error: any) {
      console.error("Erro ao remover anexo:", error);
      toast.error(`Falha ao remover anexo: ${error.message}`);
    } finally {
      setIsConfirmDeleteAttachmentOpen(false);
      setAttachmentToDelete(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full p-12">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando detalhes da oportunidade...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!opportunity) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full p-12 text-center">
          <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Oportunidade Não Encontrada</h2>
          <p className="text-muted-foreground mb-6">
            A oportunidade que você está procurando não existe ou foi removida.
          </p>
          <Button onClick={() => navigate("/opportunities")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Oportunidades
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const getOpportunityTypeLabel = (type: string | undefined) => {
    if (!type) return "Indefinido";
    const labels: Record<string, string> = {
      intragrupo: "Oportunidade Intragrupo",
      externa_entrada: "Oportunidade Externa Recebida",
      externa_saida: "Oportunidade Externa Enviada",
    };
    return labels[type] || type;
  };

  const getStatusColor = (statusName: string | undefined) => {
    if (!statusName) return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    const lowerStatus = statusName.toLowerCase();
    if (lowerStatus.includes("nova")) return "bg-purple-100 text-purple-800 hover:bg-purple-100";
    if (lowerStatus.includes("andamento")) return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    if (lowerStatus.includes("ganha")) return "bg-green-100 text-green-800 hover:bg-green-100";
    if (lowerStatus.includes("perdida")) return "bg-red-100 text-red-800 hover:bg-red-100";
    if (lowerStatus.includes("espera")) return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/opportunities")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Oportunidades
        </Button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h1 className="text-3xl font-bold text-aeight-dark cursor-help">
                    {opportunity.leads?.nome_empresa || "Empresa Cliente N/A"}
                  </h1>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Nome da empresa cliente para esta oportunidade.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-sm">
                ID: {opportunity.id}
              </Badge>
              <Badge variant="outline" className={getStatusColor(opportunity.status_oportunidade?.nome)}>
                {opportunity.status_oportunidade?.nome || "Status N/A"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {getOpportunityTypeLabel(opportunity.tipo_oportunidade)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Dialog open={statusUpdateOpen} onOpenChange={setStatusUpdateOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="lg">
                  <Edit className="mr-2 h-4 w-4" /> Atualizar Status
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Atualizar Status da Oportunidade</DialogTitle>
                  <DialogDescription>
                    Selecione o novo status para esta oportunidade.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Select onValueChange={(value) => setNewStatusId(Number(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o novo status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.id} value={status.id.toString()}>
                          {status.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setStatusUpdateOpen(false)}>Cancelar</Button>
                  <Button onClick={handleStatusUpdate} disabled={!newStatusId}>Salvar Novo Status</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <p className="text-xs text-muted-foreground">
              Responsável: {opportunity.usuarios?.nome_completo || "N/A"}
            </p>
            <p className="text-xs text-muted-foreground">
              Criada em: {formatDate(opportunity.data_envio)}
            </p>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="grid md:grid-cols-3 gap-6">
        {/* Coluna Esquerda e Central - Conteúdo Principal */}
        <div className="md:col-span-2 space-y-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card>
                  <CardHeader>
                    <CardTitle>Detalhes da Oportunidade</CardTitle>
                    <CardDescription>
                      Informações sobre a origem, destino e o lead associado.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      <div>
                        <p className="text-sm font-medium">Empresa de Origem</p>
                        <p>
                          {opportunity.tipo_oportunidade === "intragrupo" || opportunity.tipo_oportunidade === "externa_saida"
                            ? opportunity.empresas_grupo_origem?.nome || "N/A"
                            : opportunity.parceiros_externos?.nome || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Empresa de Destino</p>
                        <p>
                          {opportunity.tipo_oportunidade === "intragrupo" || opportunity.tipo_oportunidade === "externa_entrada"
                            ? opportunity.empresas_grupo_destino?.nome || "N/A"
                            : opportunity.parceiros_externos?.nome || "N/A"} {/* Para saida, pode ser múltiplos */}
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="text-md font-semibold mb-2">Informações do Lead</h3>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                          <p className="text-sm font-medium">Empresa Cliente</p>
                          <p>{opportunity.leads?.nome_empresa || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Contato Principal</p>
                          <p>{opportunity.leads?.nome_contato || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            <span className="flex items-center">
                              <Mail className="h-4 w-4 mr-1" /> Email
                            </span>
                          </p>
                          <p>
                            <a
                              href={`mailto:${opportunity.leads?.email}`}
                              className="text-aeight-blue hover:underline"
                            >
                              {opportunity.leads?.email || "N/A"}
                            </a>
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            <span className="flex items-center">
                              <Phone className="h-4 w-4 mr-1" /> Telefone
                            </span>
                          </p>
                          <p>
                            <a
                              href={`tel:${opportunity.leads?.telefone}`}
                              className="text-aeight-blue hover:underline"
                            >
                              {opportunity.leads?.telefone || "N/A"}
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Detalhes completos da oportunidade, incluindo informações básicas, detalhes da parceria e dados de contato.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Tabs defaultValue="notes">
            <TabsList className="w-full">
              <TabsTrigger value="notes" className="flex-1">
                Notas
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1">
                Histórico
              </TabsTrigger>
              <TabsTrigger value="attachments" className="flex-1">
                Anexos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notes" className="pt-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg">Observações</CardTitle>
                        <Dialog open={addNoteOpen} onOpenChange={setAddNoteOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3 mr-1.5" /> Adicionar Nota
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Adicionar Nova Observação</DialogTitle>
                              <DialogDescription>
                                Escreva sua observação sobre esta oportunidade.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <Textarea
                                placeholder="Digite sua nota aqui..."
                                value={newNoteContent}
                                onChange={(e) => setNewNoteContent(e.target.value)}
                                rows={5}
                              />
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setAddNoteOpen(false)}>Cancelar</Button>
                              <Button onClick={handleAddNote} disabled={!newNoteContent.trim()}>Salvar Nota</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </CardHeader>
                      <CardContent>
                        {notes.length > 0 ? (
                          <div className="space-y-4">
                            {notes.map(note => (
                              <div key={note.id} className="p-3 border rounded-md bg-muted/20">
                                <p className="text-sm whitespace-pre-wrap">{note.conteudo}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  Por: {note.usuarios?.nome_completo || "Desconhecido"} em {formatDate(note.data_criacao)}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center p-6">
                            <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                            <h3 className="text-lg font-medium mb-1">Ainda Sem Notas</h3>
                            <p className="text-muted-foreground">
                              Nenhuma nota foi adicionada a esta oportunidade ainda.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Anotações e observações importantes sobre esta oportunidade.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TabsContent>

            <TabsContent value="history" className="pt-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Histórico de Alterações</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {history.length > 0 ? (
                          <div className="relative">
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted -z-10" /> {/* Ajuste z-index */}
                            <ol className="space-y-6">
                              {history.map((entry) => (
                                <li key={entry.id} className="relative pl-10">
                                  <div className="absolute left-0 top-1.5 flex h-8 w-8 items-center justify-center rounded-full border bg-background">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-sm text-muted-foreground">
                                      {formatDate(entry.data_modificacao)} - {entry.usuarios?.nome_completo || "Sistema"}
                                    </span>
                                    <span className="font-medium">
                                      {entry.descricao_modificacao || `Campo '${entry.campo_modificado}' alterado`}
                                    </span>
                                    {entry.campo_modificado === "status_id" && entry.valor_anterior && entry.valor_novo && (
                                      <div className="text-sm">
                                        De: <Badge variant="outline" className={getStatusColor(statusOptions.find(s=>s.id === parseInt(entry.valor_anterior!))?.nome)}>{statusOptions.find(s=>s.id === parseInt(entry.valor_anterior!))?.nome || entry.valor_anterior}</Badge>
                                        {' -> '}
                                        Para: <Badge variant="outline" className={getStatusColor(statusOptions.find(s=>s.id === parseInt(entry.valor_novo!))?.nome)}>{statusOptions.find(s=>s.id === parseInt(entry.valor_novo!))?.nome || entry.valor_novo}</Badge>
                                      </div>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ol>
                          </div>
                        ) : (
                          <div className="text-center p-6">
                            <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                            <h3 className="text-lg font-medium mb-1">Nenhum Histórico Disponível</h3>
                            <p className="text-muted-foreground">
                              O histórico desta oportunidade será registrado aqui.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Histórico completo de todas as alterações e atualizações feitas nesta oportunidade.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TabsContent>

            <TabsContent value="attachments" className="pt-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg">Anexos</CardTitle>
                        <div>
                          <Input type="file" id="file-upload" className="hidden" onChange={handleFileSelected} />
                          <Button variant="outline" size="sm" onClick={() => document.getElementById('file-upload')?.click()} disabled={uploadingFile}>
                            <Upload className="h-3 w-3 mr-1.5" /> {uploadingFile ? "Enviando..." : "Adicionar Anexo"}
                          </Button>
                          {fileToUpload && (
                            <Button size="sm" onClick={handleFileUpload} disabled={uploadingFile} className="ml-2">
                              {uploadingFile ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Upload"}
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {attachments.length > 0 ? (
                          <div className="space-y-4">
                            {attachments.map((attachment) => (
                              <div
                                key={attachment.id}
                                className="flex items-center justify-between p-3 border rounded-md bg-muted/20"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="bg-muted/20 p-2 rounded-md">
                                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <div>
                                    <a href={attachment.url_arquivo} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
                                      {attachment.nome_arquivo}
                                    </a>
                                    <div className="text-xs text-muted-foreground">
                                      {`${attachment.tamanho_arquivo ? (attachment.tamanho_arquivo / 1024 / 1024).toFixed(2) : '0.00'} MB • 
                                      ${formatDate(attachment.data_upload)} • 
                                      Por: ${attachment.usuarios?.nome_completo || "Desconhecido"}`}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="icon" asChild>
                                    <a href={attachment.url_arquivo} target="_blank" rel="noopener noreferrer">
                                      <Download className="h-4 w-4" />
                                    </a>
                                  </Button>
                                  <AlertDialog open={isConfirmDeleteAttachmentOpen && attachmentToDelete?.id === attachment.id} onOpenChange={(open) => {
                                    if (!open) {
                                      setIsConfirmDeleteAttachmentOpen(false);
                                      setAttachmentToDelete(null);
                                    }
                                  }}>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => {setAttachmentToDelete(attachment); setIsConfirmDeleteAttachmentOpen(true);}}>
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Confirmar Exclusão de Anexo</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Tem certeza que deseja excluir o anexo "{attachment.nome_arquivo}"? Esta ação não pode ser desfeita.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel onClick={() => {setIsConfirmDeleteAttachmentOpen(false); setAttachmentToDelete(null);}}>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteAttachment} className="bg-red-600 hover:bg-red-700">Excluir Anexo</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center p-6">
                            <Paperclip className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                            <h3 className="text-lg font-medium mb-1">Sem Anexos</h3>
                            <p className="text-muted-foreground">
                              Nenhum arquivo foi anexado a esta oportunidade ainda.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Arquivos e documentos anexados a esta oportunidade.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TabsContent>
          </Tabs>
        </div>

        {/* Coluna Direita - Informações Secundárias */}
        <div className="space-y-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card>
                  <CardHeader>
                    <CardTitle>Status da Oportunidade</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Status Atual</p>
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(opportunity.status_oportunidade?.nome)} text-base px-4 py-1.5`}
                        >
                          {opportunity.status_oportunidade?.nome || "Status N/A"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                  {/* Footer removido para consistência, botão de atualizar status já está no header da página */}
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Status atual da oportunidade.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Card de Ações foi removido pois os botões principais estão no header ou dentro dos cards de conteúdo */}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="border-red-200 bg-red-50/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-red-700">Zona de Perigo</CardTitle>
                    <CardDescription className="text-red-600">
                      Ações irreversíveis para esta oportunidade.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                          Deletar Oportunidade
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Tem absoluta certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente esta
                            oportunidade e todos os dados associados do sistema.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={async () => {
                              try {
                                if (!opportunity || !opportunity.id) return;
                                const { error } = await supabase.from("oportunidades").delete().eq("id", opportunity.id);
                                if (error) throw error;
                                toast.success("Oportunidade excluída com sucesso!");
                                navigate("/opportunities");
                              } catch (err: any) {
                                toast.error(`Falha ao excluir oportunidade: ${err.message}`);
                              }
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Sim, Deletar Oportunidade
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Opções de exclusão permanente desta oportunidade. Use com cuidado!</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OpportunityDetail;

