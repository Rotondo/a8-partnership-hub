
import React, { useState } from "react";
import { format } from "date-fns";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardCard from "@/components/ui/dashboard/DashboardCard";
import {
  BarChart,
  PieChart,
  ResponsiveContainer,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Download, Calendar as CalendarIcon, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon } from "lucide-react";
import { mockOpportunities, getMonthlyDataForChart, getQuarterlyData, getOpportunityDistributionByCompany } from "@/data/mockData";

const COLORS = [
  "#1e88e5", "#26a69a", "#ab47bc", "#ff7043", "#66bb6a", 
  "#7e57c2", "#ec407a", "#ffa726", "#5c6bc0", "#26c6da"
];

const Reports = () => {
  const [periodType, setPeriodType] = useState("last6months");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");

  const monthlyData = getMonthlyDataForChart();
  const quarterlyData = getQuarterlyData();
  const opportunityDistribution = getOpportunityDistributionByCompany();

  // Filtered status distribution for pie chart
  const statusData = Object.entries(
    mockOpportunities.reduce(
      (acc, opp) => {
        acc[opp.status] = (acc[opp.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    )
  ).map(([name, value]) => ({ name, value }));

  // Generate conversion funnel data
  const generateFunnelData = () => {
    const totalOpps = mockOpportunities.length;
    const inProgressOpps = mockOpportunities.filter(
      (opp) => opp.status === "In Progress"
    ).length;
    const wonOpps = mockOpportunities.filter(
      (opp) => opp.status === "Won"
    ).length;

    return [
      { name: "All Opportunities", value: totalOpps },
      { name: "In Progress", value: inProgressOpps },
      { name: "Won", value: wonOpps },
    ];
  };

  const funnelData = generateFunnelData();

  const handleExport = () => {
    console.log("Exporting report data...");
    // In a real app, this would generate and download a report
  };

  const renderChart = () => {
    switch (chartType) {
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <Pie
                data={opportunityDistribution}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {opportunityDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value} Opportunities`, "Count"]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case "line":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={monthlyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="Cryah"
                stroke="#1e88e5"
                activeDot={{ r: 8 }}
              />
              <Line type="monotone" dataKey="Lomadee" stroke="#26a69a" />
              <Line type="monotone" dataKey="Monitfy" stroke="#ab47bc" />
              <Line type="monotone" dataKey="Boone" stroke="#ff7043" />
              <Line type="monotone" dataKey="SAIO" stroke="#66bb6a" />
            </LineChart>
          </ResponsiveContainer>
        );

      case "bar":
      default:
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={opportunityDistribution}
              margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => [`${value} Opportunities`, "Count"]}
              />
              <Legend />
              <Bar dataKey="value" name="Opportunities">
                {opportunityDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-aeight-dark">Reports</h1>
          <p className="text-muted-foreground mt-2">
            Analyze partnership data with customizable reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <DashboardCard title="Report Settings">
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Date Range
              </label>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  value={periodType}
                  onValueChange={(value) => setPeriodType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select period type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom Date</SelectItem>
                    <SelectItem value="thisMonth">This Month</SelectItem>
                    <SelectItem value="last3months">Last 3 Months</SelectItem>
                    <SelectItem value="last6months">Last 6 Months</SelectItem>
                    <SelectItem value="thisYear">This Year</SelectItem>
                    <SelectItem value="lastYear">Last Year</SelectItem>
                  </SelectContent>
                </Select>

                {periodType === "custom" && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Chart Type
              </label>
              <div className="flex space-x-2">
                <Button
                  variant={chartType === "bar" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setChartType("bar")}
                >
                  <BarChart3 className="h-4 w-4 mr-2" /> Bar
                </Button>
                <Button
                  variant={chartType === "line" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setChartType("line")}
                >
                  <LineChartIcon className="h-4 w-4 mr-2" /> Line
                </Button>
                <Button
                  variant={chartType === "pie" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setChartType("pie")}
                >
                  <PieChartIcon className="h-4 w-4 mr-2" /> Pie
                </Button>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-medium mb-3">Report Summary</h3>
              <div className="bg-muted/40 p-4 rounded-lg space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Total Opportunities:</span>{" "}
                  {mockOpportunities.length}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Conversion Rate:</span>{" "}
                  {(
                    (mockOpportunities.filter((o) => o.status === "Won").length /
                      mockOpportunities.length) *
                    100
                  ).toFixed(1)}
                  %
                </p>
                <p className="text-sm">
                  <span className="font-medium">Leading Company:</span>{" "}
                  {opportunityDistribution.sort((a, b) => b.value - a.value)[0]
                    ?.name || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Conversion Funnel">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={funnelData}
                margin={{ top: 20, right: 30, left: 70, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar
                  dataKey="value"
                  name="Opportunities"
                  fill="#1e88e5"
                  label={{ position: "right", formatter: (value) => value }}
                >
                  {funnelData.map((entry, index) => {
                    const opacity = 1 - index * 0.2;
                    return <Cell key={`cell-${index}`} fill={`rgba(30, 136, 229, ${opacity})`} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <DashboardCard title="Total Opportunities" className="col-span-2">
          {renderChart()}
        </DashboardCard>

        <DashboardCard title="Status Distribution">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.name === "Won"
                          ? "#66bb6a"
                          : entry.name === "Lost"
                          ? "#ef5350"
                          : entry.name === "In Progress"
                          ? "#ffca28"
                          : entry.name === "New"
                          ? "#42a5f5"
                          : "#bdbdbd"
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value} Opportunities`, "Count"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>
      </div>

      <DashboardCard title="Quarterly Performance" className="mb-8">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={quarterlyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => [`${value} Opportunities`, "Count"]}
              />
              <Legend />
              <Bar dataKey="value" name="Opportunities" fill="#1e88e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </DashboardCard>
    </DashboardLayout>
  );
};

export default Reports;
