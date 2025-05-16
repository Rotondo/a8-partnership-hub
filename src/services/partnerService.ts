
import { supabase } from "@/integrations/supabase/client";

export interface Partner {
  id: string;
  name: string;
  size: string;
  lead_potential: number;
  engagement: number;
  investment_potential: number;
  strategic_alignment?: number;
  alert_status?: string;
  created_at?: string;
}

export interface PartnerOpportunity {
  id: string;
  partner_id: string;
  type: 'sent' | 'received';
  created_at: string;
  status: string;
}

export const partnerService = {
  getAll: async (): Promise<Partner[]> => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching partners:', error);
      return [];
    }
  },
  
  getOpportunitiesByCompany: async () => {
    try {
      const { data, error } = await supabase.rpc('get_opportunities_by_company');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching opportunities by company:', error);
      return [];
    }
  },
  
  // Mock function to generate data if real data is not available
  getMockData: () => {
    return {
      partners: [
        { id: '1', name: 'Cryah', size: 'Medium', lead_potential: 8, engagement: 7, investment_potential: 9 },
        { id: '2', name: 'Lomadee', size: 'Large', lead_potential: 9, engagement: 6, investment_potential: 8 },
        { id: '3', name: 'Monitfy', size: 'Small', lead_potential: 7, engagement: 8, investment_potential: 6 },
        { id: '4', name: 'Boone', size: 'Medium', lead_potential: 8, engagement: 9, investment_potential: 7 },
        { id: '5', name: 'SAIO', size: 'Large', lead_potential: 9, engagement: 8, investment_potential: 9 }
      ],
      opportunitiesByCompany: [
        { empresa: 'Cryah', enviadas: 15, recebidas: 12 },
        { empresa: 'Lomadee', enviadas: 8, recebidas: 14 },
        { empresa: 'Monitfy', enviadas: 11, recebidas: 7 },
        { empresa: 'Boone', enviadas: 9, recebidas: 17 },
        { empresa: 'SAIO', enviadas: 16, recebidas: 9 }
      ]
    };
  }
};
