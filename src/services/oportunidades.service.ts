
import { supabase } from '@/integrations/supabase/client';
import { 
  EstatisticaOportunidadePorEmpresa, 
  EstatisticaParceiroExterno,
  EmpresaGrupo,
  ParceiroExterno,
  StatusOportunidade,
  OportunidadeCompleta,
  Oportunidade,
  getMockEmpresasGrupo,
  getMockParceirosExternos,
  getMockStatusOportunidades,
  getMockOportunidades
} from '@/types/supabase-extended';

// Main function to get opportunities data
export const getOportunidadesCompletas = async (): Promise<OportunidadeCompleta[]> => {
  try {
    console.log('Fetching opportunities from service');
    // For now, using mock data since tables don't exist yet in Supabase
    return getMockOportunidades();
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return getMockOportunidades(); // Return mock data on error
  }
};

// Get statistics for companies
export const getEstatisticasOportunidadesPorEmpresa = async (): Promise<EstatisticaOportunidadePorEmpresa[]> => {
  try {
    // For now, return mock data
    return [
      { empresa: "Empresa A", enviadas: 15, recebidas: 8, saldo: 7 },
      { empresa: "Empresa B", enviadas: 10, recebidas: 12, saldo: -2 },
      { empresa: "Empresa C", enviadas: 5, recebidas: 5, saldo: 0 }
    ];
  } catch (error) {
    console.error('Error fetching company statistics:', error);
    return []; // Return empty array on error
  }
};

// Get statistics for external partners
export const getEstatisticasParceirosExternos = async (): Promise<EstatisticaParceiroExterno[]> => {
  try {
    // For now, return mock data
    return [
      { parceiro: "Parceiro X", enviadas: 8, recebidas: 12, saldo: -4 },
      { parceiro: "Parceiro Y", enviadas: 14, recebidas: 7, saldo: 7 },
      { parceiro: "Parceiro Z", enviadas: 5, recebidas: 5, saldo: 0 }
    ];
  } catch (error) {
    console.error('Error fetching partner statistics:', error);
    return []; // Return empty array on error
  }
};

// Get companies in the group
export const getEmpresasGrupo = async (): Promise<EmpresaGrupo[]> => {
  try {
    // For now, using mock data since tables don't exist yet in Supabase
    return getMockEmpresasGrupo();
  } catch (error) {
    console.error('Error fetching companies:', error);
    return getMockEmpresasGrupo(); // Return mock data on error
  }
};

// Get external partners
export const getParceirosExternos = async (): Promise<ParceiroExterno[]> => {
  try {
    // For now, using mock data since tables don't exist yet in Supabase
    return getMockParceirosExternos();
  } catch (error) {
    console.error('Error fetching external partners:', error);
    return getMockParceirosExternos(); // Return mock data on error
  }
};

// Get opportunity statuses
export const getStatusOportunidades = async (): Promise<StatusOportunidade[]> => {
  try {
    // For now, using mock data since tables don't exist yet in Supabase
    return getMockStatusOportunidades();
  } catch (error) {
    console.error('Error fetching opportunity statuses:', error);
    return getMockStatusOportunidades(); // Return mock data on error
  }
};

// Create a new opportunity
export const createOportunidade = async (
  oportunidade: Omit<Oportunidade, 'id_oportunidade' | 'data_criacao' | 'data_ultima_modificacao'>,
  lead: any,
  parceirosDestinoIds: number[] = []
): Promise<OportunidadeCompleta> => {
  console.log('Mocking create opportunity', { oportunidade, lead, parceirosDestinoIds });
  
  // Return a mock successful creation
  const mockOportunidade = {
    ...oportunidade,
    id_oportunidade: Date.now(),
    data_criacao: new Date().toISOString(),
    data_ultima_modificacao: new Date().toISOString(),
    nome_empresa_lead: lead.nome_empresa_lead,
    nome_contato_lead: lead.nome_contato_lead,
    email_lead: lead.email_lead,
    telefone_lead: lead.telefone_lead,
    empresa_origem: oportunidade.id_empresa_origem_grupo ? `Empresa ${oportunidade.id_empresa_origem_grupo}` : undefined,
    empresa_destino: oportunidade.id_empresa_destino_grupo ? `Empresa ${oportunidade.id_empresa_destino_grupo}` : undefined,
    parceiro_origem: oportunidade.id_parceiro_origem_externo ? `Parceiro ${oportunidade.id_parceiro_origem_externo}` : undefined,
    parceiros_destino: parceirosDestinoIds.map(id => `Parceiro ${id}`),
    status: "Contato"
  } as OportunidadeCompleta;
  
  return mockOportunidade;
};

// Update an opportunity
export const updateOportunidade = async (
  id: number,
  oportunidade: Partial<Oportunidade>
): Promise<OportunidadeCompleta> => {
  console.log('Mocking update opportunity', { id, oportunidade });
  
  // Return a mock successful update
  const baseOportunidade = getMockOportunidades()[0];
  
  return {
    ...baseOportunidade,
    ...oportunidade,
    id_oportunidade: id,
    data_ultima_modificacao: new Date().toISOString()
  };
};

// Export opportunities to CSV
export const exportOportunidadesToCSV = async (): Promise<string> => {
  try {
    const oportunidades = await getOportunidadesCompletas();
    
    // Create CSV header
    const headers = [
      'ID', 
      'Data', 
      'Tipo', 
      'Empresa Lead', 
      'Origem',
      'Destino',
      'Status',
      'Projeto',
      'Valor Total'
    ].join(',');
    
    // Create CSV rows
    const rows = oportunidades.map(op => [
      op.id_oportunidade,
      new Date(op.data_envio_recebimento).toLocaleDateString(),
      op.tipo_oportunidade,
      op.nome_empresa_lead,
      op.empresa_origem || op.parceiro_origem || '-',
      op.empresa_destino || (op.parceiros_destino && op.parceiros_destino.join(', ')) || '-',
      op.status,
      op.nome_projeto || '-',
      op.valor_total_projeto ? op.valor_total_projeto : '-'
    ].join(','));
    
    // Combine headers and rows
    const csvContent = 'data:text/csv;charset=utf-8,' + headers + '\n' + rows.join('\n');
    
    return csvContent;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return '';
  }
};
