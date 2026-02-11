import { useState, useMemo, useEffect } from "react";
import { fetchFundingByOffice } from "@/lib/supabaseData";
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
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
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
  calYear?: number | string;
  fy?: string;
  [fscCode: string]: number | string | undefined;
}
const colors = [
  "hsl(142 76% 36%)", // green
  "hsl(346 77% 49%)", // red
  "hsl(38 92% 50%)",  // yellow
  "hsl(262 83% 58%)", // purple
  "hsl(188 94% 42%)", // teal
  "hsl(330 81% 60%)", // pink
  "hsl(239 84% 67%)", // blue
  "hsl(173 58% 39%)", // green teal
  "hsl(25 95% 53%)",  // orange
  "hsl(291 47% 51%)", // violet
  "hsl(217 91% 59%)", // bright blue
];


const officeDictionary: Record<string, string> = {
  N00019: "NAVAL AIR SYSTEMS COMMAND",
  N68335: "NAVAIR WARFARE CTR AIRCRAFT DIV",
  N00104: "NAVSUP WEAPON SYSTEMS SUPPORT MECH",
  SPE8EF: "DLA TROOP SUPPORT",
  SP4701: "DCSO PHILADELPHIA",
};
function getFiscalYear(date: Date): string {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return month >= 10 ? (year + 1).toString() : year.toString();
}
const FundingChart = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [activeFscs, setActiveFscs] = useState<string[]>(["All"]);
  const [activeYear, setActiveYear] = useState<string>("All");
  const [activeOffice, setActiveOffice] = useState<string>("");

  // build list of available offices (only from dictionary)
  const offices = Object.keys(officeDictionary);
  useEffect(() => {
    if (!activeOffice) {
      setRows([]);
      return;
    }

    const load = async () => {
      const data = await fetchFundingByOffice(activeOffice);

      setRows(data);
    };
    load();
  }, [activeOffice]);


  // aggregate data when office changes
  const { data, fscKeys, years } = useMemo(() => {
    if (!activeOffice || rows.length === 0) {
      return { data: [], fscKeys: [], years: [] };
    }

    const results: FundingRow[] = [];
    const allFscs = new Set<string>();
    const allYears: string[] = [];

    const yearlyTotals: Record<string, Record<string, number>> = {};
    const monthlyTotals: Record<string, Record<string, number | string>> = {};

    rows.forEach((r: any) => {
      const rawFsc = r.fsc || "Unknown";
      const fsc = rawFsc.split(" ")[0].trim();
      const amount = parseFloat(r.awarded_amount || 0);
      const awardDate = new Date(r.award_date);
      if (isNaN(amount) || !awardDate.getFullYear()) return;
      const year = getFiscalYear(awardDate);
      const month = awardDate.toLocaleString("default", { month: "short" });

      allFscs.add(fsc);
      if (!allYears.includes(year)) allYears.push(year);

      if (!yearlyTotals[year]) yearlyTotals[year] = {};
      yearlyTotals[year][fsc] = (yearlyTotals[year][fsc] || 0) + amount;

      const calYear = awardDate.getFullYear();
      const ym = `${year}-${month}`;
      if (!monthlyTotals[ym]) monthlyTotals[ym] = { year, fy: year, calYear, month };
      monthlyTotals[ym][fsc] = ((monthlyTotals[ym][fsc] as number) || 0) + amount;
    });

    Object.entries(yearlyTotals).forEach(([year, fscAmounts]) => {
      results.push({ year, ...fscAmounts });
    });
    Object.values(monthlyTotals).forEach((row) =>
      results.push(row as FundingRow)
    );

    return {
      data: results,
      fscKeys: Array.from(allFscs),
      years: allYears.sort((a, b) => parseInt(a) - parseInt(b)),
    };
  }, [activeOffice, rows]);

  // dataset to show
  // compute fiscal year boundaries
  function getFiscalYearRange(fy: number) {
    return {
      start: new Date(fy - 1, 9, 1), // Oct 1 of previous year
      end: new Date(fy, 8, 30),      // Sep 30 of fy year
    };
  }

  const monthOrder = [
  "Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep"
];

const chartData =
  activeYear === "All"
    ? data.filter((d) => !d.month) // yearly totals
    : data
        .filter((d) => {
          if (!d.month || !d.calYear) return false;
          const fyNum = parseInt(activeYear, 10);
          const { start, end } = getFiscalYearRange(fyNum);
          const date = new Date(`${d.month} 1, ${d.calYear}`);
          return date >= start && date <= end;
        })
        .sort((a, b) => {
          // sort by fiscal month order
          return (
            monthOrder.indexOf(a.month as string) -
            monthOrder.indexOf(b.month as string)
          );
        });

  // keys: if "All" is selected → show everything
  const filteredKeys = activeFscs.includes("All") ? fscKeys : activeFscs;
  const validKeys = filteredKeys;
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    minimumFractionDigits: 0, // 👈 no forced decimals
    maximumFractionDigits: 1, // 👈 show up to 1 if needed
  }).format(value);

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Defense Funding by FSC
            {activeOffice && ` (${officeDictionary[activeOffice]})`}
          </div>
        </CardTitle>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 mt-3">

          {/* Office Selector (always visible) */}
          <Select value={activeOffice} onValueChange={setActiveOffice}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Choose an office" />
            </SelectTrigger>
            <SelectContent>
              {offices.map((code) => (
                <SelectItem key={code} value={code}>
                  {code} — {officeDictionary[code]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* FSC Multi-select */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-40 justify-between">
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
                          setActiveFscs((prev) =>
                            prev.filter((v) => v !== fsc)
                          );
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
            <SelectTrigger className="w-full sm:w-64">
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
              setActiveOffice("");
            }}
          >
            Reset
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {chartData.length === 0 || validKeys.length === 0 ? (
          <div className="p-6 text-muted-foreground text-center">
            {activeOffice
              ? `No data available for ${officeDictionary[activeOffice]}.`
              : "Select a contracting office to view data."}
            {/* Empty chart placeholder */}
            <ResponsiveContainer width="100%" height={700}>
              <BarChart data={[]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis />
                <YAxis />
                <Tooltip />
                
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={700}>

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
              formatter={(val: number) => formatCurrency(val)}
              labelFormatter={(label, payload) => {
                if (activeYear === "All") {
                  return `FY ${label}`;
                } else {
                  const row = payload?.[0]?.payload;
                  return `${label} ${row?.calYear || ""} (FY ${row?.fy || ""})`;
                }
              }}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />

            <Legend />
            {validKeys.map((fsc, idx) => (
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

        )}
      </CardContent>
    </Card>

  );
};

export default FundingChart;
