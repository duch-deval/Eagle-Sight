import React, { useState } from "react";
import { ChevronDown, ChevronRight, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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

// --- Single Node ---
const TreeNodeItem: React.FC<{ node: TreeNode; depth?: number }> = ({
  node,
  depth = 0,
}) => {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

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

// --- Lane ---
const LaneSection: React.FC<{ lane: Lane; index: number }> = ({
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
  return (
    <div className="space-y-3 animate-in">
      {/* Root Node */}
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

      {/* Connector line */}
      <div className="flex justify-center">
        <div className="w-px h-4 bg-border" />
      </div>

      {/* Lanes */}
      <div className="space-y-2">
        {lanes.map((lane, i) => (
          <LaneSection key={i} lane={lane} index={i} />
        ))}
      </div>

      {/* Disclaimer */}
      {disclaimer && (
        <div className="flex items-start gap-2 px-3 py-2 bg-muted/40 rounded-sm border border-border">
          <Info className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-[10px] text-muted-foreground italic leading-relaxed">
            {disclaimer}
          </p>
        </div>
      )}
    </div>
  );
};

export default FunctionalTreeMap;
