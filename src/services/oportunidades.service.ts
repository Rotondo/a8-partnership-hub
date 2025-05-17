
import { supabase } from '@/integrations/supabase/client';
import {
  Oportunidade,
  OportunidadeCompleta,
  Lead,
  ObservacaoOportunidade,
  getMockOportunidades,
  getMockEmpresasGrupo,
  getMockParceirosExternos,
  getMockStatusOportunidades
} from '@/types/supabase-extended';

// Currently using mock data since tables don't exist yet in Supabase
export const getOportunidadesCompletas = async (): Promise<OportunidadeCompleta[]> => {
  try {
    // Attempt to get real data from Supabase if the table exists
    const { data, error } = await supabase
      .from('opportunities')
      .select('*');
    
    if (error) {
      console.error('Error fetching opportunities:', error);
      // Return mock data if there's an error (likely table doesn't exist)
      return getMockOportunidades();
    }
    
    // If we get data, convert it to our application format
    // For now, just return mock data
    return getMockOportunidades();
  } catch (err) {
    console.error('Error in getOportunidadesCompletas:', err);
    return getMockOportunidades();
  }
};

export const getOportunidadeById = async (id: number): Promise<OportunidadeCompleta | null> => {
  try {
    const opportunities = await getMockOportunidades();
    return opportunities.find(op => op.id_oportunidade === id) || null;
  } catch (err) {
    console.error('Error in getOportunidadeById:', err);
    return null;
  }
};

export const exportOportunidadesToCSV = async (): Promise<string> => {
  try {
    const oportunidades = await getOportunidadesCompletas();
    
    // Create headers
    const headers = [
      'ID',
      'Tipo',
      'Data',
      'Empresa Lead',
      'Origem',
      'Destino',
      'Status',
      'Projeto',
      'Valor'
    ].join(',');
    
    // Create rows
    const rows = oportunidades.map(op => {
      return [
        op.id_oportunidade,
        op.tipo_oportunidade,
        new Date(op.data_envio_recebimento).toLocaleDateString(),
        `"${op.nome_empresa_lead}"`,
        `"${op.empresa_origem || op.parceiro_origem || '-'}"`,
        `"${op.empresa_destino || (op.parceiros_destino && op.parceiros_destino.join(', ')) || '-'}"`,
        `"${op.status}"`,
        `"${op.nome_projeto || '-'}"`,
        op.valor_total_projeto ? op.valor_total_projeto : '-'
      ].join(',');
    });
    
    // Combine headers and rows
    return `data:text/csv;charset=utf-8,${encodeURIComponent(headers + '\n' + rows.join('\n'))}`;
  } catch (err) {
    console.error('Error in exportOportunidadesToCSV:', err);
    throw err;
  }
};

export const createOportunidade = async (
  oportunidade: Omit<Oportunidade, 'id_oportunidade' | 'data_criacao' | 'data_ultima_modificacao'>,
  lead: Omit<Lead, 'id_lead' | 'data_criacao'>,
  parceirosDestinoIds?: number[]
): Promise<OportunidadeCompleta> => {
  try {
    // For now, just return a mock response
    const mockOportunidades = await getMockOportunidades();
    const newId = Math.max(...mockOportunidades.map(op => op.id_oportunidade)) + 1;
    
    const newOportunidade: OportunidadeCompleta = {
      id_oportunidade: newId,
      data_envio_recebimento: oportunidade.data_envio_recebimento,
      id_responsavel_envio_recebimento: oportunidade.id_responsavel_envio_recebimento,
      id_empresa_origem_grupo: oportunidade.id_empresa_origem_grupo,
      id_empresa_destino_grupo: oportunidade.id_empresa_destino_grupo,
      id_parceiro_origem_externo: oportunidade.id_parceiro_origem_externo,
      id_lead: newId, // Mock ID for the lead
      id_status_atual: oportunidade.id_status_atual,
      tipo_oportunidade: oportunidade.tipo_oportunidade,
      descricao_servicos: oportunidade.descricao_servicos,
      nome_projeto: oportunidade.nome_projeto,
      valor_proposta_mensal: oportunidade.valor_proposta_mensal,
      numero_aportes: oportunidade.numero_aportes,
      valor_total_projeto: oportunidade.valor_total_projeto,
      quarter_oportunidade: oportunidade.quarter_oportunidade,
      mes_oportunidade: oportunidade.mes_oportunidade,
      ano_oportunidade: oportunidade.ano_oportunidade,
      observacoes: oportunidade.observacoes,
      data_criacao: new Date().toISOString(),
      data_ultima_modificacao: new Date().toISOString(),
      nome_empresa_lead: lead.nome_empresa_lead,
      nome_contato_lead: lead.nome_contato_lead,
      email_lead: lead.email_lead,
      telefone_lead: lead.telefone_lead,
      empresa_origem: oportunidade.id_empresa_origem_grupo ? `Empresa ${oportunidade.id_empresa_origem_grupo}` : undefined,
      empresa_destino: oportunidade.id_empresa_destino_grupo ? `Empresa ${oportunidade.id_empresa_destino_grupo}` : undefined,
      parceiro_origem: oportunidade.id_parceiro_origem_externo ? `Parceiro ${oportunidade.id_parceiro_origem_externo}` : undefined,
      parceiros_destino: parceirosDestinoIds?.map(id => `Parceiro ${id}`),
      status: `Status ${oportunidade.id_status_atual}`
    };
    
    return newOportunidade;
  } catch (err) {
    console.error('Error in createOportunidade:', err);
    throw err;
  }
};

export const updateOportunidade = async (
  id: number,
  oportunidade: Partial<Oportunidade>
): Promise<OportunidadeCompleta> => {
  try {
    // For now, just return an updated mock item
    const mockOportunidades = await getMockOportunidades();
    const existingIndex = mockOportunidades.findIndex(op => op.id_oportunidade === id);
    
    if (existingIndex === -1) {
      throw new Error(`Oportunidade with ID ${id} not found`);
    }
    
    // Update the existing opportunity
    const updated = {
      ...mockOportunidades[existingIndex],
      ...oportunidade,
      data_ultima_modificacao: new Date().toISOString()
    };
    
    return updated;
  } catch (err) {
    console.error('Error in updateOportunidade:', err);
    throw err;
  }
};

export const deleteOportunidade = async (id: number): Promise<void> => {
  try {
    console.log(`Deleting opportunity with ID: ${id}`);
    // Mock deletion - in real implementation this would delete from Supabase
  } catch (err) {
    console.error('Error in deleteOportunidade:', err);
    throw err;
  }
};

export const addObservacaoOportunidade = async (
  idOportunidade: number,
  conteudo: string
): Promise<ObservacaoOportunidade> => {
  try {
    // Mock adding an observation
    const newObservacao: ObservacaoOportunidade = {
      id_observacao: Math.floor(Math.random() * 1000),
      id_oportunidade: idOportunidade,
      id_usuario: 1, // Mock user ID
      conteudo,
      data_criacao: new Date().toISOString()
    };
    
    return newObservacao;
  } catch (err) {
    console.error('Error in addObservacaoOportunidade:', err);
    throw err;
  }
};

export const getEmpresasGrupo = async () => {
  try {
    return getMockEmpresasGrupo();
  } catch (err) {
    console.error('Error in getEmpresasGrupo:', err);
    throw err;
  }
};

export const getParceirosExternos = async () => {
  try {
    return getMockParceirosExternos();
  } catch (err) {
    console.error('Error in getParceirosExternos:', err);
    throw err;
  }
};

export const getStatusOportunidades = async () => {
  try {
    return getMockStatusOportunidades();
  } catch (err) {
    console.error('Error in getStatusOportunidades:', err);
    throw err;
  }
};
