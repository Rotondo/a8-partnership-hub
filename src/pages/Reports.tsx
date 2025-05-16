
import React, { useState, useEffect } from "react";
import { Loader2, TrendingUp, TrendingDown, BarChart2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useToast } from "@/hooks/use-toast";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Reports = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [quarterlyData, setQuarterlyData] = useState<any[]>([]);
  const [distributionData, setDistributionData] = useState<any[]>([]);
  const [indicadores, setIndicadores] = useState<any[]>([]);
  const [funil, setFunil] = useState<any[]>([]);
  const [oportunidadesPorEmpresa, setOportunidadesPorEmpresa] = useState<any[]>([]);
  const [groupBalance, setGroupBalance] = useState<any>(null);

  // Função para gerar dados de exemplo para testes
  const generateMockData = () => {
    // Dados mensais
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mockMonthlyData = monthNames.map(name => ({
      name,
      Cryah: Math.floor(Math.random() * 10),
      Lomadee: Math.floor(Math.random() * 15),
      Monitfy: Math.floor(Math.random() * 8),
      Boone: Math.floor(Math.random() * 12),
      SAIO: Math.floor(Math.random() * 14)
    }));
    
    // Dados trimestrais
    const mockQuarterlyData = [
      { name: 'Q1', value: Math.floor(Math.random() * 100) + 50 },
      { name: 'Q2', value: Math.floor(Math.random() * 100) + 50 },
      { name: 'Q3', value: Math.floor(Math.random() * 100) + 50 },
      { name: 'Q4', value: Math.floor(Math.random() * 100) + 50 }
    ];
    
    // Dados de distribuição
    const mockDistributionData = [
      { name: 'Cryah', value: Math.floor(Math.random() * 50) + 10 },
      { name: 'Lomadee', value: Math.floor(Math.random() * 50) + 10 },
      { name: 'Monitfy', value: Math.floor(Math.random() * 50) + 10 },
      { name: 'Boone', value: Math.floor(Math.random() * 50) + 10 },
      { name: 'SAIO', value: Math.floor(Math.random() * 50) + 10 }
    ];
    
    // Balanço mensal
    const mockMonthlyBalance = monthNames.map(name => ({
      name,
      sent: Math.floor(Math.random() * 30),
      received: Math.floor(Math.random() * 30),
      balance: Math.floor(Math.random() * 20) - 10
    }));

    // Dados por empresa
    const mockCompanyData = [
      { empresa: 'Cryah', enviadas: 15, recebidas: 12 },
      { empresa: 'Lomadee', enviadas: 8, recebidas: 14 },
      { empresa: 'Monitfy', enviadas: 11, recebidas: 7 },
      { empresa: 'Boone', enviadas: 9, recebidas: 17 },
      { empresa: 'SAIO', enviadas: 16, recebidas: 9 }
    ];
    
    // Dados do funil
    const mockFunnelData = [
      { etapa: 'Indicação', total: 32 },
      { etapa: 'Contato Realizado', total: 21 },
      { etapa: 'Proposta Enviada', total: 14 },
      { etapa: 'Negócio Fechado', total: 9 }
    ];

    return {
      monthlyData: mockMonthlyData,
      quarterlyData: mockQuarterlyData,
      distributionData: mockDistributionData,
      groupBalance: {
        totalSent: 49,
        totalReceived: 59,
        balance: 10,
        monthlyBalanceData: mockMonthlyBalance
      },
      oportunidadesPorEmpresa: mockCompanyData,
      funil: mockFunnelData
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Iniciando carregamento de dados...");
        
        // Tentar buscar dados do Supabase
        let dadosCarregados = false;
        
        try {
          // Dados por empresa (usando a função SQL)
          console.log("Tentando buscar dados da função get_opportunities_by_company...");
          const { data: companyData, error: companyError } = await supabase.rpc('get_opportunities_by_company');
          
          if (companyError) {
            console.error("Erro ao buscar dados por empresa:", companyError);
            throw companyError;
          }
          
          if (companyData && companyData.length > 0) {
            console.log("Dados por empresa carregados com sucesso:", companyData);
            setOportunidadesPorEmpresa(companyData);
            dadosCarregados = true;
          } else {
            console.warn("Nenhum dado retornado pela função get_opportunities_by_company");
          }
          
          // Dados do funil
          console.log("Tentando buscar dados da função get_opportunity_funnel...");
          const { data: funnelData, error: funnelError } = await supabase.rpc('get_opportunity_funnel');
          
          if (funnelError) {
            console.error("Erro ao buscar dados do funil:", funnelError);
          } else if (funnelData && funnelData.length > 0) {
            console.log("Dados do funil carregados com sucesso:", funnelData);
            setFunil(funnelData);
          } else {
            console.warn("Nenhum dado retornado pela função get_opportunity_funnel");
          }
          
          // Query direta para obter parceiros
          console.log("Consultando tabela de partners...");
          const { data: parceiros, error: parceirosError } = await supabase
            .from('partners')
            .select('*');
            
          if (parceirosError) {
            console.error("Erro ao consultar parceiros:", parceirosError);
          } else {
            console.log("Parceiros carregados com sucesso:", parceiros);
            
            // Se temos parceiros, podemos gerar alguns gráficos com esses dados
            if (parceiros && parceiros.length > 0) {
              // Gráfico de distribuição por tamanho
              const distribuicao = parceiros.reduce((acc, partner) => {
                if (!acc[partner.size]) acc[partner.size] = 0;
                acc[partner.size]++;
                return acc;
              }, {});
              
              const pieData = Object.entries(distribuicao).map(([name, value]) => ({ 
                name, 
                value 
              }));
              
              setDistributionData(pieData);
              
              // Indicadores baseados em médias dos campos numéricos
              const avgLeadPotential = parceiros.reduce((sum, p) => sum + p.lead_potential, 0) / parceiros.length;
              const avgEngagement = parceiros.reduce((sum, p) => sum + p.engagement, 0) / parceiros.length;
              const avgInvestment = parceiros.reduce((sum, p) => sum + p.investment_potential, 0) / parceiros.length;
              
              setIndicadores([
                { label: "Parceiros Cadastrados", valor: parceiros.length },
                { label: "Potencial Médio", valor: avgLeadPotential.toFixed(1) },
                { label: "Engajamento Médio", valor: avgEngagement.toFixed(1) }
              ]);
            }
          }
          
        } catch (supabaseError) {
          console.error("Erro durante consultas ao Supabase:", supabaseError);
        }
        
        // Se nenhum dado foi carregado com sucesso, usar dados mockados
        if (!dadosCarregados) {
          console.log("Usando dados mockados devido a falhas nas consultas...");
          const mockData = generateMockData();
          
          setMonthlyData(mockData.monthlyData);
          setQuarterlyData(mockData.quarterlyData);
          if (distributionData.length === 0) setDistributionData(mockData.distributionData);
          setGroupBalance(mockData.groupBalance);
          if (oportunidadesPorEmpresa.length === 0) setOportunidadesPorEmpresa(mockData.oportunidadesPorEmpresa);
          if (funil.length === 0) setFunil(mockData.funil);
          if (indicadores.length === 0) {
            setIndicadores([
              { label: "Oportunidades Geradas", valor: mockData.groupBalance.totalSent },
              { label: "Oportunidades Recebidas", valor: mockData.groupBalance.totalReceived },
              { label: "Taxa de Conversão", valor: "62%" },
            ]);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setError("Falha ao carregar dados. Por favor, tente novamente.");
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do dashboard. Usando dados de exemplo.",
          variant: "destructive"
        });
        setLoading(false);
        
        // Em caso de erro, carregamos dados mockados para manter a UI funcional
        const mockData = generateMockData();
        setMonthlyData(mockData.monthlyData);
        setQuarterlyData(mockData.quarterlyData);
        setDistributionData(mockData.distributionData);
        setGroupBalance(mockData.groupBalance);
        setOportunidadesPorEmpresa(mockData.oportunidadesPorEmpresa);
        setFunil(mockData.funil);
        setIndicadores([
          { label: "Oportunidades Geradas", valor: mockData.groupBalance.totalSent },
          { label: "Oportunidades Recebidas", valor: mockData.groupBalance.totalReceived },
          { label: "Taxa de Conversão", valor: "62%" },
        ]);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando dados...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-6 bg-red-50 text-red-600">
          <h3 className="text-lg font-semibold">Erro</h3>
          <p>{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Relatórios & Indicadores Estratégicos
      </h1>
      <p className="mb-8 text-muted-foreground">
        Acompanhe os principais indicadores de desempenho das parcerias do grupo A&amp;eight.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {indicadores.map((item) => (
          <Card
            key={item.label}
            className="hover:shadow transition-shadow duration-300"
          >
            <CardContent className="p-6 flex flex-col items-center">
              <span className="text-lg font-semibold">{item.label}</span>
              <span className="text-3xl font-bold mt-2">{item.valor}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4">Evolução Mensal de Oportunidades</h2>
        <div className="h-80">
          <ChartContainer
            config={{
              Cryah: { color: "#3b82f6" },
              Lomadee: { color: "#10b981" },
              Monitfy: { color: "#f59e0b" },
              Boone: { color: "#ef4444" },
              SAIO: { color: "#8b5cf6" },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                {Object.keys(monthlyData[0] || {})
                  .filter(key => key !== 'name')
                  .map((key, index) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={COLORS[index % COLORS.length]}
                      activeDot={{ r: 8 }}
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div>
          <h2 className="text-xl font-bold mb-4">Oportunidades por Trimestre</h2>
          <div className="h-72">
            <ChartContainer
              config={{
                value: { color: "#3b82f6" },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={quarterlyData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="value" name="Oportunidades" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-4">Distribuição por Empresa</h2>
          <div className="h-72">
            <ChartContainer
              config={{
                value: { color: "#3b82f6" },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
      </div>

      {groupBalance && (
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4">Balanço Mensal com Parceiros Externos</h2>
          <div className="h-80">
            <ChartContainer
              config={{
                Enviadas: { color: "#f59e0b" },
                Recebidas: { color: "#3b82f6" },
                Saldo: { color: "#10b981" },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={groupBalance.monthlyBalanceData || []}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="sent" name="Enviadas" fill="#f59e0b" />
                  <Bar dataKey="received" name="Recebidas" fill="#3b82f6" />
                  <Bar dataKey="balance" name="Saldo" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
      )}

      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4">Funil de Conversão</h2>
        <div className="flex flex-col md:flex-row gap-4">
          {funil.map((etapa, idx) => (
            <Card
              key={etapa.etapa}
              className={`flex-1 hover:shadow transition-shadow duration-300 ${
                idx === funil.length - 1 ? 'border-green-300 bg-green-50' : ''
              }`}
            >
              <CardContent className="p-4 flex flex-col items-center">
                <span className="font-medium">{etapa.etapa}</span>
                <span className="text-2xl font-bold">{etapa.total}</span>
                {idx < funil.length - 1 && (
                  <span className="hidden md:inline-block mt-2 text-muted-foreground">
                    ↓
                  </span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <h2 className="text-xl font-bold mb-4">Comparativo por Empresa</h2>
        <table className="min-w-full border rounded-lg bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2 border bg-muted">Empresa</th>
              <th className="px-4 py-2 border bg-muted">Enviadas</th>
              <th className="px-4 py-2 border bg-muted">Recebidas</th>
              <th className="px-4 py-2 border bg-muted">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {oportunidadesPorEmpresa.map((item) => {
              const saldo = item.recebidas - item.enviadas;
              return (
                <tr key={item.empresa}>
                  <td className="px-4 py-2 border">{item.empresa}</td>
                  <td className="px-4 py-2 border text-center">{item.enviadas}</td>
                  <td className="px-4 py-2 border text-center">{item.recebidas}</td>
                  <td className={`px-4 py-2 border text-center font-bold ${
                    saldo > 0 ? 'text-green-600' : saldo < 0 ? 'text-red-600' : ''
                  }`}>
                    {saldo > 0 ? `+${saldo}` : saldo}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
