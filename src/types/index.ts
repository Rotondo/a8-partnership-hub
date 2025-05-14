
export type Company = 
  | "Cryah" 
  | "Lomadee" 
  | "Monitfy" 
  | "Boone" 
  | "SAIO";

export type GroupCompany = Company;

export type OpportunityStatus =
  | "New"
  | "In Progress"
  | "Won"
  | "Lost"
  | "On Hold";

// Base opportunity type
export interface BaseOpportunity {
  id: string;
  date: string;
  responsibleName: string;
  status: OpportunityStatus;
  targetCompanyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  notes?: string;
  history: HistoryEntry[];
  attachments?: Attachment[];
}

// Internal group opportunity (between A&eight companies)
export interface InternalOpportunity extends BaseOpportunity {
  type: 'internal';
  sourceCompany: GroupCompany;
  targetCompany: GroupCompany;
}

// Opportunity received from external partner
export interface IncomingOpportunity extends BaseOpportunity {
  type: 'incoming';
  partnerName: string;
  targetCompany: GroupCompany;
}

// Opportunity sent to external partner
export interface OutgoingOpportunity extends BaseOpportunity {
  type: 'outgoing';
  sourceCompany: GroupCompany;
  partners: string[]; // Array of partner names
}

// Union type for all opportunity types
export type Opportunity = 
  | InternalOpportunity 
  | IncomingOpportunity 
  | OutgoingOpportunity;

export interface HistoryEntry {
  id: string;
  date: string;
  user: string;
  action: string;
  previousValue?: string;
  newValue?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  uploadedBy: string;
  url: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  company: GroupCompany;
  role: "admin" | "user";
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface LineChartDataPoint {
  name: string;
  [key: string]: string | number;
}

export interface BalanceData {
  partnerName: string;
  sent: number;
  received: number;
  balance: number;
}

export interface NetworkData {
  nodes: {
    id: string;
    name: string;
  }[];
  links: {
    source: string;
    target: string;
    value: number;
  }[];
}
