import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, TrendingUp, Hash, SortAsc, Calendar, Loader2 } from "lucide-react";
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
import { useFscLeaderboard } from "@/lib/supabaseRecipientData";
import type { Recipient } from "@/lib/supabaseRecipientData";

type SortMode = "code" | "volume" | "alpha";

const COMPANY = "DEVAL";
const SISTER = "PARTS LIFE";

const fmt = (n: number) =>
  n >= 1_000_000_000
    ? `$${(n / 1_000_000_000).toFixed(1)}B`
    : n >= 1_000_000
      ? `$${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
        ? `$${(n / 1_000).toFixed(0)}K`
        : `$${n.toFixed(0)}`;

const FY_OPTIONS = [
  { label: "All", value: null },
  { label: "FY2024", value: 2024 },
  { label: "FY2025", value: 2025 },
  { label: "FY2026", value: 2026 },
] as const;

const NUM_COLORS = 13;
const GROUP_SIZE = 4;

const RecipientAnalysis = () => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("volume");
  const [selectedFy, setSelectedFy] = useState<number | null>(null);
  const navigate = useNavigate();

  const { data, loading, error } = useFscLeaderboard(selectedFy);

  const dataWithTier = useMemo(() => {
    const indexed = data.map((entry, i) => ({ ...entry, _idx: i }));
    const byVolume = [...indexed].sort((a, b) => b.total_volume - a.total_volume);
    const tierMap = new Map<number, number>();
    byVolume.forEach((entry, i) => {
      tierMap.set(entry._idx, (Math.floor(i / GROUP_SIZE) % NUM_COLORS) + 1);
    });
    return indexed.map((e) => ({ ...e, _tier: tierMap.get(e._idx) || NUM_COLORS }));
  }, [data]);

  const sorted = useMemo(() => {
    const copy = [...dataWithTier];
    if (sort === "volume") copy.sort((a, b) => b.total_volume - a.total_volume);
    else if (sort === "code") copy.sort((a, b) => a.fsc_code.localeCompare(b.fsc_code));
    else copy.sort((a, b) => a.fsc_description.localeCompare(b.fsc_description));
    return copy;
  }, [dataWithTier, sort]);

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

  const fyLabel = FY_OPTIONS.find((o) => o.value === selectedFy)?.label || "All";

  const renderRecipientRow = (r: Recipient, isHighlight: boolean) => (
    <TableRow
      key={`${r.name}-${r.rank}`}
      className={`cursor-pointer hover:bg-accent/50 border-border/40 ${
        isHighlight ? "bg-primary/10" : ""
      }`}
      onClick={() => navigate(`/recipient-awards?recipient=${encodeURIComponent(r.name)}${selectedFy ? `&fy=${selectedFy}` : ''}`)}
    >
      <TableCell className="px-3 py-1.5 text-xs text-muted-foreground font-mono">
        {r.rank}
      </TableCell>
      <TableCell
        className={`px-2 py-1.5 text-xs truncate max-w-[140px] ${
          isHighlight ? "text-primary font-bold" : "text-foreground"
        }`}
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
  );

  return (
    <div className="p-4 sm:p-6 flex flex-col h-screen gap-6">
      <SectionHeader
        title="Recipient Analysis"
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
          {FY_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => setSelectedFy(opt.value)}
              className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm transition-all ${
                selectedFy === opt.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {loading
          ? "Loading…"
          : error
            ? `Error: ${error}`
            : `Showing ${filtered.length} of ${data.length} FSC categories`}
        {" · "}
        <span className="font-semibold text-foreground">{fyLabel}</span>
      </p>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">Loading leaderboard…</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-16 text-destructive">
          Failed to load leaderboard data. Check console for details.
        </div>
      )}

      {/* Grid */}
      {!loading && !error && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((entry, idx) => {
            const tier = entry._tier;
            const headerBg = `hsl(var(--tier-${tier}))`;
            const headerFg = `hsl(var(--tier-${tier}-fg))`;

            const inTop25 = entry.top_recipients?.some(
              (r) => r.name.toUpperCase().includes(COMPANY)
            );

            return (
              <Card
                key={`${entry.fsc_code}-${idx}`}
                className="flex flex-col overflow-hidden hover:shadow-lg transition-all duration-200 border-border/60"
                style={{ borderTopColor: headerBg, borderTopWidth: "3px" }}
              >
                <CardHeader
                  className="px-4 py-3 border-b border-border space-y-0.5"
                  style={{ backgroundColor: headerBg }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-sm font-bold tracking-wide uppercase"
                      style={{ color: headerFg }}
                    >
                      {entry.fsc_code}
                    </span>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: headerFg, opacity: 0.8 }}
                    >
                      {fmt(entry.total_volume)}
                    </span>
                  </div>
                  <p
                    className="text-xs truncate"
                    style={{ color: headerFg, opacity: 0.6 }}
                    title={entry.fsc_description}
                  >
                    {entry.fsc_description.replace(/^\d+:?\s*/, '')}
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
                      {entry.top_recipients?.map((r: Recipient) =>
                        renderRecipientRow(
                          r,
                          r.name.toUpperCase().includes(COMPANY) ||
                          r.name.toUpperCase().includes(SISTER)
                        )
                      )}
                      {(() => {
                        const devalInTop = entry.top_recipients?.some(
                          (r) => r.name.toUpperCase().includes(COMPANY)
                        );
                        const plInTop = entry.top_recipients?.some(
                          (r) => r.name.toUpperCase().includes(SISTER)
                        );
                        const extras: Recipient[] = [];
                        if (!devalInTop && entry.deval) extras.push(entry.deval);
                        if (!plInTop && entry.partslife) extras.push(entry.partslife);

                        if (extras.length === 0) return null;
                        return (
                          <>
                            <TableRow className="border-0">
                              <TableCell colSpan={4} className="px-3 py-0.5 text-center">
                                <span className="text-[10px] text-muted-foreground tracking-widest">
                                  · · ·
                                </span>
                              </TableCell>
                            </TableRow>
                            {extras.map((r) => renderRecipientRow(r, true))}
                          </>
                        );
                      })()}
                    </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          No FSC categories match "<span className="font-semibold">{search}</span>"
        </div>
      )}
    </div>
  );
};

export default RecipientAnalysis;