import { Handle, Position, NodeProps } from "@xyflow/react";
import { Clock } from "lucide-react";

export function WaitResponseNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`min-w-[200px] rounded-xl border-2 bg-card shadow-lg transition-shadow ${
        selected ? "border-node-wait shadow-xl ring-2 ring-node-wait/30" : "border-border"
      }`}
    >
      <div className="flex items-center gap-2 rounded-t-[10px] bg-node-wait px-3 py-2">
        <Clock className="h-4 w-4 text-primary-foreground" />
        <span className="text-sm font-semibold text-primary-foreground">Esperar Respuesta</span>
      </div>
      <div className="p-3">
        <p className="text-sm text-muted-foreground">
          {(data as any).label || "Esperando respuesta del usuario..."}
        </p>
        {(data as any).categories?.length > 0 && (
          <div className="mt-2 space-y-1">
            {(data as any).categories.map((c: string, i: number) => (
              <div key={i} className="flex items-center gap-1.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-node-wait" />
                <span className="text-foreground">{c}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Top} className="!bg-node-wait !w-3 !h-3 !border-2 !border-card" />
      <Handle type="source" position={Position.Bottom} className="!bg-node-wait !w-3 !h-3 !border-2 !border-card" />
    </div>
  );
}
