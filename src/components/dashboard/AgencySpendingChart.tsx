import { useState, useEffect } from "react";
import loadCsv from "@/lib/loadCsv";
import { Card } from "@/components/ui/card";

const parseAmt = (val: any) => {
  const num = parseFloat((val || "0").toString().replace(/,/g, ""));
  return isNaN(num) ? 0 : num * 1000; // values are in thousands
};

export default function ClassifiedDashboard() {
  const [metrics, setMetrics] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const p1 = await loadCsv("/p1_display.csv");
      const r1 = await loadCsv("/r1_display.csv");
      const o1 = await loadCsv("/o1_display.csv");

      const datasets = [
        { rows: p1, type: "Procurement" },
        { rows: r1, type: "RDT&E" },
        { rows: o1, type: "O&M" },
      ];

      let totalGrowth = 0;
      let totalClassified = 0;
      let totalGrowthAll = 0;
      let totalRecon = 0;

      datasets.forEach(({ rows }) => {
        rows.forEach((r: any) => {
          const name =
            r["Budget Line Item (BLI) Title"] ||
            r["SAG/Budget Line Item (BLI) Title"] ||
            r["Program Element/Budget Line Item (BLI) Title"] ||
            "";

          const isClassified = name.toLowerCase().includes("classified");

          const fy25 = parseAmt(r["FY 2025 Enacted Amount"] || r["FY 2025 Enacted"]);
          const fy26Req =
            parseAmt(r["FY 2026 Disc Request Amount"] || r["FY 2026 Disc Request"]);
          const fy26Rec =
            parseAmt(r["FY 2026 Reconciliation Request Amount"] || r["FY 2026 Reconciliation Request"]);
          const fy26Total =
            parseAmt(r["FY 2026 Total Amount"] || r["FY 2026 Total"]);

          const fy26Combined = fy26Req + fy26Rec || fy26Total;
          const growth = fy26Combined - fy25;

          totalGrowthAll += growth;

          if (isClassified) {
            totalGrowth += growth;
            totalClassified += fy26Combined;
            totalRecon += fy26Rec;
          }
        });
      });

      setMetrics([
        { value: `$${(totalGrowth / 1e9).toFixed(2)}B`, label: "Total Growth" },
        {
          value: `${((totalGrowth / totalGrowthAll) * 100).toFixed(1)}%`,
          label: "of Total Budget Growth",
          sublabel: `$${(totalGrowth / 1e9).toFixed(2)}B of $${(totalGrowthAll / 1e9).toFixed(2)}B`,
        },
        {
          value: `$${(totalClassified / 1e9).toFixed(2)}B`,
          label: "FY26 Total Classified",
        },
        {
          value: `$${(totalRecon / 1e9).toFixed(2)}B`,
          label: "From Reconciliation",
          sublabel: `${((totalRecon / totalClassified) * 100).toFixed(1)}% of FY26 total`,
        },
      ]);
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <h1 className="text-xl font-medium text-gray-900">
          Classified Programs: Hidden Driver of Budget Growth
        </h1>
      </div>

      {/* Metrics */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {metrics.map((m, i) => (
            <Card key={i} className="p-4 bg-white border-0 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 mb-1">{m.value}</div>
                <div className="text-sm text-gray-700 mb-1">{m.label}</div>
                {m.sublabel && <div className="text-xs text-gray-500">{m.sublabel}</div>}
              </div>
            </Card>
          ))}
        </div>
        <div className="text-sm text-gray-700">
          <strong>Data Scope:</strong> Analysis includes all program elements with "classified" in line item name. <br />
          <strong>Coverage:</strong> RDT&E, Procurement, O&M <br />
          <strong>Comparison:</strong> FY26 Total (Discretionary + Reconciliation) vs FY25 Enacted
        </div>
      </div>
    </div>
  );
}