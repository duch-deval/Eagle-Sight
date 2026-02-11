import React, { useState } from "react";
import { ChevronDown, ChevronRight, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useIsMobile } from "@/hooks/use-mobile";

// --- Types ---
interface TreeNode {
  label: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "outline" | "destructive";
  children?: TreeNode[];
}

interface Lane {
  title: string;
  icon?: React.ReactNode;
  badgeLabel?: string;
  badgeVariant?: "default" | "secondary" | "outline" | "destructive";
  nodes: TreeNode[];
  defaultOpen?: boolean;
}

interface FunctionalTreeMapProps {
  rootLabel: string;
  rootSubtitle?: string;
  lanes: Lane[];
  disclaimer?: string;
}

// --- Desktop recursive node (top-down, vertically stacked) ---
const DesktopNode: React.FC<{ node: TreeNode; depth?: number }> = ({ node, depth = 0 }) => {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col items-center w-full">
      <button
        onClick={() => hasChildren && setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-all text-left w-full
          ${depth === 0 ? "bg-muted/60 border-border shadow-sm" : "bg-card border-border hover:border-primary/30"}
          ${hasChildren ? "cursor-pointer" : "cursor-default"}
        `}
      >
        {hasChildren && (
          open
            ? <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
            : <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
        )}
        {!hasChildren && <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-xs font-semibold text-foreground leading-tight truncate">{node.label}</span>
          {node.subtitle && (
            <span className="text-[10px] text-muted-foreground leading-tight truncate">{node.subtitle}</span>
          )}
        </div>
        {node.badge && (
          <Badge variant={node.badgeVariant ?? "outline"} className="text-[8px] uppercase tracking-wider font-bold shrink-0">
            {node.badge}
          </Badge>
        )}
      </button>

      {hasChildren && open && (
        <>
          <div className="w-px h-3 bg-border" />
          <div className="flex flex-col items-center gap-1 w-full pl-4 border-l-2 border-border ml-4">
            {node.children!.map((child, i) => (
              <DesktopNode key={i} node={child} depth={depth + 1} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// --- Desktop Lane Branch ---
const DesktopLaneBranch: React.FC<{ lane: Lane }> = ({ lane }) => {
  const [open, setOpen] = useState(lane.defaultOpen ?? true);

  return (
    <div className="flex flex-col items-center flex-1 min-w-0">
      {/* Vertical connector from horizontal bar */}
      <div className="w-px h-4 bg-border" />
      {/* Lane header */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 bg-muted/50 border border-border rounded-sm hover:bg-muted transition-colors w-full justify-center cursor-pointer"
      >
        {open
          ? <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
          : <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
        }
        {lane.icon}
        <span className="text-[10px] font-bold uppercase tracking-widest text-foreground text-center">{lane.title}</span>
        {lane.badgeLabel && (
          <Badge variant={lane.badgeVariant ?? "secondary"} className="text-[8px] uppercase tracking-wider font-bold shrink-0">
            {lane.badgeLabel}
          </Badge>
        )}
      </button>
      {/* Nodes below */}
      {open && (
        <div className="flex flex-col items-center gap-1 w-full mt-1">
          {lane.nodes.map((node, i) => (
            <DesktopNode key={i} node={node} />
          ))}
        </div>
      )}
    </div>
  );
};

// --- Mobile accordion node ---
const MobileNode: React.FC<{ node: TreeNode; depth?: number }> = ({ node, depth = 0 }) => {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className={`${depth > 0 ? "ml-5 border-l-2 border-border pl-4" : ""}`}>
      {hasChildren ? (
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 w-full text-left group py-1.5">
            {open ? <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" /> : <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />}
            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{node.label}</span>
            {node.badge && (
              <Badge variant={node.badgeVariant ?? "outline"} className="text-[9px] uppercase tracking-wider font-bold ml-auto shrink-0">{node.badge}</Badge>
            )}
          </CollapsibleTrigger>
          {node.subtitle && <p className="text-[11px] text-muted-foreground ml-5 -mt-0.5 mb-1">{node.subtitle}</p>}
          <CollapsibleContent>
            {node.children!.map((child, i) => (
              <MobileNode key={i} node={child} depth={depth + 1} />
            ))}
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <div className="flex items-center gap-2 py-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
          <span className="text-sm text-foreground">{node.label}</span>
          {node.badge && <Badge variant={node.badgeVariant ?? "outline"} className="text-[9px] uppercase tracking-wider font-bold ml-auto shrink-0">{node.badge}</Badge>}
          {node.subtitle && <span className="text-[10px] text-muted-foreground ml-1 italic hidden sm:inline">— {node.subtitle}</span>}
        </div>
      )}
    </div>
  );
};

// --- Mobile Lane ---
const MobileLane: React.FC<{ lane: Lane; index: number }> = ({ lane, index }) => {
  const [open, setOpen] = useState(lane.defaultOpen ?? true);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="bg-card border border-border rounded-sm overflow-hidden" style={{ animationDelay: `${index * 60}ms` }}>
        <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted transition-colors">
          <div className="flex items-center gap-3">
            {open ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
            {lane.icon}
            <span className="text-[11px] font-bold uppercase tracking-widest text-foreground">{lane.title}</span>
          </div>
          {lane.badgeLabel && <Badge variant={lane.badgeVariant ?? "secondary"} className="text-[9px] uppercase tracking-wider font-bold">{lane.badgeLabel}</Badge>}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 py-3 space-y-0.5">
            {lane.nodes.map((node, i) => <MobileNode key={i} node={node} />)}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

// --- Main ---
const FunctionalTreeMap: React.FC<FunctionalTreeMapProps> = ({ rootLabel, rootSubtitle, lanes, disclaimer }) => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-3 animate-in">
      {isMobile ? (
        <div className="flex flex-col gap-2">
          <div className="bg-primary/10 border border-primary/20 rounded-sm px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-foreground">{rootLabel}</h3>
                {rootSubtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{rootSubtitle}</p>}
              </div>
              <Badge variant="default" className="text-[9px] uppercase tracking-wider font-bold">ROOT</Badge>
            </div>
          </div>
          <div className="space-y-2">
            {lanes.map((lane, i) => <MobileLane key={i} lane={lane} index={i} />)}
          </div>
          {disclaimer && (
            <div className="flex items-start gap-2 px-3 py-2 bg-muted/40 rounded-sm border border-border">
              <Info className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-[10px] text-muted-foreground italic leading-relaxed">{disclaimer}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-0">
          {/* Root at top */}
          <div className="bg-primary/10 border border-primary/20 rounded-sm px-6 py-3 text-center">
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-foreground">{rootLabel}</h3>
            {rootSubtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{rootSubtitle}</p>}
            <Badge variant="default" className="text-[9px] uppercase tracking-wider font-bold mt-1">ROOT</Badge>
          </div>

          {/* Vertical connector from root */}
          <div className="w-px h-5 bg-border" />

          {/* Horizontal bar */}
          <div className="relative w-full flex justify-center">
            <div className="h-px bg-border" style={{ width: `${Math.min(lanes.length * 25, 85)}%` }} />
          </div>

          {/* Branches in a CSS grid: 4 cols on desktop, 2 cols on tablet */}
          <div
            className="grid w-full gap-4"
            style={{
              gridTemplateColumns: `repeat(${lanes.length}, minmax(0, 1fr))`,
            }}
          >
            {lanes.map((lane, i) => (
              <DesktopLaneBranch key={i} lane={lane} />
            ))}
          </div>

          {/* Disclaimer */}
          {disclaimer && (
            <div className="flex items-start gap-2 px-3 py-2 bg-muted/40 rounded-sm border border-border w-full mt-4">
              <Info className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-[10px] text-muted-foreground italic leading-relaxed">{disclaimer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FunctionalTreeMap;
