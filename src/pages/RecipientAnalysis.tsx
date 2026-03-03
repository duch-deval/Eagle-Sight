import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, TrendingUp, Hash, SortAsc } from "lucide-react";
import { fetchAllRecipientsWithFSC, type RecipientRow } from "@/lib/supabaseRecipientData";
import { SectionHeader } from "@/components/ui/TacticalComponents";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

type SortMode = "code" | "volume" | "alpha";

interface FSCCard {
  fsc: string;
  totalVolume: number;
  recipients: { rank: number; name: string; total: number; count: number }[];
}

const fmt = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `$${(n / 1_000).toFixed(0)}K`
      : `$${n.toFixed(0)}`;

const RecipientAnalysis = () => {
  const [rows, setRows] = useState<RecipientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("volume");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllRecipientsWithFSC().then((d) => {
      setRows(d);
      setLoading(false);
    });
  }, []);

  const cards: FSCCard[] = useMemo(() => {
    const map = new Map<string, Map<string, { total: number; count: number }>>();
    for (const r of rows) {
      if (!r.fsc) continue;
      if (!map.has(r.fsc)) map.set(r.fsc, new Map());
      const recMap = map.get(r.fsc)!;
      const name = r.recipient_name || "Unknown";
      const prev = recMap.get(name) || { total: 0, count: 0 };
      prev.total += Number(r.awarded_amount) || 0;
      prev.count += 1;
      recMap.set(name, prev);
    }

    const result: FSCCard[] = [];
    for (const [fsc, recMap] of map) {
      const sorted = [...recMap.entries()]
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 25)
        .map(([name, d], i) => ({ rank: i + 1, name, total: d.total, count: d.count }));
      const totalVolume = sorted.reduce((s, r) => s + r.total, 0);
      result.push({ fsc, totalVolume, recipients: sorted });
    }

    if (sort === "volume") result.sort((a, b) => b.totalVolume - a.totalVolume);
    else result.sort((a, b) => a.fsc.localeCompare(b.fsc));

    return result;
  }, [rows, sort]);

  const filtered = useMemo(() => {
    if (!search.trim()) return cards;
    const q = search.toLowerCase();
    return cards.filter((c) => c.fsc.toLowerCase().includes(q));
  }, [cards, search]);

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
          <input
            className="w-full bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none py-2.5 pl-9 pr-3 rounded-sm shadow-sm transition-all"
            placeholder="Filter by FSC code…"
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
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-sm" />
          ))}
        </div>
      )}

      {/* Grid */}
      {!loading && (
        <>
          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} of {cards.length} FSC categories
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((card) => (
              <div
                key={card.fsc}
                className="bg-card border border-border rounded-sm shadow-sm flex flex-col overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-200"
              >
                {/* Card Header */}
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground tracking-wide uppercase">
                      FSC {card.fsc}
                    </span>
                    <span className="text-xs font-semibold text-primary">
                      {fmt(card.totalVolume)}
                    </span>
                  </div>
                </div>

                {/* Scrollable Table */}
                <ScrollArea className="h-56">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-card z-10">
                      <tr className="border-b border-border">
                        <th className="text-left px-3 py-1.5 text-muted-foreground font-semibold w-8">#</th>
                        <th className="text-left px-2 py-1.5 text-muted-foreground font-semibold">Company</th>
                        <th className="text-right px-3 py-1.5 text-muted-foreground font-semibold">Amount</th>
                        <th className="text-right px-3 py-1.5 text-muted-foreground font-semibold w-10">Ct</th>
                      </tr>
                    </thead>
                    <tbody>
                      {card.recipients.map((r) => (
                        <tr
                          key={r.name}
                          className="border-b border-border/50 hover:bg-muted/40 cursor-pointer transition-colors"
                          onClick={() =>
                            navigate(`/awards?recipient=${encodeURIComponent(r.name)}`)
                          }
                        >
                          <td className="px-3 py-1.5 text-muted-foreground font-mono">{r.rank}</td>
                          <td className="px-2 py-1.5 text-foreground truncate max-w-[140px]" title={r.name}>
                            {r.name}
                          </td>
                          <td className="px-3 py-1.5 text-right font-semibold text-foreground whitespace-nowrap">
                            {fmt(r.total)}
                          </td>
                          <td className="px-3 py-1.5 text-right text-muted-foreground">{r.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          No FSC categories match "<span className="font-semibold">{search}</span>"
        </div>
      )}
    </div>
  );
};

export default RecipientAnalysis;
