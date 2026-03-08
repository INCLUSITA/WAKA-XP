import { useMemo } from "react";
import { Node, Edge, useReactFlow } from "@xyflow/react";
import {
  Layers, Box, ChevronRight, MousePointerClick, Package,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FlowModule } from "@/hooks/useFlowModules";

interface StructuredViewProps {
  nodes: Node[];
  edges: Edge[];
  modules: FlowModule[];
  onFocusModule: (moduleId: string) => void;
  onFocusNode: (nodeId: string) => void;
  onSwitchToCanvas: () => void;
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
};

export function StructuredView({
  nodes,
  edges,
  modules,
  onFocusModule,
  onFocusNode,
  onSwitchToCanvas,
}: StructuredViewProps) {
  const regularNodes = nodes.filter((n) => n.type !== "moduleGroup");

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

  // Module connections (simplified)
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

                  {/* Node summary */}
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

                  {/* Connections */}
                  {targets.length > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                      <ChevronRight className="h-2.5 w-2.5" />
                      {targets.join(", ")}
                    </div>
                  )}
                </button>
              </div>
            );
          })}

          {/* Unassigned nodes */}
          {unassigned.length > 0 && (
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Unassigned Nodes
                </span>
                <Badge variant="outline" className="ml-auto text-[10px]">
                  {unassigned.length}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {unassigned.map((n) => (
                  <span
                    key={n.id}
                    onClick={() => {
                      onFocusNode(n.id);
                      onSwitchToCanvas();
                    }}
                    className="cursor-pointer rounded bg-card px-1.5 py-0.5 text-[10px] text-muted-foreground border border-border hover:border-primary/30 hover:text-primary transition-colors"
                  >
                    <span
                      className="mr-1 inline-block h-1.5 w-1.5 rounded-full"
                      style={{ background: NODE_TYPE_COLORS[n.type || ""] || "hsl(var(--muted-foreground))" }}
                    />
                    {NODE_TYPE_LABELS[n.type || ""] || n.type}
                  </span>
                ))}
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
