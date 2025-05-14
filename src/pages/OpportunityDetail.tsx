
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
    // In a real app, this would be an API call
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

    // Update the opportunity status (in a real app, this would be an API call)
    setOpportunity((prev) => {
      if (!prev) return null;

      // Create a history entry for this change
      const historyEntry: HistoryEntry = {
        id: `hist-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        user: "Current User", // In a real app, this would be the logged-in user
        action: `Updated status from ${prev.status} to ${newStatus}`,
        previousValue: prev.status,
        newValue: newStatus,
      };

      return {
        ...prev,
        status: newStatus as OpportunityStatus,
        history: [historyEntry, ...prev.history],
      };
    });

    toast.success(`Opportunity status updated to ${newStatus}`);
    setStatusUpdateOpen(false);
    setNewStatus("");
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    // Add a note to the opportunity (in a real app, this would be an API call)
    setOpportunity((prev) => {
      if (!prev) return null;

      // Create a history entry for this note
      const historyEntry: HistoryEntry = {
        id: `hist-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        user: "Current User", // In a real app, this would be the logged-in user
        action: "Added note",
        newValue: newNote,
      };

      return {
        ...prev,
        notes: prev.notes ? `${prev.notes}\n\n${newNote}` : newNote,
        history: [historyEntry, ...prev.history],
      };
    });

    toast.success("Note added successfully");
    setAddNoteOpen(false);
    setNewNote("");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading opportunity details...</p>
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
          <h2 className="text-2xl font-bold mb-2">Opportunity Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The opportunity you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/opportunities")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Opportunities
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const getOpportunityTypeLabel = (type: string) => {
    const labels = {
      internal: "Intragroup Opportunity",
      incoming: "Incoming External Opportunity",
      outgoing: "Outgoing External Opportunity",
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
          Back to Opportunities
        </Button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-aeight-dark">
              {opportunity.targetCompanyName}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="bg-aeight-blue/10 text-aeight-blue hover:bg-aeight-blue/10">
                {getOpportunityTypeLabel(opportunity.type)}
              </Badge>
              <Badge
                variant="outline"
                className={getStatusColor(opportunity.status)}
              >
                {opportunity.status}
              </Badge>
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
                  Update Status
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Status</DialogTitle>
                  <DialogDescription>
                    Change the status of this opportunity.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="status" className="mb-2 block">
                    New Status
                  </Label>
                  <Select
                    value={newStatus}
                    onValueChange={(value) => setNewStatus(value as OpportunityStatus)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
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
                    Cancel
                  </Button>
                  <Button onClick={handleStatusUpdate} disabled={!newStatus}>
                    Update
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={addNoteOpen} onOpenChange={setAddNoteOpen}>
              <DialogTrigger asChild>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Add Note
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Note</DialogTitle>
                  <DialogDescription>
                    Add a note to this opportunity.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Textarea
                    placeholder="Enter your notes here..."
                    rows={5}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddNoteOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                    Add Note
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Primary Information */}
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Opportunity Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Client Company</p>
                    <p>{opportunity.targetCompanyName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Date Created</p>
                    <p>{opportunity.date}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Type</p>
                    <p>{getOpportunityTypeLabel(opportunity.type)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Responsible</p>
                    <p>{opportunity.responsibleName}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Partnership Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {opportunity.type === "internal" && (
                    <>
                      <div>
                        <p className="text-sm font-medium">Source Company</p>
                        <p>{opportunity.sourceCompany}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Target Company</p>
                        <p>{opportunity.targetCompany}</p>
                      </div>
                    </>
                  )}

                  {opportunity.type === "incoming" && (
                    <>
                      <div>
                        <p className="text-sm font-medium">External Partner</p>
                        <p>{opportunity.partnerName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Target Company</p>
                        <p>{opportunity.targetCompany}</p>
                      </div>
                    </>
                  )}

                  {opportunity.type === "outgoing" && (
                    <>
                      <div>
                        <p className="text-sm font-medium">Source Company</p>
                        <p>{opportunity.sourceCompany}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">External Partners</p>
                        <p>{opportunity.partners.join(", ")}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Contact Name</p>
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
                        <Phone className="h-4 w-4 mr-1" /> Phone
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

          <Tabs defaultValue="notes">
            <TabsList className="w-full">
              <TabsTrigger value="notes" className="flex-1">
                Notes
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1">
                History
              </TabsTrigger>
              <TabsTrigger value="attachments" className="flex-1">
                Attachments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notes" className="pt-4">
              <Card>
                <CardContent className="pt-6">
                  {opportunity.notes ? (
                    <div className="whitespace-pre-wrap">{opportunity.notes}</div>
                  ) : (
                    <div className="text-center p-6">
                      <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                      <h3 className="text-lg font-medium mb-1">No Notes Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        No notes have been added to this opportunity yet
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setAddNoteOpen(true)}
                      >
                        Add the First Note
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="pt-4">
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
                                  Changed from{" "}
                                  <Badge variant="outline" className={getStatusColor(entry.previousValue as OpportunityStatus)}>
                                    {entry.previousValue}
                                  </Badge>{" "}
                                  to{" "}
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
                      <h3 className="text-lg font-medium mb-1">No History Available</h3>
                      <p className="text-muted-foreground">
                        The history of this opportunity will be tracked here
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attachments" className="pt-4">
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
                                Uploaded by ${attachment.uploadedBy}`}
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4 mr-1" /> Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6">
                      <Paperclip className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                      <h3 className="text-lg font-medium mb-1">No Attachments</h3>
                      <p className="text-muted-foreground mb-4">
                        No files are attached to this opportunity yet
                      </p>
                      <Button variant="outline" disabled>
                        Add Attachment
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Secondary Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Current Status</p>
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
                <Edit className="h-4 w-4 mr-2" /> Update Status
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" onClick={() => setAddNoteOpen(true)}>
                <FileText className="h-4 w-4 mr-2" /> Add Note
              </Button>
              <Button variant="outline" className="w-full" disabled>
                <Paperclip className="h-4 w-4 mr-2" /> Add Attachment
              </Button>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-red-700">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions for this opportunity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    Delete Opportunity
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this
                      opportunity and all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        toast.success("Opportunity deleted successfully");
                        navigate("/opportunities");
                      }}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OpportunityDetail;
