import { Handle, Position, NodeProps } from "@xyflow/react";
import { GitBranch } from "lucide-react";

export function SplitNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`min-w-[200px] rounded-xl border-2 bg-card shadow-lg transition-shadow ${
        selected ? "border-node-split shadow-xl ring-2 ring-node-split/30" : "border-border"
      }`}
    >
      <div className="flex items-center gap-2 rounded-t-[10px] bg-node-split px-3 py-2">
        <GitBranch className="h-4 w-4 text-primary-foreground" />
        <span className="text-sm font-semibold text-primary-foreground">Dividir por Expresión</span>
      </div>
      <div className="p-3">
        <p className="text-xs font-mono text-muted-foreground">
          {(data as any).operand || "@input.text"}
        </p>
      </div>
      <Handle type="target" position={Position.Top} className="!bg-node-split !w-3 !h-3 !border-2 !border-card" />
      <Handle type="source" position={Position.Bottom} className="!bg-node-split !w-3 !h-3 !border-2 !border-card" />
    </div>
  );
}
