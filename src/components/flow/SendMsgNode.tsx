import { Handle, Position, NodeProps } from "@xyflow/react";
import { MessageSquare } from "lucide-react";

export function SendMsgNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`min-w-[200px] rounded-xl border-2 bg-card shadow-lg transition-shadow ${
        selected ? "border-node-send shadow-xl ring-2 ring-node-send/30" : "border-border"
      }`}
    >
      <div className="flex items-center gap-2 rounded-t-[10px] bg-node-send px-3 py-2">
        <MessageSquare className="h-4 w-4 text-primary-foreground" />
        <span className="text-sm font-semibold text-primary-foreground">Enviar Mensaje</span>
      </div>
      <div className="p-3">
        <p className="text-sm text-foreground line-clamp-3">
          {(data as any).text || "Sin mensaje configurado"}
        </p>
        {(data as any).quick_replies?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {(data as any).quick_replies.map((r: string, i: number) => (
              <span key={i} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                {r}
              </span>
            ))}
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Top} className="!bg-node-send !w-3 !h-3 !border-2 !border-card" />
      <Handle type="source" position={Position.Bottom} className="!bg-node-send !w-3 !h-3 !border-2 !border-card" />
    </div>
  );
}
