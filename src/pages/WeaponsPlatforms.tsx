import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Grid, List, ChevronRight, Loader2 } from "lucide-react";
import type { DepotLocation } from "@/data/weaponsPlatforms";
import { usePlatforms, useAllDepots } from "@/hooks/usePlatforms";
import { CorporateInput } from "@/components/ui/TacticalComponents";
import { DepotMap } from "@/components/dashboard/DepotMap";
import { WeaponPlatformCard } from "@/components/dashboard/WeaponPlatformCard";

const WeaponsPlatforms = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch from Supabase
  const { platforms, loading, error } = usePlatforms();
  const { depots: allDepots, loading: depotsLoading } = useAllDepots();

  // Convert filtered depot data â†’ DepotLocation[] for existing DepotMap
  const mapDepots: DepotLocation[] = useMemo(() => {
    const filtered = allDepots;

    // Deduplicate by coordinates so the same physical depot doesn't stack markers
    const seen = new Map<string, DepotLocation>();
    filtered.forEach((d) => {
      if (!d.coordinates?.lat || !d.coordinates?.lon) return;
      const key = `${d.coordinates.lat.toFixed(4)},${d.coordinates.lon.toFixed(4)}`;
      if (!seen.has(key)) {
        seen.set(key, {
          id: d.depotId,
          name: d.name,
          base: d.base,
          roles: d.roles,
          coordinates: d.coordinates,
          source: d.source,
          sourceDate: d.sourceDate,
        });
      }
    });
    return Array.from(seen.values());
  }, [allDepots]);

  // Client-side filtering
  const filteredWeapons = useMemo(() => {
    let results = [...platforms];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.description?.toLowerCase().includes(q) ||
          w.role?.toLowerCase().includes(q) ||
          w.budgetKeyword?.toLowerCase().includes(q) ||
          w.contractors?.some((c) => c.toLowerCase().includes(q))
      );
    }

    return results;
  }, [platforms, searchQuery]);

  const clearFilters = () => {
    setSearchQuery("");
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="px-4 py-8 max-w-[1600px]">
        {/* FILTERS BAR */}
        <div className="bg-card p-6 shadow-sm border border-border mb-8 rounded-sm">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="h-4 w-4 text-corporate-blue" />
            <h3 className="font-bold text-muted-foreground text-xs uppercase tracking-wide">Filter Platforms</h3>
          </div>

          <div className="flex items-end gap-6">
            <div className="flex-1">
              <CorporateInput
                label="Search"
                placeholder="Search by platform name or keyword..."
                icon={<Search className="h-4 w-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center h-full pb-1 gap-4">
              <div className="flex gap-1 border rounded overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
              {searchQuery && (
                <button onClick={clearFilters} className="text-[10px] text-muted-foreground hover:text-corporate-blue font-bold uppercase tracking-wider">
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>


        {/* DEPOT MAP */}
        {!depotsLoading && allDepots.length > 0 && (
          <div className="mb-8">
            <DepotMap depots={mapDepots} />
          </div>
        )}


        {/* LOADING STATE */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-corporate-blue" />
            <span className="ml-3 text-muted-foreground">Loading platforms...</span>
          </div>
        )}

        {/* ERROR STATE */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-6 text-center">
            <p className="text-red-600 font-medium">Failed to load platforms</p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* RESULTS COUNT */}
        {!loading && !error && (
          <div className="mb-4 text-xs text-muted-foreground">
            Showing {filteredWeapons.length} platform{filteredWeapons.length !== 1 ? "s" : ""}
          </div>
        )}

        {/* GRID VIEW */}
        {!loading && !error && viewMode === "grid" && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredWeapons.map((w) => (
              <WeaponPlatformCard
                key={w.id}
                id={w.id}
                name={w.name}
                category={w.category}
                description={w.description}
                contractors={w.contractors}
                imagePath={`${import.meta.env.BASE_URL}${w.id}.jpg`}
              />
            ))}
          </div>
        )}

        {/* LIST VIEW */}
        {!loading && !error && viewMode === "list" && (
          <div className="bg-card shadow-sm border border-border rounded-sm">
            <div className="grid grid-cols-12 gap-4 p-3 border-b border-border bg-muted text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              <div className="col-span-4">Platform</div>
              <div className="col-span-3">Category</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-right">Program Value</div>
              <div className="col-span-1"></div>
            </div>
            {filteredWeapons.map((w) => (
              <div
                key={w.id}
                className="grid grid-cols-12 gap-4 p-4 border-b border-border items-center hover:bg-accent/50 transition-colors group cursor-pointer"
                onClick={() => navigate(`/platforms/${w.id}`)}
              >
                <div className="col-span-4">
                  <div className="font-bold text-foreground text-sm group-hover:text-corporate-blue transition-colors">
                    {w.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Prime: {w.contractors?.[0] || "Unknown"}
                  </div>
                </div>
                <div className="col-span-3">
                  <span className="inline-block border border-border px-2 py-0.5 rounded text-[10px] font-bold text-muted-foreground bg-card">
                    {w.category}
                  </span>
                </div>
                <div className="col-span-2 text-xs font-medium text-foreground">{w.status}</div>
                <div className="col-span-2 text-right text-xs font-mono text-muted-foreground">
                  {w.totalFunding ? `$${(w.totalFunding / 1_000_000_000).toFixed(1)}B` : "--"}
                </div>
                <div className="col-span-1 flex justify-end">
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-corporate-blue" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && filteredWeapons.length === 0 && (
          <div className="bg-card border border-border p-12 text-center rounded-sm">
            <p className="text-muted-foreground">No platforms found matching your criteria.</p>
            <button onClick={clearFilters} className="mt-4 text-corporate-blue font-bold text-sm hover:underline">
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeaponsPlatforms;