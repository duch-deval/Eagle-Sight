import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Building2, DollarSign, Target, AlertTriangle, Users } from "lucide-react";
import BudgetAnalysis from "@/components/dashboard/BudgetAnalysis";

const MarketIntelligence = () => {
  const agencySpendingData = [
    { name: 'Air Force', value: 43.2, contracts: 1247 },
    { name: 'Navy', value: 34.1, contracts: 892 },
    { name: 'Army', value: 25.2, contracts: 1654 },
    { name: 'Space Force', value: 8.7, contracts: 234 },
    { name: 'Marines', value: 6.4, contracts: 187 },
  ];

  const contractTypeData = [
    { name: 'Firm Fixed Price', value: 45.2, color: '#1E40AF' },
    { name: 'Cost Plus', value: 28.7, color: '#059669' },
    { name: 'Time & Materials', value: 16.3, color: '#D97706' },
    { name: 'Indefinite Delivery', value: 9.8, color: '#DC2626' },
  ];

  const competitionTrends = [
    { year: '2020', fullOpen: 67.2, limited: 23.8, notCompeted: 9.0 },
    { year: '2021', fullOpen: 69.1, limited: 22.4, notCompeted: 8.5 },
    { year: '2022', fullOpen: 71.3, limited: 21.2, notCompeted: 7.5 },
    { year: '2023', fullOpen: 73.8, limited: 19.8, notCompeted: 6.4 },
    { year: '2024', fullOpen: 75.2, limited: 19.1, notCompeted: 5.7 },
  ];

  const COLORS = ['#1E40AF', '#059669', '#D97706', '#DC2626', '#7C3AED'];

  const formatCurrency = (value: number) => `$${value.toFixed(1)}B`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Market Intelligence</h1>
        <p className="text-muted-foreground">
          Strategic insights and analytics for defense contracting market
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Size</CardTitle>
            <DollarSign className="h-4 w-4 text-navy" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$117.6B</div>
            <p className="text-xs text-success">+8.4% from last year</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contractors</CardTitle>
            <Building2 className="h-4 w-4 text-navy" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-success">+3.2% active prime contractors</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Competition Rate</CardTitle>
            <Target className="h-4 w-4 text-navy" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75.2%</div>
            <p className="text-xs text-success">+1.4% competitive awards</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Small Business %</CardTitle>
            <Users className="h-4 w-4 text-navy" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23.8%</div>
            <p className="text-xs text-warning">-0.3% of total contract value</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Agency Spending Distribution */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-navy" />
              Agency Spending Distribution (FY 2024)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={agencySpendingData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: $${value}B`}
                >
                  {agencySpendingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Contract Type Breakdown */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-navy" />
              Contract Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={contractTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {contractTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Competition Trends */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-navy" />
            Competition Trends (2020-2024)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={competitionTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="year" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                label={{ value: 'Percentage', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value) => `${value}%`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar 
                dataKey="fullOpen" 
                stackId="a" 
                fill="hsl(var(--success))" 
                name="Full & Open Competition"
              />
              <Bar 
                dataKey="limited" 
                stackId="a" 
                fill="hsl(var(--warning))" 
                name="Limited Sources"
              />
              <Bar 
                dataKey="notCompeted" 
                stackId="a" 
                fill="hsl(var(--destructive))" 
                name="Not Competed"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Budget Analysis */}
      <BudgetAnalysis />

      {/* Market Insights */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Top Growth Areas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Space Systems</span>
              <span className="text-sm font-bold text-success">+23.4%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Cybersecurity</span>
              <span className="text-sm font-bold text-success">+18.7%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">AI/ML Systems</span>
              <span className="text-sm font-bold text-success">+15.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Hypersonics</span>
              <span className="text-sm font-bold text-success">+12.8%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Risk Indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Supply Chain Disruption</span>
              <span className="text-sm font-bold text-warning">Medium</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Cost Overruns</span>
              <span className="text-sm font-bold text-destructive">High</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Schedule Delays</span>
              <span className="text-sm font-bold text-warning">Medium</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Technology Readiness</span>
              <span className="text-sm font-bold text-success">Low</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Emerging Opportunities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm font-medium">Next-Gen Fighter</div>
              <div className="text-xs text-muted-foreground">Estimated $85B opportunity</div>
            </div>
            <div>
              <div className="text-sm font-medium">Maritime Drones</div>
              <div className="text-xs text-muted-foreground">Estimated $12B opportunity</div>
            </div>
            <div>
              <div className="text-sm font-medium">Quantum Computing</div>
              <div className="text-xs text-muted-foreground">Estimated $8B opportunity</div>
            </div>
            <div>
              <div className="text-sm font-medium">Directed Energy</div>
              <div className="text-xs text-muted-foreground">Estimated $6B opportunity</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketIntelligence;