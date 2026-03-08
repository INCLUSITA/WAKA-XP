import { useMemo, useState } from "react";
import { Node, Edge } from "@xyflow/react";
import {
  Layers, Box, ChevronRight, ChevronDown, MousePointerClick, Package, ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FlowModule } from "@/hooks/useFlowModules";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StructuredViewProps {
  nodes: Node[];
  edges: Edge[];
  modules: FlowModule[];
  onFocusModule: (moduleId: string) => void;
  onFocusNode: (nodeId: string) => void;
  onSwitchToCanvas: () => void;
  onAssignNode?: (nodeId: string, moduleId: string | null) => void;
}

const NODE_TYPE_LABELS: Record<string, string> = {
  sendMsg: "Send Message",
  waitResponse: "Wait Response",
  splitExpression: "Split",
  webhook: "Webhook",
  saveResult: "Save Result",
  updateContact: "Update Contact",
  sendEmail: "Send Email",
  callAI: "Call AI",
  enterFlow: "Enter Flow",
  openTicket: "Open Ticket",
  callZapier: "Call Zapier",
  sendAirtime: "Send Airtime",
  splitContactField: "Split Contact",
  splitResult: "Split Result",
  splitRandom: "Split Random",
  splitGroup: "Split Group",
};

const NODE_TYPE_COLORS: Record<string, string> = {
  sendMsg: "hsl(var(--node-send))",
  waitResponse: "hsl(var(--node-wait))",
  splitExpression: "hsl(var(--node-split))",
  webhook: "hsl(var(--node-webhook))",
  saveResult: "hsl(45, 80%, 50%)",
  updateContact: "hsl(200, 70%, 50%)",
  sendEmail: "hsl(340, 70%, 50%)",
  callAI: "hsl(270, 70%, 55%)",
  enterFlow: "hsl(190, 70%, 45%)",
  callZapier: "hsl(20, 90%, 55%)",
  sendAirtime: "hsl(50, 80%, 50%)",
  openTicket: "hsl(15, 80%, 50%)",
};

export function StructuredView({
  nodes,
  edges,
  modules,
  onFocusModule,
  onFocusNode,
  onSwitchToCanvas,
  onAssignNode,
}: StructuredViewProps) {
  const regularNodes = nodes.filter((n) => n.type !== "moduleGroup");
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());

  // Group nodes by parentId (module)
  const { grouped, unassigned } = useMemo(() => {
    const grouped: Record<string, Node[]> = {};
    const unassigned: Node[] = [];
    for (const n of regularNodes) {
      if (n.parentId) {
        if (!grouped[n.parentId]) grouped[n.parentId] = [];
        grouped[n.parentId].push(n);
      } else {
        unassigned.push(n);
      }
    }
    return { grouped, unassigned };
  }, [regularNodes]);

  // Group unassigned by type
  const unassignedByType = useMemo(() => {
    const byType: Record<string, Node[]> = {};
    for (const n of unassigned) {
      const t = n.type || "unknown";
      if (!byType[t]) byType[t] = [];
      byType[t].push(n);
    }
    return Object.entries(byType).sort((a, b) => b[1].length - a[1].length);
  }, [unassigned]);

  // Module connections
  const moduleConnections = useMemo(() => {
    const connections: { from: string; to: string }[] = [];
    const nodeToModule = new Map<string, string>();
    for (const n of regularNodes) {
      if (n.parentId) nodeToModule.set(n.id, n.parentId);
    }
    for (const e of edges) {
      const fromMod = nodeToModule.get(e.source);
      const toMod = nodeToModule.get(e.target);
      if (fromMod && toMod && fromMod !== toMod) {
        const key = `${fromMod}->${toMod}`;
        if (!connections.find((c) => `${c.from}->${c.to}` === key)) {
          connections.push({ from: fromMod, to: toMod });
        }
      }
    }
    return connections;
  }, [regularNodes, edges]);

  const toggleType = (type: string) => {
    setExpandedTypes((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Layers className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-bold text-foreground">Structure View</h2>
        <Badge variant="outline" className="ml-auto text-[10px]">
          {modules.length} modules · {regularNodes.length} nodes
        </Badge>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {/* Modules */}
          {modules.map((mod) => {
            const modNodes = grouped[mod.id] || [];
            const outgoing = moduleConnections.filter((c) => c.from === mod.id);
            const targets = outgoing.map((c) => modules.find((m) => m.id === c.to)?.label).filter(Boolean);

            return (
              <div key={mod.id} className="group">
                <button
                  onClick={() => onFocusModule(mod.id)}
                  className="w-full rounded-lg border border-border bg-card p-3 text-left transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-sm"
                      style={{ background: mod.color }}
                    />
                    <span className="text-sm font-bold" style={{ color: mod.color }}>
                      {mod.label}
                    </span>
                    <Badge variant="secondary" className="ml-auto text-[10px]">
                      {modNodes.length} nodes
                    </Badge>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {modNodes.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {modNodes.slice(0, 6).map((n) => (
                        <span
                          key={n.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onFocusNode(n.id);
                            onSwitchToCanvas();
                          }}
                          className="cursor-pointer rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          <span
                            className="mr-1 inline-block h-1.5 w-1.5 rounded-full"
                            style={{ background: NODE_TYPE_COLORS[n.type || ""] || "hsl(var(--muted-foreground))" }}
                          />
                          {NODE_TYPE_LABELS[n.type || ""] || n.type}
                        </span>
                      ))}
                      {modNodes.length > 6 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{modNodes.length - 6} more
                        </span>
                      )}
                    </div>
                  )}

                  {targets.length > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                      <ArrowRight className="h-2.5 w-2.5" />
                      {targets.join(", ")}
                    </div>
                  )}
                </button>
              </div>
            );
          })}

          {/* Unassigned nodes — grouped by type */}
          {unassigned.length > 0 && (
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-3">
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Unassigned Nodes
                </span>
                <Badge variant="outline" className="ml-auto text-[10px]">
                  {unassigned.length}
                </Badge>
              </div>

              <div className="space-y-1">
                {unassignedByType.map(([type, typeNodes]) => {
                  const isExpanded = expandedTypes.has(type);
                  const color = NODE_TYPE_COLORS[type] || "hsl(var(--muted-foreground))";
                  const label = NODE_TYPE_LABELS[type] || type;

                  return (
                    <div key={type}>
                      <button
                        onClick={() => toggleType(type)}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted/60 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-3 w-3 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: color }}
                        />
                        <span className="text-xs font-medium text-foreground">{label}</span>
                        <span className="ml-auto text-[10px] text-muted-foreground font-medium">
                          {typeNodes.length}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="ml-7 mt-1 mb-2 space-y-0.5">
                          {typeNodes.map((n) => (
                            <div
                              key={n.id}
                              className="flex items-center gap-2 rounded px-2 py-1 text-[11px] hover:bg-card transition-colors group/node"
                            >
                              <button
                                onClick={() => {
                                  onFocusNode(n.id);
                                  onSwitchToCanvas();
                                }}
                                className="flex-1 text-left text-muted-foreground hover:text-primary transition-colors truncate"
                              >
                                {(n.data?.text as string)?.slice(0, 50) || (n.data?.label as string) || (n.data?.url as string)?.slice(0, 40) || `${label} node`}
                              </button>
                              {onAssignNode && modules.length > 0 && (
                                <Select
                                  onValueChange={(moduleId) => onAssignNode(n.id, moduleId)}
                                >
                                  <SelectTrigger className="h-5 w-20 border-none bg-transparent text-[10px] text-muted-foreground opacity-0 group-hover/node:opacity-100 transition-opacity focus:ring-0 [&>svg]:h-2.5 [&>svg]:w-2.5">
                                    <SelectValue placeholder="Assign" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {modules.map((m) => (
                                      <SelectItem key={m.id} value={m.id} className="text-xs">
                                        <span className="mr-1 inline-block h-2 w-2 rounded-sm" style={{ background: m.color }} />
                                        {m.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty state */}
          {modules.length === 0 && unassigned.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <Box className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-medium text-foreground">No structure yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add modules in Canvas view to organize your flow
              </p>
              <button
                onClick={onSwitchToCanvas}
                className="mt-3 inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <MousePointerClick className="h-3 w-3" />
                Switch to Canvas
              </button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
