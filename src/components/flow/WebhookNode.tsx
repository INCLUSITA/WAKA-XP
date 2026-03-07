import { Handle, Position, NodeProps } from "@xyflow/react";
import { Globe } from "lucide-react";

export function WebhookNode({ data, selected }: NodeProps) {
  const d = data as any;
  return (
    <div
      className={`min-w-[200px] max-w-[280px] rounded-lg border bg-white shadow-md transition-all ${
        selected ? "ring-2 ring-node-webhook/50 shadow-lg" : "border-border/60"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 rounded-t-lg bg-node-webhook px-3 py-1.5">
        <Globe className="h-3.5 w-3.5 text-primary-foreground" />
        <span className="text-xs font-bold tracking-wide text-primary-foreground uppercase">Call Webhook</span>
      </div>

      {/* Body */}
      <div className="px-3 py-2.5">
        <p className="text-xs font-mono text-muted-foreground truncate max-w-[240px] bg-muted/50 rounded px-2 py-1">
          {d.url || "https://..."}
        </p>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t border-border/40 pt-2">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="h-2 w-2 rounded-full bg-node-send" />
            <span className="font-medium text-foreground">Success</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="h-2 w-2 rounded-full bg-destructive" />
            <span className="font-medium text-foreground">Failure</span>
          </div>
        </div>
      </div>

      <Handle type="target" position={Position.Top} className="!bg-node-webhook !w-2.5 !h-2.5 !border-2 !border-white !-top-1" />
      <Handle type="source" position={Position.Bottom} className="!bg-node-webhook !w-2.5 !h-2.5 !border-2 !border-white !-bottom-1" />
    </div>
  );
}
