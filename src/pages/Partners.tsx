
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardCard from "@/components/ui/dashboard/DashboardCard";
import StatCard from "@/components/ui/dashboard/StatCard";
import {
  BarChart,
  ResponsiveContainer,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";
import { externalPartners, mockOpportunities } from "@/data/mockData";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const groupCompanies = ["Cryah", "Lomadee", "Monitfy", "B8one", "SAIO"];
const COLORS = ["#8B5CF6", "#A78BFA", "#C4B5FD", "#DDD6FE", "#EDE9FE"];

const Partners = () => {
  const [period, setPeriod] = useState("last6months");

  const totalSentByCompany = (companyName: string): number => {
    return mockOpportunities.filter(
      (opportunity) => 
        opportunity.type === "outgoing" && 
        opportunity.sourceCompany === companyName
    ).length;
  };

  const totalReceivedByPartner = (partnerName: string): number => {
    return mockOpportunities.filter(
      (opportunity) => 
        opportunity.type === "incoming" && 
        opportunity.partnerName === partnerName
    ).length;
  };

  const totalSentToPartner = (partnerName: string): number => {
    return mockOpportunities.filter(
      (opportunity) => 
        opportunity.type === "outgoing" && 
        opportunity.partners.includes(partnerName)
    ).length;
  };

  // Calcula o balanço para cada parceiro (recebido - enviado)
  const partnerBalance = externalPartners.map((partner) => {
    const received = totalReceivedByPartner(partner);
    const sent = totalSentToPartner(partner);
    
    return {
      name: partner,
      received,
      sent,
      balance: received - sent
    };
  });

  // Ordenando para mostrar os melhores balanços primeiro
  partnerBalance.sort((a, b) => b.balance - a.balance);
  
  // Dados para o gráfico de balanço mensal
  const monthlyBalanceData = [
    { month: "Jan", balance: 5 },
    { month: "Fev", balance: 8 },
    { month: "Mar", balance: -3 },
    { month: "Abr", balance: 4 },
    { month: "Mai", balance: 9 },
    { month: "Jun", balance: -2 },
  ];

  // Função para calcular quantas oportunidades cada parceiro enviou para cada empresa do grupo
  const calculatePartnerToGroupMatrix = () => {
    const matrix = [];
    
    for (const partner of externalPartners) {
      const partnerRow: Record<string, any> = { name: partner };
      
      for (const company of groupCompanies) {
        partnerRow[company] = mockOpportunities.filter(
          (opportunity) => 
            opportunity.type === "incoming" && 
            opportunity.partnerName === partner && 
            opportunity.targetCompany === company
        ).length;
      }
      
      matrix.push(partnerRow);
    }
    
    return matrix;
  };
  
  // Função para calcular quantas oportunidades cada empresa do grupo enviou para cada parceiro
  const calculateGroupToPartnerMatrix = () => {
    const matrix = [];
    
    for (const company of groupCompanies) {
      const companyRow: Record<string, any> = { name: company };
      
      for (const partner of externalPartners) {
        companyRow[partner] = mockOpportunities.filter(
          (opportunity) => 
            opportunity.type === "outgoing" && 
            opportunity.sourceCompany === company && 
            opportunity.partners.includes(partner)
        ).length;
      }
      
      matrix.push(companyRow);
    }
    
    return matrix;
  };
  
  // Calcula o total do balanço do grupo inteiro com parceiros externos
  const calculateGroupTotalBalance = () => {
    const totalReceived = mockOpportunities.filter(opportunity => opportunity.type === "incoming").length;
    const totalSent = mockOpportunities.filter(opportunity => opportunity.type === "outgoing").length;
    
    return {
      received: totalReceived,
      sent: totalSent,
      balance: totalReceived - totalSent,
      percentBalance: totalSent === 0 ? 100 : (totalReceived / totalSent) * 100
    };
  };

  const groupTotalBalance = calculateGroupTotalBalance();
  
  // Dados para os gráficos matriz
  const partnerToGroupMatrix = calculatePartnerToGroupMatrix();
  const groupToPartnerMatrix = calculateGroupToPartnerMatrix();

  const handleExportData = () => {
    console.log("Exportando dados...");
  };
  
  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-aeight-dark">Parceiros</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie e monitore o desempenho de parcerias externas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <StatCard
                  title="Parceiros Ativos"
                  value={externalPartners.length.toString()}
                  trend="up"
                  trendValue="2"
                  description="vs. mês passado"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total de parceiros externos ativos com trocas de oportunidades nos últimos 6 meses.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <StatCard
                  title="Oportunidades Recebidas"
                  value={groupTotalBalance.received.toString()}
                  trend={groupTotalBalance.received > groupTotalBalance.sent ? "up" : "down"}
                  trendValue={(Math.abs(groupTotalBalance.received - groupTotalBalance.sent)).toString()}
                  description="vs. enviadas"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Número total de oportunidades recebidas de parceiros externos.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <StatCard
                  title="Oportunidades Enviadas"
                  value={groupTotalBalance.sent.toString()}
                  trend={groupTotalBalance.sent > groupTotalBalance.received ? "up" : "down"}
                  trendValue={(Math.abs(groupTotalBalance.received - groupTotalBalance.sent)).toString()}
                  description="vs. recebidas"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Número total de oportunidades enviadas para parceiros externos.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="col-span-3">
                <DashboardCard title="Balanço Total do Grupo A&eight">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Recebidas</span>
                        <span className="text-green-600 font-bold">{groupTotalBalance.received}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Enviadas</span>
                        <span className="text-blue-600 font-bold">{groupTotalBalance.sent}</span>
                      </div>
                      <div className="flex justify-between items-center border-t pt-2">
                        <span className="font-medium">Balanço</span>
                        <span className={`font-bold ${groupTotalBalance.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {groupTotalBalance.balance > 0 ? '+' : ''}{groupTotalBalance.balance}
                        </span>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Desequilíbrio</span>
                          <span>Equilíbrio</span>
                        </div>
                        <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-600 rounded-full" 
                            style={{ 
                              width: `${Math.min(100, Math.max(0, groupTotalBalance.percentBalance))}%`,
                              backgroundColor: groupTotalBalance.balance >= 0 ? '#10b981' : '#ef4444'
                            }}
                          ></div>
                        </div>
                        <div className="text-center text-sm mt-1">
                          {Math.round(groupTotalBalance.percentBalance)}% 
                          {groupTotalBalance.balance >= 0 ? ' (favorável)' : ' (desfavorável)'}
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <p className="mb-2 font-medium">Tendência de Balanço Mensal</p>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={monthlyBalanceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <RechartsTooltip
                              formatter={(value: number) => [`${value} oportunidades`, 'Balanço']}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="balance" 
                              stroke="#8B5CF6"
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </DashboardCard>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Visão geral do equilíbrio entre as oportunidades recebidas e enviadas para parceiros externos. Um balanço positivo indica que recebemos mais oportunidades do que enviamos.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold">Balanço por Parceiro</h2>
        <Select
          value={period}
          onValueChange={setPeriod}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Último mês" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lastmonth">Último mês</SelectItem>
            <SelectItem value="last3months">Últimos 3 meses</SelectItem>
            <SelectItem value="last6months">Últimos 6 meses</SelectItem>
            <SelectItem value="thisyear">Este ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="rounded-md border shadow-md p-6 mb-8">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={partnerBalance}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar name="Recebidas" dataKey="received" fill="#10b981" />
                  <Bar name="Enviadas" dataKey="sent" fill="#3b82f6" />
                  <Bar name="Balanço" dataKey="balance">
                    {partnerBalance.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.balance >= 0 ? "#10b981" : "#ef4444"} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Comparação entre oportunidades recebidas e enviadas por parceiro. O balanço positivo (verde) indica mais oportunidades recebidas do que enviadas.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <DashboardCard title="Oportunidades de Parceiros para A&eight">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Parceiro</th>
                          {groupCompanies.map((company) => (
                            <th key={company} className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">{company}</th>
                          ))}
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {partnerToGroupMatrix.map((row, rowIndex) => (
                          <tr key={row.name}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{row.name}</td>
                            {groupCompanies.map((company) => (
                              <td key={company} className="px-4 py-2 whitespace-nowrap text-sm">
                                {row[company]}
                              </td>
                            ))}
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                              {groupCompanies.reduce((sum, company) => sum + row[company], 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </DashboardCard>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Matriz que mostra quantas oportunidades cada parceiro externo enviou para cada empresa do grupo A&eight.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <DashboardCard title="Oportunidades de A&eight para Parceiros">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                          {externalPartners.map((partner) => (
                            <th key={partner} className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">{partner}</th>
                          ))}
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {groupToPartnerMatrix.map((row) => (
                          <tr key={row.name}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{row.name}</td>
                            {externalPartners.map((partner) => (
                              <td key={partner} className="px-4 py-2 whitespace-nowrap text-sm">
                                {row[partner]}
                              </td>
                            ))}
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                              {externalPartners.reduce((sum, partner) => sum + row[partner], 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </DashboardCard>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Matriz que mostra quantas oportunidades cada empresa do grupo A&eight enviou para cada parceiro externo.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </DashboardLayout>
  );
};

export default Partners;
