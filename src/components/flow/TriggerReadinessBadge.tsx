import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Zap, ZapOff, Navigation, AlertTriangle, CheckCircle2, Pin, PinOff } from "lucide-react";
import { TriggerReadiness } from "@/lib/flowValidation";
import { Node } from "@xyflow/react";
import { toast } from "sonner";

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
  pinnedStartNodeId?: string | null;
  onPinStartNode?: (nodeId: string | null) => void;
}

function getNodeLabel(node: Node): string {
  const d = node.data as Record<string, any>;
  return d.text?.slice(0, 30) || d.label || d.resultName || d.flowName || d.topic || d.url || d.prompt?.slice(0, 30) || node.type || node.id.slice(0, 8);
}

export function TriggerReadinessBadge({ readiness, compact = false, nodes = [], onFocusNode, pinnedStartNodeId, onPinStartNode }: TriggerReadinessBadgeProps) {
  const Icon = readiness.ready ? Zap : ZapOff;

  const rootNodes: RootNodeInfo[] = readiness.rootNodeIds
    .map((id) => {
      const node = nodes.find((n) => n.id === id);
      if (!node) return null;
      return { id, type: node.type || "unknown", label: getNodeLabel(node) };
    })
    .filter(Boolean) as RootNodeInfo[];

  const handlePin = (nodeId: string) => {
    onPinStartNode?.(nodeId);
    toast.success("Start Flow pinned", { description: "This node is now the explicit entry point." });
  };

  const handleUnpin = () => {
    onPinStartNode?.(null);
    toast.info("Start Flow unpinned", { description: "Entry point will be inferred automatically." });
  };

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
          {pinnedStartNodeId && <Pin className="h-2.5 w-2.5 ml-0.5" />}
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

        {/* Pinned start info */}
        {pinnedStartNodeId && (
          <div className="px-3 py-2 border-b border-border/50 bg-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Pin className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-semibold text-primary">Start pinned</span>
              </div>
              <button
                onClick={handleUnpin}
                className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <PinOff className="h-2.5 w-2.5" />
                Unpin
              </button>
            </div>
          </div>
        )}

        {/* Root nodes list */}
        {rootNodes.length > 0 && (
          <div className="px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              {rootNodes.length === 1 ? "Entry node" : `${rootNodes.length} root nodes`}
            </p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {rootNodes.map((rn) => (
                <div key={rn.id} className="flex items-center gap-1">
                  <button
                    onClick={() => onFocusNode?.(rn.id)}
                    className="flex items-center gap-2 flex-1 min-w-0 rounded-md px-2 py-1.5 text-left text-xs hover:bg-accent/10 transition-colors group"
                  >
                    <Navigation className="h-3 w-3 text-muted-foreground group-hover:text-primary shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-foreground">{rn.label}</span>
                      <span className="ml-1.5 text-[10px] text-muted-foreground font-mono">{rn.type}</span>
                    </div>
                    {pinnedStartNodeId === rn.id && (
                      <Pin className="h-2.5 w-2.5 text-primary shrink-0" />
                    )}
                  </button>
                  {pinnedStartNodeId !== rn.id && onPinStartNode && (
                    <button
                      onClick={() => handlePin(rn.id)}
                      className="rounded-md p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors shrink-0"
                      title="Set as Start Flow"
                    >
                      <Pin className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guidance */}
        {!readiness.ready && !pinnedStartNodeId && (
          <div className="px-3 py-2 border-t border-border/50 bg-muted/30">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {rootNodes.length > 1
                ? "💡 Pin one node as Start, or connect the extras to the main flow."
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
