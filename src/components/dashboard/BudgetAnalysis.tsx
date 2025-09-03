import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Rocket, 
  Plane, 
  Ship, 
  Zap, 
  Target,
  Shield,
  Radio,
  Satellite,
  TrendingUp,
  Info
} from "lucide-react";

const BudgetAnalysis = () => {
  const budgetWinnersData = {
    all: [
      {
        name: "Sea-Launched Cruise Missile (SLCM-N)",
        description: "Nuclear-capable cruise missile",
        increase: 1.93,
        total: 1.93,
        icon: Rocket,
      },
      {
        name: "E-2D Advanced Hawkeye",
        description: "Airborne early warning aircraft",
        increase: 1.47,
        total: 1.85,
        icon: Plane,
      },
      {
        name: "Medium Unmanned Surface Vessel (MUSV)",
        description: "Autonomous surface warfare",
        increase: 1.03,
        total: 1.13,
        icon: Ship,
      },
      {
        name: "MQ-25 Stingray",
        description: "Carrier-based refueling drone",
        increase: 0.63,
        total: 1.05,
        icon: Target,
      },
      {
        name: "E-6 Mercury TACAMO",
        description: "Strategic communications aircraft",
        increase: 0.53,
        total: 1.41,
        icon: Radio,
      },
    ],
    navy: [
      {
        name: "Sea-Launched Cruise Missile (SLCM-N)",
        description: "Nuclear-capable cruise missile",
        increase: 1.93,
        total: 1.93,
        icon: Rocket,
      },
      {
        name: "E-2D Advanced Hawkeye",
        description: "Airborne early warning aircraft",
        increase: 1.47,
        total: 1.85,
        icon: Plane,
      },
      {
        name: "Medium Unmanned Surface Vessel (MUSV)",
        description: "Autonomous surface warfare",
        increase: 1.03,
        total: 1.13,
        icon: Ship,
      },
      {
        name: "MQ-25 Stingray",
        description: "Carrier-based refueling drone",
        increase: 0.63,
        total: 1.05,
        icon: Target,
      },
    ],
    army: [
      {
        name: "Precision Strike Missile (PrSM)",
        description: "Long-range precision fires",
        increase: 0.82,
        total: 1.24,
        icon: Rocket,
      },
      {
        name: "Extended Range Cannon Artillery (ERCA)",
        description: "Next-generation artillery system",
        increase: 0.67,
        total: 0.89,
        icon: Target,
      },
      {
        name: "Integrated Air & Missile Defense (IAMD)",
        description: "Multi-layer defense system",
        increase: 0.54,
        total: 2.1,
        icon: Shield,
      },
    ],
    airforce: [
      {
        name: "B-21 Raider",
        description: "Next-generation stealth bomber",
        increase: 2.8,
        total: 5.1,
        icon: Plane,
      },
      {
        name: "Next Generation Air Dominance (NGAD)",
        description: "6th generation fighter program",
        increase: 1.2,
        total: 2.9,
        icon: Plane,
      },
      {
        name: "Sentinel ICBM (LGM-35A)",
        description: "Ground-based strategic deterrent",
        increase: 0.95,
        total: 3.6,
        icon: Rocket,
      },
    ],
    spaceforce: [
      {
        name: "Next Generation Overhead Persistent Infrared (Next Gen OPIR)",
        description: "Missile warning satellite constellation",
        increase: 0.89,
        total: 2.4,
        icon: Satellite,
      },
      {
        name: "GPS III Follow On (GPS IIIF)",
        description: "Enhanced navigation satellites",
        increase: 0.71,
        total: 1.8,
        icon: Satellite,
      },
      {
        name: "Protected Tactical SATCOM (PTS)",
        description: "Anti-jam communications satellites",
        increase: 0.45,
        total: 1.2,
        icon: Radio,
      },
    ],
  };

  const formatCurrency = (value: number) => `+$${value.toFixed(2)}B`;
  const formatTotal = (value: number) => `Total: $${value.toFixed(2)}B`;

  const renderProgramList = (programs: any[]) => (
    <div className="space-y-3">
      {programs.map((program, index) => {
        const Icon = program.icon;
        return (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-card to-card/50 rounded-lg border border-border hover:shadow-medium transition-all duration-200"
          >
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-card-foreground">{program.name}</h4>
                <p className="text-sm text-muted-foreground">{program.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-success">
                {formatCurrency(program.increase)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatTotal(program.total)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <Card className="shadow-medium">
      <CardHeader className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-success rounded-full"></div>
          <CardTitle className="text-2xl font-bold">
            FY 2026 Budget Transformation: Winners & Losers
          </CardTitle>
        </div>
        <p className="text-muted-foreground text-lg">
          Comprehensive analysis of the biggest program increases and decreases across all defense agencies
        </p>
        
        <Alert className="bg-warning/10 border-warning/20">
          <Info className="h-4 w-4 text-warning" />
          <AlertDescription className="text-sm text-warning-foreground">
            <strong>Analysis Methodology:</strong> Rankings exclude shipbuilding programs due to timing-based procurement fluctuations that do not reflect strategic priorities. 
            Analysis is based on currently available DoD budget documents and administration announcements. This analysis will be updated as additional budget materials are released.
          </AlertDescription>
        </Alert>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <h3 className="text-xl font-semibold">Biggest Budget Winners: Top 5 Program Increases</h3>
            </div>
            <div className="text-sm text-muted-foreground">
              Comparing FY26 (base + reconciliation) vs FY25 enacted<br />
              <span className="text-xs">*Shipbuilding programs excluded from overall rankings (timing-based fluctuations)</span>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="army">Army</TabsTrigger>
              <TabsTrigger value="marinecorps">Marine Corps</TabsTrigger>
              <TabsTrigger value="navy" className="bg-primary/20 data-[state=active]:bg-primary">Navy</TabsTrigger>
              <TabsTrigger value="airforce">Air Force</TabsTrigger>
              <TabsTrigger value="spaceforce">Space Force</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              {renderProgramList(budgetWinnersData.all)}
            </TabsContent>

            <TabsContent value="navy" className="mt-4">
              {renderProgramList(budgetWinnersData.navy)}
            </TabsContent>

            <TabsContent value="army" className="mt-4">
              {renderProgramList(budgetWinnersData.army)}
            </TabsContent>

            <TabsContent value="marinecorps" className="mt-4">
              <div className="text-center py-8 text-muted-foreground">
                <p>Marine Corps budget data will be available soon.</p>
              </div>
            </TabsContent>

            <TabsContent value="airforce" className="mt-4">
              {renderProgramList(budgetWinnersData.airforce)}
            </TabsContent>

            <TabsContent value="spaceforce" className="mt-4">
              {renderProgramList(budgetWinnersData.spaceforce)}
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetAnalysis;