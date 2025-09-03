import SearchFilters from "@/components/dashboard/SearchFilters";
import StatsCards from "@/components/dashboard/StatsCards";
import FundingChart from "@/components/dashboard/FundingChart";
import TreemapChart from "@/components/dashboard/TreemapChart";

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Defense Funding Dashboard</h1>
        <p className="text-muted-foreground">
          Analyze historical funding data for government defense programs and weapon systems
        </p>
      </div>

      <StatsCards />
      {/* <SearchFilters /> */}
      <div className="space-y-6">
        <FundingChart />
        <TreemapChart />
      </div>
    </div>
  );
};

export default Dashboard;