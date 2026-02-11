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

// --- Recursive node renderer (inverted: deepest first) ---
const TreeNodeItem: React.FC<{ node: TreeNode; depth?: number; isDesktop?: boolean }> = ({
  node,
  depth = 0,
  isDesktop = false,
}) => {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  // On desktop, render bottom-up (children above parent)
  if (isDesktop) {
    return (
      <div className="flex flex-col items-center">
        {/* Children rendered ABOVE */}
        {hasChildren && open && (
          <div className="flex flex-row gap-4 items-end justify-center mb-0">
            {node.children!.map((child, i) => (
              <TreeNodeItem key={i} node={child} depth={depth + 1} isDesktop />
            ))}
          </div>
        )}
        {/* Connector line up */}
        {hasChildren && open && (
          <div className="w-px h-4 bg-border" />
        )}
        {/* This node */}
        <button
          onClick={() => hasChildren && setOpen(!open)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-all text-left
            ${depth === 0
              ? "bg-muted/60 border-border shadow-sm"
              : "bg-card border-border hover:border-primary/30"}
            ${hasChildren ? "cursor-pointer" : "cursor-default"}
          `}
        >
          {hasChildren && (
            open
              ? <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
              : <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
          )}
          {!hasChildren && <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-foreground leading-tight">{node.label}</span>
            {node.subtitle && (
              <span className="text-[10px] text-muted-foreground leading-tight">{node.subtitle}</span>
            )}
          </div>
          {node.badge && (
            <Badge
              variant={node.badgeVariant ?? "outline"}
              className="text-[8px] uppercase tracking-wider font-bold ml-1 shrink-0"
            >
              {node.badge}
            </Badge>
          )}
        </button>
      </div>
    );
  }

  // Mobile: accordion-style (indented, inverted order — deepest first visually)
  return (
    <div className={`${depth > 0 ? "ml-5 border-l-2 border-border pl-4" : ""}`}>
      {hasChildren ? (
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 w-full text-left group py-1.5">
            {open ? (
              <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
            )}
            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              {node.label}
            </span>
            {node.badge && (
              <Badge
                variant={node.badgeVariant ?? "outline"}
                className="text-[9px] uppercase tracking-wider font-bold ml-auto shrink-0"
              >
                {node.badge}
              </Badge>
            )}
          </CollapsibleTrigger>
          {node.subtitle && (
            <p className="text-[11px] text-muted-foreground ml-5 -mt-0.5 mb-1">
              {node.subtitle}
            </p>
          )}
          <CollapsibleContent>
            {node.children!.map((child, i) => (
              <TreeNodeItem key={i} node={child} depth={depth + 1} />
            ))}
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <div className="flex items-center gap-2 py-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
          <span className="text-sm text-foreground">{node.label}</span>
          {node.badge && (
            <Badge
              variant={node.badgeVariant ?? "outline"}
              className="text-[9px] uppercase tracking-wider font-bold ml-auto shrink-0"
            >
              {node.badge}
            </Badge>
          )}
          {node.subtitle && (
            <span className="text-[10px] text-muted-foreground ml-1 italic hidden sm:inline">
              — {node.subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// --- Desktop Lane Branch (inverted: nodes grow upward from lane header) ---
const DesktopLaneBranch: React.FC<{ lane: Lane }> = ({ lane }) => {
  const [open, setOpen] = useState(lane.defaultOpen ?? true);

  return (
    <div className="flex flex-col items-center min-w-[180px] max-w-[280px] flex-1">
      {/* Nodes above (inverted tree: children on top) */}
      {open && (
        <div className="flex flex-col items-center gap-1 mb-0">
          {lane.nodes.map((node, i) => (
            <TreeNodeItem key={i} node={node} isDesktop />
          ))}
        </div>
      )}
      {/* Connector line */}
      {open && <div className="w-px h-5 bg-border" />}
      {/* Lane header at bottom of branch */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 bg-muted/50 border border-border rounded-sm hover:bg-muted transition-colors w-full justify-center cursor-pointer"
      >
        {open ? (
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        )}
        {lane.icon}
        <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">
          {lane.title}
        </span>
        {lane.badgeLabel && (
          <Badge
            variant={lane.badgeVariant ?? "secondary"}
            className="text-[8px] uppercase tracking-wider font-bold"
          >
            {lane.badgeLabel}
          </Badge>
        )}
      </button>
    </div>
  );
};

// --- Mobile Lane (accordion, inverted order) ---
const MobileLaneSection: React.FC<{ lane: Lane; index: number }> = ({
  lane,
  index,
}) => {
  const [open, setOpen] = useState(lane.defaultOpen ?? true);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className="bg-card border border-border rounded-sm overflow-hidden transition-all duration-200"
        style={{ animationDelay: `${index * 60}ms` }}
      >
        <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted transition-colors group">
          <div className="flex items-center gap-3">
            {open ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            {lane.icon}
            <span className="text-[11px] font-bold uppercase tracking-widest text-foreground">
              {lane.title}
            </span>
          </div>
          {lane.badgeLabel && (
            <Badge
              variant={lane.badgeVariant ?? "secondary"}
              className="text-[9px] uppercase tracking-wider font-bold"
            >
              {lane.badgeLabel}
            </Badge>
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 py-3 space-y-0.5">
            {lane.nodes.map((node, i) => (
              <TreeNodeItem key={i} node={node} />
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

// --- Main Component ---
const FunctionalTreeMap: React.FC<FunctionalTreeMapProps> = ({
  rootLabel,
  rootSubtitle,
  lanes,
  disclaimer,
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-3 animate-in">
      {/* ===== MOBILE: stacked accordions, root at bottom ===== */}
      {isMobile ? (
        <div className="flex flex-col-reverse gap-2">
          {/* Root node (rendered last in DOM, appears at bottom via flex-col-reverse) */}
          <div className="bg-primary/10 border border-primary/20 rounded-sm px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-foreground">
                  {rootLabel}
                </h3>
                {rootSubtitle && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {rootSubtitle}
                  </p>
                )}
              </div>
              <Badge variant="default" className="text-[9px] uppercase tracking-wider font-bold">
                ROOT
              </Badge>
            </div>
          </div>

          {/* Lanes (reversed so they stack above root in inverted order) */}
          <div className="space-y-2">
            {lanes.map((lane, i) => (
              <MobileLaneSection key={i} lane={lane} index={i} />
            ))}
          </div>

          {/* Disclaimer at top on mobile */}
          {disclaimer && (
            <div className="flex items-start gap-2 px-3 py-2 bg-muted/40 rounded-sm border border-border">
              <Info className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                {disclaimer}
              </p>
            </div>
          )}
        </div>
      ) : (
        /* ===== DESKTOP / TABLET: inverted tree with connector lines ===== */
        <div className="flex flex-col items-center gap-0">
          {/* Disclaimer at top */}
          {disclaimer && (
            <div className="flex items-start gap-2 px-3 py-2 bg-muted/40 rounded-sm border border-border w-full mb-4">
              <Info className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                {disclaimer}
              </p>
            </div>
          )}

          {/* Branches growing upward — wrap into 2 rows on tablet */}
          <div className="flex flex-wrap justify-center gap-6 items-end w-full">
            {lanes.map((lane, i) => (
              <DesktopLaneBranch key={i} lane={lane} />
            ))}
          </div>

          {/* Horizontal connector bar */}
          <div className="relative w-full flex justify-center my-0">
            <div className="h-px bg-border" style={{ width: `${Math.min(lanes.length * 25, 80)}%` }} />
          </div>

          {/* Vertical connector down to root */}
          <div className="w-px h-5 bg-border" />

          {/* Root Node at bottom */}
          <div className="bg-primary/10 border border-primary/20 rounded-sm px-6 py-3 text-center">
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-foreground">
              {rootLabel}
            </h3>
            {rootSubtitle && (
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {rootSubtitle}
              </p>
            )}
            <Badge variant="default" className="text-[9px] uppercase tracking-wider font-bold mt-1">
              ROOT
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
};

export default FunctionalTreeMap;
