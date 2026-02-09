import { useState, useEffect } from "react";
import loadCsv from "@/lib/loadCsv";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface Program {
  name: string;
  description: string;
  agency: string;
  increase: number;
  total: number;
}

function parseAmt(val: any) {
  const num = parseFloat((val || "0").toString().replace(/,/g, ""));
  return isNaN(num) ? 0 : num * 1000; // values in thousands
}

// ✅ Agency normalization (merge Space Force into Air Force, Marine Corps into Navy)
function normalizeAgency(org: string, accountTitle: string): string {
  if (!org) return "Defense-Wide";

  const code = org.trim().toUpperCase();

  if (code === "A") return "Army";
  if (code === "N") return "Navy"; // includes Marine Corps
  if (code === "F") {
    if (accountTitle.includes("Space Force")) return "Space Force";
    return "Air Force";
  }
  return "Defense-Wide";
}



const BudgetAnalysis = () => {
  const [winners, setWinners] = useState<Record<string, Program[]>>({});
  const [losers, setLosers] = useState<Record<string, Program[]>>({});

  useEffect(() => {
    async function fetchData() {
      const p1Rows = await loadCsv("/p1_display.csv");
      const o1Rows = await loadCsv("/o1_display.csv");
      const allRows = [...p1Rows, ...o1Rows];

      // --- Group by platform (BLI Title) ---
      const groupedByPlatform: Record<string, any[]> = {};
      allRows.forEach(r => {
        const key =
          r["Budget Line Item (BLI) Title"] || // P-1
          r["SAG/Budget Line Item (BLI) Title"] || // O-1
          "Unnamed Program";

        if (!groupedByPlatform[key]) groupedByPlatform[key] = [];
        groupedByPlatform[key].push(r);
      });

      // --- Rollup each platform ---
      const programs: Program[] = Object.entries(groupedByPlatform).map(
        ([name, rows]) => {
          const r0: any = rows[0];
          const accountTitle = r0["Account Title"] || "";
          const org = r0["Organization"] || "";
          const agency = normalizeAgency(org, accountTitle);
          const description = r0["Budget Activity Title"] || "—";

          let fy25Enacted = 0,
            fy26Req = 0,
            fy26Rec = 0,
            fy26Total = 0;

          rows.forEach((r: any) => {
            fy25Enacted +=
              parseAmt(r["FY 2025 Enacted Amount"]) ||
              parseAmt(r["FY 2025 Enacted"]);
            fy26Req +=
              parseAmt(r["FY 2026 Disc Request Amount"]) ||
              parseAmt(r["FY 2026 Disc Request"]);
            fy26Rec +=
              parseAmt(r["FY 2026 Reconciliation Request Amount"]) ||
              parseAmt(r["FY 2026 Reconciliation Request"]);
            fy26Total +=
              parseAmt(r["FY 2026 Total Amount"]) ||
              parseAmt(r["FY 2026 Total"]);
          });

          const fy26Combined = fy26Req + fy26Rec || fy26Total;

          return {
            name,
            description,
            agency,
            increase: fy26Combined - fy25Enacted,
            total: fy26Combined,
          };
        }
      );

      // --- Group by agency: Winners & Losers ---
      const groupedWinners: Record<string, Program[]> = {
        all: programs
          .filter((p) => p.increase > 0)
          .sort((a, b) => b.increase - a.increase)
          .slice(0, 10),
      };

      const groupedLosers: Record<string, Program[]> = {
        all: programs
          .filter((p) => p.increase < 0)
          .sort((a, b) => a.increase - b.increase)
          .slice(0, 10),
      };

      ["Army", "Navy", "Air Force", "Space Force", "Defense-Wide"].forEach(
        (branch) => {
          let agencies: string[] = [branch];

          // 👇 Merge Marine Corps into Navy
          if (branch === "Navy") agencies.push("Marine Corps");

          // 👇 Merge Space Force into Air Force
          if (branch === "Air Force") agencies.push("Space Force");

          groupedWinners[branch.toLowerCase()] = programs
            .filter((p) => agencies.includes(p.agency) && p.increase > 0)
            .sort((a, b) => b.increase - a.increase)
            .slice(0, 10);

          groupedLosers[branch.toLowerCase()] = programs
            .filter((p) => agencies.includes(p.agency) && p.increase < 0)
            .sort((a, b) => a.increase - b.increase)
            .slice(0, 10);
        }
      );


      setWinners(groupedWinners);
      setLosers(groupedLosers);
    }

    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    const billions = value / 1e9;
    return `${billions >= 0 ? "+" : ""}$${Math.abs(billions).toFixed(2)}B`;
  };

  const formatTotal = (value: number) =>
    `Total: $${(value / 1e9).toFixed(2)}B`;

  const renderProgramList = (programs: Program[] = [], isLoser = false) => (
    <div className="space-y-3">
      {programs.map((p, idx) => (
        <div
          key={idx}
          className={`flex items-center justify-between p-4 bg-gradient-to-r from-card to-card/50 rounded-lg border border-border hover:shadow-medium transition-all ${
            isLoser ? "border-red-200" : ""
          }`}
        >
          <div>
            <h4 className="font-semibold">{p.name}</h4>
            <p className="text-sm text-muted-foreground">{p.description}</p>
          </div>
          <div className="text-right">
            <div
              className={`text-lg font-bold ${
                isLoser ? "text-red-600" : "text-green-600"
              }`}
            >
              {formatCurrency(p.increase)}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatTotal(p.total)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card className="shadow-medium">
      <CardHeader className="space-y-4">
        <CardTitle className="text-2xl font-bold">
          FY 2026 Budget Transformation: Winners & Losers
        </CardTitle>
        <p className="text-muted-foreground text-lg">
          Biggest platform increases and decreases by agency (FY26 vs FY25 Enacted)
        </p>
        <Alert className="bg-warning/10 border-warning/20">
          <Info className="h-4 w-4 text-warning" />
          <AlertDescription className="text-sm text-warning-foreground">
            Analysis compares FY25 Enacted vs FY26 Total (Disc + Reconciliation).
            Shipbuilding excluded due to timing spikes.
          </AlertDescription>
        </Alert>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="army">Army</TabsTrigger>
            <TabsTrigger value="navy">Navy</TabsTrigger>
            <TabsTrigger value="air force">Air Force</TabsTrigger>
            <TabsTrigger value="defense-wide">Defense-Wide</TabsTrigger>
          </TabsList>

          {/* 🔵 All Tab */}
          <TabsContent value="all">
            <h3 className="text-lg font-semibold mb-2 text-green-700">
              Biggest Budget Winners: Top 10 Increases
            </h3>
            {renderProgramList(winners.all)}
            <h3 className="text-lg font-semibold mt-6 mb-2 text-red-700">
              Biggest Budget Losers: Top 10 Cuts
            </h3>
            {renderProgramList(losers.all, true)}
          </TabsContent>

          {/* 🔵 Specific Agencies */}
          {["army", "navy", "air force", "space force", "defense-wide"].map(branch => (
            <TabsContent key={branch} value={branch}>
              <h3 className="text-lg font-semibold mb-2 text-green-700">
                Biggest Budget Winners: Top 10 Increases
              </h3>
              {renderProgramList(winners[branch])}
              <h3 className="text-lg font-semibold mt-6 mb-2 text-red-700">
                Biggest Budget Losers: Top 10 Cuts
              </h3>
              {renderProgramList(losers[branch], true)}
            </TabsContent>
          ))}
        </Tabs>

      </CardContent>
    </Card>
  );
};

export default BudgetAnalysis;
