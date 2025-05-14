import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardCard from "@/components/ui/dashboard/DashboardCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar,
} from "recharts";
import { ArrowUpRight, ArrowDownRight, Search, Users, Balance, ChevronLeftRight } from "lucide-react";
import { externalPartners, groupCompanies } from "@/data/mockData";
import { getPartnerBalanceData, BalanceData, getGroupPartnerBalanceData } from "@/data/mockData";
import { toast } from "@/components/ui/use-toast";

const Partners = () => {
  const [balanceData, setBalanceData] = useState<BalanceData[]>([]);
  const [groupBalanceData, setGroupBalanceData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      const data = getPartnerBalanceData();
      const groupData = getGroupPartnerBalanceData();
      setBalanceData(data);
      setGroupBalanceData(groupData);
      setLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  // Filter partners based on search
  const filteredPartners = balanceData.filter((partner) =>
    partner.partnerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper function to determine balance status
  const getBalanceStatus = (balance: number) => {
    if (balance > 10) return "Strongly Positive";
    if (balance > 5) return "Positive";
    if (balance > 0) return "Slightly Positive";
    if (balance === 0) return "Balanced";
    if (balance > -5) return "Slightly Negative";
    if (balance > -10) return "Negative";
    return "Strongly Negative";
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-aeight-dark">Partners</h1>
        <p className="text-muted-foreground mt-2">
          Manage and analyze partnership balance with external partners
        </p>
      </div>

      {/* A&eight Group Balance Dashboard */}
      {!loading && groupBalanceData && (
        <DashboardCard title="A&eight Group Balance" className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <div className="text-center p-6 border rounded-lg bg-gradient-to-br from-blue-50 to-purple-50">
                <h3 className="text-lg font-medium mb-2">Overall Partnership Balance</h3>
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Received</p>
                    <p className="text-2xl font-bold text-green-600">{groupBalanceData.totalReceived}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <ChevronLeftRight className="h-6 w-6 text-blue-500" />
                    <p className="text-sm text-muted-foreground">vs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Sent</p>
                    <p className="text-2xl font-bold text-blue-600">{groupBalanceData.totalSent}</p>
                  </div>
                </div>
                
                <div className="relative pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-red-600">Deficit</span>
                    <span className="text-xs text-green-600">Surplus</span>
                  </div>
                  <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${groupBalanceData.balance > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ 
                        width: `${Math.min(Math.abs(groupBalanceData.balance) * 2, 100)}%`,
                        marginLeft: groupBalanceData.balance > 0 ? '50%' : '', 
                        marginRight: groupBalanceData.balance < 0 ? '50%' : '',
                      }}
                    ></div>
                  </div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 shadow-sm rounded-full h-7 w-7 flex items-center justify-center z-10">
                    <Balance className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                
                <div className="mt-6">
                  <p className="text-sm mb-1">Balance Score</p>
                  <div className="flex items-center justify-center">
                    {groupBalanceData.balance === 0 ? (
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 text-sm">
                        Perfectly Balanced
                      </Badge>
                    ) : groupBalanceData.balance > 0 ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800 text-sm">
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                        +{groupBalanceData.balance} (Receiving More)
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-100 text-red-800 text-sm">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        {groupBalanceData.balance} (Sending More)
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {getBalanceStatus(groupBalanceData.balance)} relationship with external partners
                  </p>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <h3 className="text-lg font-medium mb-4">Monthly Balance Trend</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={groupBalanceData.monthlyBalanceData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === "balance") {
                          return [`${value > 0 ? "+" : ""}${value}`, "Balance"];
                        }
                        return [value, name === "sent" ? "Sent" : "Received"];
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="received"
                      name="Received"
                      fill="#26a69a"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="sent"
                      name="Sent"
                      fill="#1e88e5"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="balance"
                      name="Balance"
                      fill="#ab47bc"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/20 p-4 rounded-lg mt-4">
                <h4 className="font-medium mb-2">Partnership Balance Insights</h4>
                <p className="text-sm text-muted-foreground">
                  This chart shows the monthly balance between received and sent opportunities with external partners.
                  A positive balance indicates the A&eight group is receiving more opportunities than sending.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "Report Generated",
                        description: "Balance report has been downloaded successfully.",
                      });
                    }}
                  >
                    Export Balance Report
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DashboardCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <DashboardCard title="A&eight Group Companies">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {groupCompanies.map((company) => (
              <div
                key={company}
                className="flex flex-col items-center justify-center p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-aeight-blue/10 rounded-full mb-3">
                  <Users className="h-6 w-6 text-aeight-blue" />
                </div>
                <div className="text-center">
                  <h3 className="font-medium">{company}</h3>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="Partner Statistics">
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg bg-blue-50">
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Total Partners
                </div>
                <div className="text-2xl font-bold">{externalPartners.length}</div>
              </div>
              <div className="p-4 border rounded-lg bg-green-50">
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Active Partnerships
                </div>
                <div className="text-2xl font-bold">
                  {balanceData.filter((p) => p.sent > 0 || p.received > 0).length}
                </div>
              </div>
              <div className="p-4 border rounded-lg bg-purple-50">
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Balanced Partners
                </div>
                <div className="text-2xl font-bold">
                  {balanceData.filter((p) => p.balance === 0 && (p.sent > 0 || p.received > 0)).length}
                </div>
              </div>
            </div>
            <div className="bg-aeight-gray p-4 rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Balance Score:</span> The difference between
                received and sent opportunities. A positive score indicates that
                the partner is sending more opportunities than receiving.
              </p>
            </div>
          </div>
        </DashboardCard>
      </div>

      <DashboardCard title="Partnership Balance" className="mb-8">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-4">
            This chart shows the balance of opportunities exchanged with external
            partners. A positive balance means the partner has sent more opportunities
            to the group than received.
          </p>
          
          <div className="h-[400px]">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-muted-foreground">Loading chart data...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={balanceData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                  barGap={0}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="partnerName" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "balance") {
                        return [`${value > 0 ? "+" : ""}${value} Opportunities`, "Balance"];
                      }
                      return [`${value} Opportunities`, name === "sent" ? "Sent" : "Received"];
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="received"
                    name="Received"
                    fill="#26a69a"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="sent"
                    name="Sent"
                    fill="#1e88e5"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </DashboardCard>

      <DashboardCard title="Partner List">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search partners..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Partner</th>
                <th className="text-center py-3 px-4">Received</th>
                <th className="text-center py-3 px-4">Sent</th>
                <th className="text-center py-3 px-4">Balance</th>
                <th className="text-center py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`loading-${index}`} className="animate-pulse">
                    <td className="py-3 px-4">
                      <div className="h-5 bg-muted rounded w-32"></div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="h-5 bg-muted rounded w-8 mx-auto"></div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="h-5 bg-muted rounded w-8 mx-auto"></div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="h-5 bg-muted rounded w-16 mx-auto"></div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="h-5 bg-muted rounded w-20 mx-auto"></div>
                    </td>
                  </tr>
                ))
              ) : filteredPartners.length > 0 ? (
                filteredPartners.map((partner, idx) => (
                  <tr
                    key={partner.partnerName}
                    className={`hover:bg-muted/50 ${
                      idx % 2 === 0 ? "bg-muted/20" : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-medium">
                      {partner.partnerName}
                    </td>
                    <td className="py-3 px-4 text-center">{partner.received}</td>
                    <td className="py-3 px-4 text-center">{partner.sent}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center">
                        {partner.balance > 0 ? (
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800 hover:bg-green-100"
                          >
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                            +{partner.balance}
                          </Badge>
                        ) : partner.balance < 0 ? (
                          <Badge
                            variant="outline"
                            className="bg-red-100 text-red-800 hover:bg-red-100"
                          >
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            {partner.balance}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-gray-100 text-gray-800 hover:bg-gray-100"
                          >
                            Balanced
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant="outline"
                        className={
                          partner.sent === 0 && partner.received === 0
                            ? "bg-gray-100 text-gray-800 hover:bg-gray-100"
                            : partner.balance > 0
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : partner.balance < 0
                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                            : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                        }
                      >
                        {partner.sent === 0 && partner.received === 0
                          ? "Inactive"
                          : partner.balance > 5
                          ? "Very Active"
                          : partner.balance > 0
                          ? "Active"
                          : partner.balance < -5
                          ? "Needs Attention"
                          : partner.balance < 0
                          ? "Unbalanced"
                          : "Balanced"}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">
                    No partners matching your search criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </DashboardLayout>
  );
};

export default Partners;
