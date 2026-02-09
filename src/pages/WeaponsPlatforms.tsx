import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight, Filter, Grid, List, ChevronRight, FileBarChart, Loader2, MapPin } from "lucide-react";
import { weaponCategories } from "@/data/weaponsPlatforms";
import type { DepotLocation } from "@/data/weaponsPlatforms";
import { usePlatforms, useAllDepots } from "@/hooks/usePlatforms";
import { CorporateButton, CorporateInput, CorporateSelect, CorporateCard } from "@/components/ui/TacticalComponents";
import { DepotMap } from "@/components/dashboard/DepotMap";

const WeaponsPlatforms = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mapPlatform, setMapPlatform] = useState<string>("all");

  // Fetch from Supabase
  const { platforms, loading, error } = usePlatforms();
  const { depots: allDepots, platformNames: depotPlatforms, loading: depotsLoading } = useAllDepots();

  // Convert filtered depot data â†’ DepotLocation[] for existing DepotMap
  const mapDepots: DepotLocation[] = useMemo(() => {
    const filtered = mapPlatform === "all"
      ? allDepots
      : allDepots.filter((d) => d.platformId === mapPlatform);

    // Deduplicate by coordinates so the same physical depot doesn't stack markers
    const seen = new Map<string, DepotLocation>();
    filtered.forEach((d) => {
      if (!d.coordinates?.lat || !d.coordinates?.lon) return;
      const key = `${d.coordinates.lat.toFixed(4)},${d.coordinates.lon.toFixed(4)}`;
      if (!seen.has(key)) {
        seen.set(key, {
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
  }, [allDepots, mapPlatform]);

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

    if (selectedCategory !== "all") {
      results = results.filter((w) => w.category === selectedCategory);
    }

    if (selectedStatus !== "all") {
      results = results.filter((w) => w.status === selectedStatus);
    }

    return results;
  }, [platforms, searchQuery, selectedCategory, selectedStatus]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedStatus("all");
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* FILTERS BAR */}
        <div className="bg-white p-6 shadow-sm border border-slate-200 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="h-4 w-4 text-corporate-blue" />
            <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wide">Filter Platforms</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-5">
              <CorporateInput
                label="Search"
                placeholder="Search by name or keyword..."
                icon={<Search className="h-4 w-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="md:col-span-3">
              <CorporateSelect
                label="Category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {weaponCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </CorporateSelect>
            </div>
            <div className="md:col-span-2">
              <CorporateSelect
                label="Status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">Any Status</option>
                <option value="Active">Active</option>
                <option value="Development">Development</option>
                <option value="Retired">Retired</option>
              </CorporateSelect>
            </div>
            <div className="md:col-span-2 flex justify-end items-center h-full pb-1 gap-4">
              <div className="flex gap-1 border rounded overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-corporate-navy text-white" : "bg-white text-slate-500 hover:bg-slate-100"}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-corporate-navy text-white" : "bg-white text-slate-500 hover:bg-slate-100"}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
              {(searchQuery || selectedCategory !== "all" || selectedStatus !== "all") && (
                <button onClick={clearFilters} className="text-[10px] text-slate-400 hover:text-corporate-blue font-bold uppercase tracking-wider">
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>


        {/* DEPOT MAP */}
        {!depotsLoading && allDepots.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Map */}
              <div className="flex-1 min-w-0">
                <DepotMap depots={mapDepots} />
              </div>

              {/* Sidebar filter panel */}
              <div className="w-full lg:w-56 flex-shrink-0 bg-white border border-slate-200 rounded-lg p-4 self-start">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                  <MapPin className="h-4 w-4 text-corporate-blue" />
                  <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wide">
                    Sustainment Network
                  </h3>
                </div>

                <div className="mb-4">
                  <CorporateSelect
                    label="Platform"
                    value={mapPlatform}
                    onChange={(e) => setMapPlatform(e.target.value)}
                  >
                    <option value="all">All Platforms</option>
                    {depotPlatforms.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </CorporateSelect>
                </div>

                <div className="text-[10px] text-slate-400 space-y-1">
                  <div>
                    <span className="font-bold text-slate-500">{mapDepots.length}</span> depot{mapDepots.length !== 1 ? "s" : ""}
                  </div>
                  <div>
                    <span className="font-bold text-slate-500">{allDepots.length}</span> total depot links
                  </div>
                  {mapPlatform !== "all" && (
                    <div className="pt-2 border-t border-slate-100 mt-2 text-corporate-blue font-medium">
                      {depotPlatforms.find((p) => p.id === mapPlatform)?.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}


        {/* LOADING STATE */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-corporate-blue" />
            <span className="ml-3 text-slate-500">Loading platforms...</span>
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
          <div className="mb-4 text-xs text-slate-500">
            Showing {filteredWeapons.length} platform{filteredWeapons.length !== 1 ? "s" : ""}
          </div>
        )}

        {/* GRID VIEW */}
        {!loading && !error && viewMode === "grid" && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredWeapons.map((w) => (
              <CorporateCard key={w.id} className="group h-full border-t-4 border-t-slate-200 hover:border-t-corporate-blue">
                <div
                  className="h-48 bg-slate-200 relative overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/platforms/${w.id}`)}
                >
                  <img
                    src={`${import.meta.env.BASE_URL}${w.id}.jpg`}
                    alt={w.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                      e.currentTarget.nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                  <div className="absolute inset-0 bg-slate-800 flex items-center justify-center hidden">
                    <div className="text-white opacity-10 text-8xl font-bold tracking-tighter select-none">
                      {w.name.substring(0, 2)}
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-corporate-navy text-[10px] font-bold px-3 py-1 uppercase tracking-wider shadow-sm">
                    {w.category}
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3
                        className="text-xl font-bold text-corporate-navy group-hover:text-corporate-blue transition-colors cursor-pointer"
                        onClick={() => navigate(`/platforms/${w.id}`)}
                      >
                        {w.name}
                      </h3>
                      <FileBarChart className="h-5 w-5 text-slate-300 group-hover:text-corporate-blue transition-colors" />
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-3">
                      Prime: {w.contractors?.[0] || "Unknown"}
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">{w.description}</p>
                  </div>

                  <div className="mt-auto pt-4 flex justify-between items-center">
                    <button
                      onClick={() => navigate(`/platforms/${w.id}`)}
                      className="text-corporate-blue font-bold text-xs flex items-center group-hover:underline"
                    >
                      View Details <ArrowRight className="ml-1 h-3 w-3" />
                    </button>
                  </div>
                </div>
              </CorporateCard>
            ))}
          </div>
        )}

        {/* LIST VIEW */}
        {!loading && !error && viewMode === "list" && (
          <div className="bg-white shadow-sm border border-slate-200">
            <div className="grid grid-cols-12 gap-4 p-3 border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <div className="col-span-4">Platform</div>
              <div className="col-span-3">Category</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-right">Program Value</div>
              <div className="col-span-1"></div>
            </div>
            {filteredWeapons.map((w) => (
              <div
                key={w.id}
                className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 items-center hover:bg-blue-50 transition-colors group cursor-pointer"
                onClick={() => navigate(`/platforms/${w.id}`)}
              >
                <div className="col-span-4">
                  <div className="font-bold text-corporate-navy text-sm group-hover:text-corporate-blue transition-colors">
                    {w.name}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wide">
                    Prime: {w.contractors?.[0] || "Unknown"}
                  </div>
                </div>
                <div className="col-span-3">
                  <span className="inline-block border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 bg-white">
                    {w.category}
                  </span>
                </div>
                <div className="col-span-2 text-xs font-medium text-slate-700">{w.status}</div>
                <div className="col-span-2 text-right text-xs font-mono text-slate-600">
                  {w.totalFunding ? `$${(w.totalFunding / 1_000_000_000).toFixed(1)}B` : "--"}
                </div>
                <div className="col-span-1 flex justify-end">
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-corporate-blue" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && filteredWeapons.length === 0 && (
          <div className="bg-white border border-slate-200 p-12 text-center">
            <p className="text-slate-500">No platforms found matching your criteria.</p>
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