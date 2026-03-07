import { Handle, Position, NodeProps } from "@xyflow/react";
import { Globe } from "lucide-react";

export function WebhookNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`min-w-[200px] rounded-xl border-2 bg-card shadow-lg transition-shadow ${
        selected ? "border-node-webhook shadow-xl ring-2 ring-node-webhook/30" : "border-border"
      }`}
    >
      <div className="flex items-center gap-2 rounded-t-[10px] bg-node-webhook px-3 py-2">
        <Globe className="h-4 w-4 text-primary-foreground" />
        <span className="text-sm font-semibold text-primary-foreground">Webhook</span>
      </div>
      <div className="p-3">
        <p className="text-xs font-mono text-muted-foreground truncate max-w-[180px]">
          {(data as any).url || "https://..."}
        </p>
        <span className="mt-1 inline-block rounded bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground">
          {(data as any).method || "GET"}
        </span>
      </div>
      <Handle type="target" position={Position.Top} className="!bg-node-webhook !w-3 !h-3 !border-2 !border-card" />
      <Handle type="source" position={Position.Bottom} className="!bg-node-webhook !w-3 !h-3 !border-2 !border-card" />
    </div>
  );
}
