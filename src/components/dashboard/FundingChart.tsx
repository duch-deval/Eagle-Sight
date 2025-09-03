import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import loadCsv from "@/lib/loadCsv";
import { csvFiles } from "@/data/contractsData";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
// 👇 this import was missing
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


interface FundingRow {
  year: string;
  month?: string;
  [fscCode: string]: number | string | undefined;
}

const colors = [
  "hsl(var(--navy))",
  "hsl(var(--success))",
  "hsl(var(--info))",
  "hsl(var(--warning))",
  "hsl(var(--accent))",
];

const FundingChart = () => {
  const [data, setData] = useState<FundingRow[]>([]);
  const [fscKeys, setFscKeys] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [activeFscs, setActiveFscs] = useState<string[]>(["All"]);
  const [activeYear, setActiveYear] = useState<string>("All");

  useEffect(() => {
    async function fetchAllYears() {
      const results: FundingRow[] = [];
      const allFscs = new Set<string>();
      const allYears: string[] = [];

      for (const [year, filePath] of Object.entries(csvFiles)) {
        const rows = await loadCsv(filePath);
        allYears.push(year);

        // group by FSC per month
        const byMonth: Record<string, Record<string, number>> = {};

        rows.forEach((r: any) => {
          const rawFsc = r["FSC"] || "Unknown FSC";
          const fsc = rawFsc.split(" ")[0].trim();

          const amount = parseFloat(r["Awarded$"] || 0);
          const date = new Date(r["Award Date"]);
          const month = date.toLocaleString("default", { month: "short" });

          allFscs.add(fsc);

          if (!byMonth[month]) byMonth[month] = {};
          byMonth[month][fsc] = (byMonth[month][fsc] || 0) + amount;
        });

        // yearly totals
        const byFsc = rows.reduce((acc: Record<string, number>, r: any) => {
          const rawFsc = r["FSC"] || "Unknown FSC";
          const fsc = rawFsc.split(" ")[0].trim();
          const amount = parseFloat(r["Awarded$"] || 0);
          acc[fsc] = (acc[fsc] || 0) + amount;
          return acc;
        }, {});

        // push one row per year
        results.push({ year, ...byFsc });

        // push rows per month
        Object.entries(byMonth).forEach(([month, fscAmounts]) => {
          results.push({ year, month, ...fscAmounts });
        });
      }

      setData(results);
      setFscKeys(Array.from(allFscs));
      setYears(allYears.sort());
    }

    fetchAllYears();
  }, []);

  // dataset to show
  const chartData =
    activeYear === "All"
      ? data.filter((d) => !d.month)
      : data.filter((d) => d.year === activeYear && d.month);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);

  // keys: if "All" is selected → show everything
  const filteredKeys = activeFscs.includes("All") ? fscKeys : activeFscs;

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-navy" />
            Defense Funding by FSC
          </div>
        </CardTitle>

        {/* Filters */}
        <div className="flex gap-4 mt-3">
          {/* Multi-select FSC */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-40 justify-between">
                {activeFscs.includes("All")
                  ? "All FSCs"
                  : `${activeFscs.length} selected`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 max-h-60 overflow-y-auto">
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={activeFscs.includes("All")}
                    onCheckedChange={(checked) =>
                      checked ? setActiveFscs(["All"]) : setActiveFscs([])
                    }
                  />
                  <span>All FSCs</span>
                </label>
                {fscKeys.map((fsc) => (
                  <label key={fsc} className="flex items-center gap-2">
                    <Checkbox
                      checked={activeFscs.includes(fsc)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setActiveFscs((prev) =>
                            prev.filter((v) => v !== "All").concat(fsc)
                          );
                        } else {
                          setActiveFscs((prev) => prev.filter((v) => v !== fsc));
                        }
                      }}
                    />
                    <span>{fsc}</span>
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Year filter */}
          <Select value={activeYear} onValueChange={setActiveYear}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Years</SelectItem>
              {years.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Reset */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setActiveFscs(["All"]);
              setActiveYear("All");
            }}
          >
            Reset
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={800}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey={activeYear === "All" ? "year" : "month"}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label, payload) =>
                activeYear === "All"
                  ? `FY ${label}`
                  : `${label} ${payload?.[0]?.payload?.year || ""}`
              }
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />

            {filteredKeys.map((fsc, idx) => (
              <Bar
                key={fsc}
                dataKey={fsc}
                stackId="funding"
                fill={colors[idx % colors.length]}
                name={fsc}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default FundingChart;
