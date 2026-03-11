import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Zap, ZapOff, Navigation, AlertTriangle, CheckCircle2 } from "lucide-react";
import { TriggerReadiness } from "@/lib/flowValidation";
import { Node } from "@xyflow/react";

interface RootNodeInfo {
  id: string;
  type: string;
  label: string;
}

interface TriggerReadinessBadgeProps {
  readiness: TriggerReadiness;
  compact?: boolean;
  nodes?: Node[];
  onFocusNode?: (nodeId: string) => void;
}

function getNodeLabel(node: Node): string {
  const d = node.data as Record<string, any>;
  return d.text?.slice(0, 30) || d.label || d.resultName || d.flowName || d.topic || d.url || d.prompt?.slice(0, 30) || node.type || node.id.slice(0, 8);
}

export function TriggerReadinessBadge({ readiness, compact = false, nodes = [], onFocusNode }: TriggerReadinessBadgeProps) {
  const Icon = readiness.ready ? Zap : ZapOff;

  const rootNodes: RootNodeInfo[] = readiness.rootNodeIds
    .map((id) => {
      const node = nodes.find((n) => n.id === id);
      if (!node) return null;
      return { id, type: node.type || "unknown", label: getNodeLabel(node) };
    })
    .filter(Boolean) as RootNodeInfo[];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors cursor-pointer ${
            readiness.ready
              ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15"
              : "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/15"
          }`}
        >
          <Icon className="h-3 w-3" />
          {!compact && (readiness.ready ? "Trigger-ready" : "Not launchable")}
        </button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-72 p-0">
        {/* Header */}
        <div className={`flex items-center gap-2 px-3 py-2 border-b ${
          readiness.ready ? "bg-primary/5 border-primary/10" : "bg-destructive/5 border-destructive/10"
        }`}>
          {readiness.ready ? (
            <CheckCircle2 className="h-4 w-4 text-primary" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          )}
          <span className="text-xs font-semibold">
            {readiness.ready ? "✓ Ready to trigger" : "✗ Not trigger-ready"}
          </span>
        </div>

        {/* Reason */}
        <div className="px-3 py-2 border-b border-border/50">
          <p className="text-xs text-muted-foreground">{readiness.reason}</p>
        </div>

        {/* Root nodes list */}
        {rootNodes.length > 0 && (
          <div className="px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              {rootNodes.length === 1 ? "Entry node" : `${rootNodes.length} root nodes (disconnected)`}
            </p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {rootNodes.map((rn) => (
                <button
                  key={rn.id}
                  onClick={() => onFocusNode?.(rn.id)}
                  className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-left text-xs hover:bg-accent/10 transition-colors group"
                >
                  <Navigation className="h-3 w-3 text-muted-foreground group-hover:text-primary shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-foreground">{rn.label}</span>
                    <span className="ml-1.5 text-[10px] text-muted-foreground font-mono">{rn.type}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Guidance */}
        {!readiness.ready && (
          <div className="px-3 py-2 border-t border-border/50 bg-muted/30">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {rootNodes.length > 1
                ? "💡 Connect the extra root nodes to the main flow so only one entry point remains."
                : rootNodes.length === 0
                ? "💡 Add a first node or disconnect a node from incoming edges to define the entry point."
                : "💡 Configure this node with valid content to make the flow launchable."}
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
