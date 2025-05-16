
import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { analyticService, empresaGrupoService, parceiroExternoService } from "@/services/supabaseService";
import { BalanceData } from "@/types";
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

const Partners = () => {
  const [empresasGrupo, setEmpresasGrupo] = useState<string[]>([]);
  const [parceirosExternos, setParceirosExternos] = useState<string[]>([]);
  const [balancoComercial, setBalancoComercial] = useState<BalanceData[]>([]);
  const [parceiroEmpresaMatrix, setParceiroEmpresaMatrix] = useState<Record<string, Record<string, number>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Carrega empresas do grupo
        const empresasData = await empresaGrupoService.getAll();
        setEmpresasGrupo(empresasData.map(e => e.nome));
        
        // Carrega parceiros externos
        const parceirosData = await parceiroExternoService.getAll();
        setParceirosExternos(parceirosData.map(p => p.nome));
        
        // Carrega dados de balanço comercial
        const balanceData = await analyticService.getPartnerBalanceData();
        setBalancoComercial(balanceData);
        
        // Carrega matriz de relacionamento empresa-parceiro
        const { data: matrix } = await supabase.rpc('get_company_partner_matrix');
        setParceiroEmpresaMatrix(matrix || {});
        
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
        Parcerias Externas & Balanço Comercial
      </h1>
      <p className="mb-8 text-muted-foreground">
        Visualize o balanço de oportunidades trocadas entre o grupo A&amp;eight e parceiros externos.
      </p>

      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4">Balanço Comercial por Parceiro</h2>
        <div className="h-80">
          <ChartContainer
            config={{
              Enviadas: { 
                color: "#f59e0b" 
              },
              Recebidas: { 
                color: "#3b82f6" 
              },
              Saldo: { 
                color: "#10b981" 
              }
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={balancoComercial}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="partnerName" />
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

      <div className="overflow-x-auto mb-8">
        <table className="min-w-full border rounded-lg bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2 border bg-muted">Parceiro Externo</th>
              <th className="px-4 py-2 border bg-muted">Enviadas para Parceiro</th>
              <th className="px-4 py-2 border bg-muted">Recebidas do Parceiro</th>
              <th className="px-4 py-2 border bg-muted">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {balancoComercial.map((item) => (
              <tr key={item.partnerName}>
                <td className="px-4 py-2 border">{item.partnerName}</td>
                <td className="px-4 py-2 border text-center">{item.sent}</td>
                <td className="px-4 py-2 border text-center">{item.received}</td>
                <td className={`px-4 py-2 border text-center font-bold ${
                  item.balance > 0 ? 'text-green-600' : item.balance < 0 ? 'text-red-600' : ''
                }`}>
                  {item.balance > 0 ? `+${item.balance}` : item.balance}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Matriz de Relacionamento Empresa-Parceiro</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-lg bg-white">
            <thead>
              <tr>
                <th className="px-4 py-2 border bg-muted"></th>
                {parceirosExternos.map((parceiro) => (
                  <th key={parceiro} className="px-4 py-2 border bg-muted">
                    {parceiro}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {empresasGrupo.map((empresa) => (
                <tr key={empresa}>
                  <td className="px-4 py-2 border font-semibold bg-muted">
                    {empresa}
                  </td>
                  {parceirosExternos.map((parceiro) => {
                    const count = parceiroEmpresaMatrix[empresa]?.[parceiro] || 0;
                    return (
                      <td 
                        key={parceiro} 
                        className={`px-4 py-2 border text-center ${
                          count > 0 ? 'font-medium' : 'text-gray-400'
                        }`}
                      >
                        {count}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Partners;
