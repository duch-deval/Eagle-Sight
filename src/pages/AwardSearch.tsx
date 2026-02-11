import FundingChart from "@/components/dashboard/FundingChart";
import TreemapChart from "@/components/dashboard/TreemapChart";

const AwardSearch = () => {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Award Search</h1>
      <p className="text-muted-foreground">
        Search, filter, and analyze awards with visual insights
      </p>

      {/* your existing search UI here */}

      {/* charts moved from Dashboard */}
      <div className="space-y-6 mt-6">
        <FundingChart />
        <TreemapChart />
      </div>
    </div>
  );
};

export default AwardSearch;
