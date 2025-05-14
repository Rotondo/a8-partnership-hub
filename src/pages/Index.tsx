
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, LineChart, ResponsiveContainer, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line } from "recharts";
import DashboardCard from "@/components/ui/dashboard/DashboardCard";
import StatCard from "@/components/ui/dashboard/StatCard";
import { BarChart3, PieChart, Users, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { mockOpportunities, getMonthlyDataForChart, getQuarterlyData, getOpportunityDistributionByCompany, getIntraGroupExchangeData } from "@/data/mockData";

const Index = () => {
  const [period, setPeriod] = useState<"quarterly" | "monthly">("monthly");
  const [loading, setLoading] = useState(true);

  // simulating loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const monthlyData = getMonthlyDataForChart();
  const quarterlyData = getQuarterlyData();
  const opportunityDistribution = getOpportunityDistributionByCompany();
  const intraGroupData = getIntraGroupExchangeData();

  // Calculate statistics
  const totalOpportunities = mockOpportunities.length;
  const internalOpportunities = mockOpportunities.filter(opp => opp.type === 'internal').length;
  const incomingOpportunities = mockOpportunities.filter(opp => opp.type === 'incoming').length;
  const outgoingOpportunities = mockOpportunities.filter(opp => opp.type === 'outgoing').length;
  const wonOpportunities = mockOpportunities.filter(opp => opp.status === 'Won').length;
  const conversionRate = Math.round((wonOpportunities / totalOpportunities) * 100);
  
  const currentQuarterCount = quarterlyData[Math.floor(new Date().getMonth() / 3)].value;
  const previousQuarterIndex = Math.floor(new Date().getMonth() / 3) - 1;
  const previousQuarterCount = previousQuarterIndex >= 0 ? quarterlyData[previousQuarterIndex].value : quarterlyData[3].value;
  const growthRate = Math.round(((currentQuarterCount - previousQuarterCount) / previousQuarterCount) * 100);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-aeight-dark">Partnership Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Monitor and analyze A&eight group's internal and external partnership opportunities
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Opportunities"
          value={totalOpportunities}
          description="All registered opportunities"
          icon={<BarChart3 className="h-5 w-5" />}
          trend={growthRate}
          className="animate-enter"
        />
        <StatCard
          title="Intragroup Opportunities"
          value={internalOpportunities}
          description="Between A&eight companies"
          icon={<Users className="h-5 w-5" />}
          trend={12}
          className="animate-enter"
          style={{ animationDelay: "100ms" }}
        />
        <StatCard
          title="External Incoming"
          value={incomingOpportunities}
          description="From external partners"
          icon={<ArrowDownRight className="h-5 w-5" />}
          trend={-5}
          className="animate-enter"
          style={{ animationDelay: "200ms" }}
        />
        <StatCard
          title="External Outgoing"
          value={outgoingOpportunities}
          description="To external partners"
          icon={<ArrowUpRight className="h-5 w-5" />}
          trend={8}
          className="animate-enter"
          style={{ animationDelay: "300ms" }}
        />
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="volume" className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="volume">Volume Trends</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>
          <Select value={period} onValueChange={(val: "quarterly" | "monthly") => setPeriod(val)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="volume" className="mt-0">
          <DashboardCard title="Opportunity Volume Over Time">
            <div className="h-[400px]">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-muted-foreground">Loading chart data...</div>
                </div>
              ) : period === "monthly" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Cryah" stroke="#1e88e5" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="Lomadee" stroke="#26a69a" />
                    <Line type="monotone" dataKey="Monitfy" stroke="#ab47bc" />
                    <Line type="monotone" dataKey="Boone" stroke="#ff7043" />
                    <Line type="monotone" dataKey="SAIO" stroke="#66bb6a" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={quarterlyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Opportunities" fill="#1e88e5" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </DashboardCard>
        </TabsContent>

        <TabsContent value="distribution" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardCard title="Opportunities by Company">
              <div className="h-[400px]">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-muted-foreground">Loading chart data...</div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={opportunityDistribution}
                      margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Opportunities" fill="#26a69a" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </DashboardCard>

            <DashboardCard title="Opportunity Status Distribution">
              <div className="h-[400px]">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-muted-foreground">Loading chart data...</div>
                  </div>
                ) : (
                  <div className="p-4 flex flex-col h-full">
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="w-full max-w-md mx-auto">
                        <div className="mb-8 text-center">
                          <div className="text-5xl font-bold">{conversionRate}%</div>
                          <div className="text-sm text-muted-foreground mt-2">Overall conversion rate</div>
                        </div>
                        <div className="space-y-4">
                          {[
                            { status: "New", count: mockOpportunities.filter(o => o.status === "New").length, color: "bg-blue-500" },
                            { status: "In Progress", count: mockOpportunities.filter(o => o.status === "In Progress").length, color: "bg-yellow-500" },
                            { status: "Won", count: wonOpportunities, color: "bg-green-500" },
                            { status: "Lost", count: mockOpportunities.filter(o => o.status === "Lost").length, color: "bg-red-500" },
                            { status: "On Hold", count: mockOpportunities.filter(o => o.status === "On Hold").length, color: "bg-gray-500" }
                          ].map(item => (
                            <div key={item.status} className="flex items-center">
                              <div className={`w-3 h-3 rounded-full ${item.color} mr-2`}></div>
                              <div className="flex-1">
                                <div className="flex justify-between text-sm">
                                  <span>{item.status}</span>
                                  <span className="font-medium">{item.count}</span>
                                </div>
                                <div className="mt-1 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className={`${item.color} h-full`} 
                                    style={{ width: `${(item.count / totalOpportunities) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </DashboardCard>
          </div>
        </TabsContent>
      </Tabs>

      {/* Intragroup Exchange Matrix */}
      <DashboardCard title="Intragroup Exchange Matrix" className="mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-3 border-b"></th>
                {Object.keys(intraGroupData).map((company) => (
                  <th key={company} className="p-3 border-b text-center">{company}</th>
                ))}
                <th className="p-3 border-b text-center">Total Sent</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(intraGroupData).map(([source, targets], idx) => {
                const totalSent = Object.values(targets).reduce((sum: number, count: number) => sum + count, 0);
                return (
                  <tr key={source} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                    <td className="p-3 border-b font-medium">{source}</td>
                    {Object.entries(targets).map(([target, count]) => (
                      <td key={`${source}-${target}`} className="p-3 border-b text-center">
                        {source === target ? (
                          <span className="text-gray-400">–</span>
                        ) : (
                          count > 0 ? (
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-medium">
                              {count}
                            </span>
                          ) : (
                            <span className="text-gray-400">0</span>
                          )
                        )}
                      </td>
                    ))}
                    <td className="p-3 border-b text-center font-medium">{totalSent}</td>
                  </tr>
                );
              })}
              <tr className="bg-muted/50">
                <td className="p-3 font-medium">Total Received</td>
                {Object.keys(intraGroupData).map((company) => {
                  const totalReceived = Object.entries(intraGroupData)
                    .reduce((sum, [source, targets]) => sum + (source !== company ? targets[company] : 0), 0);
                  return (
                    <td key={`received-${company}`} className="p-3 text-center font-medium">
                      {totalReceived}
                    </td>
                  );
                })}
                <td className="p-3"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </DashboardLayout>
  );
};

export default Index;
