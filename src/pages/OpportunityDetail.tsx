
import React, { useEffect, useState } from "react";
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
import { ArrowLeft, Edit, Mail, Phone, Paperclip, Calendar, FileText, AlertTriangle, Download } from "lucide-react";
import { mockOpportunities, statusOptions } from "@/data/mockData";
import { Opportunity, OpportunityStatus, HistoryEntry, Attachment } from "@/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const OpportunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<OpportunityStatus | "">("");
  const [newNote, setNewNote] = useState("");
  const [addNoteOpen, setAddNoteOpen] = useState(false);

  useEffect(() => {
    // Em uma aplicação real, isso seria uma chamada de API
    const fetchOpportunity = () => {
      setLoading(true);
      setTimeout(() => {
        const foundOpportunity = mockOpportunities.find((o) => o.id === id);
        if (foundOpportunity) {
          setOpportunity(foundOpportunity);
        }
        setLoading(false);
      }, 500);
    };

    fetchOpportunity();
  }, [id]);

  const handleStatusUpdate = () => {
    if (!newStatus) return;

    // Atualiza o status da oportunidade (em uma aplicação real, isso seria uma chamada de API)
    setOpportunity((prev) => {
      if (!prev) return null;

      // Cria uma entrada de histórico para esta alteração
      const historyEntry: HistoryEntry = {
        id: `hist-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        user: "Usuário Atual", // Em uma aplicação real, isso seria o usuário logado
        action: `Status atualizado de ${prev.status} para ${newStatus}`,
        previousValue: prev.status,
        newValue: newStatus,
      };

      return {
        ...prev,
        status: newStatus as OpportunityStatus,
        history: [historyEntry, ...prev.history],
      };
    });

    toast.success(`Status da oportunidade atualizado para ${newStatus}`);
    setStatusUpdateOpen(false);
    setNewStatus("");
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    // Adiciona uma nota à oportunidade (em uma aplicação real, isso seria uma chamada de API)
    setOpportunity((prev) => {
      if (!prev) return null;

      // Cria uma entrada de histórico para esta nota
      const historyEntry: HistoryEntry = {
        id: `hist-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        user: "Usuário Atual", // Em uma aplicação real, isso seria o usuário logado
        action: "Nota adicionada",
        newValue: newNote,
      };

      return {
        ...prev,
        notes: prev.notes ? `${prev.notes}\n\n${newNote}` : newNote,
        history: [historyEntry, ...prev.history],
      };
    });

    toast.success("Nota adicionada com sucesso");
    setAddNoteOpen(false);
    setNewNote("");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
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

  const getOpportunityTypeLabel = (type: string) => {
    const labels = {
      internal: "Oportunidade Intragrupo",
      incoming: "Oportunidade Externa Recebida",
      outgoing: "Oportunidade Externa Enviada",
    };
    return labels[type as keyof typeof labels];
  };

  const getStatusColor = (status: OpportunityStatus) => {
    const colors = {
      New: "bg-purple-100 text-purple-800 hover:bg-purple-100",
      "In Progress": "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      Won: "bg-green-100 text-green-800 hover:bg-green-100",
      Lost: "bg-red-100 text-red-800 hover:bg-red-100",
      "On Hold": "bg-gray-100 text-gray-800 hover:bg-gray-100",
    };
    return colors[status];
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
                    {opportunity.targetCompanyName}
                  </h1>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Nome da empresa cliente para esta oportunidade.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex items-center gap-2 mt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="bg-aeight-blue/10 text-aeight-blue hover:bg-aeight-blue/10">
                      {getOpportunityTypeLabel(opportunity.type)}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Tipo de oportunidade: interna entre empresas do grupo ou externa com parceiros.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className={getStatusColor(opportunity.status)}
                    >
                      {opportunity.status}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Status atual da oportunidade no fluxo de vendas.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-sm text-muted-foreground">
                {opportunity.date}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Dialog open={statusUpdateOpen} onOpenChange={setStatusUpdateOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Atualizar Status
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Atualizar Status</DialogTitle>
                  <DialogDescription>
                    Altere o status desta oportunidade.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="status" className="mb-2 block">
                    Novo Status
                  </Label>
                  <Select
                    value={newStatus}
                    onValueChange={(value) => setNewStatus(value as OpportunityStatus)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setStatusUpdateOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleStatusUpdate} disabled={!newStatus}>
                    Atualizar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={addNoteOpen} onOpenChange={setAddNoteOpen}>
              <DialogTrigger asChild>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Adicionar Nota
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Nota</DialogTitle>
                  <DialogDescription>
                    Adicione uma nota a esta oportunidade.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Textarea
                    placeholder="Digite suas observações aqui..."
                    rows={5}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddNoteOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                    Adicionar Nota
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coluna Esquerda - Informações Principais */}
        <div className="col-span-2 space-y-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card>
                  <CardHeader>
                    <CardTitle>Detalhes da Oportunidade</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        Informações Básicas
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Empresa Cliente</p>
                          <p>{opportunity.targetCompanyName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Data de Criação</p>
                          <p>{opportunity.date}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Tipo</p>
                          <p>{getOpportunityTypeLabel(opportunity.type)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Responsável</p>
                          <p>{opportunity.responsibleName}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        Detalhes da Parceria
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {opportunity.type === "internal" && (
                          <>
                            <div>
                              <p className="text-sm font-medium">Empresa de Origem</p>
                              <p>{opportunity.sourceCompany}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Empresa de Destino</p>
                              <p>{opportunity.targetCompany}</p>
                            </div>
                          </>
                        )}

                        {opportunity.type === "incoming" && (
                          <>
                            <div>
                              <p className="text-sm font-medium">Parceiro Externo</p>
                              <p>{opportunity.partnerName}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Empresa de Destino</p>
                              <p>{opportunity.targetCompany}</p>
                            </div>
                          </>
                        )}

                        {opportunity.type === "outgoing" && (
                          <>
                            <div>
                              <p className="text-sm font-medium">Empresa de Origem</p>
                              <p>{opportunity.sourceCompany}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Parceiros Externos</p>
                              <p>{opportunity.partners.join(", ")}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        Informações de Contato
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Nome do Contato</p>
                          <p>{opportunity.contactName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            <span className="flex items-center">
                              <Mail className="h-4 w-4 mr-1" /> Email
                            </span>
                          </p>
                          <p>
                            <a
                              href={`mailto:${opportunity.contactEmail}`}
                              className="text-aeight-blue hover:underline"
                            >
                              {opportunity.contactEmail}
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
                              href={`tel:${opportunity.contactPhone}`}
                              className="text-aeight-blue hover:underline"
                            >
                              {opportunity.contactPhone}
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
                      <CardContent className="pt-6">
                        {opportunity.notes ? (
                          <div className="whitespace-pre-wrap">{opportunity.notes}</div>
                        ) : (
                          <div className="text-center p-6">
                            <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                            <h3 className="text-lg font-medium mb-1">Ainda Sem Notas</h3>
                            <p className="text-muted-foreground mb-4">
                              Nenhuma nota foi adicionada a esta oportunidade ainda
                            </p>
                            <Button
                              variant="outline"
                              onClick={() => setAddNoteOpen(true)}
                            >
                              Adicionar a Primeira Nota
                            </Button>
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
                      <CardContent className="pt-6 pb-2">
                        {opportunity.history.length > 0 ? (
                          <div className="relative">
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />
                            <ol className="space-y-6">
                              {opportunity.history.map((entry, index) => (
                                <li key={entry.id} className="relative pl-10">
                                  <div className="absolute left-0 top-1.5 flex h-8 w-8 items-center justify-center rounded-full border bg-background">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-sm text-muted-foreground">
                                      {entry.date} - {entry.user}
                                    </span>
                                    <span className="font-medium">{entry.action}</span>
                                    {entry.previousValue && entry.newValue && (
                                      <div className="text-sm">
                                        Alterado de{" "}
                                        <Badge variant="outline" className={getStatusColor(entry.previousValue as OpportunityStatus)}>
                                          {entry.previousValue}
                                        </Badge>{" "}
                                        para{" "}
                                        <Badge variant="outline" className={getStatusColor(entry.newValue as OpportunityStatus)}>
                                          {entry.newValue}
                                        </Badge>
                                      </div>
                                    )}
                                    {!entry.previousValue && entry.newValue && (
                                      <div className="text-sm mt-2 bg-muted/50 p-2 rounded-md">
                                        {entry.newValue}
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
                              O histórico desta oportunidade será registrado aqui
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
                      <CardContent className="pt-6">
                        {opportunity.attachments && opportunity.attachments.length > 0 ? (
                          <div className="space-y-4">
                            {opportunity.attachments.map((attachment) => (
                              <div
                                key={attachment.id}
                                className="flex items-center justify-between p-3 border rounded-md"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="bg-muted/50 p-2 rounded-md">
                                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{attachment.name}</p>
                                    <div className="text-xs text-muted-foreground">
                                      {`${(attachment.size / 1024 / 1024).toFixed(2)} MB • 
                                      ${attachment.uploadDate} • 
                                      Enviado por ${attachment.uploadedBy}`}
                                    </div>
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm">
                                  <Download className="h-4 w-4 mr-1" /> Baixar
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center p-6">
                            <Paperclip className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                            <h3 className="text-lg font-medium mb-1">Sem Anexos</h3>
                            <p className="text-muted-foreground mb-4">
                              Nenhum arquivo foi anexado a esta oportunidade ainda
                            </p>
                            <Button variant="outline" disabled>
                              Adicionar Anexo
                            </Button>
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
                    <CardTitle>Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Status Atual</p>
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(opportunity.status)} text-base px-4 py-1.5`}
                        >
                          {opportunity.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => setStatusUpdateOpen(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" /> Atualizar Status
                    </Button>
                  </CardFooter>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Status atual da oportunidade e opções para atualizá-lo.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card>
                  <CardHeader>
                    <CardTitle>Ações</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full" onClick={() => setAddNoteOpen(true)}>
                      <FileText className="h-4 w-4 mr-2" /> Adicionar Nota
                    </Button>
                    <Button variant="outline" className="w-full" disabled>
                      <Paperclip className="h-4 w-4 mr-2" /> Adicionar Anexo
                    </Button>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ações que podem ser realizadas nesta oportunidade.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="border-red-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-red-700">Zona de Perigo</CardTitle>
                    <CardDescription>
                      Ações irreversíveis para esta oportunidade
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
                            oportunidade e todos os dados associados.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              toast.success("Oportunidade excluída com sucesso");
                              navigate("/opportunities");
                            }}
                            className="bg-red-600 text-white hover:bg-red-700"
                          >
                            Deletar
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
