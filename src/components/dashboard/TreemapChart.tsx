import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeft, Building2, Calendar, Tags, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import supabase from "@/lib/supabaseClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchAwardsByOffice } from "@/lib/supabaseData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Treemap, 
  ResponsiveContainer, 
  Tooltip,
  PieChart,   
  Pie,       
  Cell        
} from "recharts";
import AwardTable from "@/components/AwardTable";

// ============================================
// Types
// ============================================
interface TreemapNode {
  name: string;
  size: number;
  id: string;
  level: number;
  parent?: string;
  children?: TreemapNode[];
  metadata?: {
    awardAmount?: number;
    awardDate?: string;
    contractType?: string;
    description?: string;
    periodOfPerformance?: string;
    daysTillEnd?: number | null;
    popStatus?: string;
    offersReceived?: number | null;
  };
  rows?: any[];
}

// ============================================
// Constants
// ============================================
const officeDictionary: Record<string, string> = {
  N00019: "NAVAL AIR SYSTEMS COMMAND",
  N68335: "NAVAIR WARFARE CTR AIRCRAFT DIV",
  N00104: "NAVSUP WEAPON SYSTEMS SUPPORT MECH",
  SPE8EF: "DLA TROOP SUPPORT",
  SP4701: "DCSO PHILADELPHIA",
};

const freshColors = [
  "hsl(142 76% 36%)", "hsl(346 77% 49%)", "hsl(38 92% 50%)",
  "hsl(262 83% 58%)", "hsl(188 94% 42%)", "hsl(330 81% 60%)",
  "hsl(239 84% 67%)", "hsl(173 58% 39%)", "hsl(25 95% 53%)",
  "hsl(291 47% 51%)", "hsl(217 91% 59%)"
];

const statusColors: Record<string, string> = {
  "1-14": "#ef4444",
  "15-29": "#d4592b",
  "30-44": "#eab308",
  "45-60": "#00b9ff",
  ">60": "#50af70",
  Ended: "#5b5b5bff",
  Unknown: "#6b7280"
};

// ============================================
// Helper Functions
// ============================================
function getFiscalYear(dateStr: string): string {
  if (!dateStr) return "Unknown";
  const d = new Date(dateStr);
  return d.getMonth() + 1 >= 10 ? (d.getFullYear() + 1).toString() : d.getFullYear().toString();
}

function computePoP(start: string, end: string) {
  if (!start || !end) return { duration: "—", daysLeft: null, status: "Unknown" };
  const s = new Date(start), e = new Date(end), today = new Date();
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
    notation: "compact",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const findNodeById = (root: TreemapNode, targetId: string): TreemapNode | null => {
  if (root.id === targetId) return root;
  if (root.children) {
    for (const child of root.children) {
      const found = findNodeById(child, targetId);
      if (found) return found;
    }
  }
  return null;
};

const buildBreadcrumbPath = (root: TreemapNode, targetId: string): TreemapNode[] => {
  const path: TreemapNode[] = [];
  const findPath = (node: TreemapNode, target: string, currentPath: TreemapNode[]): boolean => {
    currentPath.push(node);
    if (node.id === target) return true;
    if (node.children) {
      for (const child of node.children) {
        if (findPath(child, target, currentPath)) return true;
      }
    }
    currentPath.pop();
    return false;
  };
  findPath(root, targetId, path);
  return path;
};

// ============================================
// Sub-Components
// ============================================
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const raw = payload[0].payload;
    const data = raw?._fullNode ?? raw;

    return (
      <div className="bg-card p-3 rounded-lg shadow-lg border border-border">
        <p className="font-semibold text-card-foreground">{data.name}</p>
        <p className="text-sm text-muted-foreground">Value: {formatCurrency(data.size)}</p>
      </div>
    );
  }
  return null;
};

const SetAsideChart = ({ rows }: { rows: any[] }) => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (!rows || rows.length === 0) {
      setData([]);
      return;
    }

    const grouped: Record<string, number> = {};
    rows.forEach((r) => {
      const type = r.set_aside_type || "None";
      const amt = parseFloat(r.awarded_amount) || 0;
      grouped[type] = (grouped[type] || 0) + amt;
    });

    const total = Object.values(grouped).reduce((a, b) => a + b, 0);
    const processed = Object.entries(grouped).map(([name, value]) => ({
      name,
      value,
      percent: total ? (value / total) * 100 : 0,
    }));

    setData(processed);
  }, [rows]);

  const renderCustomLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent, name,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.7;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const isDark = document.documentElement.classList.contains("dark");
    const textColor = isDark ? "white" : "black";

    return (
      <text
        x={x}
        y={y}
        fill={textColor}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
      >
        {`${name} ${percent.toFixed(1)}%`}
      </text>
    );
  };

  if (!data.length) return null;

  return (
    <Card className="p-6 mt-6">
      <h3 className="text-lg font-medium mb-4">Set Aside Distribution</h3>
      <div className="h-[600px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={180}
              paddingAngle={2}
              dataKey="value"
              labelLine={true}
              label={renderCustomLabel}
            >
              {data.map((entry, idx) => (
                <Cell
                  key={idx}
                  fill={["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#6366F1"][idx % 6]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(val: number, name: string) =>
                [`$${(val as number).toLocaleString()}`, name]
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

// ============================================
// Main Component
// ============================================
const TreemapChart = () => {
  const [rootData, setRootData] = useState<TreemapNode | null>(null);
  const [currentNode, setCurrentNode] = useState<TreemapNode | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<TreemapNode[]>([]);
  const [selectedOffice, setSelectedOffice] = useState<string>("");
  const [recipientSearch, setRecipientSearch] = useState<string>("");
  const [selectedAward, setSelectedAward] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const [profiles, setProfiles] = useState<any[]>([]);

  const availableOffices = Object.keys(officeDictionary);

  // Load profiles for watchlist
  useEffect(() => {
    const loadProfiles = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, created_at");

      if (error) {
        console.error("❌ error loading profiles:", error);
        return;
      }
      setProfiles(data || []);
    };
    loadProfiles();
  }, []);

  // Build hierarchy tree whenever office changes
  useEffect(() => {
    if (!selectedOffice) return;

    const loadData = async () => {
      const rows = await fetchAwardsByOffice(selectedOffice, 2000);

      const root: TreemapNode = {
        name: officeDictionary[selectedOffice],
        size: 0,
        id: selectedOffice,
        level: 0,
        children: [],
        rows: [],
      };

      rows.forEach(r => {
        const officeCode = r.funding_office_code?.trim() || "Unknown";
        const fsc = (r.fsc || "Unknown FSC").split(" ")[0].trim();
        const recipient = r.recipient_name?.trim() || "Unknown Recipient";
        const awardId = r.award_id?.trim() || "Unknown Award";
        const amount = Number(r.awarded_amount);
        if (!awardId || isNaN(amount)) return;
        const fy = getFiscalYear(r.award_date);

        // Office level
        let officeNode = root.children!.find(c => c.id === `office-${officeCode}`);
        if (!officeNode) {
          officeNode = {
            name: officeCode,
            size: 0,
            id: `office-${officeCode}`,
            level: 1,
            parent: root.id,
            children: [],
            rows: [],
          };
          root.children!.push(officeNode);
        }
        officeNode.rows!.push(r);

        // Year level
        let yearNode = officeNode.children!.find(c => c.id === `year-${officeCode}-${fy}`);
        if (!yearNode) {
          yearNode = {
            name: `FY ${fy}`,
            size: 0,
            id: `year-${officeCode}-${fy}`,
            level: 2,
            parent: officeNode.id,
            children: [],
            rows: [],
          };
          officeNode.children!.push(yearNode);
        }
        yearNode.rows!.push(r);

        // FSC level
        let fscNode = yearNode.children!.find(c => c.id === `fsc-${officeCode}-${fy}-${fsc}`);
        if (!fscNode) {
          fscNode = {
            name: fsc,
            size: 0,
            id: `fsc-${officeCode}-${fy}-${fsc}`,
            level: 3,
            parent: yearNode.id,
            children: [],
            rows: [],
          };
          yearNode.children!.push(fscNode);
        }
        fscNode.rows!.push(r);

        // Recipient level
        let recipientNode = fscNode.children!.find(c => c.id === `recipient-${officeCode}-${fy}-${fsc}-${recipient}`);
        if (!recipientNode) {
          recipientNode = {
            name: recipient,
            size: 0,
            id: `recipient-${officeCode}-${fy}-${fsc}-${recipient}`,
            level: 4,
            parent: fscNode.id,
            children: [],
            rows: [],
          };
          fscNode.children!.push(recipientNode);
        }
        recipientNode.rows!.push(r);

        // Award level
        const awardNode: TreemapNode = {
          name: awardId,
          size: amount,
          id: `award-${officeCode}-${fy}-${fsc}-${recipient}-${awardId}`,
          level: 5,
          parent: recipientNode.id,
          metadata: {
            awardAmount: amount,
            awardDate: r.award_date,
            contractType: r.contract_pricing_type,
            description: r.award_description,
            periodOfPerformance: `${r.pop_start_date || "?"} – ${r.pop_end_date || "?"}`,
            ...computePoP(r.pop_start_date, r.pop_end_date),
            offersReceived: r.offers_received ? parseInt(r.offers_received, 10) : null,
          },
          rows: [r],
        };
        recipientNode.children!.push(awardNode);

        // Bubble up sizes
        recipientNode.size += amount;
        fscNode.size += amount;
        yearNode.size += amount;
        officeNode.size += amount;
        root.size += amount;
      });

      setRootData(root);
      if (root.children?.length) {
        setCurrentNode(root.children[0]);
        setBreadcrumb([root, root.children[0]]);
      } else {
        setCurrentNode(root);
        setBreadcrumb([root]);
      }
    };

    loadData();
  }, [selectedOffice]);

  const handleCellClick = (node: TreemapNode) => {
    if (node.children && node.children.length > 0 && rootData) {
      const actualNode = findNodeById(rootData, node.id);
      if (actualNode) {
        setCurrentNode(actualNode);
        setBreadcrumb(buildBreadcrumbPath(rootData, actualNode.id));
      }
    }
  };

  const handleDrillUp = (targetNode: TreemapNode) => {
    if (!rootData) return;

    if (targetNode.id === rootData.id) {
      setSelectedOffice("");
      setRootData(null);
      setCurrentNode(null);
      setBreadcrumb([]);
      return;
    }

    const actualNode = findNodeById(rootData, targetNode.id);
    if (actualNode) {
      setCurrentNode(actualNode);
      setBreadcrumb(buildBreadcrumbPath(rootData, actualNode.id));
    }
  };

  const handleRowDoubleClick = (award: any) => {
    setSelectedAward(award);
    setIsModalOpen(true);
  };

  // Recipient filter
  let filteredChildren = currentNode?.children ?? [];
  if (currentNode?.level === 3 && recipientSearch) {
    filteredChildren = filteredChildren.filter((child) =>
      child.name.toLowerCase().includes(recipientSearch.toLowerCase())
    );
  }

  const layerData = filteredChildren.map((child, idx) => ({
    name: child.name,
    size: child.size,
    id: child.id,
    level: child.level,
    parent: child.parent,
    payload: { _fullNode: child },
    fill:
      child.level === 5 && child.metadata?.popStatus
        ? statusColors[child.metadata.popStatus] || "hsl(var(--primary))"
        : freshColors[idx % freshColors.length],
  }));

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>
              Contract Funding Treemap
              {selectedOffice && ` (${officeDictionary[selectedOffice]})`}
            </CardTitle>
          </div>

          {breadcrumb.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDrillUp(breadcrumb[breadcrumb.length - 2])}
              className="flex items-center space-x-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          )}
        </div>

        {/* Office Selector */}
        <div className="flex gap-4 mt-2">
          <Select value={selectedOffice} onValueChange={setSelectedOffice}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Choose an office" />
            </SelectTrigger>
            <SelectContent>
              {availableOffices.map((code) => (
                <SelectItem key={code} value={code}>
                  {code} — {officeDictionary[code]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {(!selectedOffice || !currentNode) ? (
          <div className="h-[300px] sm:h-[500px] lg:h-[600px]">
            Select a contracting office to view treemap data.
            <ResponsiveContainer width="100%" height={400}>
              <Treemap
                data={[]}
                dataKey="size"
                stroke="hsl(var(--border))"
              />
            </ResponsiveContainer>
          </div>
        ) : (
          <>
            {/* Treemap */}
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <Treemap
                  data={layerData}
                  dataKey="size"
                  stroke="hsl(var(--border))"
                  content={({ x, y, width, height, name, size, payload, fill }) => {
                    const node = payload?._fullNode;
                    if (!node) return null;
                    const fontSize = Math.max(8, Math.min(14, Math.min(width, height) / 6));

                    return (
                      <g onClick={() => handleCellClick(node)} style={{ cursor: "pointer" }}>
                        <rect
                          x={x}
                          y={y}
                          width={width}
                          height={height}
                          fill={fill}
                          stroke="hsl(var(--border))"
                          strokeWidth={2}
                          className="hover:opacity-90 transition-opacity"
                        />
                        {width > 40 && height > 20 && (
                          <>
                            <text
                              x={x + width / 2}
                              y={y + height / 2 - 5}
                              textAnchor="middle"
                              fill="white"
                              stroke="black"
                              strokeWidth={0.8}
                              paintOrder="stroke"
                              fontSize={fontSize}
                              fontWeight="600"
                            >
                              {name}
                            </text>
                            <text
                              x={x + width / 2}
                              y={y + height / 2 + 10}
                              textAnchor="middle"
                              fill="white"
                              stroke="black"
                              strokeWidth={0.8}
                              paintOrder="stroke"
                              fontSize={fontSize - 2}
                            >
                              {typeof size === "number" ? formatCurrency(size) : "—"}
                            </text>
                          </>
                        )}
                      </g>
                    );
                  }}
                >
                  <Tooltip content={<CustomTooltip />} />
                </Treemap>
              </ResponsiveContainer>
            </div>

            {/* Set Aside Chart */}
            {currentNode?.rows && (
              <div className="mt-6">
                <SetAsideChart rows={currentNode.rows} />
              </div>
            )}

            {/* Award Table - Using shared component */}
            {currentNode?.rows && currentNode.rows.length > 0 && (
              <div className="mt-6">
                <AwardTable 
                  awards={currentNode.rows} 
                  onRowDoubleClick={handleRowDoubleClick}
                  showSearch
                  showLegend
                />
              </div>
            )}

            {/* Add to Profile Dialog */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Award to Profile</DialogTitle>
                </DialogHeader>

                {selectedAward && (
                  <div className="space-y-2 text-sm">
                    <p><strong>Award ID:</strong> {selectedAward.award_id}</p>
                    <p><strong>Description:</strong> {selectedAward.award_description}</p>
                    <p><strong>Recipient:</strong> {selectedAward.recipient_name}</p>
                    <p><strong>Value:</strong> {formatCurrency(Number(selectedAward.awarded_amount) || 0)}</p>
                  </div>
                )}

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">Assign to Profile</label>
                  <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a profile" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button
                    onClick={async () => {
                      if (!selectedProfile || !selectedAward) return;

                      const { error } = await supabase
                        .from("watchlist_awards")
                        .insert([
                          {
                            profile_id: selectedProfile,
                            award_db_id: selectedAward.id,
                          },
                        ]);

                      if (error) {
                        console.error("❌ Failed to save award to watchlist:", error);
                      } else {
                        console.log("✅ Award saved to profile:", selectedProfile);
                      }

                      setIsModalOpen(false);
                      setSelectedProfile("");
                    }}
                    disabled={!selectedProfile}
                  >
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TreemapChart;