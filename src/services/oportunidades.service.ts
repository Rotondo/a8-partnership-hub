
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { EstatisticaOportunidadePorEmpresa, EstatisticaParceiroExterno, OportunidadeCompleta, Lead, Oportunidade } from '@/types/supabase-extended';

// Mock data to fill in when the database doesn't have all tables yet
const mockEmpresas = [
  { name: 'Cryah', sent: 15, received: 10 },
  { name: 'Monitfy', sent: 12, received: 14 },
  { name: 'Lomadee', sent: 20, received: 15 },
  { name: 'Boone', sent: 8, received: 5 },
  { name: 'SAIO', sent: 10, received: 12 }
];

const mockParceiros = [
  { name: 'Partner A', sent: 5, received: 7 },
  { name: 'Partner B', sent: 8, received: 3 },
  { name: 'Partner C', sent: 12, received: 10 },
  { name: 'Partner D', sent: 6, received: 9 }
];

// Get statistics for companies
export async function getEstatisticasOportunidadesPorEmpresa(): Promise<EstatisticaOportunidadePorEmpresa[]> {
  try {
    // Try to fetch data from Supabase function
    const { data, error } = await supabase.rpc('get_opportunities_by_company');
    
    if (error) {
      console.error('Error fetching opportunity statistics:', error);
      throw error;
    }
    
    if (data && data.length > 0) {
      // Map the data to the expected format
      return data.map((item: any) => ({
        empresa: item.empresa,
        enviadas: Number(item.enviadas),
        recebidas: Number(item.recebidas),
        saldo: Number(item.enviadas) - Number(item.recebidas)
      }));
    } else {
      // Return mock data if no data is returned
      return mockEmpresas.map(empresa => ({
        empresa: empresa.name,
        enviadas: empresa.sent,
        recebidas: empresa.received,
        saldo: empresa.sent - empresa.received
      }));
    }
  } catch (err) {
    console.error('Error in getEstatisticasOportunidadesPorEmpresa:', err);
    // Return mock data in case of an error
    return mockEmpresas.map(empresa => ({
      empresa: empresa.name,
      enviadas: empresa.sent,
      recebidas: empresa.received,
      saldo: empresa.sent - empresa.received
    }));
  }
}

// Get statistics for external partners
export async function getEstatisticasParceirosExternos(): Promise<EstatisticaParceiroExterno[]> {
  try {
    // Use the partners table as a temporary source of data until the full schema is created
    const { data: partners, error } = await supabase.from('partners').select('*');
    
    if (error) {
      console.error('Error fetching partner statistics:', error);
      throw error;
    }
    
    if (partners && partners.length > 0) {
      // Map partners data to statistics format
      return partners.map((partner: Tables['partners']['Row']) => ({
        parceiro: partner.name,
        enviadas: partner.lead_potential, // Using these fields as proxies
        recebidas: partner.engagement,
        saldo: partner.lead_potential - partner.engagement
      }));
    } else {
      // Return mock data if no data is returned
      return mockParceiros.map(parceiro => ({
        parceiro: parceiro.name,
        enviadas: parceiro.sent,
        recebidas: parceiro.received,
        saldo: parceiro.sent - parceiro.received
      }));
    }
  } catch (err) {
    console.error('Error in getEstatisticasParceirosExternos:', err);
    // Return mock data in case of an error
    return mockParceiros.map(parceiro => ({
      parceiro: parceiro.name,
      enviadas: parceiro.sent,
      recebidas: parceiro.received,
      saldo: parceiro.sent - parceiro.received
    }));
  }
}

// Get detailed opportunities
export async function getOportunidadesCompletas(): Promise<OportunidadeCompleta[]> {
  try {
    // For now, return mock data based on partners
    const { data: partners, error } = await supabase.from('partners').select('*');
    
    if (error) {
      console.error('Error fetching opportunities:', error);
      throw error;
    }
    
    if (partners && partners.length > 0) {
      // Create mock opportunities from partners
      const mockOportunidades: OportunidadeCompleta[] = partners.map((partner, index) => ({
        id_oportunidade: index + 1,
        data_envio_recebimento: new Date().toISOString(),
        id_responsavel_envio_recebimento: 1,
        id_lead: index + 1,
        id_status_atual: index % 4 + 1,
        tipo_oportunidade: ['intragrupo', 'externa_entrada', 'externa_saida'][index % 3] as any,
        nome_empresa_lead: `Client of ${partner.name}`,
        nome_contato_lead: 'Contact Person',
        email_lead: 'contact@example.com',
        empresa_origem: mockEmpresas[index % mockEmpresas.length].name,
        empresa_destino: index % 2 === 0 ? mockEmpresas[(index + 1) % mockEmpresas.length].name : undefined,
        parceiro_origem: index % 2 === 1 ? partner.name : undefined,
        status: ['Contato', 'Negociação', 'Ganho', 'Perdido'][index % 4],
        nome_projeto: `Project ${index + 1}`,
        valor_total_projeto: Math.floor(Math.random() * 100000) + 10000,
      }));
      
      return mockOportunidades;
    }
    
    return [];
  } catch (err) {
    console.error('Error in getOportunidadesCompletas:', err);
    return [];
  }
}

// Export opportunities to CSV
export async function exportOportunidadesToCSV(): Promise<string> {
  try {
    const oportunidades = await getOportunidadesCompletas();
    
    // Create CSV header
    const header = 'ID,Data,Empresa,Tipo,Origem,Destino,Status,Projeto,Valor\n';
    
    // Create CSV rows
    const rows = oportunidades.map(op => {
      return `${op.id_oportunidade},${new Date(op.data_envio_recebimento).toLocaleDateString()},${op.nome_empresa_lead},${op.tipo_oportunidade},${op.empresa_origem || op.parceiro_origem || '-'},${op.empresa_destino || (op.parceiros_destino ? op.parceiros_destino.join('; ') : '-')},${op.status},${op.nome_projeto || '-'},${op.valor_total_projeto || 0}`;
    }).join('\n');
    
    // Return CSV content
    return `data:text/csv;charset=utf-8,${encodeURIComponent(header + rows)}`;
  } catch (err) {
    console.error('Error exporting to CSV:', err);
    throw new Error('Falha ao exportar para CSV');
  }
}

// Create new opportunity
export async function createOportunidade(
  oportunidade: Omit<Oportunidade, 'id_oportunidade' | 'data_criacao' | 'data_ultima_modificacao'>,
  lead: Partial<Lead>,
  parceirosDestinoIds?: number[]
): Promise<void> {
  // This is a mock implementation until the database schema is fully set up
  console.log('Creating opportunity:', oportunidade);
  console.log('Lead data:', lead);
  console.log('Partner destination IDs:', parceirosDestinoIds);
  
  // Success - no actual saving happening yet
  return Promise.resolve();
}

// Update opportunity
export async function updateOportunidade(
  id: number,
  oportunidade: Partial<Oportunidade>
): Promise<void> {
  // This is a mock implementation until the database schema is fully set up
  console.log('Updating opportunity:', id, oportunidade);
  
  // Success - no actual saving happening yet
  return Promise.resolve();
}

// Get partners
export async function getParceirosExternos() {
  try {
    // Use the partners table and adapt it to the expected format
    const { data, error } = await supabase.from('partners').select('*');
    
    if (error) throw error;
    
    // Map to the expected format
    return data.map((partner) => ({
      id_parceiro_externo: parseInt(partner.id.split('-')[0], 16),
      nome_parceiro: partner.name,
      email_parceiro: `contact@${partner.name.toLowerCase().replace(/\s+/g, '')}.com`,
      telefone_parceiro: null,
      observacoes: null,
      data_criacao: partner.created_at
    }));
  } catch (err) {
    console.error('Error fetching partners:', err);
    return [];
  }
}

// Add partner
export async function adicionarParceiroExterno(parceiro: Partial<ParceiroExterno>) {
  try {
    // Use the partners table
    const { data, error } = await supabase.from('partners').insert({
      name: parceiro.nome_parceiro || '',
      size: 'Medium',
      engagement: 5,
      lead_potential: 8,
      investment_potential: 7
    }).select();
    
    if (error) throw error;
    
    return data;
  } catch (err) {
    console.error('Error adding partner:', err);
    throw err;
  }
}

// Update partner
export async function atualizarParceiroExterno(id: number, parceiro: Partial<ParceiroExterno>) {
  try {
    // Find the UUID of the partner with the approximate ID
    const { data: partners, error: findError } = await supabase
      .from('partners')
      .select('id')
      .limit(id);
    
    if (findError) throw findError;
    if (!partners || partners.length === 0) throw new Error('Partner not found');
    
    // Use the UUID to update
    const partnerId = partners[partners.length - 1].id;
    
    const { data, error } = await supabase
      .from('partners')
      .update({
        name: parceiro.nome_parceiro
      })
      .eq('id', partnerId)
      .select();
    
    if (error) throw error;
    
    return data;
  } catch (err) {
    console.error('Error updating partner:', err);
    throw err;
  }
}

// Remove partner
export async function removerParceiroExterno(id: number) {
  try {
    // Find the UUID of the partner with the approximate ID
    const { data: partners, error: findError } = await supabase
      .from('partners')
      .select('id')
      .limit(id);
    
    if (findError) throw findError;
    if (!partners || partners.length === 0) throw new Error('Partner not found');
    
    // Use the UUID to delete
    const partnerId = partners[partners.length - 1].id;
    
    const { error } = await supabase
      .from('partners')
      .delete()
      .eq('id', partnerId);
    
    if (error) throw error;
    
    return true;
  } catch (err) {
    console.error('Error removing partner:', err);
    throw err;
  }
}
