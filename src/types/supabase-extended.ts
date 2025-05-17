
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
}
