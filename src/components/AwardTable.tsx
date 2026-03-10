import { useState, useMemo } from "react";
import { ArrowUpDown, Search, Filter, X, Check } from "lucide-react";

// ============================================
// Constants
// ============================================
const statusColors: Record<string, string> = {
  "1-14": "#ef4444", // Red
  "15-29": "#d4592b", // Orange-Red
  "30-44": "#eab308", // Yellow
  "45-60": "#00b9ff", // Blue
  ">60": "#50af70", // Green
  Ended: "#5b5b5bff", // Dark Grey
  Unknown: "#6b7280", // Grey
};

// ============================================
// Helpers
// ============================================
function computePoP(start: string, end: string) {
  if (!start || !end) return { duration: "—", daysLeft: null, status: "Unknown" };
  const s = new Date(start);
  const e = new Date(end);
  const today = new Date();

  const duration = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  const daysLeft = Math.round((e.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  let status = "Unknown";
  if (daysLeft < 0) status = "Ended";
  else if (daysLeft <= 14) status = "1-14";
  else if (daysLeft <= 29) status = "15-29";
  else if (daysLeft <= 44) status = "30-44";
  else if (daysLeft <= 60) status = "45-60";
  else status = ">60";

  return { duration, daysLeft, status };
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

// Handles both display keys ("Award ID") and db keys ("award_id")
const getValue = (row: any, displayKey: string, dbKey: string) => {
  return row[displayKey] ?? row[dbKey] ?? null;
};

// ============================================
// Types
// ============================================
interface AwardTableProps {
  awards: any[];
  onRowDoubleClick?: (award: any) => void;
}

// ============================================
// Component
// ============================================
export const AwardTable = ({ awards, onRowDoubleClick }: AwardTableProps) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedSetAside, setSelectedSetAside] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  // Normalize data to handle both formats
  const normalizedAwards = useMemo(() => {
    return awards.map((row) => {
      const popStart = getValue(row, "PoP Start Date", "pop_start_date");
      const popEnd = getValue(row, "PoP End Date", "pop_end_date");
      const { duration, daysLeft, status } = computePoP(popStart, popEnd);

      return {
        _original: row,
        awardId: getValue(row, "Award ID", "award_id"),
        solicitationId: getValue(row, "Solicitation ID", "solicitation_id"),
        awardDate: getValue(row, "Award Date", "award_date"),
        description: getValue(row, "Award Description", "award_description"),
        recipient: getValue(row, "Recipient Name", "recipient_name"),
        setAside: getValue(row, "Set Aside Type", "set_aside_type"),
        fsc: getValue(row, "FSC", "fsc"),
        amount: Number(getValue(row, "Awarded$", "awarded_amount")) || 0,
        offers: getValue(row, "Offers Received", "offers_received"),
        preparedUser: getValue(row, "Prepared_User", "prepared_user"),
        approvedBy: getValue(row, "Approved_By", "approved_by"),
        lastModifiedBy: getValue(row, "Last_Modified_By", "last_modified_by"),
        popDuration: duration,
        daysLeft,
        status,
      };
    });
  }, [awards]);

  // Unique Set Aside values for filter dropdown
  const setAsideOptions = useMemo(() => {
    const vals = new Set<string>();
    normalizedAwards.forEach((a) => {
      if (a.setAside) vals.add(a.setAside);
    });
    return Array.from(vals).sort();
  }, [normalizedAwards]);

  // Filter + Sort
  const filteredData = useMemo(() => {
    let data = normalizedAwards;

    if (selectedSetAside) {
      data = data.filter((a) => a.setAside === selectedSetAside);
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(
        (r) =>
          (r.awardId || "").toLowerCase().includes(lower) ||
          (r.solicitationId || "").toLowerCase().includes(lower) ||
          (r.description || "").toLowerCase().includes(lower) ||
          (r.recipient || "").toLowerCase().includes(lower),
      );
    }

    if (sortConfig) {
      data = [...data].sort((a, b) => {
        // @ts-ignore
        const aVal = a[sortConfig.key];
        // @ts-ignore
        const bVal = b[sortConfig.key];

        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortConfig.direction === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        // @ts-ignore
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      });
    }

    return data;
  }, [normalizedAwards, selectedSetAside, searchTerm, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // Header cell component
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
      <div
        className={`flex items-center gap-1 ${align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start"}`}
      >
        {label}
        {sortKey && <ArrowUpDown className="h-3 w-3 opacity-30" />}
      </div>
    </th>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm rounded-lg overflow-hidden">
      {/* TOOLBAR */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/30 flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-1 min-w-[300px]">
          {/* Search Input */}
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter Award ID, Solicitation, Recipient..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Set Aside Filter Dropdown */}
          <div className="relative">
            <button
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-sm transition-colors whitespace-nowrap ${
                selectedSetAside
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-blue-500"
              }`}
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Filter className="h-3 w-3" />
              {selectedSetAside || "Set Aside Type"}
              {selectedSetAside && (
                <X
                  className="h-3 w-3 ml-1 hover:text-red-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSetAside(null);
                  }}
                />
              )}
            </button>

            {filterOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-lg z-50 max-h-60 overflow-y-auto py-1 rounded-sm">
                <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 mb-1">
                  Filter by Set Aside
                </div>
                {setAsideOptions.map((opt) => (
                  <div
                    key={opt}
                    className="px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex items-center justify-between"
                    onClick={() => {
                      setSelectedSetAside(opt);
                      setFilterOpen(false);
                    }}
                  >
                    <span className="truncate">{opt || "(None)"}</span>
                    {selectedSetAside === opt && <Check className="h-3 w-3 text-blue-600" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Status Legend */}
        <div className="flex items-center gap-4 text-[10px] font-medium text-slate-400">
          {Object.entries(statusColors).map(([label, color]) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="flex-1 min-h-0 overflow-x-auto">
        <div className="h-full overflow-y-auto min-w-fit">
          <table className="min-w-[1400px] border-collapse">
            <thead className="sticky top-0 z-10 bg-white dark:bg-slate-900 shadow-sm">
              <tr>
                <th className="w-1 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky left-0 z-20"></th>
                <HeaderCell label="Award ID" sortKey="awardId" width="w-32" />
                <HeaderCell label="Solicitation ID" sortKey="solicitationId" width="w-32" />
                <HeaderCell label="Date" sortKey="awardDate" width="w-24" />
                <HeaderCell label="Recipient" sortKey="recipient" width="w-48" />
                <HeaderCell label="Description" sortKey="description" width="w-64" />
                <HeaderCell label="FSC" sortKey="fsc" width="w-16" />
                <HeaderCell label="Set Aside" sortKey="setAside" width="w-40" />
                <HeaderCell label="Amount" sortKey="amount" width="w-32" align="right" />
                <HeaderCell label="PoP Duration" sortKey="popDuration" width="w-24" align="center" />
                <HeaderCell label="Days Left" sortKey="daysLeft" width="w-24" align="center" />
                <HeaderCell label="Status" sortKey="status" width="w-24" align="center" />
                <HeaderCell label="Offers" sortKey="offers" width="w-16" align="center" />
                <HeaderCell label="Prepared By" sortKey="preparedUser" width="w-32" />
                <HeaderCell label="Approved By" sortKey="approvedBy" width="w-32" />
                <HeaderCell label="Modified By" sortKey="lastModifiedBy" width="w-32" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredData.map((row, idx) => {
                const statusColor = statusColors[row.status] || statusColors["Unknown"];
                return (
                  <tr
                    key={idx}
                    className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-xs cursor-pointer"
                    onDoubleClick={() => onRowDoubleClick?.(row._original)}
                  >
                    {/* Status Indicator Strip (Sticky) */}
                    <td className="w-1 p-0 relative sticky left-0 z-10 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50">
                      <div className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: statusColor }}></div>
                    </td>

                    <td className="px-4 py-3 font-mono text-slate-900 dark:text-slate-100 font-medium whitespace-nowrap">
                      {row.awardId}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {row.solicitationId || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {row.awardDate ? new Date(row.awardDate).toLocaleDateString() : "—"}
                    </td>
                    <td
                      className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[12rem]"
                      title={row.recipient}
                    >
                      {row.recipient}
                    </td>
                    <td
                      className="px-4 py-3 text-slate-600 dark:text-slate-400 truncate max-w-[16rem]"
                      title={row.description}
                    >
                      {row.description}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono">{row.fsc}</td>
                    <td
                      className="px-4 py-3 text-slate-500 dark:text-slate-400 truncate max-w-[10rem]"
                      title={row.setAside}
                    >
                      {row.setAside || "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                      {formatCurrency(row.amount)}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-500 dark:text-slate-400">
                      {typeof row.popDuration === "number" ? `${row.popDuration} days` : row.popDuration}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`font-mono font-bold ${row.daysLeft !== null && row.daysLeft < 30 ? "text-red-600" : "text-slate-600 dark:text-slate-300"}`}
                      >
                        {row.daysLeft !== null ? row.daysLeft : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white whitespace-nowrap"
                        style={{ backgroundColor: statusColor }}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-500 dark:text-slate-400">{row.offers || "—"}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {row.preparedUser || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {row.approvedBy || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {row.lastModifiedBy || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <div className="p-12 text-center text-slate-400 text-sm">No records found matching your criteria.</div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-2 text-[10px] font-medium text-slate-500 dark:text-slate-400 flex justify-between items-center">
        <span>Records: {filteredData.length}</span>
        <span className="font-mono">TOTAL: {formatCurrency(filteredData.reduce((sum, r) => sum + r.amount, 0))}</span>
      </div>
    </div>
  );
};

export default AwardTable;
