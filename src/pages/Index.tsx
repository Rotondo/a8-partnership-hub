
import React, { useState, useEffect } from "react";
import { empresaGrupoService } from "@/services/supabaseService";
import { EmpresaGrupo } from "@/types";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const Index = () => {
  const [empresasGrupo, setEmpresasGrupo] = useState<EmpresaGrupo[]>([]);
  const [intraGroupChartData, setIntraGroupChartData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Carrega empresas do grupo
        const empresas = await empresaGrupoService.getAll();
        setEmpresasGrupo(empresas);
        
        // Carrega dados da matriz de indicações
        const { data: matriz } = await supabase.rpc('get_intragroup_exchange_matrix');
        setIntraGroupChartData(matriz || {});
        
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
        Dashboard de Parcerias A&amp;eight
      </h1>
      <p className="mb-8 text-muted-foreground">
        Monitore e analise as oportunidades de parceria internas e externas do grupo A&amp;eight.
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-lg bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2 border bg-muted"></th>
              {empresasGrupo.map((company) => (
                <th key={company.id} className="px-4 py-2 border bg-muted">
                  {company.nome}
                </th>
              ))}
              <th className="px-4 py-2 border bg-muted">Total Enviado</th>
            </tr>
          </thead>
          <tbody>
            {empresasGrupo.map((source) => {
              const targets = intraGroupChartData[source.nome] || {};
              const totalSent = Object.values(targets).reduce(
                (sum: number, count: any) => sum + (count || 0),
                0
              );
              return (
                <tr key={source.id}>
                  <td className="px-4 py-2 border font-semibold bg-muted">
                    {source.nome}
                  </td>
                  {empresasGrupo.map((target) => (
                    <td key={target.id} className="px-4 py-2 border text-center">
                      {source.nome === target.nome
                        ? "–"
                        : targets[target.nome] > 0
                        ? targets[target.nome]
                        : 0}
                    </td>
                  ))}
                  <td className="px-4 py-2 border font-bold text-center">
                    {totalSent}
                  </td>
                </tr>
              );
            })}
            <tr>
              <td className="px-4 py-2 border font-semibold bg-muted">
                Total Recebido
              </td>
              {empresasGrupo.map((company) => {
                const totalReceived = empresasGrupo.reduce((sum, source) => {
                  if (source.nome === company.nome) return sum;
                  const targets = intraGroupChartData[source.nome] || {};
                  return sum + (targets[company.nome] || 0);
                }, 0);
                return (
                  <td
                    key={company.id}
                    className="px-4 py-2 border font-bold text-center"
                  >
                    {totalReceived}
                  </td>
                );
              })}
              <td className="px-4 py-2 border bg-muted"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">Visualização de Troca Intragrupo</h2>
        <div className="h-80">
          <ChartContainer
            config={{
              Enviadas: { 
                color: "#3b82f6" 
              },
              Recebidas: { 
                color: "#10b981" 
              }
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={Object.keys(intraGroupChartData).map(company => {
                  const sentCount = Object.values(intraGroupChartData[company] || {}).reduce(
                    (sum: number, count: any) => sum + (count || 0),
                    0
                  );
                  
                  const receivedCount = empresasGrupo.reduce((sum, source) => {
                    if (source.nome === company) return sum;
                    const targets = intraGroupChartData[source.nome] || {};
                    return sum + (targets[company] || 0);
                  }, 0);
                  
                  return {
                    name: company,
                    Enviadas: sentCount,
                    Recebidas: receivedCount
                  };
                })}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="Enviadas" fill="#3b82f6" />
                <Bar dataKey="Recebidas" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};

export default Index;
