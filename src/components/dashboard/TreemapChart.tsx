import { useState, useEffect } from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Building2, Calendar, Tags, User, FileText } from "lucide-react";
import loadCsv from "@/lib/loadCsv";
import { csvFiles } from "@/data/contractsData";

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

// --- add helpers ---
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

const getLevelInfo = (level: number) => {
  const levels = [
    { name: "Overview", icon: Building2 },
    { name: "Contracting Office", icon: Building2 },
    { name: "Fiscal Year", icon: Calendar },
    { name: "FSC Code", icon: Tags },
    { name: "Recipient", icon: User },
    { name: "Award ID", icon: FileText },
  ];
  return levels[level] || levels[0];
};
const statusColors: Record<string, string> = {
  "1-14": "#ef4444",   
  "15-29": "#d4592b", 
  "30-44": "#eab308",  
  "45-60": "#00b9ff",  
  ">60":  "#50af70",   
  "Ended": "#5b5b5bff", 
  "Unknown": "#6d7686ff"
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const raw = payload[0].payload;
    const data = raw?._fullNode ?? raw;

    const formatCurrency = (value: number) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value);

    return (
      <div className="bg-card p-3 rounded-lg shadow-lg border border-border">
        <p className="font-semibold text-card-foreground">{data.name}</p>
        <p className="text-sm text-muted-foreground">
          Value: {formatCurrency(data.size)}
        </p>

        {data.metadata && (
          <>
            {data.metadata.awardAmount && (
              <p className="text-sm text-muted-foreground">
                Award: {formatCurrency(data.metadata.awardAmount)}
              </p>
            )}
            {data.metadata.awardDate && (
              <p className="text-sm text-muted-foreground">
                Award Date: {new Date(data.metadata.awardDate).toLocaleDateString()}
              </p>
            )}
            {data.metadata.periodOfPerformance && (
              <p className="text-sm text-muted-foreground">
                PoP: {data.metadata.periodOfPerformance}
              </p>
            )}
            {typeof data.metadata.daysTillEnd === "number" && (
              <p className="text-sm text-muted-foreground">
                Days Till End: {data.metadata.daysTillEnd >= 0 ? data.metadata.daysTillEnd : "Ended"}
              </p>
            )}
            {data.metadata.popStatus && (
              <p className="text-sm text-muted-foreground">
                PoP Status: {data.metadata.popStatus}
              </p>
            )}
            {data.metadata.contractType && (
              <p className="text-sm text-muted-foreground">
                Type: {data.metadata.contractType}
              </p>
            )}
            {data.metadata.description && (
              <p className="text-sm text-muted-foreground">
                {data.metadata.description}
              </p>
            )}
            {typeof data.metadata.offersReceived === "number" && (
              <p className="text-sm text-muted-foreground">
                Offers Received: {data.metadata.offersReceived}
              </p>
            )}
          </>
        )}
      </div>
    );
  }
  return null;
};

const TreemapChart = () => {
  const [rootData, setRootData] = useState<TreemapNode | null>(null);
  const [currentNode, setCurrentNode] = useState<TreemapNode | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<TreemapNode[]>([]);

  useEffect(() => {
    async function buildTree() {
      const root: TreemapNode = {
        name: "All Contracts",
        size: 0,
        id: "root",
        level: 0,
        children: [],
        rows: [],
      };

      for (const [year, filePath] of Object.entries(csvFiles)) {
        const rows = await loadCsv(filePath);

        rows.forEach((r: any) => {
          const office = r["Funding Office Name"] || "Unknown Office";
          const fscRaw = r["FSC"] || "Unknown FSC";
          const fsc = fscRaw.split(" ")[0].trim();
          const recipient = r["Recipient Name"] || "Unknown Recipient";
          const awardId = r["Award ID"] || "Unknown Award";
          const rawAmount = parseFloat(r["Awarded$"]);
          const safeAmount = isNaN(rawAmount) ? 0 : rawAmount;

          // --- Office Node ---
          let officeNode = root.children!.find((c) => c.name === office);
          if (!officeNode) {
            officeNode = {
              name: office,
              size: 0,
              id: office,
              level: 1,
              parent: root.id,
              children: [],
              rows: [],
            };
            root.children!.push(officeNode);
          }
          officeNode.rows!.push(r);

          // --- Year Node ---
          let yearNode = officeNode.children!.find((c) => c.name === `FY ${year}`);
          if (!yearNode) {
            yearNode = {
              name: `FY ${year}`,
              size: 0,
              id: `${office}-${year}`,
              level: 2,
              parent: officeNode.id,
              children: [],
              rows: [],
            };
            officeNode.children!.push(yearNode);
          }
          yearNode.rows!.push(r);

          // --- FSC Node ---
          let fscNode = yearNode.children!.find((c) => c.name === fsc);
          if (!fscNode) {
            fscNode = {
              name: fsc,
              size: 0,
              id: `${office}-${year}-${fsc}`,
              level: 3,
              parent: yearNode.id,
              children: [],
              rows: [],
            };
            yearNode.children!.push(fscNode);
          }
          fscNode.rows!.push(r);

          // --- Recipient Node ---
          let recipientNode = fscNode.children!.find((c) => c.name === recipient);
          if (!recipientNode) {
            recipientNode = {
              name: recipient,
              size: 0,
              id: `${office}-${year}-${fsc}-${recipient}`,
              level: 4,
              parent: fscNode.id,
              children: [],
              rows: [],
            };
            fscNode.children!.push(recipientNode);
          }
          recipientNode.rows!.push(r);

          // --- Award Leaf ---
          const awardNode: TreemapNode = {
            name: awardId,
            size: safeAmount,
            id: `${office}-${year}-${fsc}-${recipient}-${awardId}`,
            level: 5,
            parent: recipientNode.id,
            metadata: {
              awardAmount: safeAmount,
              awardDate: r["Award Date"],
              contractType: r["Contract Pricing Type"],
              description: r["Award Description"],
              periodOfPerformance: `${r["PoP Start Date"] || "?"} – ${r["PoP End Date"] || "?"}`,
              daysTillEnd: r["Days Till End"] ? parseInt(r["Days Till End"], 10) : null,
              popStatus: r["PoP Status"],
              offersReceived: r["Offers Received"] ? parseInt(r["Offers Received"], 10) : null,
            },
            rows: [r],
          };
          recipientNode.children!.push(awardNode);

          // --- Roll up totals ---
          recipientNode.size += safeAmount;
          fscNode.size += safeAmount;
          yearNode.size += safeAmount;
          officeNode.size += safeAmount;
          root.size += safeAmount;
        });
      }

      setRootData(root);
      setCurrentNode(root);
      setBreadcrumb([root]);
    }

    buildTree();
  }, []);

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
    if (rootData) {
      const actualNode = findNodeById(rootData, targetNode.id);
      if (actualNode) {
        setCurrentNode(actualNode);
        setBreadcrumb(buildBreadcrumbPath(rootData, actualNode.id));
      }
    }
  };

  if (!currentNode) return null;

  const layerData = (currentNode.children || []).map((child) => ({
    name: child.name,
    size: child.size,
    id: child.id,
    level: child.level,
    parent: child.parent,
    payload: { _fullNode: child },
  }));

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);

  const currentLevelInfo = getLevelInfo(currentNode.level);
  const Icon = currentLevelInfo.icon;

  return (
    <Card className="col-span-2">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="h-5 w-5 text-primary" />
            <CardTitle>Contract Funding Treemap</CardTitle>
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

        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm">
          {breadcrumb.map((node, index) => (
            <div key={node.id} className="flex items-center space-x-2">
              {index > 0 && <span className="text-muted-foreground">›</span>}
              <button
                onClick={() => handleDrillUp(node)}
                className={`hover:text-primary transition-colors ${
                  index === breadcrumb.length - 1
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {node.name}
              </button>
            </div>
          ))}
        </div>

        <div className="text-sm text-muted-foreground">
          Current Level: {currentLevelInfo.name}
          {currentNode.size > 0 && (
            <span className="ml-2 font-medium">Total Value: {formatCurrency(currentNode.size)}</span>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={1000}>
          <Treemap
            data={layerData}
            dataKey="size"
            stroke="hsl(var(--border))"
            content={({ x, y, width, height, name, size, payload }) => {
              const node = payload?._fullNode;
              if (!node) return null;

              const fontSize = Math.max(8, Math.min(14, Math.min(width, height) / 6));

              // pick fill color
              let fillColor = "hsl(var(--primary))";
              if (node.level === 5 && node.metadata?.popStatus) {
                fillColor = statusColors[node.metadata.popStatus] || "hsl(var(--primary))";
              }

              return (
                <g onClick={() => handleCellClick(node)}>
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    style={{
                      fill: fillColor,
                      stroke: "hsl(var(--border))",
                      strokeWidth: 1,
                      cursor: "pointer",
                    }}
                  />
                  {width > 30 && height > 20 && (
                    <>
                      <text
                        x={x + width / 2}
                        y={y + height / 2 - 5}
                        textAnchor="middle"
                        fill="hsl(var(--primary-foreground))"
                        fontSize={fontSize}
                        fontWeight="500"
                      >
                        {name}
                      </text>
                      <text
                        x={x + width / 2}
                        y={y + height / 2 + 10}
                        textAnchor="middle"
                        fill="hsl(var(--primary-foreground))"
                        fontSize={fontSize - 2}
                        opacity="0.8"
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

          {/* Table beneath the treemap */}
          <div className="mt-6 overflow-x-auto">
            {currentNode?.rows && currentNode.rows.length > 0 && (
              <table className="min-w-full text-sm border">
                <thead>
                  <tr className="bg-muted">
                    <th className="px-4 py-2 text-left">Award ID</th>
                    <th className="px-4 py-2">Award Date</th>
                    <th className="px-4 py-2">Award Description</th>
                    <th className="px-4 py-2">Recipient</th>
                    <th className="px-4 py-2">FSC</th>
                    <th className="px-4 py-2 text-right">Awarded $</th>
                    <th className="px-4 py-2">PoP Duration</th>
                    <th className="px-4 py-2">Days Till End</th>
                    <th className="px-4 py-2">PoP Status</th>
                    <th className="px-4 py-2">Offers</th>
                  </tr>
                </thead>
                  <tbody>
                    {currentNode.rows.map((row: any, idx: number) => {
                      const status = row["PoP Status"] || "Unknown";
                      const bgColor = statusColors[status] || "#ffffff"; 

                    return (
                      <tr
                        key={idx}
                        className="border-t hover:bg-accent"
                        style={{ backgroundColor: bgColor, color: "white" }}  
                      >
                      <td className="px-4 py-2">{row["Award ID"]}</td>
                      <td className="px-4 py-2">
                        {row["Award Date"] ? new Date(row["Award Date"]).toLocaleDateString() : ""}
                      </td>
                      <td className="px-4 py-2">{row["Award Description"]}</td>
                      <td className="px-4 py-2">{row["Recipient Name"]}</td>
                      <td className="px-4 py-2">{row["FSC"]}</td>
                      <td className="px-4 py-2 text-right">
                        {formatCurrency(parseFloat(row["Awarded$"] || 0))}
                      </td>
                      <td className="px-4 py-2">{row["PoP Duration"]}</td>
                      <td className="px-4 py-2">{row["Days Till End"]}</td>
                      <td className="px-4 py-2">{row["PoP Status"]}</td>
                      <td className="px-4 py-2">{row["Offers Received"]}</td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TreemapChart;
