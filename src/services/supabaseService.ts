
import { supabase } from "@/integrations/supabase/client";
import { 
  Oportunidade, ParceiroExterno, EmpresaGrupo, Lead,
  StatusOportunidade, Usuario, ObservacaoOportunidade,
  HistoricoAlteracoesOportunidade, AnexoOportunidade,
  LineChartDataPoint, ChartDataPoint, BalanceData
} from "@/types";

// Serviço para Oportunidades
export const oportunidadeService = {
  // Buscar todas as oportunidades
  getAll: async (): Promise<Oportunidade[]> => {
    const { data, error } = await supabase
      .from('oportunidades')
      .select(`
        *,
        empresas_grupo_origem:empresa_origem_id(id, nome),
        empresas_grupo_destino:empresa_destino_id(id, nome),
        parceiros_externos(*),
        status_oportunidade(*),
        leads(*),
        usuarios:id_responsavel_envio_recebimento(*),
        oportunidade_parceiro_saida(*, parceiros_externos(*))
      `);
    
    if (error) {
      console.error("Erro ao buscar oportunidades:", error);
      throw error;
    }
    
    return data || [];
  },

  // Buscar oportunidade por ID
  getById: async (id: number): Promise<Oportunidade | null> => {
    const { data, error } = await supabase
      .from('oportunidades')
      .select(`
        *,
        empresas_grupo_origem:empresa_origem_id(id, nome),
        empresas_grupo_destino:empresa_destino_id(id, nome),
        parceiros_externos(*),
        status_oportunidade(*),
        leads(*),
        usuarios:id_responsavel_envio_recebimento(*),
        oportunidade_parceiro_saida(*, parceiros_externos(*))
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Erro ao buscar oportunidade ${id}:`, error);
      if (error.code === 'PGRST116') return null; // Não encontrado
      throw error;
    }
    
    return data;
  },

  // Criar nova oportunidade
  create: async (oportunidade: Partial<Oportunidade>): Promise<Oportunidade> => {
    const { data, error } = await supabase
      .from('oportunidades')
      .insert([oportunidade])
      .select();
    
    if (error) {
      console.error("Erro ao criar oportunidade:", error);
      throw error;
    }
    
    return data![0];
  },

  // Atualizar oportunidade
  update: async (id: number, oportunidade: Partial<Oportunidade>): Promise<Oportunidade> => {
    const { data, error } = await supabase
      .from('oportunidades')
      .update(oportunidade)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error(`Erro ao atualizar oportunidade ${id}:`, error);
      throw error;
    }
    
    return data![0];
  }
};

// Serviço para Parceiros Externos
export const parceiroExternoService = {
  getAll: async (): Promise<ParceiroExterno[]> => {
    const { data, error } = await supabase
      .from('parceiros_externos')
      .select('*');
    
    if (error) {
      console.error("Erro ao buscar parceiros externos:", error);
      throw error;
    }
    
    return data || [];
  }
};

// Serviço para Empresas do Grupo
export const empresaGrupoService = {
  getAll: async (): Promise<EmpresaGrupo[]> => {
    const { data, error } = await supabase
      .from('empresas_grupo')
      .select('*');
    
    if (error) {
      console.error("Erro ao buscar empresas do grupo:", error);
      throw error;
    }
    
    return data || [];
  }
};

// Serviço para Leads
export const leadService = {
  getAll: async (): Promise<Lead[]> => {
    const { data, error } = await supabase
      .from('leads')
      .select('*');
    
    if (error) {
      console.error("Erro ao buscar leads:", error);
      throw error;
    }
    
    return data || [];
  },
  
  create: async (lead: Partial<Lead>): Promise<Lead> => {
    const { data, error } = await supabase
      .from('leads')
      .insert([lead])
      .select();
    
    if (error) {
      console.error("Erro ao criar lead:", error);
      throw error;
    }
    
    return data![0];
  }
};

// Serviço para Status de Oportunidade
export const statusOportunidadeService = {
  getAll: async (): Promise<StatusOportunidade[]> => {
    const { data, error } = await supabase
      .from('status_oportunidade')
      .select('*');
    
    if (error) {
      console.error("Erro ao buscar status de oportunidade:", error);
      throw error;
    }
    
    return data || [];
  }
};

// Serviço para Usuários
export const usuarioService = {
  getAll: async (): Promise<Usuario[]> => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*, empresas_grupo(*)');
    
    if (error) {
      console.error("Erro ao buscar usuários:", error);
      throw error;
    }
    
    return data || [];
  },
  
  getById: async (id: string): Promise<Usuario | null> => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*, empresas_grupo(*)')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Erro ao buscar usuário ${id}:`, error);
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return data;
  }
};

// Serviço para Observações de Oportunidade
export const observacaoOportunidadeService = {
  getByOportunidadeId: async (oportunidadeId: number): Promise<ObservacaoOportunidade[]> => {
    const { data, error } = await supabase
      .from('observacoes_oportunidade')
      .select('*, usuarios(*)')
      .eq('oportunidade_id', oportunidadeId)
      .order('data_criacao', { ascending: false });
    
    if (error) {
      console.error(`Erro ao buscar observações da oportunidade ${oportunidadeId}:`, error);
      throw error;
    }
    
    return data || [];
  },
  
  create: async (observacao: Partial<ObservacaoOportunidade>): Promise<ObservacaoOportunidade> => {
    const { data, error } = await supabase
      .from('observacoes_oportunidade')
      .insert([observacao])
      .select();
    
    if (error) {
      console.error("Erro ao criar observação:", error);
      throw error;
    }
    
    return data![0];
  }
};

// Serviço para Histórico de Alterações de Oportunidade
export const historicoAlteracoesService = {
  getByOportunidadeId: async (oportunidadeId: number): Promise<HistoricoAlteracoesOportunidade[]> => {
    const { data, error } = await supabase
      .from('historico_alteracoes_oportunidade')
      .select('*, usuarios(*)')
      .eq('oportunidade_id', oportunidadeId)
      .order('data_modificacao', { ascending: false });
    
    if (error) {
      console.error(`Erro ao buscar histórico da oportunidade ${oportunidadeId}:`, error);
      throw error;
    }
    
    return data || [];
  },
  
  create: async (historico: Partial<HistoricoAlteracoesOportunidade>): Promise<HistoricoAlteracoesOportunidade> => {
    const { data, error } = await supabase
      .from('historico_alteracoes_oportunidade')
      .insert([historico])
      .select();
    
    if (error) {
      console.error("Erro ao criar histórico:", error);
      throw error;
    }
    
    return data![0];
  }
};

// Serviço para Anexos de Oportunidade
export const anexoOportunidadeService = {
  getByOportunidadeId: async (oportunidadeId: number): Promise<AnexoOportunidade[]> => {
    const { data, error } = await supabase
      .from('anexos_oportunidade')
      .select('*, usuarios(*)')
      .eq('oportunidade_id', oportunidadeId)
      .order('data_upload', { ascending: false });
    
    if (error) {
      console.error(`Erro ao buscar anexos da oportunidade ${oportunidadeId}:`, error);
      throw error;
    }
    
    return data || [];
  }
};

// Serviços para obtenção de dados analíticos
export const analyticService = {
  // Obter dados mensais para gráficos
  getMonthlyData: async (): Promise<LineChartDataPoint[]> => {
    const oportunidades = await oportunidadeService.getAll();
    const empresas = await empresaGrupoService.getAll();
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const data: LineChartDataPoint[] = [];

    for (let i = 0; i < 12; i++) {
      const monthData: LineChartDataPoint = { name: months[i] };
      
      // Inicializa contagens para cada empresa
      empresas.forEach(company => {
        monthData[company.nome] = 0;
      });

      // Filtra oportunidades para este mês e conta por empresa
      oportunidades.forEach(opp => {
        const oppDate = opp.data_envio ? new Date(opp.data_envio) : null;
        if (oppDate && oppDate.getMonth() === i && oppDate.getFullYear() === currentYear) {
          if (opp.tipo_oportunidade === 'intragrupo' && opp.empresa_origem_id) {
            const empresa = empresas.find(e => e.id === opp.empresa_origem_id);
            if (empresa && empresa.nome) {
              monthData[empresa.nome] = (monthData[empresa.nome] as number) + 1;
            }
          } else if (opp.tipo_oportunidade === 'externa_saida' && opp.empresa_origem_id) {
            const empresa = empresas.find(e => e.id === opp.empresa_origem_id);
            if (empresa && empresa.nome) {
              monthData[empresa.nome] = (monthData[empresa.nome] as number) + 1;
            }
          }
        }
      });

      data.push(monthData);
    }

    return data;
  },

  // Obter dados de balanço de parceiros
  getPartnerBalanceData: async (): Promise<BalanceData[]> => {
    const oportunidades = await oportunidadeService.getAll();
    const parceirosExternos = await parceiroExternoService.getAll();
    const balanceData: BalanceData[] = [];

    parceirosExternos.forEach(parceiro => {
      // Oportunidades enviadas (saída)
      const sent = oportunidades.filter(opp => {
        if (opp.tipo_oportunidade === 'externa_saida' && opp.oportunidade_parceiro_saida) {
          return opp.oportunidade_parceiro_saida.some(p => p.parceiro_externo_id === parceiro.id);
        }
        return false;
      }).length;
      
      // Oportunidades recebidas (entrada)
      const received = oportunidades.filter(opp => 
        opp.tipo_oportunidade === 'externa_entrada' && opp.parceiro_externo_id === parceiro.id
      ).length;

      balanceData.push({
        partnerName: parceiro.nome,
        sent,
        received,
        balance: received - sent
      });
    });

    return balanceData;
  },

  // Obter distribuição de oportunidades por empresa
  getOpportunityDistributionByCompany: async (): Promise<ChartDataPoint[]> => {
    const oportunidades = await oportunidadeService.getAll();
    const empresas = await empresaGrupoService.getAll();
    const distribution: Record<string, number> = {};

    empresas.forEach(empresa => {
      distribution[empresa.nome] = 0;
    });

    oportunidades.forEach(opp => {
      if ((opp.tipo_oportunidade === 'intragrupo' || opp.tipo_oportunidade === 'externa_saida') && opp.empresa_origem_id) {
        const empresa = empresas.find(e => e.id === opp.empresa_origem_id);
        if (empresa) {
          distribution[empresa.nome] = (distribution[empresa.nome] || 0) + 1;
        }
      }
    });

    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  },

  // Obter dados trimestrais
  getQuarterlyData: async (): Promise<ChartDataPoint[]> => {
    const oportunidades = await oportunidadeService.getAll();
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const data: ChartDataPoint[] = quarters.map(name => ({ name, value: 0 }));
    const currentYear = new Date().getFullYear();

    oportunidades.forEach(opp => {
      if (!opp.data_envio) return;
      
      const oppDate = new Date(opp.data_envio);
      if (oppDate.getFullYear() === currentYear) {
        const quarter = Math.floor(oppDate.getMonth() / 3);
        data[quarter].value += 1;
      }
    });

    return data;
  },

  // Obter dados de intercâmbio intragrupo
  getIntraGroupExchangeData: async () => {
    const oportunidades = await oportunidadeService.getAll();
    const empresas = await empresaGrupoService.getAll();
    const exchangeMatrix: Record<string, Record<string, number>> = {};

    empresas.forEach(source => {
      exchangeMatrix[source.nome] = {};
      empresas.forEach(target => {
        exchangeMatrix[source.nome][target.nome] = 0;
      });
    });

    oportunidades
      .filter(opp => opp.tipo_oportunidade === 'intragrupo')
      .forEach(opp => {
        if (opp.empresa_origem_id && opp.empresa_destino_id) {
          const sourceCompany = empresas.find(e => e.id === opp.empresa_origem_id);
          const targetCompany = empresas.find(e => e.id === opp.empresa_destino_id);
          
          if (sourceCompany && targetCompany) {
            exchangeMatrix[sourceCompany.nome][targetCompany.nome] += 1;
          }
        }
      });

    return exchangeMatrix;
  },

  // Calcular o balanço geral entre o grupo A&eight e parceiros externos
  getGroupPartnerBalanceData: async () => {
    const oportunidades = await oportunidadeService.getAll();
    
    // Total enviado para parceiros externos
    const totalSent = oportunidades.filter(
      opp => opp.tipo_oportunidade === 'externa_saida'
    ).length;
    
    // Total recebido de parceiros externos
    const totalReceived = oportunidades.filter(
      opp => opp.tipo_oportunidade === 'externa_entrada'
    ).length;
    
    // Cálculo do balanço
    const balance = totalReceived - totalSent;
    
    // Dados de balanço mensal para gráfico
    const monthlyBalanceData = Array.from({ length: 12 }, (_, i) => {
      const month = new Date();
      month.setMonth(i);
      const monthName = month.toLocaleString('default', { month: 'short' });
      
      const sent = oportunidades.filter(opp => {
        if (!opp.data_envio) return false;
        const oppDate = new Date(opp.data_envio);
        return opp.tipo_oportunidade === 'externa_saida' && oppDate.getMonth() === i;
      }).length;
      
      const received = oportunidades.filter(opp => {
        if (!opp.data_envio) return false;
        const oppDate = new Date(opp.data_envio);
        return opp.tipo_oportunidade === 'externa_entrada' && oppDate.getMonth() === i;
      }).length;
      
      return {
        name: monthName,
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
  }
};
