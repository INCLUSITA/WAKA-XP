import { useMemo, useState } from "react";
import { Node, Edge } from "@xyflow/react";
import {
  Layers, Box, ChevronRight, ChevronDown, MousePointerClick, Package, ArrowRight, Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FlowModule } from "@/hooks/useFlowModules";
import { toast } from "sonner";
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
  sendMsg: "hsl(160, 84%, 39%)",
  waitResponse: "hsl(220, 80%, 55%)",
  splitExpression: "hsl(260, 60%, 55%)",
  webhook: "hsl(30, 90%, 55%)",
  saveResult: "hsl(45, 80%, 50%)",
  updateContact: "hsl(200, 70%, 50%)",
  sendEmail: "hsl(340, 70%, 50%)",
  callAI: "hsl(270, 70%, 55%)",
  enterFlow: "hsl(190, 70%, 45%)",
  callZapier: "hsl(20, 90%, 55%)",
  sendAirtime: "hsl(50, 80%, 50%)",
  openTicket: "hsl(15, 80%, 50%)",
};

function getNodePreview(n: Node): string {
  const text = n.data?.text as string;
  if (text) return text.replace(/\n/g, " ").slice(0, 60);
  const label = n.data?.label as string;
  if (label) return label;
  const url = n.data?.url as string;
  if (url) return url.slice(0, 50);
  const prompt = n.data?.prompt as string;
  if (prompt) return prompt.slice(0, 50);
  return NODE_TYPE_LABELS[n.type || ""] || "Node";
}

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

  const unassignedByType = useMemo(() => {
    const byType: Record<string, Node[]> = {};
    for (const n of unassigned) {
      const t = n.type || "unknown";
      if (!byType[t]) byType[t] = [];
      byType[t].push(n);
    }
    return Object.entries(byType).sort((a, b) => b[1].length - a[1].length);
  }, [unassigned]);

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

  const handleAssign = (nodeId: string, moduleId: string) => {
    onAssignNode?.(nodeId, moduleId);
    const mod = modules.find((m) => m.id === moduleId);
    if (mod) {
      toast.success(`Node assigned to ${mod.label}`, { duration: 1500 });
    }
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-3.5">
        <Layers className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-bold text-foreground tracking-wide">Structure View</h2>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] font-medium px-2">
            {modules.length} {modules.length === 1 ? "module" : "modules"}
          </Badge>
          <Badge variant="outline" className="text-[10px] font-medium px-2">
            {regularNodes.length} nodes
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-5 space-y-4">
          {/* Modules */}
          {modules.map((mod) => {
            const modNodes = grouped[mod.id] || [];
            const outgoing = moduleConnections.filter((c) => c.from === mod.id);
            const targets = outgoing.map((c) => modules.find((m) => m.id === c.to)?.label).filter(Boolean);

            return (
              <div key={mod.id}>
                <button
                  onClick={() => onFocusModule(mod.id)}
                  className="w-full rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/40 hover:shadow-lg group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-4 w-1 rounded-full"
                      style={{ background: mod.color }}
                    />
                    <span className="text-sm font-bold tracking-wide" style={{ color: mod.color }}>
                      {mod.label}
                    </span>
                    <Badge variant="secondary" className="ml-auto text-[10px] font-medium">
                      {modNodes.length} {modNodes.length === 1 ? "node" : "nodes"}
                    </Badge>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {modNodes.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5 pl-5">
                      {modNodes.slice(0, 8).map((n) => (
                        <span
                          key={n.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onFocusNode(n.id);
                          }}
                          className="cursor-pointer rounded-md bg-muted/80 px-2 py-1 text-[10px] text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-1"
                        >
                          <span
                            className="inline-block h-1.5 w-1.5 rounded-full flex-shrink-0"
                            style={{ background: NODE_TYPE_COLORS[n.type || ""] || "hsl(var(--muted-foreground))" }}
                          />
                          {NODE_TYPE_LABELS[n.type || ""] || n.type}
                        </span>
                      ))}
                      {modNodes.length > 8 && (
                        <span className="text-[10px] text-muted-foreground/60 self-center">
                          +{modNodes.length - 8} more
                        </span>
                      )}
                    </div>
                  )}

                  {modNodes.length === 0 && (
                    <p className="mt-2 pl-5 text-[10px] text-muted-foreground/50 italic">
                      No nodes assigned yet — use Structure View or drag nodes in Canvas
                    </p>
                  )}

                  {targets.length > 0 && (
                    <div className="mt-2 pl-5 flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
                      <ArrowRight className="h-2.5 w-2.5" />
                      <span>{targets.join(" → ")}</span>
                    </div>
                  )}
                </button>
              </div>
            );
          })}

          {/* Divider between modules and unassigned */}
          {modules.length > 0 && unassigned.length > 0 && (
            <div className="border-t border-border" />
          )}

          {/* Unassigned nodes — grouped by type */}
          {unassigned.length > 0 && (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-4">
              <div className="flex items-center gap-2.5 mb-3">
                <Package className="h-4 w-4 text-muted-foreground/60" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Unassigned Nodes
                </span>
                <Badge variant="outline" className="ml-auto text-[10px] font-medium">
                  {unassigned.length}
                </Badge>
              </div>

              <div className="space-y-0.5">
                {unassignedByType.map(([type, typeNodes]) => {
                  const isExpanded = expandedTypes.has(type);
                  const color = NODE_TYPE_COLORS[type] || "hsl(var(--muted-foreground))";
                  const label = NODE_TYPE_LABELS[type] || type;

                  return (
                    <div key={type}>
                      <button
                        onClick={() => toggleType(type)}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left hover:bg-muted/60 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-3 w-3 text-muted-foreground/70" />
                        ) : (
                          <ChevronRight className="h-3 w-3 text-muted-foreground/70" />
                        )}
                        <span
                          className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                          style={{ background: color }}
                        />
                        <span className="text-xs font-semibold text-foreground">{label}</span>
                        <span className="ml-auto text-[10px] text-muted-foreground font-medium tabular-nums">
                          {typeNodes.length}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="ml-8 mt-0.5 mb-2 space-y-px border-l-2 border-border/40 pl-3">
                          {typeNodes.slice(0, 30).map((n) => (
                            <div
                              key={n.id}
                              className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px] hover:bg-card transition-colors group/node"
                            >
                              <button
                                onClick={() => onFocusNode(n.id)}
                                className="flex-1 text-left text-muted-foreground hover:text-primary transition-colors truncate leading-snug"
                                title={getNodePreview(n)}
                              >
                                {getNodePreview(n)}
                              </button>
                              {onAssignNode && modules.length > 0 && (
                                <Select
                                  onValueChange={(moduleId) => handleAssign(n.id, moduleId)}
                                >
                                  <SelectTrigger className="h-5 w-[72px] border border-border/50 bg-transparent text-[9px] text-muted-foreground opacity-0 group-hover/node:opacity-100 transition-opacity focus:ring-0 rounded [&>svg]:h-2 [&>svg]:w-2">
                                    <SelectValue placeholder="Assign →" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {modules.map((m) => (
                                      <SelectItem key={m.id} value={m.id} className="text-xs">
                                        <span className="mr-1.5 inline-block h-2 w-2 rounded-sm" style={{ background: m.color }} />
                                        {m.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          ))}
                          {typeNodes.length > 30 && (
                            <p className="px-2.5 py-1 text-[10px] text-muted-foreground/50 italic">
                              +{typeNodes.length - 30} more nodes
                            </p>
                          )}
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
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
              <Box className="mx-auto h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-semibold text-foreground">No structure yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Create modules in Canvas view to organize your flow into logical sections
              </p>
              <button
                onClick={onSwitchToCanvas}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <MousePointerClick className="h-3.5 w-3.5" />
                Switch to Canvas
              </button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
