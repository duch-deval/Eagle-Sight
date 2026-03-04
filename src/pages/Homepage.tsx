import BudgetAnalysis from "@/components/dashboard/BudgetAnalysis"; 
import BudgetAnalysis from "@/components/dashboard/BudgetAnalysis";
import DefenseBudgetBreakdown from "@/components/dashboard/DefenseBudgetBreakdown"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Homepage = () => {
  return (
    <div className="p-4 sm:p-6 space-y-6 animate-in">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Live Budget Analysis</h1>
        <p className="text-muted-foreground">
          Funding data for government defense programs and weapon systems 
        </p>
      </div>

      <Tabs defaultValue="agency" className="w-full">
        <TabsContent value="agency" className="space-y-6 mt-6">
          <DefenseBudgetBreakdown />
          <BudgetAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Homepage;
