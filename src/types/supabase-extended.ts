
// Extended type definitions to complement Supabase generated types

// Partners are the only table in Supabase, but our app uses these types in the UI
export interface EstatisticaOportunidadePorEmpresa {
  empresa: string;
  enviadas: number;
  recebidas: number;
  saldo: number;
}

export interface EstatisticaParceiroExterno {
  parceiro: string;
  enviadas: number;
  recebidas: number;
  saldo: number;
}

// Map database structure to application types
export interface EmpresaGrupo {
  id_empresa_grupo: number;
  nome_empresa: string;
  data_criacao?: string;
}

export interface ParceiroExterno {
  id_parceiro_externo: number;
  nome_parceiro: string;
  email_parceiro?: string;
  telefone_parceiro?: string;
  observacoes?: string;
  data_criacao?: string;
}

export interface StatusOportunidade {
  id_status: number;
  nome_status: string;
  data_criacao?: string;
}

export interface Lead {
  id_lead: number;
  nome_empresa_lead: string;
  nome_contato_lead?: string;
  email_lead?: string;
  telefone_lead?: string;
  data_criacao?: string;
}

export interface Oportunidade {
  id_oportunidade: number;
  data_envio_recebimento: string;
  id_responsavel_envio_recebimento: number;
  id_empresa_origem_grupo?: number;
  id_empresa_destino_grupo?: number;
  id_parceiro_origem_externo?: number;
  id_lead: number;
  id_status_atual: number;
  tipo_oportunidade: "intragrupo" | "externa_entrada" | "externa_saida";
  descricao_servicos?: string;
  nome_projeto?: string;
  valor_proposta_mensal?: number;
  numero_aportes?: number;
  valor_total_projeto?: number;
  quarter_oportunidade?: string;
  mes_oportunidade?: number;
  ano_oportunidade?: number;
  observacoes?: string;
  data_criacao?: string;
  data_ultima_modificacao?: string;
}

export interface ObservacaoOportunidade {
  id_observacao: number;
  id_oportunidade: number;
  id_usuario: number;
  conteudo: string;
  data_criacao: string;
  usuarios?: {
    nome_usuario: string;
  };
}

export interface OportunidadeCompleta extends Oportunidade {
  nome_empresa_lead: string;
  nome_contato_lead?: string;
  email_lead?: string;
  telefone_lead?: string;
  empresa_origem?: string;
  empresa_destino?: string;
  parceiro_origem?: string;
  parceiros_destino?: string[];
  status: string;
  nome_responsavel?: string;
}

// Adapter functions to map between database and application types
export const mapPartnerToEmpresaGrupo = (partner: any): EmpresaGrupo => ({
  id_empresa_grupo: parseInt(partner.id),
  nome_empresa: partner.name,
  data_criacao: partner.created_at
});

export const mapPartnerToParceiroExterno = (partner: any): ParceiroExterno => ({
  id_parceiro_externo: parseInt(partner.id),
  nome_parceiro: partner.name,
  email_parceiro: partner.email || "",
  telefone_parceiro: partner.phone || "",
  data_criacao: partner.created_at
});

export const mapPartnerToStatusOportunidade = (partner: any): StatusOportunidade => ({
  id_status: parseInt(partner.id),
  nome_status: partner.name,
  data_criacao: partner.created_at
});

// Mock service functions to provide sample data until database is fully set up
export const getMockEmpresasGrupo = (): EmpresaGrupo[] => [
  { id_empresa_grupo: 1, nome_empresa: "Empresa A", data_criacao: new Date().toISOString() },
  { id_empresa_grupo: 2, nome_empresa: "Empresa B", data_criacao: new Date().toISOString() },
  { id_empresa_grupo: 3, nome_empresa: "Empresa C", data_criacao: new Date().toISOString() }
];

export const getMockParceirosExternos = (): ParceiroExterno[] => [
  { id_parceiro_externo: 1, nome_parceiro: "Parceiro X", email_parceiro: "parceirox@example.com", data_criacao: new Date().toISOString() },
  { id_parceiro_externo: 2, nome_parceiro: "Parceiro Y", email_parceiro: "parceiroy@example.com", data_criacao: new Date().toISOString() },
  { id_parceiro_externo: 3, nome_parceiro: "Parceiro Z", email_parceiro: "parceiroz@example.com", data_criacao: new Date().toISOString() }
];

export const getMockStatusOportunidades = (): StatusOportunidade[] => [
  { id_status: 1, nome_status: "Contato", data_criacao: new Date().toISOString() },
  { id_status: 2, nome_status: "Negociação", data_criacao: new Date().toISOString() },
  { id_status: 3, nome_status: "Ganho", data_criacao: new Date().toISOString() },
  { id_status: 4, nome_status: "Perdido", data_criacao: new Date().toISOString() },
  { id_status: 5, nome_status: "Sem contato", data_criacao: new Date().toISOString() }
];

export const getMockOportunidades = (): OportunidadeCompleta[] => [
  {
    id_oportunidade: 1,
    data_envio_recebimento: new Date().toISOString(),
    id_responsavel_envio_recebimento: 1,
    id_empresa_origem_grupo: 1,
    id_empresa_destino_grupo: 2,
    id_lead: 1,
    id_status_atual: 1,
    tipo_oportunidade: "intragrupo",
    nome_empresa_lead: "Cliente ABC",
    nome_contato_lead: "João Silva",
    email_lead: "joao@cliente.com",
    telefone_lead: "(11) 98765-4321",
    empresa_origem: "Empresa A",
    empresa_destino: "Empresa B",
    status: "Contato",
    nome_projeto: "Projeto Alpha",
    valor_total_projeto: 50000,
    nome_responsavel: "Usuário Teste",
    data_criacao: new Date().toISOString(),
    data_ultima_modificacao: new Date().toISOString()
  },
  {
    id_oportunidade: 2,
    data_envio_recebimento: new Date().toISOString(),
    id_responsavel_envio_recebimento: 2,
    id_parceiro_origem_externo: 1,
    id_empresa_destino_grupo: 3,
    id_lead: 2,
    id_status_atual: 2,
    tipo_oportunidade: "externa_entrada",
    nome_empresa_lead: "Cliente XYZ",
    nome_contato_lead: "Maria Souza",
    email_lead: "maria@cliente.com",
    telefone_lead: "(11) 91234-5678",
    parceiro_origem: "Parceiro X",
    empresa_destino: "Empresa C",
    status: "Negociação",
    nome_projeto: "Projeto Beta",
    valor_total_projeto: 75000,
    nome_responsavel: "Usuário Teste",
    data_criacao: new Date().toISOString(),
    data_ultima_modificacao: new Date().toISOString()
  }
];
