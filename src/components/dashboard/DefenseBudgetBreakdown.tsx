import { useState, useMemo, useEffect } from "react";
import { Search, ChevronDown, ChevronRight, Filter, Download, Plane, Ship, Shield, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import loadCsv from "@/lib/loadCsv";


interface BudgetItem {
  id: string;
  name: string;
  category: string;
  agency: string;
  programElement?: string;
  fy24Actuals: number;
  fy25Enacted: number;
  fy25Total: number;
  fy25Supplemental?: number;
  fy26Request: number;
  fy26Reconciliation: number;
  fy26Total: number;
  children?: BudgetItem[];
  level: number;
}


const agencies = ["All", "Army", "Navy", "Air Force", "Space Force", "OSD", "Marines"];
function parseAmt(val: any) {
  const num = parseFloat((val || "0").toString().replace(/,/g, ""));
  return isNaN(num) ? 0 : num * 1000; // values in thousands
}

function buildProcurementHierarchy(rows: any[]): BudgetItem[] {
  const root: BudgetItem = {
    id: "procurement",
    name: "PROCUREMENT",
    category: "PROCUREMENT",
    agency: "All",
    fy24Actuals: 0,
    fy25Enacted: 0,
    fy25Total: 0,
    fy25Supplemental: 0,
    fy26Request: 0,
    fy26Reconciliation: 0,
    fy26Total: 0,
    level: 0,
    children: []
  };

  rows.forEach(r => {
    const agency = (r["Account Title"] || "").split(", ").pop() || "Unknown";
    const accountTitle = r["Account Title"];
    const account = r["Account"];
    const baTitle = r["Budget Activity Title"];
    const ba = r["Budget Activity"];
    const bliTitle = r["Budget Line Item (BLI) Title"];
    const bli = r["Budget Line Item"];

    const fy25Enacted = parseAmt(r["FY 2025 Enacted Amount"]);
    const fy25Supp = parseAmt(r["FY 2025 Supplemental Amount"]);

    const amounts = {
      fy24: parseAmt(r["FY 2024 Actuals Amount"]),
      fy25Enacted,
      fy25Supp,
      fy25Total: fy25Enacted + fy25Supp,   // <-- FIX: combine enacted + supplemental
      fy26Req: parseAmt(r["FY 2026 Disc Request Amount"]),
      fy26Rec: parseAmt(r["FY 2026 Reconciliation Request Amount"]),
      fy26Tot: parseAmt(r["FY 2026 Total Amount"]),
    };

    addToHierarchy(root, accountTitle, account, baTitle, ba, bliTitle, bli, agency, amounts);
  });

  return [root];
}


function buildRDTEHierarchy(rows: any[]): BudgetItem[] {
  const root: BudgetItem = {
    id: "rdte",
    name: "RDT&E",
    category: "RDTE",
    agency: "All",
    fy24Actuals: 0,
    fy25Enacted: 0,
    fy25Total: 0,
    fy25Supplemental: 0,
    fy26Request: 0,
    fy26Reconciliation: 0,
    fy26Total: 0,
    level: 0,
    children: []
  };

  rows.forEach(r => {
    const agency = (r["Account Title"] || "").split(", ").pop() || "Unknown";
    const accountTitle = r["Account Title"];
    const account = r["Account"];
    const baTitle = r["Budget Activity Title"];
    const ba = r["Budget Activity"];
    const bliTitle = r["Program Element/Budget Line Item (BLI) Title"];
    const bli = r["PE/BLI"];

    const amounts = {
      fy24: parseAmt(r["FY 2024 Actuals"]),
      fy25Enacted: parseAmt(r["FY 2025 Enacted"]),
      fy25Total: parseAmt(r["FY 2025 Total"]),
      fy25Supp: parseAmt(r["FY 2025 Supplemental"]),
      fy26Req: parseAmt(r["FY 2026 Disc Request"]),
      fy26Rec: parseAmt(r["FY 2026 Reconciliation Request"]),
      fy26Tot: parseAmt(r["FY 2026 Total"]),
    };

    addToHierarchy(root, accountTitle, account, baTitle, ba, bliTitle, bli, agency, amounts);
  });

  return [root];
}
function buildOMHierarchy(rows: any[]): BudgetItem[] {
  const root: BudgetItem = {
    id: "om",
    name: "O&M",
    category: "O&M",
    agency: "All",
    fy24Actuals: 0,
    fy25Enacted: 0,
    fy25Total: 0,
    fy25Supplemental: 0,
    fy26Request: 0,
    fy26Reconciliation: 0,
    fy26Total: 0,
    level: 0,
    children: []
  };

  rows.forEach(r => {
    const agency = (r["Account Title"] || "").split(", ").pop() || "Unknown";
    const accountTitle = r["Account Title"];
    const account = r["Account"];
    const baTitle = r["Budget Activity Title"];
    const ba = r["Budget Activity"];
    const bliTitle = r["SAG/Budget Line Item (BLI) Title"];
    const bli = r["SAG/BLI"];

    const amounts = {
      fy24: parseAmt(r["FY 2024 Actuals"]),
      fy25Enacted: parseAmt(r["FY 2025 Enacted"]),
      fy25Total: parseAmt(r["FY 2025 Total"]),
      fy25Supp: parseAmt(r["FY 2025 Supplemental"]),
      fy26Req: parseAmt(r["FY 2026 Disc Request"]),
      fy26Rec: parseAmt(r["FY 2026 Reconciliation Request"]),
      fy26Tot: parseAmt(r["FY 2026 Total"]),
    };

    addToHierarchy(root, accountTitle, account, baTitle, ba, bliTitle, bli, agency, amounts);
  });

  return [root];
}

// Shared roll-up logic
function addToHierarchy(root: BudgetItem, accountTitle: string, account: string, baTitle: string, ba: string, bliTitle: string, bli: string, agency: string, amounts: any) {
  let acctNode = root.children!.find(c => c.name === accountTitle);
  if (!acctNode) {
    acctNode = { id: account, name: accountTitle, category: root.category, agency, programElement: account,
      fy24Actuals: 0, fy25Enacted: 0, fy25Total: 0, fy25Supplemental: 0,
      fy26Request: 0, fy26Reconciliation: 0, fy26Total: 0, level: 1, children: [] };
    root.children!.push(acctNode);
  }

  let baNode = acctNode.children!.find(c => c.name === baTitle);
  if (!baNode) {
    baNode = { id: `${account}-${ba}`, name: baTitle, category: root.category, agency, programElement: `#${ba}`,
      fy24Actuals: 0, fy25Enacted: 0, fy25Total: 0, fy25Supplemental: 0,
      fy26Request: 0, fy26Reconciliation: 0, fy26Total: 0, level: 2, children: [] };
    acctNode.children!.push(baNode);
  }

  let bliNode = baNode.children!.find(c => c.name === bliTitle);
  if (!bliNode) {
    bliNode = { id: bli, name: bliTitle, category: root.category, agency, programElement: bli,
      fy24Actuals: 0, fy25Enacted: 0, fy25Total: 0, fy25Supplemental: 0,
      fy26Request: 0, fy26Reconciliation: 0, fy26Total: 0, level: 3, children: [] };
    baNode.children!.push(bliNode);
  }

  [bliNode, baNode, acctNode, root].forEach(node => {
    node.fy24Actuals += amounts.fy24;
    node.fy25Enacted += amounts.fy25Enacted;
    node.fy25Total += amounts.fy25Total;
    node.fy25Supplemental = (node.fy25Supplemental || 0) + amounts.fy25Supp;
    node.fy26Request += amounts.fy26Req;
    node.fy26Reconciliation += amounts.fy26Rec;
    node.fy26Total += amounts.fy26Tot;
  });
}



const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'PROCUREMENT': 'bg-success/40',
    'RDTE': 'bg-primary/40',
    'O&M': 'bg-warning/40',
    'MILPER': 'bg-purple-500/40',
    'MILCON': 'bg-purple-500/40',
    'OTHER': 'bg-muted'
  };
  return colors[category] || 'bg-muted';
};


const getAgencyIcon = (agency: string) => {
  switch (agency) {
    // --- Core branches ---
    case 'Air Force':
      return <img src="/Air_Force.png" alt="Air Force" className="h-4 w-4 object-contain" />;
    case 'Army':
      return <img src="/Army.png" alt="Army" className="h-4 w-4 object-contain" />;
    case 'Navy':
      return <img src="/Navy.png" alt="Navy" className="h-4 w-4 object-contain" />;
    case 'Marine Corps':
      return <img src="/Marine Corps.png" alt="Marine Corps" className="h-4 w-4 object-contain" />;
    case 'Space Force':
      return <img src="/Space Force.png" alt="Space Force" className="h-4 w-4 object-contain" />;

    // --- Guard / Reserve ---
    case 'Army Reserve':
      return <img src="/Army_Reserve.png" alt="Army Reserve" className="h-4 w-4 object-contain" />;
    case 'Army National Guard':
      return <img src="/Army National Guard.png" alt="Army National Guard" className="h-4 w-4 object-contain" />;
    case 'Navy Reserve':
      return <img src="/Navy Reserve.png" alt="Navy Reserve" className="h-4 w-4 object-contain" />;
    case 'Marine Corps Reserve':
      return <img src="/Marine Corps Reserve.png" alt="Marine Corps Reserve" className="h-4 w-4 object-contain" />;
    case 'Air Force Reserve':
      return <img src="/Air Force Reserve.png" alt="Air Force Reserve" className="h-4 w-4 object-contain" />;
    case 'Air National Guard':
      return <img src="/Air National Guard.png" alt="Air National Guard" className="h-4 w-4 object-contain" />;
    case 'OSD':
      return <img src="/Office_of_the_Secretary_of_Defense.png" alt="OSD" className="h-4 w-4 object-contain" />;
    case 'United States Court of Appeals for the Armed Forces':
      return <img src="/Court_of_Appeals.png" alt="United States Court of Appeals for the Armed Forces" className="h-4 w-4 object-contain" />;
    case 'Defense Health Program':
      return <img src="/Military_Health_System.png" alt="Defense Health Program" className="h-4 w-4 object-contain" />;

    default:
      return null;
  }
};



const DefenseBudgetBreakdown = () => {
  const [csvRows, setCsvRows] = useState<any[]>([]);  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgency, setSelectedAgency] = useState("All Agencies");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [compareFrom, setCompareFrom] = useState("FY24 Actuals");
  const [compareTo, setCompareTo] = useState("FY26 Request");
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set([
    "fy24Actuals", "fy25Enacted", "fy25Total", "fy25Supplemental", "fy26Request", "fy26Reconciliation", "fy26Total"
  ]));
  const [compareMode, setCompareMode] = useState(false);
  

  useEffect(() => {
    async function fetchData() {
        const p1Rows = await loadCsv("/p1_display.csv");
        const r1Rows = await loadCsv("/r1_display.csv");
        const o1Rows = await loadCsv("/o1_display.csv");

        const procurementData = buildProcurementHierarchy(p1Rows);
        const rdteData = buildRDTEHierarchy(r1Rows);
        const omData = buildOMHierarchy(o1Rows);

        setCsvRows([...procurementData, ...rdteData, ...omData]);
    }
    fetchData();
    }, []);


  const budgetData = useMemo(() => csvRows, [csvRows]);


  const fiscalYearOptions = [
    "FY24 Actuals",
    "FY25 Enacted", 
    "FY25 Total",
    "FY25 Supplemental",
    "FY26 Request",
    "FY26 Reconciliation",
    "FY26 Total"
  ];

  const getVisibleColumnsArray = () => {
    const columns = [
      { key: "fy24Actuals", label: "FY24 Actuals", value: (item: BudgetItem) => item.fy24Actuals },
      { key: "fy25Enacted", label: "FY25 Enacted", value: (item: BudgetItem) => item.fy25Enacted },
      { key: "fy25Total", label: "FY25 Total", value: (item: BudgetItem) => item.fy25Total },
      { key: "fy25Supplemental", label: "FY25 Supplemental", value: (item: BudgetItem) => item.fy25Supplemental },
      { key: "fy26Request", label: "FY26 Request", value: (item: BudgetItem) => item.fy26Request },
      { key: "fy26Reconciliation", label: "FY26 Reconciliation", value: (item: BudgetItem) => item.fy26Reconciliation },
      { key: "fy26Total", label: "FY26 Total", value: (item: BudgetItem) => item.fy26Total }
    ];
    return columns.filter(col => visibleColumns.has(col.key));
  };

  const getColumnGroups = () => {
    const visibleCols = getVisibleColumnsArray();
    const groups = [];
    
    // FY 2024 group
    const fy24Cols = visibleCols.filter(col => col.key.startsWith('fy24'));
    if (fy24Cols.length > 0) {
      groups.push({ title: `FY 2024 (${fy24Cols.length})`, columns: fy24Cols });
    }
    
    // FY 2025 group  
    const fy25Cols = visibleCols.filter(col => col.key.startsWith('fy25'));
    if (fy25Cols.length > 0) {
      groups.push({ title: `FY 2025 (${fy25Cols.length})`, columns: fy25Cols });
    }
    
    // FY 2026 group
    const fy26Cols = visibleCols.filter(col => col.key.startsWith('fy26'));
    if (fy26Cols.length > 0) {
      groups.push({ title: `FY 2026 (${fy26Cols.length})`, columns: fy26Cols });
    }
    
    return groups;
  };

  const toggleColumn = (column: string) => {
    const newVisibleColumns = new Set(visibleColumns);
    if (newVisibleColumns.has(column)) {
      newVisibleColumns.delete(column);
    } else {
      newVisibleColumns.add(column);
    }
    setVisibleColumns(newVisibleColumns);
  };

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const formatCurrency = (value: number) => {
    if (!value || value === 0) return "—";
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        maximumFractionDigits: 2,
    }).format(value);
    };



  const getFiscalYearValue = (item: BudgetItem, fiscalYear: string): number => {
    const mapping: Record<string, keyof BudgetItem> = {
      "FY24 Actuals": "fy24Actuals",
      "FY25 Enacted": "fy25Enacted", 
      "FY25 Total": "fy25Total",
      "FY25 Supplemental": "fy25Supplemental",
      "FY26 Request": "fy26Request",
      "FY26 Reconciliation": "fy26Reconciliation",
      "FY26 Total": "fy26Total"
    };
    return (item[mapping[fiscalYear]] as number) || 0;
  };

  const calculateChange = (item: BudgetItem) => {
    const fromValue = getFiscalYearValue(item, compareFrom);
    const toValue = getFiscalYearValue(item, compareTo);
    
    if (fromValue === 0) return { amount: 0, percentage: 0 };
    
    const amount = toValue - fromValue;
    const percentage = (amount / fromValue) * 100;
    
    return { amount, percentage };
  };

  const formatChange = (change: { amount: number; percentage: number }) => {
    const sign = change.amount >= 0 ? '+' : '';
    const color = change.amount >= 0 ? 'text-green-600' : 'text-red-600';

    return (
        <div className={`text-sm ${color}`}>
        <div className="font-medium">
            {sign}{formatCurrency(change.amount)}
        </div>
        <div className="text-xs">
            {sign}{change.percentage.toFixed(1)}%
        </div>
        </div>
    );
    };


  const filteredData = useMemo(() => {
    const filterItems = (items: BudgetItem[]): BudgetItem[] => {
      return items.filter(item => {
        const matchesSearch = !searchQuery || 
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.programElement?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesAgency = selectedAgency === "All Agencies" || 
                      item.agency === selectedAgency || 
                      item.agency === "All";

        if (matchesSearch && matchesAgency) {
          return true;
        }

        // Check if any children match
        if (item.children) {
          const filteredChildren = filterItems(item.children);
          return filteredChildren.length > 0;
        }

        return false;
      }).map(item => ({
        ...item,
        children: item.children ? filterItems(item.children) : undefined
      }));
    };

    return filterItems(budgetData);
  }, [searchQuery, selectedAgency]);

  const renderBudgetItem = (item: BudgetItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const indentLevel = item.level * 20;
    const visibleCols = getVisibleColumnsArray();

    return (
      <div key={item.id}>
        <div className="flex border-b border-border hover:bg-muted/50 transition-colors">
          <div 
            className="w-[300px] p-3 flex items-center cursor-pointer"
            style={{ paddingLeft: `${12 + indentLevel}px` }}
            onClick={() => hasChildren && toggleExpanded(item.id)}
          >
            <div className="flex items-center space-x-2">
              {hasChildren && (
                <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </Button>
              )}
              {!hasChildren && <div className="w-4" />}
              
              <div className="flex items-center space-x-2">
                {item.level === 0 && (
                <div className={`w-3 h-3 rounded-sm ${getCategoryColor(item.category)}`} />
                )}

                <div>
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.programElement && (
                      <>
                        {item.programElement}
                        {item.agency !== "All" && (
                          <>
                            {" • "}
                            <span className="inline-flex items-center gap-1">
                              {getAgencyIcon(item.agency)}
                              {item.agency}
                            </span>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-1 border-l border-border">
            {visibleCols.map((column, colIndex) => (
              <div key={column.key} className={`flex-1 p-3 text-center text-sm ${colIndex > 0 ? 'border-l border-border' : ''}`}>
                <div className="font-medium">
                  {column.key === "fy25Supplemental" && column.value(item) === undefined 
                    ? "—" 
                    : formatCurrency(column.value(item) || 0)
                  }
                </div>
              </div>
            ))}
            {compareMode && (
              <div className="flex-1 p-3 text-center text-sm border-l border-border min-w-[120px]">
                {formatChange(calculateChange(item))}
              </div>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <>
            {item.children!.map(child => renderBudgetItem(child))}
          </>
        )}
      </div>
    );
  };

  return (
    <Card className="shadow-medium">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">
            🔵 FY 2026 Defense Budget Breakdown
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowColumnSelector(!showColumnSelector)}
              >
                <Download className="h-4 w-4 mr-2" />
                Columns ({visibleColumns.size})
              </Button>
              {showColumnSelector && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-background border border-border rounded-md shadow-lg z-10 p-4">
                  <div className="text-sm font-medium mb-3">Select Columns to Display</div>
                  <div className="space-y-2">
                    {[
                      { key: "fy24Actuals", label: "FY24 Actuals" },
                      { key: "fy25Enacted", label: "FY25 Enacted" },
                      { key: "fy25Total", label: "FY25 Total" },
                      { key: "fy25Supplemental", label: "FY25 Supplemental" },
                      { key: "fy26Request", label: "FY26 Request" },
                      { key: "fy26Reconciliation", label: "FY26 Reconciliation" },
                      { key: "fy26Total", label: "FY26 Total" }
                    ].map(column => (
                      <label key={column.key} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visibleColumns.has(column.key)}
                          onChange={() => toggleColumn(column.key)}
                          className="rounded"
                        />
                        <span className="text-sm">{column.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCompareMode(!compareMode)}
              className={compareMode ? "bg-primary text-primary-foreground" : ""}
            >
              Compare
            </Button>
          </div>
        </div>
        
        <p className="text-muted-foreground">
          Hierarchical breakdown of defense program elements with funding comparisons across fiscal years
        </p>

        {/* Compare Section */}
        <div className="flex items-center space-x-4 p-3 bg-muted/30 rounded-lg">
          <span className="text-sm font-medium">Compare:</span>
          <Select value={compareFrom} onValueChange={setCompareFrom}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fiscalYearOptions.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">to</span>
          <Select value={compareTo} onValueChange={setCompareTo}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fiscalYearOptions.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search programs (e.g., CH-53K)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="md:w-48">
            <Select value={selectedAgency} onValueChange={setSelectedAgency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Agencies">All Agencies</SelectItem>
                {agencies.map(agency => (
                  <SelectItem key={agency} value={agency}>
                    {agency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          {/* Header */}
          <div className="border-b-2 border-border bg-muted/50">
            {/* Fiscal Year Group Headers */}
            <div className="flex">
              <div className="w-[300px] p-2 font-semibold text-sm">Fiscal Year</div>
              <div className="flex flex-1 border-l border-border">
                {getColumnGroups().map((group, groupIndex) => (
                  <div 
                    key={groupIndex} 
                    className={`flex-1 p-2 text-center text-sm font-semibold ${groupIndex > 0 ? 'border-l border-border' : ''}`}
                    style={{ flexBasis: `${(group.columns.length / getVisibleColumnsArray().length) * 100}%` }}
                  >
                    {group.title}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Column Headers */}
            <div className="flex">
              <div className="w-[300px] p-3 font-semibold">Budget Items</div>
              <div className="flex flex-1 border-l border-border">
                {getVisibleColumnsArray().map((column, colIndex) => (
                  <div key={column.key} className={`flex-1 p-2 text-center text-xs text-muted-foreground ${colIndex > 0 ? 'border-l border-border' : ''}`}>
                    {column.label}
                  </div>
                ))}
                {compareMode && (
                  <div className="flex-1 p-2 text-center text-xs text-muted-foreground border-l border-border min-w-[120px]">
                    Change
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Data Rows */}
          <div className="min-h-[400px]">
            {filteredData.map(item => renderBudgetItem(item))}
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No budget items found matching your search criteria.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DefenseBudgetBreakdown;