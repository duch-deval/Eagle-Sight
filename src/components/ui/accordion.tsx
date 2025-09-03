import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Building2, FileText } from "lucide-react";

const StatsCards = () => {
  const stats = [
    {
      title: "Total Defense Spending",
      value: "$102.5B",
      change: "+6.2%",
      icon: DollarSign,
      description: "FY 2024 procurement funding"
    },
    {
      title: "Active Contracts",
      value: "4,827",
      change: "+12.1%",
      icon: FileText,
      description: "Currently active defense contracts"
    },
    {
      title: "Prime Contractors",
      value: "1,249",
      change: "+3.4%",
      icon: Building2,
      description: "Companies with active contracts"
    },
    {
      title: "Funding Growth",
      value: "8.3%",
      change: "+1.2%",
      icon: TrendingUp,
      description: "Average annual growth rate"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-navy" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span className="text-success font-medium mr-1">{stat.change}</span>
                {stat.description}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsCards;