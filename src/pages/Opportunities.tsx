
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Plus, Search, Download, Filter } from "lucide-react";
import {
  mockOpportunities,
  groupCompanies,
  externalPartners,
  statusOptions,
} from "@/data/mockData";
import { Opportunity, OpportunityStatus, GroupCompany } from "@/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const OpportunityTypeBadge = ({ type }: { type: string }) => {
  const styles = {
    internal: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    incoming: "bg-green-100 text-green-800 hover:bg-green-100",
    outgoing: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  };

  const labels = {
    internal: "Intragrupo",
    incoming: "Recebido",
    outgoing: "Enviado",
  };

  return (
    <Badge
      variant="outline"
      className={styles[type as keyof typeof styles]}
    >
      {labels[type as keyof typeof labels]}
    </Badge>
  );
};

const StatusBadge = ({ status }: { status: OpportunityStatus }) => {
  const styles = {
    New: "bg-purple-100 text-purple-800 hover:bg-purple-100",
    "In Progress": "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    Won: "bg-green-100 text-green-800 hover:bg-green-100",
    Lost: "bg-red-100 text-red-800 hover:bg-red-100",
    "On Hold": "bg-gray-100 text-gray-800 hover:bg-gray-100",
  };

  return (
    <Badge variant="outline" className={styles[status]}>
      {status}
    </Badge>
  );
};

const Opportunities = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState({
    type: "",
    status: "",
    sourceCompany: "",
    targetCompany: "",
    search: "",
  });
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newOpportunity, setNewOpportunity] = useState({
    type: "internal",
    sourceCompany: "",
    targetCompany: "",
    partnerName: "",
    partners: [""],
    status: "New" as OpportunityStatus,
    targetCompanyName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    notes: "",
  });

  useEffect(() => {
    // Aplicar filtros
    let filteredOpps = [...mockOpportunities];

    if (filter.type) {
      filteredOpps = filteredOpps.filter((opp) => opp.type === filter.type);
    }

    if (filter.status) {
      filteredOpps = filteredOpps.filter((opp) => opp.status === filter.status);
    }

    if (filter.sourceCompany) {
      filteredOpps = filteredOpps.filter((opp) => {
        if (opp.type === "internal" || opp.type === "outgoing") {
          return opp.sourceCompany === filter.sourceCompany;
        }
        return false;
      });
    }

    if (filter.targetCompany) {
      filteredOpps = filteredOpps.filter((opp) => {
        if (opp.type === "internal" || opp.type === "incoming") {
          return opp.targetCompany === filter.targetCompany;
        }
        return false;
      });
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filteredOpps = filteredOpps.filter(
        (opp) =>
          opp.targetCompanyName.toLowerCase().includes(searchLower) ||
          opp.contactName.toLowerCase().includes(searchLower) ||
          opp.contactEmail.toLowerCase().includes(searchLower) ||
          opp.responsibleName.toLowerCase().includes(searchLower)
      );
    }

    setOpportunities(filteredOpps);
  }, [filter]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewOpportunity((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewOpportunity((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateOpportunity = () => {
    // Aqui você normalmente enviaria isso para sua API de backend
    console.log("Criando nova oportunidade:", newOpportunity);
    
    // Em uma aplicação real, você adicionaria a nova oportunidade à lista
    // Por enquanto, vamos apenas fechar o diálogo
    setIsCreateDialogOpen(false);
    
    // Resetar formulário
    setNewOpportunity({
      type: "internal",
      sourceCompany: "",
      targetCompany: "",
      partnerName: "",
      partners: [""],
      status: "New",
      targetCompanyName: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      notes: "",
    });
  };

  const handleExportData = () => {
    console.log("Exportando dados...");
    // Em uma aplicação real, isso geraria e baixaria um arquivo CSV/Excel
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-aeight-dark">Oportunidades</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie e monitore todas as oportunidades de parceria
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Oportunidade
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Criar Nova Oportunidade</DialogTitle>
                <DialogDescription>
                  Registre uma nova oportunidade de parceria preenchendo os detalhes abaixo.
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="internal" className="w-full mt-4">
                <TabsList className="w-full">
                  <TabsTrigger value="internal" className="flex-1">Intragrupo</TabsTrigger>
                  <TabsTrigger value="incoming" className="flex-1">Recebida Externa</TabsTrigger>
                  <TabsTrigger value="outgoing" className="flex-1">Enviada Externa</TabsTrigger>
                </TabsList>

                <TabsContent value="internal">
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sourceCompany">Empresa de Origem</Label>
                        <Select
                          value={newOpportunity.sourceCompany}
                          onValueChange={(value) =>
                            handleSelectChange("sourceCompany", value)
                          }
                        >
                          <SelectTrigger id="sourceCompany">
                            <SelectValue placeholder="Selecione empresa" />
                          </SelectTrigger>
                          <SelectContent>
                            {groupCompanies.map((company) => (
                              <SelectItem key={company} value={company}>
                                {company}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="targetCompany">Empresa de Destino</Label>
                        <Select
                          value={newOpportunity.targetCompany}
                          onValueChange={(value) =>
                            handleSelectChange("targetCompany", value)
                          }
                        >
                          <SelectTrigger id="targetCompany">
                            <SelectValue placeholder="Selecione empresa" />
                          </SelectTrigger>
                          <SelectContent>
                            {groupCompanies
                              .filter((c) => c !== newOpportunity.sourceCompany)
                              .map((company) => (
                                <SelectItem key={company} value={company}>
                                  {company}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="targetCompanyName">Nome da Empresa Cliente</Label>
                      <Input
                        id="targetCompanyName"
                        name="targetCompanyName"
                        value={newOpportunity.targetCompanyName}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactName">Nome do Contato</Label>
                        <Input
                          id="contactName"
                          name="contactName"
                          value={newOpportunity.contactName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Email do Contato</Label>
                        <Input
                          id="contactEmail"
                          name="contactEmail"
                          type="email"
                          value={newOpportunity.contactEmail}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Telefone do Contato</Label>
                      <Input
                        id="contactPhone"
                        name="contactPhone"
                        value={newOpportunity.contactPhone}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Observações</Label>
                      <Input
                        id="notes"
                        name="notes"
                        value={newOpportunity.notes}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="incoming">
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="partnerName">Nome do Parceiro</Label>
                        <Select
                          value={newOpportunity.partnerName}
                          onValueChange={(value) =>
                            handleSelectChange("partnerName", value)
                          }
                        >
                          <SelectTrigger id="partnerName">
                            <SelectValue placeholder="Selecione parceiro" />
                          </SelectTrigger>
                          <SelectContent>
                            {externalPartners.map((partner) => (
                              <SelectItem key={partner} value={partner}>
                                {partner}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="targetCompany">Empresa de Destino</Label>
                        <Select
                          value={newOpportunity.targetCompany}
                          onValueChange={(value) =>
                            handleSelectChange("targetCompany", value)
                          }
                        >
                          <SelectTrigger id="targetCompany">
                            <SelectValue placeholder="Selecione empresa" />
                          </SelectTrigger>
                          <SelectContent>
                            {groupCompanies.map((company) => (
                              <SelectItem key={company} value={company}>
                                {company}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="targetCompanyName">Nome da Empresa Cliente</Label>
                      <Input
                        id="targetCompanyName"
                        name="targetCompanyName"
                        value={newOpportunity.targetCompanyName}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactName">Nome do Contato</Label>
                        <Input
                          id="contactName"
                          name="contactName"
                          value={newOpportunity.contactName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Email do Contato</Label>
                        <Input
                          id="contactEmail"
                          name="contactEmail"
                          type="email"
                          value={newOpportunity.contactEmail}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Telefone do Contato</Label>
                      <Input
                        id="contactPhone"
                        name="contactPhone"
                        value={newOpportunity.contactPhone}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Observações</Label>
                      <Input
                        id="notes"
                        name="notes"
                        value={newOpportunity.notes}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="outgoing">
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sourceCompany">Empresa de Origem</Label>
                        <Select
                          value={newOpportunity.sourceCompany}
                          onValueChange={(value) =>
                            handleSelectChange("sourceCompany", value)
                          }
                        >
                          <SelectTrigger id="sourceCompany">
                            <SelectValue placeholder="Selecione empresa" />
                          </SelectTrigger>
                          <SelectContent>
                            {groupCompanies.map((company) => (
                              <SelectItem key={company} value={company}>
                                {company}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="partners">Parceiro(s)</Label>
                        <Select
                          value={newOpportunity.partners[0]}
                          onValueChange={(value) =>
                            setNewOpportunity({
                              ...newOpportunity,
                              partners: [value],
                            })
                          }
                        >
                          <SelectTrigger id="partners">
                            <SelectValue placeholder="Selecione parceiro" />
                          </SelectTrigger>
                          <SelectContent>
                            {externalPartners.map((partner) => (
                              <SelectItem key={partner} value={partner}>
                                {partner}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="targetCompanyName">Nome da Empresa Cliente</Label>
                      <Input
                        id="targetCompanyName"
                        name="targetCompanyName"
                        value={newOpportunity.targetCompanyName}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactName">Nome do Contato</Label>
                        <Input
                          id="contactName"
                          name="contactName"
                          value={newOpportunity.contactName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Email do Contato</Label>
                        <Input
                          id="contactEmail"
                          name="contactEmail"
                          type="email"
                          value={newOpportunity.contactEmail}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Telefone do Contato</Label>
                      <Input
                        id="contactPhone"
                        name="contactPhone"
                        value={newOpportunity.contactPhone}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Observações</Label>
                      <Input
                        id="notes"
                        name="notes"
                        value={newOpportunity.notes}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button
                  type="submit"
                  onClick={handleCreateOpportunity}
                >
                  Criar Oportunidade
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Buscar oportunidades..."
              className="pl-10"
              value={filter.search}
              onChange={(e) =>
                setFilter({ ...filter, search: e.target.value })
              }
            />
          </div>
        </div>
        <Select
          value={filter.type}
          onValueChange={(value) => setFilter({ ...filter, type: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os Tipos</SelectItem>
            <SelectItem value="internal">Intragrupo</SelectItem>
            <SelectItem value="incoming">Recebida Externa</SelectItem>
            <SelectItem value="outgoing">Enviada Externa</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filter.status}
          onValueChange={(value) => setFilter({ ...filter, status: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os Status</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filter.sourceCompany}
          onValueChange={(value) =>
            setFilter({ ...filter, sourceCompany: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Empresa de Origem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as Empresas de Origem</SelectItem>
            {groupCompanies.map((company) => (
              <SelectItem key={company} value={company}>
                {company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filter.targetCompany}
          onValueChange={(value) =>
            setFilter({ ...filter, targetCompany: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Empresa de Destino" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as Empresas de Destino</SelectItem>
            {groupCompanies.map((company) => (
              <SelectItem key={company} value={company}>
                {company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabela de Oportunidades */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="rounded-md border shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>De</TableHead>
                    <TableHead>Para</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Responsável</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {opportunities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Nenhuma oportunidade encontrada com os filtros atuais
                      </TableCell>
                    </TableRow>
                  ) : (
                    opportunities.map((opportunity) => (
                      <TableRow
                        key={opportunity.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/opportunity/${opportunity.id}`)}
                      >
                        <TableCell>
                          <OpportunityTypeBadge type={opportunity.type} />
                        </TableCell>
                        <TableCell>{opportunity.date}</TableCell>
                        <TableCell>{opportunity.targetCompanyName}</TableCell>
                        <TableCell>
                          {opportunity.type === "internal" || opportunity.type === "outgoing"
                            ? opportunity.sourceCompany
                            : opportunity.partnerName}
                        </TableCell>
                        <TableCell>
                          {opportunity.type === "internal" || opportunity.type === "incoming"
                            ? opportunity.targetCompany
                            : opportunity.partners.join(", ")}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={opportunity.status} />
                        </TableCell>
                        <TableCell>{opportunity.contactName}</TableCell>
                        <TableCell>{opportunity.responsibleName}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Lista de todas as oportunidades de parceria. Clique em uma linha para ver detalhes completos.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </DashboardLayout>
  );
};

export default Opportunities;
