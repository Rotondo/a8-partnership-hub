import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getEstatisticasOportunidadesPorEmpresa, getEstatisticasParceirosExternos } from '@/services/oportunidades.service';
import { EstatisticaOportunidadePorEmpresa, EstatisticaParceiroExterno } from '@/types/supabase-extended';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Dashboard = () => {
  const [estatisticasEmpresas, setEstatisticasEmpresas] = useState<EstatisticaOportunidadePorEmpresa[]>([]);
  const [estatisticasParceiros, setEstatisticasParceiros] = useState<EstatisticaParceiroExterno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Buscar estatísticas de empresas
        const empresasData = await getEstatisticasOportunidadesPorEmpresa();
        setEstatisticasEmpresas(empresasData);
        
        // Buscar estatísticas de parceiros
        const parceirosData = await getEstatisticasParceirosExternos();
        setEstatisticasParceiros(parceirosData);
        
      } catch (err) {
        console.error('Erro ao carregar estatísticas:', err);
        setError('Falha ao carregar dados estatísticos. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Preparar dados para gráficos de empresas
  const empresasEnviadasData = estatisticasEmpresas.map(empresa => ({
    name: empresa.empresa,
    value: empresa.enviadas
  }));
  
  const empresasRecebidasData = estatisticasEmpresas.map(empresa => ({
    name: empresa.empresa,
    value: empresa.recebidas
  }));
  
  const empresasSaldoData = estatisticasEmpresas.map(empresa => ({
    name: empresa.empresa,
    value: empresa.saldo
  }));
  
  // Preparar dados para gráficos de parceiros
  const parceirosEnviadasData = estatisticasParceiros.map(parceiro => ({
    name: parceiro.parceiro,
    value: parceiro.enviadas
  }));
  
  const parceirosRecebidasData = estatisticasParceiros.map(parceiro => ({
    name: parceiro.parceiro,
    value: parceiro.recebidas
  }));
  
  const parceirosSaldoData = estatisticasParceiros.map(parceiro => ({
    name: parceiro.parceiro,
    value: parceiro.saldo
  }));
  
  // Dados para gráfico de barras comparativo
  const dadosComparativos = estatisticasEmpresas.map(empresa => ({
    name: empresa.empresa,
    Enviadas: empresa.enviadas,
    Recebidas: empresa.recebidas,
    Saldo: empresa.saldo
  }));
  
  // Dados para gráfico de barras comparativo de parceiros
  const dadosComparativosParceiros = estatisticasParceiros.map(parceiro => ({
    name: parceiro.parceiro,
    Enviadas: parceiro.enviadas,
    Recebidas: parceiro.recebidas,
    Saldo: parceiro.saldo
  }));
  
  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="bg-destructive/15 text-destructive p-4 rounded-md">
              <h3 className="font-medium">Erro ao carregar dados</h3>
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard de Parcerias</h1>
      
      <Tabs defaultValue="intragrupo" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="intragrupo">Intragrupo</TabsTrigger>
          <TabsTrigger value="parceiros">Parceiros Externos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="intragrupo">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Oportunidades Enviadas por Empresa</CardTitle>
                <CardDescription>Total de oportunidades enviadas por cada empresa do grupo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={empresasEnviadasData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {empresasEnviadasData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} oportunidades`, 'Enviadas']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Oportunidades Recebidas por Empresa</CardTitle>
                <CardDescription>Total de oportunidades recebidas por cada empresa do grupo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={empresasRecebidasData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {empresasRecebidasData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} oportunidades`, 'Recebidas']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Comparativo de Oportunidades por Empresa</CardTitle>
              <CardDescription>Enviadas vs. Recebidas vs. Saldo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dadosComparativos}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Enviadas" fill="#8884d8" />
                    <Bar dataKey="Recebidas" fill="#82ca9d" />
                    <Bar dataKey="Saldo" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Saldo de Oportunidades por Empresa</CardTitle>
              <CardDescription>Diferença entre oportunidades enviadas e recebidas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={empresasSaldoData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} oportunidades`, 'Saldo']} />
                    <Bar dataKey="value" fill="#ffc658">
                      {empresasSaldoData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.value >= 0 ? '#82ca9d' : '#ff8042'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="parceiros">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Oportunidades Enviadas para Parceiros</CardTitle>
                <CardDescription>Total de oportunidades enviadas para cada parceiro externo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={parceirosEnviadasData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {parceirosEnviadasData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} oportunidades`, 'Enviadas']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Oportunidades Recebidas de Parceiros</CardTitle>
                <CardDescription>Total de oportunidades recebidas de cada parceiro externo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={parceirosRecebidasData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {parceirosRecebidasData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} oportunidades`, 'Recebidas']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Comparativo de Oportunidades por Parceiro</CardTitle>
              <CardDescription>Enviadas vs. Recebidas vs. Saldo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dadosComparativosParceiros}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Enviadas" fill="#8884d8" />
                    <Bar dataKey="Recebidas" fill="#82ca9d" />
                    <Bar dataKey="Saldo" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Balança Comercial de Parceiros</CardTitle>
              <CardDescription>Saldo de oportunidades por parceiro externo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={parceirosSaldoData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} oportunidades`, 'Saldo']} />
                    <Bar dataKey="value" fill="#ffc658">
                      {parceirosSaldoData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.value >= 0 ? '#82ca9d' : '#ff8042'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
