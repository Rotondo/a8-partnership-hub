
import React, { useState, useEffect } from "react";
import { Loader2, TrendingUp, TrendingDown, BarChart2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { analyticService } from "@/services/supabaseService";
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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [quarterlyData, setQuarterlyData] = useState<any[]>([]);
  const [distributionData, setDistributionData] = useState<any[]>([]);
  const [indicadores, setIndicadores] = useState<any[]>([]);
  const [funil, setFunil] = useState<any[]>([]);
  const [oportunidadesPorEmpresa, setOportunidadesPorEmpresa] = useState<any[]>([]);
  const [groupBalance, setGroupBalance] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Carregar dados mensais
        const monthlyChartData = await analyticService.getMonthlyData();
        setMonthlyData(monthlyChartData);
        
        // Carregar dados trimestrais
        const quarterlyChartData = await analyticService.getQuarterlyData();
        setQuarterlyData(quarterlyChartData);
        
        // Carregar distribuição por empresa
        const distributionChartData = await analyticService.getOpportunityDistributionByCompany();
        setDistributionData(distributionChartData);
        
        // Carregar dados de balanço do grupo
        const balanceData = await analyticService.getGroupPartnerBalanceData();
        setGroupBalance(balanceData);
        
        // Indicadores chave
        setIndicadores([
          { label: "Oportunidades Geradas", valor: balanceData.totalSent },
          { label: "Oportunidades Recebidas", valor: balanceData.totalReceived },
          { label: "Taxa de Conversão", valor: "62%" }, // Valor fixo para exemplo
        ]);
        
        // Dados para o funil
        const { data: funnelData } = await supabase.rpc('get_opportunity_funnel');
        setFunil(funnelData || [
          { etapa: "Indicação", total: 32 },
          { etapa: "Contato Realizado", total: 21 },
          { etapa: "Proposta Enviada", total: 14 },
          { etapa: "Negócio Fechado", total: 9 },
        ]);
        
        // Dados por empresa
        const { data: companyData } = await supabase.rpc('get_opportunities_by_company');
        setOportunidadesPorEmpresa(companyData || []);
        
        setLoading(false);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setError("Falha ao carregar dados. Por favor, tente novamente.");
        setLoading(false);
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
                data={groupBalance?.monthlyBalanceData || []}
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
