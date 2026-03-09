import React, { useState, useMemo } from "react";
import { ArrowUpDown, Search, Filter, X, Check } from "lucide-react";

// ============================================
// Constants
// ============================================

// Color-code by days until response deadline
const deadlineColors: Record<string, string> = {
  "Overdue":  "#5b5b5bff", // Grey — past deadline
  "1-7":      "#ef4444",   // Red — urgent
  "8-14":     "#d4592b",   // Orange-red
  "15-30":    "#eab308",   // Yellow
  "31-60":    "#00b9ff",   // Blue
  ">60":      "#50af70",   // Green
  "No Date":  "#6b7280",   // Grey — no deadline
};

const opportunityTypeColors: Record<string, string> = {
  "Solicitation":                    "#3b82f6",
  "Combined Synopsis/Solicitation":  "#8b5cf6",
  "Sources Sought":                  "#f59e0b",
  "Presolicitation":                 "#06b6d4",
  "Special Notice":                  "#6b7280",
};

// ============================================
// Helpers
// ============================================
function computeDeadlineStatus(responseDateStr: string | null): {
  daysLeft: number | null;
  status: string;
} {
  if (!responseDateStr) return { daysLeft: null, status: "No Date" };

  // Response date format from pipeline: "Mar 19, 2026 03:00 PM UTC"
  const parsed = new Date(responseDateStr);
  if (isNaN(parsed.getTime())) return { daysLeft: null, status: "No Date" };

  const daysLeft = Math.round((parsed.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  let status = "No Date";
  if (daysLeft < 0)   status = "Overdue";
  else if (daysLeft <= 7)  status = "1-7";
  else if (daysLeft <= 14) status = "8-14";
  else if (daysLeft <= 30) status = "15-30";
  else if (daysLeft <= 60) status = "31-60";
  else status = ">60";

  return { daysLeft, status };
}

function formatPublishedDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  // Published date format: MM/DD/YYYY
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ============================================
// Types
// ============================================
export interface SamNoticeRow {
  notice_id: string;
  opportunity_title: string | null;
  opportunity_type: string | null;
  contracting_office: string | null;
  sub_tier_name: string | null;
  aac_code: string | null;
  psc: string | null;
  naics: string | null;
  set_aside: string | null;
  response_date: string | null;
  published_date: string | null;
  poc_name: string | null;
  poc_email: string | null;
}

interface SamNoticeTableProps {
  notices: SamNoticeRow[];
}

// ============================================
// Component
// ============================================
export const SamNoticeTable = ({ notices }: SamNoticeTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(
    { key: "publishedDate", direction: "desc" }
  );

  const normalized = useMemo(() => {
    return notices.map((row) => {
      const { daysLeft, status } = computeDeadlineStatus(row.response_date);
      return {
        _original: row,
        noticeId:         row.notice_id,
        title:            row.opportunity_title || "—",
        type:             row.opportunity_type || "—",
        office:           row.contracting_office || "—",
        subTier:          row.sub_tier_name || "—",
        psc:              row.psc || "—",
        naics:            row.naics || "—",
        setAside:         row.set_aside && row.set_aside !== "No Set aside used" ? row.set_aside : "—",
        responseDate:     row.response_date,
        publishedDate:    row.published_date,
        pocName:          row.poc_name || "—",
        pocEmail:         row.poc_email || "—",
        daysLeft,
        deadlineStatus:   status,
      };
    });
  }, [notices]);

  const typeOptions = useMemo(() => {
    const vals = new Set<string>();
    normalized.forEach(r => { if (r.type !== "—") vals.add(r.type); });
    return Array.from(vals).sort();
  }, [normalized]);

  const filteredData = useMemo(() => {
    let data = normalized;

    if (selectedType) {
      data = data.filter(r => r.type === selectedType);
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(r =>
        r.noticeId.toLowerCase().includes(lower) ||
        r.title.toLowerCase().includes(lower) ||
        r.office.toLowerCase().includes(lower) ||
        r.psc.toLowerCase().includes(lower) ||
        r.pocEmail.toLowerCase().includes(lower)
      );
    }

    if (sortConfig) {
      data = [...data].sort((a, b) => {
        // @ts-ignore
        const aVal = a[sortConfig.key];
        // @ts-ignore
        const bVal = b[sortConfig.key];

        // Null/dash always last
        if (!aVal || aVal === "—") return 1;
        if (!bVal || bVal === "—") return -1;

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
        }
        return sortConfig.direction === "asc"
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }

    return data;
  }, [normalized, selectedType, searchTerm, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(prev =>
      prev?.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  const HeaderCell = ({
    label,
    sortKey,
    width,
    align = "left",
  }: {
    label: string;
    sortKey?: string;
    width?: string;
    align?: "left" | "right" | "center";
  }) => (
    <th
      className={`px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none border-b border-slate-200 bg-slate-50/50 whitespace-nowrap ${sortKey ? "cursor-pointer hover:bg-slate-100 hover:text-blue-600" : ""} ${width || ""} text-${align}`}
      onClick={() => sortKey && handleSort(sortKey)}
    >
      <div className={`flex items-center gap-1 ${align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start"}`}>
        {label}
        {sortKey && <ArrowUpDown className="h-3 w-3 opacity-30" />}
      </div>
    </th>
  );

  return (
    <div className="flex flex-col border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden bg-white dark:bg-slate-900 text-sm">

      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter Notice ID, Title, Office, PSC..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Opportunity Type Filter */}
          <div className="relative">
            <button
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-sm transition-colors whitespace-nowrap ${
                selectedType
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-blue-500"
              }`}
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Filter className="h-3 w-3" />
              {selectedType || "Opportunity Type"}
              {selectedType && (
                <X
                  className="h-3 w-3 ml-1 hover:text-red-200"
                  onClick={(e) => { e.stopPropagation(); setSelectedType(null); }}
                />
              )}
            </button>
            {filterOpen && (
              <div className="absolute top-full left-0 mt-1 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-lg z-50 max-h-60 overflow-y-auto py-1 rounded-sm">
                <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 mb-1">
                  Filter by Type
                </div>
                {typeOptions.map(opt => (
                  <div
                    key={opt}
                    className="px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex items-center justify-between"
                    onClick={() => { setSelectedType(opt); setFilterOpen(false); }}
                  >
                    <span className="truncate">{opt}</span>
                    {selectedType === opt && <Check className="h-3 w-3 text-blue-600" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Deadline Legend */}
        <div className="flex items-center gap-4 text-[10px] font-medium text-slate-400">
          {Object.entries(deadlineColors).map(([label, color]) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-white dark:bg-slate-900 shadow-sm">
            <tr>
              <th className="w-1 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky left-0 z-20" />
              <HeaderCell label="Notice ID"    sortKey="noticeId"       width="w-36" />
              <HeaderCell label="Published"    sortKey="publishedDate"  width="w-24" />
              <HeaderCell label="Title"        sortKey="title"          width="w-72" />
              <HeaderCell label="Office"       sortKey="office"         width="w-48" />
              <HeaderCell label="PSC"          sortKey="psc"            width="w-48" />
              <HeaderCell label="Set Aside"    sortKey="setAside"       width="w-40" />
              <HeaderCell label="Response Due" sortKey="daysLeft"       width="w-36" align="center" />
              <HeaderCell label="Days Left"    sortKey="daysLeft"       width="w-24" align="center" />
              <HeaderCell label="POC"          sortKey="pocName"        width="w-36" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredData.map((row, idx) => {
              const deadlineColor = deadlineColors[row.deadlineStatus] || deadlineColors["No Date"];
              const typeColor = opportunityTypeColors[row.type] || "#6b7280";
              return (
                <tr
                  key={idx}
                  className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-xs cursor-default"
                >
                  {/* Deadline color strip */}
                  <td className="w-1 p-0 relative sticky left-0 z-10 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50">
                    <div className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: deadlineColor }} />
                  </td>

                  <td className="px-4 py-3 font-mono text-slate-900 dark:text-slate-100 font-medium whitespace-nowrap">
                    {row.noticeId}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {formatPublishedDate(row.publishedDate)}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200 truncate max-w-[18rem]" title={row.title}>
                    {row.title}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 truncate max-w-[12rem]" title={row.office}>
                    {row.office}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 truncate max-w-[12rem]" title={row.psc}>
                    {row.psc}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 truncate max-w-[10rem]" title={row.setAside}>
                    {row.setAside}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {row.responseDate
                      ? new Date(row.responseDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-mono font-bold ${row.daysLeft !== null && row.daysLeft <= 7 ? "text-red-600" : "text-slate-600 dark:text-slate-300"}`}>
                      {row.daysLeft !== null ? row.daysLeft : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {row.pocName}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredData.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-sm">
            No notices found matching your criteria.
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-2 text-[10px] font-medium text-slate-500 dark:text-slate-400 flex justify-between items-center">
        <span>Records: {filteredData.length}</span>
        <span className="text-[10px] text-slate-400 italic">
          Sourced from SAM.gov — opportunities only, not confirmed awards
        </span>
      </div>
    </div>
  );
};

export default SamNoticeTable;