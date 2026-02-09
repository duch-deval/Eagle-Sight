import { useState } from "react";
import { Download, Search, RotateCcw, Loader2, FileJson, Database } from "lucide-react";
import { toast } from "sonner";
import { CorporateButton, CorporateInput, CorporateCard } from "@/components/ui/TacticalComponents";
import supabase from "@/lib/supabaseClient";

// ========================
// CONFIG
// ========================

const FY_RANGES: Record<string, { start: string; end: string }> = {
  "2023": { start: "2022-10-01", end: "2023-09-30" },
  "2024": { start: "2023-10-01", end: "2024-09-30" },
  "2025": { start: "2024-10-01", end: "2025-09-30" },
  "2026": { start: "2025-10-01", end: "2026-09-30" },
};

const DESIRED_ORDER = [
  "Award ID", "Award Date", "Recipient Name", "Awarded$", "Award Description",
  "Solicitation ID", "Competition Type", "Offers Received",
  "Contract Pricing Type", "Set Aside Type", "Funding Office Name",
  "FSC", "NAICS", "Funding Agency",
  "PoP Start Date", "PoP End Date", "Last Modified Date",
];

function computePoP(startStr: string, endStr: string) {
  if (!startStr || !endStr) return { daysLeft: null };
  const end = new Date(endStr);
  const today = new Date();
  if (isNaN(end.getTime())) return { daysLeft: null };
  const daysLeft = Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return { daysLeft };
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

// ========================
// Results Table Component
// ========================

function ResultsTable({ data }: { data: any[] }) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filterText, setFilterText] = useState("");

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = data.filter(r => {
    if (!filterText) return true;
    const q = filterText.toLowerCase();
    return (r.award_id || "").toLowerCase().includes(q) || 
           (r.recipient_name || "").toLowerCase().includes(q) ||
           (r.award_description || "").toLowerCase().includes(q);
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0;
    let aVal = a[sortKey];
    let bVal = b[sortKey];
    if (sortKey === "awarded_amount") {
      aVal = parseFloat(aVal) || 0;
      bVal = parseFloat(bVal) || 0;
    }
    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-3 border-b bg-slate-50 flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="Filter by Award ID, Recipient, Description..."
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-sm focus:border-blue-600 focus:outline-none font-medium"
          />
        </div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {sorted.length} / {data.length} records
        </div>
      </div>

      <div className="overflow-auto flex-1">
        <table className="w-full text-[11px] border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-800 text-white">
              <th className="px-4 py-3 text-left font-bold uppercase tracking-wider cursor-pointer hover:bg-slate-700" onClick={() => handleSort('award_id')}>Award ID</th>
              <th className="px-4 py-3 text-left font-bold uppercase tracking-wider cursor-pointer hover:bg-slate-700" onClick={() => handleSort('recipient_name')}>Recipient</th>
              <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Set Aside</th>
              <th className="px-4 py-3 text-right font-bold uppercase tracking-wider cursor-pointer hover:bg-slate-700" onClick={() => handleSort('awarded_amount')}>Amount</th>
              <th className="px-4 py-3 text-center font-bold uppercase tracking-wider">Days Left</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sorted.slice(0, 100).map((r, idx) => {
              const { daysLeft } = computePoP(r.pop_start_date, r.pop_end_date);
              return (
                <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-blue-600">{r.award_id || "—"}</td>
                  <td className="px-4 py-3 font-bold text-slate-700 truncate max-w-[180px]">{r.recipient_name || "—"}</td>
                  <td className="px-4 py-3 text-slate-500 truncate max-w-[200px]">{r.award_description || "—"}</td>
                  <td className="px-4 py-3 text-slate-500 truncate max-w-[120px]">{r.set_aside_type || "—"}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">{r.awarded_amount ? formatCurrency(r.awarded_amount) : "—"}</td>
                  <td className={`px-4 py-3 text-center font-bold ${daysLeft !== null && daysLeft < 30 ? 'text-red-500' : 'text-slate-400'}`}>
                    {daysLeft ?? '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {data.length > 100 && (
        <div className="p-2 border-t bg-slate-50 text-[10px] text-slate-500 text-center">
          Showing 100 of {data.length} records • Download CSV for complete dataset
        </div>
      )}
    </div>
  );
}

const FY_PRESETS = Object.entries(FY_RANGES)
  .sort(([a], [b]) => parseInt(b) - parseInt(a))
  .map(([fy, { start, end }]) => ({ label: `FY ${fy}`, start, end }));

interface Filters {
  pscCodes: string;
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
}

export default function ExportData() {
  const [filters, setFilters] = useState<Filters>({
    pscCodes: "",
    startDate: "2024-10-01",
    endDate: "2025-09-30",
    minAmount: "",
    maxAmount: "",
  });

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [queryTime, setQueryTime] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);

  const parsePscCodes = (input: string): string[] => {
    if (!input.trim()) return [];
    return input.split(/[,\s\n]+/).map(code => code.trim().toUpperCase()).filter(code => code.length > 0);
  };

  const applyFyPreset = (start: string, end: string) => {
    setFilters(f => ({ ...f, startDate: start, endDate: end }));
  };

  const resetFilters = () => {
    setFilters({
      pscCodes: "",
      startDate: "2024-10-01",
      endDate: "2025-09-30",
      minAmount: "",
      maxAmount: "",
    });
    setData([]);
    setQueryTime(null);
    setTotalCount(null);
  };

  const fetchData = async () => {
    if (!filters.startDate || !filters.endDate) {
      toast.error("Please specify a date range");
      return;
    }

    setLoading(true);
    setData([]);
    setQueryTime(null);
    setTotalCount(null);
    const startTime = Date.now();

    try {
      const pscList = parsePscCodes(filters.pscCodes);

      toast("Loading records...");

      const allRecords: any[] = [];
      const pageSize = 1000;
      let consecutiveErrors = 0;
      const maxRecords = 200000;
      const hasFscFilter = pscList.length > 0;

      // DEBUG: Log query strategy
      console.group("🔍 SUPABASE FETCH DEBUG");
      console.log("Filters:", { 
        pscCodes: pscList, 
        dateRange: `${filters.startDate} to ${filters.endDate}`,
        amount: `${filters.minAmount || 'any'} - ${filters.maxAmount || 'any'}`,
        strategy: hasFscFilter ? "ID-based (FSC filter)" : "Date-cursor (no FSC)"
      });

      if (hasFscFilter) {
        // FSC FILTER PATH: Uses composite index (idx_awards_date_fsc)
        // Smaller page size + delay to avoid timeout on cold cache reads
        // ADAPTIVE page sizing: start at 200, reduce to 100 if timeouts persist
        let currentPageSize = 200;
        let cursorDate: string | null = null;
        let pageNum = 0;
        let failuresAtCurrentCursor = 0;
        
        console.log("📌 FSC filter: Using database index with ADAPTIVE page sizing");
        console.log("   FSC codes:", pscList.map(c => c.toUpperCase()));
        console.log("   Starting page size:", currentPageSize);
        
        while (allRecords.length < maxRecords) {
          pageNum++;
          const pageStart = Date.now();
          
          // Longer delay between pages to let DB cache breathe
          if (pageNum > 1) {
            await new Promise(r => setTimeout(r, 150));
          }
          
          try {
            let query = supabase
              .from("awards")
              .select(`
                award_id, solicitation_id, competition_type, offers_received,
                contract_pricing_type, set_aside_type, funding_office_name,
                fsc, naics, funding_agency, award_type, pop_start_date,
                pop_end_date, last_modified_date, recipient_name,
                award_description, awarded_amount, award_date
              `)
              .gte("award_date", filters.startDate)
              .lte("award_date", filters.endDate)
              .order("award_date", { ascending: false })
              .order("award_id", { ascending: false })
              .limit(currentPageSize);

            // FSC filter - now uses index!
            if (pscList.length === 1) {
              query = query.like("fsc", `${pscList[0].toUpperCase()}%`);
            } else {
              const pscFilters = pscList.map(code => `fsc.like.${code.toUpperCase()}%`).join(",");
              query = query.or(pscFilters);
            }

            if (filters.minAmount) {
              query = query.gte("awarded_amount", parseFloat(filters.minAmount));
            }
            if (filters.maxAmount) {
              query = query.lte("awarded_amount", parseFloat(filters.maxAmount));
            }

            if (cursorDate) {
              query = query.lt("award_date", cursorDate);
            }

            console.log(`Page ${pageNum}: cursor=${cursorDate || 'start'}, fsc=${pscList[0]}%, limit=${currentPageSize}`);

            const { data: pageData, error } = await query;
            const pageTime = Date.now() - pageStart;

            if (error) {
              console.error(`❌ Page ${pageNum} FAILED (${pageTime}ms):`, {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
              });
              consecutiveErrors++;
              failuresAtCurrentCursor++;
              
              // ADAPTIVE: After 2 failures at same cursor, reduce page size
              if (failuresAtCurrentCursor >= 2 && currentPageSize > 50) {
                currentPageSize = Math.max(50, Math.floor(currentPageSize / 2));
                console.log(`⚡ Reducing page size to ${currentPageSize} due to repeated timeouts`);
                failuresAtCurrentCursor = 0; // Reset counter for new size
              }
              
              // Give up after many total failures
              if (consecutiveErrors >= 12) {
                if (allRecords.length > 0) {
                  toast.error(`Stopped at ${allRecords.length.toLocaleString()} records after ${consecutiveErrors} errors`);
                  break;
                }
                throw new Error(`Query failed: ${error.message} (code: ${error.code})`);
              }
              
              // Wait longer after failures: 3s, 5s, 7s...
              const waitTime = 3000 + (1000 * consecutiveErrors);
              console.log(`   Retrying in ${(waitTime/1000).toFixed(1)}s...`);
              await new Promise(r => setTimeout(r, waitTime));
              continue;
            }

            console.log(`✅ Page ${pageNum}: ${pageData?.length || 0} rows in ${pageTime}ms`);

            consecutiveErrors = 0;
            failuresAtCurrentCursor = 0;
            
            if (!pageData || pageData.length === 0) {
              console.log("No more data - pagination complete");
              break;
            }
            
            allRecords.push(...pageData);
            cursorDate = pageData[pageData.length - 1].award_date;
            
            if (allRecords.length % 2000 === 0) {
              toast(`Loaded ${allRecords.length.toLocaleString()} records...`);
            }
            
            if (pageData.length < currentPageSize) {
              console.log(`Last page (${pageData.length} < ${currentPageSize}) - done`);
              break;
            }
            
          } catch (pageError: any) {
            consecutiveErrors++;
            failuresAtCurrentCursor++;
            console.error(`Page ${pageNum} exception:`, pageError);
            
            if (failuresAtCurrentCursor >= 2 && currentPageSize > 50) {
              currentPageSize = Math.max(50, Math.floor(currentPageSize / 2));
              console.log(`⚡ Reducing page size to ${currentPageSize}`);
              failuresAtCurrentCursor = 0;
            }
            
            if (consecutiveErrors >= 10) {
              if (allRecords.length > 0) {
                toast.error(`Stopped at ${allRecords.length.toLocaleString()} records`);
                break;
              }
              throw pageError;
            }
            await new Promise(r => setTimeout(r, 3000 + (1000 * consecutiveErrors)));
          }
        }
        
        console.log(`FSC filter complete: ${allRecords.length} records`);
        
      } else {
        // NO FSC FILTER: Use date-based cursor pagination (fast on date index)
        let cursorDate: string | null = null;
        let pageNum = 0;
        
        while (allRecords.length < maxRecords) {
          pageNum++;
          const pageStart = Date.now();
          
          try {
            let query = supabase
              .from("awards")
              .select(`
                award_id, solicitation_id, competition_type, offers_received,
                contract_pricing_type, set_aside_type, funding_office_name,
                fsc, naics, funding_agency, award_type, pop_start_date,
                pop_end_date, last_modified_date, recipient_name,
                award_description, awarded_amount, award_date
              `)
              .gte("award_date", filters.startDate)
              .lte("award_date", filters.endDate)
              .order("award_date", { ascending: false })
              .order("award_id", { ascending: false })
              .limit(pageSize);

            if (filters.minAmount) {
              query = query.gte("awarded_amount", parseFloat(filters.minAmount));
            }
            if (filters.maxAmount) {
              query = query.lte("awarded_amount", parseFloat(filters.maxAmount));
            }

            if (cursorDate) {
              query = query.lt("award_date", cursorDate);
            }

            // DEBUG
            console.log(`Page ${pageNum}: cursor=${cursorDate || 'none'}...`);

            const { data: pageData, error } = await query;
            const pageTime = Date.now() - pageStart;

            if (error) {
              console.error(`❌ Page ${pageNum} FAILED (${pageTime}ms):`, {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
              });
              consecutiveErrors++;
              if (consecutiveErrors >= 5) {
                if (allRecords.length > 0) {
                  toast.error(`Stopped at ${allRecords.length.toLocaleString()} records`);
                  break;
                }
                throw new Error(`Query failed: ${error.message} (code: ${error.code})`);
              }
              await new Promise(r => setTimeout(r, 3000 * consecutiveErrors));
              continue;
            }

            console.log(`✅ Page ${pageNum}: ${pageData?.length || 0} rows in ${pageTime}ms`);

            consecutiveErrors = 0;
            if (!pageData || pageData.length === 0) {
              console.log("No more data - pagination complete");
              break;
            }
            
            allRecords.push(...pageData);
            cursorDate = pageData[pageData.length - 1].award_date;
            
            if (allRecords.length % 10000 === 0) {
              toast(`Loaded ${allRecords.length.toLocaleString()} records...`);
            }
            
            if (pageData.length < pageSize) {
              console.log(`Last page (${pageData.length} < ${pageSize}) - done`);
              break;
            }
            
          } catch (pageError: any) {
            consecutiveErrors++;
            console.error(`Page ${pageNum} exception:`, pageError);
            if (consecutiveErrors >= 5) {
              if (allRecords.length > 0) {
                toast.error(`Stopped at ${allRecords.length.toLocaleString()} records`);
                break;
              }
              throw pageError;
            }
            await new Promise(r => setTimeout(r, 3000 * consecutiveErrors));
          }
        }
      }
      
      console.log(`✅ FETCH COMPLETE: ${allRecords.length} total records`);
      console.groupEnd();

      const elapsed = Date.now() - startTime;
      setQueryTime(elapsed);
      setTotalCount(allRecords.length);
      setData(allRecords);

      if (allRecords.length === 0) {
        toast("No records found matching criteria");
      } else if (allRecords.length >= maxRecords) {
        toast.success(`Loaded ${allRecords.length.toLocaleString()} records in ${(elapsed/1000).toFixed(1)}s (100K limit reached)`);
      } else {
        toast.success(`Loaded all ${allRecords.length.toLocaleString()} records in ${(elapsed/1000).toFixed(1)}s`);
      }

    } catch (err: any) {
      console.error("❌ FETCH FAILED:", err);
      console.groupEnd();
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const exportToCsv = () => {
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }

    const transformedData = data.map(row => ({
      "Award ID": row.award_id || "",
      "Award Date": row.award_date || "",
      "Recipient Name": row.recipient_name || "",
      "Awarded$": row.awarded_amount || "",
      "Award Description": row.award_description || "",
      "Solicitation ID": row.solicitation_id || "",
      "Competition Type": row.competition_type || "",
      "Offers Received": row.offers_received || "",
      "Contract Pricing Type": row.contract_pricing_type || "",
      "Set Aside Type": row.set_aside_type || "",
      "Funding Office Name": row.funding_office_name || "",
      "FSC": row.fsc || "",
      "NAICS": row.naics || "",
      "Funding Agency": row.funding_agency || "",
      "PoP Start Date": row.pop_start_date || "",
      "PoP End Date": row.pop_end_date || "",
      "Last Modified Date": row.last_modified_date || "",
    }));

    const headers = DESIRED_ORDER.filter(col => transformedData.length > 0 && col in transformedData[0]);
    
    const csv = [
      headers.join(","),
      ...transformedData.map(row =>
        headers.map(h => {
          const val = row[h as keyof typeof row];
          if (val == null || val === "") return "";
          const str = String(val);
          return str.includes(",") || str.includes('"') || str.includes("\n") 
            ? `"${str.replace(/"/g, '""')}"` 
            : str;
        }).join(",")
      ),
    ].join("\n");

    const pscPart = filters.pscCodes.trim() 
      ? parsePscCodes(filters.pscCodes).slice(0, 3).join("-") + (parsePscCodes(filters.pscCodes).length > 3 ? "-etc" : "")
      : "ALL";
    
    const fyMatch = FY_PRESETS.find(p => p.start === filters.startDate && p.end === filters.endDate);
    const fyPart = fyMatch ? fyMatch.label.replace(" ", "") : `${filters.startDate}_${filters.endDate}`;
    const filename = `${pscPart}_${fyPart}.csv`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${transformedData.length} records to ${filename}`);
  };

  // Direct export all - bypasses 50K UI limit, streams directly to CSV
  const exportAllDirect = async () => {
    if (!filters.startDate || !filters.endDate) {
      toast.error("Please specify a date range");
      return;
    }

    setExporting(true);
    const startTime = Date.now();

    try {
      const pscList = parsePscCodes(filters.pscCodes);
      const hasFscFilter = pscList.length > 0;

      toast(`Exporting records to CSV...`);

      const allRecords: any[] = [];
      const pageSize = 1000;
      let consecutiveErrors = 0;

      if (hasFscFilter) {
        // FSC FILTER: Use id-based pagination (ORDER BY id only)
        let lastId = 0;
        
        while (true) {
          try {
            let query = supabase
              .from("awards")
              .select(`
                id, award_id, solicitation_id, competition_type, offers_received,
                contract_pricing_type, set_aside_type, funding_office_name,
                fsc, naics, funding_agency, award_type, pop_start_date,
                pop_end_date, last_modified_date, recipient_name,
                award_description, awarded_amount, award_date
              `)
              .gte("award_date", filters.startDate)
              .lte("award_date", filters.endDate)
              .gt("id", lastId)
              .order("id", { ascending: true })
              .limit(pageSize);

            if (pscList.length === 1) {
              query = query.like("fsc", `${pscList[0].toUpperCase()}%`);
            } else {
              const pscFilters = pscList.map(code => `fsc.like.${code.toUpperCase()}%`).join(",");
              query = query.or(pscFilters);
            }

            if (filters.minAmount) {
              query = query.gte("awarded_amount", parseFloat(filters.minAmount));
            }
            if (filters.maxAmount) {
              query = query.lte("awarded_amount", parseFloat(filters.maxAmount));
            }

            const { data: pageData, error } = await query;

            if (error) {
              consecutiveErrors++;
              if (consecutiveErrors >= 5) {
                if (allRecords.length > 0) {
                  toast.error(`Stopped at ${allRecords.length.toLocaleString()} records`);
                  break;
                }
                throw new Error(error.message);
              }
              await new Promise(r => setTimeout(r, 3000 * consecutiveErrors));
              continue;
            }

            consecutiveErrors = 0;
            if (!pageData || pageData.length === 0) break;
            
            allRecords.push(...pageData);
            lastId = pageData[pageData.length - 1].id;
            
            if (allRecords.length % 5000 === 0) {
              toast(`Fetched ${allRecords.length.toLocaleString()} records...`);
            }
            
            if (pageData.length < pageSize) break;
          } catch (err: any) {
            consecutiveErrors++;
            if (consecutiveErrors >= 5) {
              if (allRecords.length > 0) {
                toast.error(`Stopped at ${allRecords.length.toLocaleString()}`);
                break;
              }
              throw err;
            }
            await new Promise(r => setTimeout(r, 3000 * consecutiveErrors));
          }
        }
        
        // Sort by date descending
        allRecords.sort((a, b) => {
          const dateA = new Date(a.award_date || 0).getTime();
          const dateB = new Date(b.award_date || 0).getTime();
          return dateB - dateA;
        });
        
      } else {
        // NO FSC FILTER: date-based cursor pagination
        let cursorDate: string | null = null;
        
        while (true) {
          try {
            let query = supabase
              .from("awards")
              .select(`
                award_id, solicitation_id, competition_type, offers_received,
                contract_pricing_type, set_aside_type, funding_office_name,
                fsc, naics, funding_agency, award_type, pop_start_date,
                pop_end_date, last_modified_date, recipient_name,
                award_description, awarded_amount, award_date
              `)
              .gte("award_date", filters.startDate)
              .lte("award_date", filters.endDate)
              .order("award_date", { ascending: false })
              .order("award_id", { ascending: false })
              .limit(pageSize);

            if (filters.minAmount) {
              query = query.gte("awarded_amount", parseFloat(filters.minAmount));
            }
            if (filters.maxAmount) {
              query = query.lte("awarded_amount", parseFloat(filters.maxAmount));
            }

            if (cursorDate) {
              query = query.lt("award_date", cursorDate);
            }

            const { data: pageData, error } = await query;

            if (error) {
              consecutiveErrors++;
              if (consecutiveErrors >= 5) {
                if (allRecords.length > 0) {
                  toast.error(`Stopped at ${allRecords.length.toLocaleString()} records`);
                  break;
                }
                throw new Error(error.message);
              }
              await new Promise(r => setTimeout(r, 3000 * consecutiveErrors));
              continue;
            }

            consecutiveErrors = 0;
            if (!pageData || pageData.length === 0) break;
            
            allRecords.push(...pageData);
            cursorDate = pageData[pageData.length - 1].award_date;
            
            if (allRecords.length % 10000 === 0) {
              toast(`Fetched ${allRecords.length.toLocaleString()} records...`);
            }
            
            if (pageData.length < pageSize) break;
          } catch (err: any) {
            consecutiveErrors++;
            if (consecutiveErrors >= 5) {
              if (allRecords.length > 0) {
                toast.error(`Stopped at ${allRecords.length.toLocaleString()}`);
                break;
              }
              throw err;
            }
            await new Promise(r => setTimeout(r, 3000 * consecutiveErrors));
          }
        }
      }

      if (allRecords.length === 0) {
        toast("No records found");
        setExporting(false);
        return;
      }

      // Build CSV
      const headers = DESIRED_ORDER;
      const csvRows = [headers.join(",")];
      
      for (const row of allRecords) {
        const transformed: Record<string, string> = {
          "Award ID": row.award_id || "",
          "Award Date": row.award_date || "",
          "Recipient Name": row.recipient_name || "",
          "Awarded$": row.awarded_amount || "",
          "Award Description": row.award_description || "",
          "Solicitation ID": row.solicitation_id || "",
          "Competition Type": row.competition_type || "",
          "Offers Received": row.offers_received || "",
          "Contract Pricing Type": row.contract_pricing_type || "",
          "Set Aside Type": row.set_aside_type || "",
          "Funding Office Name": row.funding_office_name || "",
          "FSC": row.fsc || "",
          "NAICS": row.naics || "",
          "Funding Agency": row.funding_agency || "",
          "PoP Start Date": row.pop_start_date || "",
          "PoP End Date": row.pop_end_date || "",
        };
        
        csvRows.push(
          headers.map(h => {
            const val = transformed[h] || "";
            return val.includes(",") || val.includes('"') || val.includes("\n") 
              ? `"${val.replace(/"/g, '""')}"` 
              : val;
          }).join(",")
        );
      }

      const pscPart = filters.pscCodes.trim() 
        ? parsePscCodes(filters.pscCodes).slice(0, 3).join("-")
        : "ALL";
      const fyMatch = FY_PRESETS.find(p => p.start === filters.startDate && p.end === filters.endDate);
      const fyPart = fyMatch ? fyMatch.label.replace(" ", "") : `${filters.startDate}_${filters.endDate}`;
      const filename = `${pscPart}_${fyPart}_FULL.csv`;

      const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      const elapsed = (Date.now() - startTime) / 1000;
      toast.success(`Exported all ${allRecords.length.toLocaleString()} records in ${elapsed.toFixed(1)}s`);

    } catch (err: any) {
      toast.error(`Export failed: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Query Parameters Column */}
          <div className="lg:col-span-4 space-y-6">
            <CorporateCard className="p-6 border-t-4 border-t-blue-600 bg-white">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">PSC / FSC Codes</label>
                  <CorporateInput 
                    placeholder="e.g., 1510, 5340, J015"
                    value={filters.pscCodes}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters(f => ({ ...f, pscCodes: e.target.value }))}
                  />
                  <p className="text-[9px] text-slate-400 mt-1">Comma or space separated. Leave empty for all codes.</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Fiscal Year</label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {FY_PRESETS.map(fy => (
                      <button
                        key={fy.label}
                        onClick={() => applyFyPreset(fy.start, fy.end)}
                        className={`py-1.5 px-3 text-[10px] font-bold border rounded-sm transition-all ${
                          filters.startDate === fy.start && filters.endDate === fy.end 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {fy.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="date" 
                      className="flex-1 bg-slate-50 border border-slate-200 p-2 text-xs font-mono rounded-sm" 
                      value={filters.startDate} 
                      onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} 
                    />
                    <input 
                      type="date" 
                      className="flex-1 bg-slate-50 border border-slate-200 p-2 text-xs font-mono rounded-sm" 
                      value={filters.endDate} 
                      onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Amount Range</label>
                  <div className="flex gap-2">
                    <CorporateInput 
                      placeholder="Min $" 
                      type="number" 
                      value={filters.minAmount} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters(f => ({ ...f, minAmount: e.target.value }))} 
                    />
                    <CorporateInput 
                      placeholder="Max $" 
                      type="number" 
                      value={filters.maxAmount} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters(f => ({ ...f, maxAmount: e.target.value }))} 
                    />
                  </div>
                </div>

                <div className="pt-6 border-t flex gap-3">
                  <CorporateButton variant="primary" className="w-full" onClick={fetchData} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                    {loading ? "Querying..." : "Search"}
                  </CorporateButton>
                  <button 
                    onClick={resetFilters} 
                    className="p-2 border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-600 rounded-sm transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CorporateCard>

            {/* Query Stats */}
            {queryTime !== null && (
              <CorporateCard className="p-5 bg-slate-900 text-white font-mono border-none shadow-xl">
                <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-3">
                  <Database className="h-4 w-4 text-emerald-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Query Complete</span>
                </div>
                <div className="space-y-2 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">SOURCE:</span>
                    <span className="text-blue-400">USA Spending</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">TIME:</span>
                    <span className="text-emerald-400">{(queryTime/1000).toFixed(2)}s</span>
                  </div>
                  {data.length < (totalCount || 0) && (
                    <div className="pt-2 mt-2 border-t border-white/10 text-amber-400 text-[9px]">
                      ⚠ 50K preview limit. Use "Export All" button for complete dataset.
                    </div>
                  )}
                </div>
              </CorporateCard>
            )}
          </div>

          {/* Results Column */}
          <div className="lg:col-span-8 flex flex-col" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
            {data.length > 0 ? (
              <CorporateCard className="flex-1 flex flex-col overflow-hidden border-t-4 border-t-slate-800">
                <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest flex items-center gap-2">
                      <Database className="h-3 w-3 text-blue-600" /> Query Results
                    </h3>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                      SOURCE: USA Spending • {data.length.toLocaleString()} RECORDS
                      {totalCount && totalCount > data.length && (
                        <span className="text-amber-500 ml-2">({totalCount.toLocaleString()} total)</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <CorporateButton variant="outline" size="sm" onClick={exportToCsv} disabled={data.length === 0}>
                      <Download className="h-4 w-4 mr-2" /> Download CSV
                    </CorporateButton>
                    {totalCount && totalCount > data.length && (
                      <CorporateButton 
                        variant="primary" 
                        size="sm" 
                        onClick={exportAllDirect} 
                        disabled={exporting}
                      >
                        <Download className="h-4 w-4 mr-2" /> 
                        {exporting ? "Exporting..." : `Export All ${totalCount.toLocaleString()}`}
                      </CorporateButton>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <ResultsTable data={data} />
                </div>
              </CorporateCard>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 bg-white/50 rounded-sm">
                <div className="p-6 rounded-full bg-slate-100 mb-4">
                  <FileJson className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-slate-400 font-bold uppercase tracking-widest text-sm">No Active Dataset</h3>
                <p className="text-slate-400 text-xs mt-2">Configure parameters and execute query to begin.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-white/10 px-6 py-2 flex justify-between items-center z-50">
        <div className="flex gap-6 items-center">
          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <span className={`w-2 h-2 rounded-full ${loading || exporting ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            {loading ? 'Querying' : exporting ? 'Exporting' : 'Ready'}
          </div>
        </div>
      </div>
    </div>
  );
}