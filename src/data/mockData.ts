// Tipos simplificados para dados mockados
type Opportunity = any;
type OpportunityStatus = any;
type GroupCompany = any;
type User = any;

// Dados mockados para desenvolvimento
export const mockOpportunities: Opportunity[] = [
  {
    id: 1,
    title: "Oportunidade Mock 1",
    status: "Em Andamento",
    company: "Cryah",
    lastUpdate: "2024-07-15",
  },
  {
    id: 2,
    title: "Oportunidade Mock 2",
    status: "Concluída",
    company: "Lomadee",
    lastUpdate: "2024-07-10",
  },
];

export const mockStatuses: OpportunityStatus[] = [
  { id: 1, name: "Nova" },
  { id: 2, name: "Em Andamento" },
  { id: 3, name: "Concluída" },
];

export const mockCompanies: GroupCompany[] = [
  { id: 1, name: "Cryah" },
  { id: 2, name: "Lomadee" },
  { id: 3, name: "Monitfy" },
];

export const mockUsers: User[] = [
  { id: "1", name: "João", company: "Cryah" },
  { id: "2", name: "Maria", company: "Lomadee" },
  { id: "3", name: "José", company: "Monitfy" },
];

export const mockPartners = [
  { id: 1, name: "Parceiro A", size: "Pequeno", lead_potential: 5, engagement: 7, investment_potential: 3 },
  { id: 2, name: "Parceiro B", size: "Médio", lead_potential: 8, engagement: 6, investment_potential: 6 },
  { id: 3, name: "Parceiro C", size: "Grande", lead_potential: 9, engagement: 8, investment_potential: 9 },
];

export const mockDashboardData = {
  totalOpportunities: 150,
  newOpportunities: 20,
  wonOpportunities: 80,
  lostOpportunities: 50,
};
