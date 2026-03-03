import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, TrendingUp, Hash, SortAsc, Calendar } from "lucide-react";
import { SectionHeader } from "@/components/ui/TacticalComponents";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import mockData from "@/data/mockFscLeaderboard.json";

type SortMode = "code" | "volume" | "alpha";

interface Recipient {
  rank: number;
  name: string;
  total_awarded: number;
  award_count: number;
}

interface FSCEntry {
  fsc_code: string;
  fsc_description: string;
  total_volume: number;
  top_recipients: Recipient[];
}

const fmt = (n: number) =>
  n >= 1_000_000_000
    ? `$${(n / 1_000_000_000).toFixed(1)}B`
    : n >= 1_000_000
      ? `$${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
        ? `$${(n / 1_000).toFixed(0)}K`
        : `$${n.toFixed(0)}`;

const RecipientAnalysis = () => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("volume");
  const [fy, setFy] = useState<string>("FY2026");
  const navigate = useNavigate();

  const fyOptions = ["FY2023", "FY2024", "FY2025", "FY2026"];

  const data = mockData as FSCEntry[];

  const sorted = useMemo(() => {
    const copy = [...data];
    if (sort === "volume") copy.sort((a, b) => b.total_volume - a.total_volume);
    else if (sort === "code") copy.sort((a, b) => a.fsc_code.localeCompare(b.fsc_code));
    else copy.sort((a, b) => a.fsc_description.localeCompare(b.fsc_description));
    return copy;
  }, [data, sort]);

  const filtered = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(
      (c) =>
        c.fsc_code.toLowerCase().includes(q) ||
        c.fsc_description.toLowerCase().includes(q)
    );
  }, [sorted, search]);

  const sortOptions: { key: SortMode; label: string; icon: typeof TrendingUp }[] = [
    { key: "volume", label: "Volume", icon: TrendingUp },
    { key: "code", label: "FSC Code", icon: Hash },
    { key: "alpha", label: "A → Z", icon: SortAsc },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <SectionHeader
        title="Recipient Analysis"
        subtitle="FSC Leaderboard — Top 25 recipients by dollar value for each Federal Supply Class"
      />

      {/* Search + Sort Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Filter by FSC code or description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 bg-muted/50 rounded-sm p-0.5 border border-border">
          {sortOptions.map((o) => (
            <button
              key={o.key}
              onClick={() => setSort(o.key)}
              className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm transition-all ${
                sort === o.key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <o.icon className="h-3 w-3" />
              {o.label}
            </button>
          ))}
        </div>

        {/* FY Filter */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-sm p-0.5 border border-border">
          <Calendar className="h-3 w-3 text-muted-foreground ml-2" />
          {fyOptions.map((year) => (
            <button
              key={year}
              onClick={() => setFy(year)}
              className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm transition-all ${
                fy === year
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {data.length} FSC categories · <span className="font-semibold text-foreground">{fy}</span>
      </p>

      {/* Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((entry, idx) => (
          <Card
            key={`${entry.fsc_code}-${idx}`}
            className="flex flex-col overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-200 border-border/60"
          >
            <CardHeader className="px-4 py-3 border-b border-border bg-primary space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-primary-foreground tracking-wide uppercase">
                  FSC {entry.fsc_code}
                </span>
                <span className="text-xs font-semibold text-primary-foreground/80">
                  {fmt(entry.total_volume)}
                </span>
              </div>
              <p className="text-xs text-primary-foreground/60 truncate" title={entry.fsc_description}>
                {entry.fsc_description}
              </p>
            </CardHeader>

            <CardContent className="p-0 flex-1 bg-card">
              <ScrollArea className="h-56">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border bg-muted/50">
                      <TableHead className="h-7 px-3 text-xs w-8">#</TableHead>
                      <TableHead className="h-7 px-2 text-xs">Company</TableHead>
                      <TableHead className="h-7 px-3 text-xs text-right">Amount</TableHead>
                      <TableHead className="h-7 px-3 text-xs text-right w-10">Ct</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entry.top_recipients.map((r) => (
                      <TableRow
                        key={r.name}
                        className="cursor-pointer hover:bg-accent/50 border-border/40"
                        onClick={() =>
                          navigate(`/awards?recipient=${encodeURIComponent(r.name)}`)
                        }
                      >
                        <TableCell className="px-3 py-1.5 text-xs text-muted-foreground font-mono">
                          {r.rank}
                        </TableCell>
                        <TableCell
                          className="px-2 py-1.5 text-xs truncate max-w-[140px] text-foreground"
                          title={r.name}
                        >
                          {r.name}
                        </TableCell>
                        <TableCell className="px-3 py-1.5 text-xs text-right font-semibold text-foreground whitespace-nowrap">
                          {fmt(r.total_awarded)}
                        </TableCell>
                        <TableCell className="px-3 py-1.5 text-xs text-right text-muted-foreground">
                          {r.award_count}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          No FSC categories match "<span className="font-semibold">{search}</span>"
        </div>
      )}
    </div>
  );
};

export default RecipientAnalysis;
