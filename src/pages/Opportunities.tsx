
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

const OpportunityTypeBadge = ({ type }: { type: string }) => {
  const styles = {
    internal: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    incoming: "bg-green-100 text-green-800 hover:bg-green-100",
    outgoing: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  };

  const labels = {
    internal: "Intragroup",
    incoming: "Incoming",
    outgoing: "Outgoing",
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
    // Apply filters
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
    // Here you would normally send this to your backend API
    console.log("Creating new opportunity:", newOpportunity);
    
    // In a real app, you'd add the new opportunity to the list
    // For now, we'll just close the dialog
    setIsCreateDialogOpen(false);
    
    // Reset form
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
    console.log("Exporting data...");
    // In a real app, this would generate and download a CSV/Excel file
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-aeight-dark">Opportunities</h1>
          <p className="text-muted-foreground mt-2">
            Manage and monitor all partnership opportunities
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Opportunity
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Opportunity</DialogTitle>
                <DialogDescription>
                  Register a new partnership opportunity by filling in the details below.
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="internal" className="w-full mt-4">
                <TabsList className="w-full">
                  <TabsTrigger value="internal" className="flex-1">Intragroup</TabsTrigger>
                  <TabsTrigger value="incoming" className="flex-1">Incoming External</TabsTrigger>
                  <TabsTrigger value="outgoing" className="flex-1">Outgoing External</TabsTrigger>
                </TabsList>

                <TabsContent value="internal">
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sourceCompany">Source Company</Label>
                        <Select
                          value={newOpportunity.sourceCompany}
                          onValueChange={(value) =>
                            handleSelectChange("sourceCompany", value)
                          }
                        >
                          <SelectTrigger id="sourceCompany">
                            <SelectValue placeholder="Select company" />
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
                        <Label htmlFor="targetCompany">Target Company</Label>
                        <Select
                          value={newOpportunity.targetCompany}
                          onValueChange={(value) =>
                            handleSelectChange("targetCompany", value)
                          }
                        >
                          <SelectTrigger id="targetCompany">
                            <SelectValue placeholder="Select company" />
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
                      <Label htmlFor="targetCompanyName">Client Company Name</Label>
                      <Input
                        id="targetCompanyName"
                        name="targetCompanyName"
                        value={newOpportunity.targetCompanyName}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactName">Contact Name</Label>
                        <Input
                          id="contactName"
                          name="contactName"
                          value={newOpportunity.contactName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Contact Email</Label>
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
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input
                        id="contactPhone"
                        name="contactPhone"
                        value={newOpportunity.contactPhone}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
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
                        <Label htmlFor="partnerName">Partner Name</Label>
                        <Select
                          value={newOpportunity.partnerName}
                          onValueChange={(value) =>
                            handleSelectChange("partnerName", value)
                          }
                        >
                          <SelectTrigger id="partnerName">
                            <SelectValue placeholder="Select partner" />
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
                        <Label htmlFor="targetCompany">Target Company</Label>
                        <Select
                          value={newOpportunity.targetCompany}
                          onValueChange={(value) =>
                            handleSelectChange("targetCompany", value)
                          }
                        >
                          <SelectTrigger id="targetCompany">
                            <SelectValue placeholder="Select company" />
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
                      <Label htmlFor="targetCompanyName">Client Company Name</Label>
                      <Input
                        id="targetCompanyName"
                        name="targetCompanyName"
                        value={newOpportunity.targetCompanyName}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactName">Contact Name</Label>
                        <Input
                          id="contactName"
                          name="contactName"
                          value={newOpportunity.contactName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Contact Email</Label>
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
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input
                        id="contactPhone"
                        name="contactPhone"
                        value={newOpportunity.contactPhone}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
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
                        <Label htmlFor="sourceCompany">Source Company</Label>
                        <Select
                          value={newOpportunity.sourceCompany}
                          onValueChange={(value) =>
                            handleSelectChange("sourceCompany", value)
                          }
                        >
                          <SelectTrigger id="sourceCompany">
                            <SelectValue placeholder="Select company" />
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
                        <Label htmlFor="partners">Partner(s)</Label>
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
                            <SelectValue placeholder="Select partner" />
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
                      <Label htmlFor="targetCompanyName">Client Company Name</Label>
                      <Input
                        id="targetCompanyName"
                        name="targetCompanyName"
                        value={newOpportunity.targetCompanyName}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactName">Contact Name</Label>
                        <Input
                          id="contactName"
                          name="contactName"
                          value={newOpportunity.contactName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Contact Email</Label>
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
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input
                        id="contactPhone"
                        name="contactPhone"
                        value={newOpportunity.contactPhone}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
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
                  Create Opportunity
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search opportunities..."
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
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="internal">Intragroup</SelectItem>
            <SelectItem value="incoming">Incoming External</SelectItem>
            <SelectItem value="outgoing">Outgoing External</SelectItem>
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
            <SelectItem value="">All Statuses</SelectItem>
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
            <SelectValue placeholder="Source Company" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Source Companies</SelectItem>
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
            <SelectValue placeholder="Target Company" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Target Companies</SelectItem>
            {groupCompanies.map((company) => (
              <SelectItem key={company} value={company}>
                {company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Opportunities Table */}
      <div className="rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Responsible</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {opportunities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No opportunities found with current filters
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
    </DashboardLayout>
  );
};

export default Opportunities;
