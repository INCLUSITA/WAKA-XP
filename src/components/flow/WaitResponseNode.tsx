import { Handle, Position, NodeProps } from "@xyflow/react";
import { Clock, Timer } from "lucide-react";

export function WaitResponseNode({ data, selected }: NodeProps) {
  const d = data as any;
  const hasTimeout = d.timeoutSeconds && d.timeoutSeconds > 0;
  const timeoutLabel = hasTimeout
    ? `${d.timeoutSeconds}${(d.timeoutUnit || "minutes").charAt(0)}`
    : null;

  return (
    <div
      className={`min-w-[200px] max-w-[280px] rounded-lg border bg-white shadow-md transition-all ${
        selected ? "ring-2 ring-node-wait/50 shadow-lg" : "border-border/60"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 rounded-t-lg bg-node-wait px-3 py-1.5">
        <Clock className="h-3.5 w-3.5 text-primary-foreground" />
        <span className="text-xs font-bold tracking-wide text-primary-foreground uppercase">Wait for Response</span>
        {hasTimeout && (
          <span className="ml-auto flex items-center gap-0.5 rounded-full bg-white/20 px-1.5 py-0.5" title={`Timeout: ${d.timeoutSeconds} ${d.timeoutUnit || "minutes"}`}>
            <Timer className="h-2.5 w-2.5 text-primary-foreground" />
            <span className="text-[9px] font-semibold text-primary-foreground">{timeoutLabel}</span>
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-3 py-2.5">
        <p className="text-[13px] text-muted-foreground">
          {d.label || "Waiting for user response..."}
        </p>
        {d.categories?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t border-border/40 pt-2">
            {d.categories.map((c: string, i: number) => (
              <div key={i} className="flex items-center gap-1.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-node-wait" />
                <span className="font-medium text-foreground">{c}</span>
              </div>
            ))}
            {hasTimeout && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="font-medium text-amber-600 italic">Timeout</span>
              </div>
            )}
          </div>
        )}
      </div>

      <Handle type="target" position={Position.Top} className="!bg-node-wait !w-2.5 !h-2.5 !border-2 !border-white !-top-1" />
      <Handle type="source" position={Position.Bottom} className="!bg-node-wait !w-2.5 !h-2.5 !border-2 !border-white !-bottom-1" id="default" />
      {hasTimeout && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="Timeout"
          className="!bg-amber-500 !w-2.5 !h-2.5 !border-2 !border-white !-bottom-1"
          style={{ left: "75%" }}
        />
      )}
    </div>
  );
}
