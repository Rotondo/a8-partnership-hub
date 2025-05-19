
import { supabase } from "@/integrations/supabase/client";
import { 
  Oportunidade, ParceiroExterno, EmpresaGrupo, Lead,
  StatusOportunidade, Usuario, ObservacaoOportunidade,
  HistoricoAlteracoesOportunidade, AnexoOportunidade,
  LineChartDataPoint, ChartDataPoint, BalanceData
} from "@/types";
import { getMockOportunidades, getMockParceirosExternos, getMockEmpresasGrupo, getMockStatusOportunidades } from "@/types/supabase-extended";

// Serviço para Oportunidades
export const oportunidadeService = {
  // Buscar todas as oportunidades
  getAll: async (): Promise<Oportunidade[]> => {
    try {
      // For now, using mock data as the tables don't exist yet
      return getMockOportunidades();
    } catch (error) {
      console.error("Erro ao buscar oportunidades:", error);
      throw error;
    }
  },

  // Buscar oportunidade por ID
  getById: async (id: number): Promise<Oportunidade | null> => {
    try {
      // For now, using mock data
      const all = getMockOportunidades();
      const found = all.find(opp => opp.id_oportunidade === id);
      return found || null;
    } catch (error) {
      console.error(`Erro ao buscar oportunidade ${id}:`, error);
      return null;
    }
  },

  // Criar nova oportunidade
  create: async (oportunidade: Partial<Oportunidade>): Promise<Oportunidade> => {
    try {
      // Using mock data for now
      const mockOportunidade = {
        ...getMockOportunidades()[0],
        ...oportunidade,
        id_oportunidade: Date.now()
      };
      return mockOportunidade;
    } catch (error) {
      console.error("Erro ao criar oportunidade:", error);
      throw error;
    }
  },

  // Atualizar oportunidade
  update: async (id: number, oportunidade: Partial<Oportunidade>): Promise<Oportunidade> => {
    try {
      // Using mock data for now
      const all = getMockOportunidades();
      const current = all.find(opp => opp.id_oportunidade === id) || all[0];
      return {
        ...current,
        ...oportunidade
      };
    } catch (error) {
      console.error(`Erro ao atualizar oportunidade ${id}:`, error);
      throw error;
    }
  }
};

// Serviço para Parceiros Externos
export const parceiroExternoService = {
  getAll: async (): Promise<ParceiroExterno[]> => {
    try {
      // For now, using mock data
      return getMockParceirosExternos();
    } catch (error) {
      console.error("Erro ao buscar parceiros externos:", error);
      throw error;
    }
  }
};

// Serviço para Empresas do Grupo
export const empresaGrupoService = {
  getAll: async (): Promise<EmpresaGrupo[]> => {
    try {
      // For now, using mock data
      return getMockEmpresasGrupo();
    } catch (error) {
      console.error("Erro ao buscar empresas do grupo:", error);
      throw error;
    }
  }
};

// Serviço para Leads
export const leadService = {
  getAll: async (): Promise<Lead[]> => {
    try {
      // Using mock data for now
      return getMockOportunidades().map(opp => ({
        id_lead: opp.id_lead,
        nome_empresa_lead: opp.nome_empresa_lead,
        nome_contato_lead: opp.nome_contato_lead,
        email_lead: opp.email_lead,
        telefone_lead: opp.telefone_lead,
        data_criacao: opp.data_criacao
      }));
    } catch (error) {
      console.error("Erro ao buscar leads:", error);
      throw error;
    }
  },
  
  create: async (lead: Partial<Lead>): Promise<Lead> => {
    try {
      // Create mock lead
      const mockLead: Lead = {
        id_lead: Date.now(),
        nome_empresa_lead: lead.nome_empresa_lead || "Nova Empresa Lead",
        nome_contato_lead: lead.nome_contato_lead,
        email_lead: lead.email_lead,
        telefone_lead: lead.telefone_lead,
        data_criacao: new Date().toISOString()
      };
      return mockLead;
    } catch (error) {
      console.error("Erro ao criar lead:", error);
      throw error;
    }
  }
};

// Serviço para Status de Oportunidade
export const statusOportunidadeService = {
  getAll: async (): Promise<StatusOportunidade[]> => {
    try {
      // For now, using mock data
      return getMockStatusOportunidades();
    } catch (error) {
      console.error("Erro ao buscar status de oportunidade:", error);
      throw error;
    }
  }
};

// Serviço para Usuários
export const usuarioService = {
  getAll: async (): Promise<Usuario[]> => {
    try {
      // Mock user data
      const mockUsers: Usuario[] = [
        {
          id: "1",
          nome_usuario: "Usuário Teste 1",
          email: "usuario1@teste.com",
          id_empresa_grupo: 1,
          data_criacao: new Date().toISOString(),
          empresas_grupo: { nome: "Empresa A" }
        },
        {
          id: "2",
          nome_usuario: "Usuário Teste 2",
          email: "usuario2@teste.com",
          id_empresa_grupo: 2,
          data_criacao: new Date().toISOString(),
          empresas_grupo: { nome: "Empresa B" }
        }
      ];
      return mockUsers;
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      throw error;
    }
  },
  
  getById: async (id: string): Promise<Usuario | null> => {
    try {
      // Mock user data lookup
      const mockUsers: Usuario[] = [
        {
          id: "1",
          nome_usuario: "Usuário Teste 1",
          email: "usuario1@teste.com",
          id_empresa_grupo: 1,
          data_criacao: new Date().toISOString(),
          empresas_grupo: { nome: "Empresa A" }
        },
        {
          id: "2",
          nome_usuario: "Usuário Teste 2",
          email: "usuario2@teste.com",
          id_empresa_grupo: 2,
          data_criacao: new Date().toISOString(),
          empresas_grupo: { nome: "Empresa B" }
        }
      ];
      return mockUsers.find(user => user.id === id) || null;
    } catch (error) {
      console.error(`Erro ao buscar usuário ${id}:`, error);
      return null;
    }
  }
};

// Serviço para Observações de Oportunidade
export const observacaoOportunidadeService = {
  getByOportunidadeId: async (oportunidadeId: number): Promise<ObservacaoOportunidade[]> => {
    try {
      // Mock observations
      const mockObservacoes: ObservacaoOportunidade[] = [
        {
          id_observacao: 1,
          id_oportunidade: oportunidadeId,
          id_usuario: 1,
          conteudo: "Primeira observação de teste",
          data_criacao: new Date().toISOString(),
          usuarios: { nome_usuario: "Usuário Teste 1" }
        },
        {
          id_observacao: 2,
          id_oportunidade: oportunidadeId,
          id_usuario: 2,
          conteudo: "Segunda observação de teste",
          data_criacao: new Date(Date.now() - 86400000).toISOString(),
          usuarios: { nome_usuario: "Usuário Teste 2" }
        }
      ];
      return mockObservacoes;
    } catch (error) {
      console.error(`Erro ao buscar observações da oportunidade ${oportunidadeId}:`, error);
      throw error;
    }
  },
  
  create: async (observacao: Partial<ObservacaoOportunidade>): Promise<ObservacaoOportunidade> => {
    try {
      // Create mock observation
      const mockObservacao: ObservacaoOportunidade = {
        id_observacao: Date.now(),
        id_oportunidade: observacao.id_oportunidade || 0,
        id_usuario: observacao.id_usuario || 1,
        conteudo: observacao.conteudo || "",
        data_criacao: new Date().toISOString(),
        usuarios: { nome_usuario: "Usuário Teste" }
      };
      return mockObservacao;
    } catch (error) {
      console.error("Erro ao criar observação:", error);
      throw error;
    }
  }
};

// Serviço para Histórico de Alterações de Oportunidade
export const historicoAlteracoesService = {
  getByOportunidadeId: async (oportunidadeId: number): Promise<HistoricoAlteracoesOportunidade[]> => {
    try {
      // Mock history data
      const mockHistorico: HistoricoAlteracoesOportunidade[] = [
        {
          id: 1,
          oportunidade_id: oportunidadeId,
          usuario_id: "1",
          tipo_alteracao: "status",
          valor_anterior: "Contato",
          valor_novo: "Negociação",
          data_modificacao: new Date().toISOString(),
          usuarios: { nome_usuario: "Usuário Teste 1" }
        },
        {
          id: 2,
          oportunidade_id: oportunidadeId,
          usuario_id: "2",
          tipo_alteracao: "valor",
          valor_anterior: "45000",
          valor_novo: "50000",
          data_modificacao: new Date(Date.now() - 86400000).toISOString(),
          usuarios: { nome_usuario: "Usuário Teste 2" }
        }
      ];
      return mockHistorico;
    } catch (error) {
      console.error(`Erro ao buscar histórico da oportunidade ${oportunidadeId}:`, error);
      throw error;
    }
  },
  
  create: async (historico: Partial<HistoricoAlteracoesOportunidade>): Promise<HistoricoAlteracoesOportunidade> => {
    try {
      // Create mock history entry
      const mockHistorico: HistoricoAlteracoesOportunidade = {
        id: Date.now(),
        oportunidade_id: historico.oportunidade_id || 0,
        usuario_id: historico.usuario_id || "1",
        tipo_alteracao: historico.tipo_alteracao || "",
        valor_anterior: historico.valor_anterior || "",
        valor_novo: historico.valor_novo || "",
        data_modificacao: new Date().toISOString(),
        usuarios: { nome_usuario: "Usuário Teste" }
      };
      return mockHistorico;
    } catch (error) {
      console.error("Erro ao criar histórico:", error);
      throw error;
    }
  }
};

// Serviço para Anexos de Oportunidade
export const anexoOportunidadeService = {
  getByOportunidadeId: async (oportunidadeId: number): Promise<AnexoOportunidade[]> => {
    try {
      // Mock attachments
      const mockAnexos: AnexoOportunidade[] = [
        {
          id: 1,
          oportunidade_id: oportunidadeId,
          usuario_id: "1",
          nome_arquivo: "proposta.pdf",
          url_arquivo: "https://example.com/proposta.pdf",
          tamanho_arquivo: 1024000,
          data_upload: new Date().toISOString(),
          usuarios: { nome_usuario: "Usuário Teste 1" }
        },
        {
          id: 2,
          oportunidade_id: oportunidadeId,
          usuario_id: "2",
          nome_arquivo: "contrato.pdf",
          url_arquivo: "https://example.com/contrato.pdf",
          tamanho_arquivo: 2048000,
          data_upload: new Date(Date.now() - 86400000).toISOString(),
          usuarios: { nome_usuario: "Usuário Teste 2" }
        }
      ];
      return mockAnexos;
    } catch (error) {
      console.error(`Erro ao buscar anexos da oportunidade ${oportunidadeId}:`, error);
      throw error;
    }
  }
};

// Serviços para obtenção de dados analíticos
export const analyticService = {
  // Obter dados mensais para gráficos
  getMonthlyData: async (): Promise<LineChartDataPoint[]> => {
    try {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const empresas = await empresaGrupoService.getAll();
      
      // Generate mock data
      const mockData: LineChartDataPoint[] = [];
      
      for (let i = 0; i < 12; i++) {
        const monthData: Record<string, string | number> = { name: months[i] };
        
        // Add data for each company
        empresas.forEach(empresa => {
          monthData[empresa.nome_empresa] = Math.floor(Math.random() * 10) + 1;
        });
        
        mockData.push(monthData as LineChartDataPoint);
      }
      
      return mockData;
    } catch (error) {
      console.error("Erro ao gerar dados mensais:", error);
      return [];
    }
  },

  // Obter dados de balanço de parceiros
  getPartnerBalanceData: async (): Promise<BalanceData[]> => {
    try {
      const parceiros = await parceiroExternoService.getAll();
      
      // Generate mock data
      return parceiros.map(parceiro => {
        const sent = Math.floor(Math.random() * 15) + 1;
        const received = Math.floor(Math.random() * 15) + 1;
        
        return {
          partnerName: parceiro.nome_parceiro,
          sent,
          received,
          balance: received - sent
        };
      });
    } catch (error) {
      console.error("Erro ao gerar dados de balanço de parceiros:", error);
      return [];
    }
  },

  // Obter distribuição de oportunidades por empresa
  getOpportunityDistributionByCompany: async (): Promise<ChartDataPoint[]> => {
    try {
      const empresas = await empresaGrupoService.getAll();
      
      // Generate mock data
      return empresas.map(empresa => ({
        name: empresa.nome_empresa,
        value: Math.floor(Math.random() * 20) + 5
      }));
    } catch (error) {
      console.error("Erro ao gerar distribuição de oportunidades:", error);
      return [];
    }
  },

  // Obter dados trimestrais
  getQuarterlyData: async (): Promise<ChartDataPoint[]> => {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    
    // Generate mock data
    return quarters.map(quarter => ({
      name: quarter,
      value: Math.floor(Math.random() * 30) + 10
    }));
  },

  // Obter dados de intercâmbio intragrupo
  getIntraGroupExchangeData: async () => {
    try {
      const empresas = await empresaGrupoService.getAll();
      const exchangeMatrix: Record<string, Record<string, number>> = {};
      
      // Initialize matrix
      empresas.forEach(source => {
        exchangeMatrix[source.nome_empresa] = {};
        empresas.forEach(target => {
          if (source.id_empresa_grupo !== target.id_empresa_grupo) {
            exchangeMatrix[source.nome_empresa][target.nome_empresa] = Math.floor(Math.random() * 8);
          } else {
            exchangeMatrix[source.nome_empresa][target.nome_empresa] = 0;
          }
        });
      });
      
      return exchangeMatrix;
    } catch (error) {
      console.error("Erro ao gerar matriz de intercâmbio:", error);
      return {};
    }
  },

  // Calcular o balanço geral entre o grupo A&eight e parceiros externos
  getGroupPartnerBalanceData: async () => {
    try {
      // Generate mock balance data
      const totalSent = Math.floor(Math.random() * 50) + 30;
      const totalReceived = Math.floor(Math.random() * 50) + 30;
      const balance = totalReceived - totalSent;
      
      // Generate monthly balance data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyBalanceData = months.map(month => {
        const sent = Math.floor(Math.random() * 8) + 1;
        const received = Math.floor(Math.random() * 8) + 1;
        return {
          name: month,
          sent,
          received,
          balance: received - sent
        };
      });
      
      return {
        totalSent,
        totalReceived,
        balance,
        monthlyBalanceData
      };
    } catch (error) {
      console.error("Erro ao gerar dados de balanço geral:", error);
      return {
        totalSent: 0,
        totalReceived: 0,
        balance: 0,
        monthlyBalanceData: []
      };
    }
  }
};
