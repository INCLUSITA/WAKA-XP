import { Handle, Position, NodeProps } from "@xyflow/react";
import { GitBranch } from "lucide-react";

export function SplitNode({ data, selected }: NodeProps) {
  const d = data as any;
  return (
    <div
      className={`min-w-[200px] max-w-[280px] rounded-lg border bg-white shadow-md transition-all ${
        selected ? "ring-2 ring-node-split/50 shadow-lg" : "border-border/60"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 rounded-t-lg bg-node-split px-3 py-1.5">
        <GitBranch className="h-3.5 w-3.5 text-primary-foreground" />
        <span className="text-xs font-bold tracking-wide text-primary-foreground uppercase">Split by Expression</span>
      </div>

      {/* Body */}
      <div className="px-3 py-2.5">
        <p className="text-xs font-mono text-muted-foreground bg-muted/50 rounded px-2 py-1">
          {d.operand || "@input.text"}
        </p>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t border-border/40 pt-2">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="h-2 w-2 rounded-full bg-node-split" />
            <span className="font-medium text-foreground">Has Text</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
            <span className="font-medium text-muted-foreground">Other</span>
          </div>
        </div>
      </div>

      <Handle type="target" position={Position.Top} className="!bg-node-split !w-2.5 !h-2.5 !border-2 !border-white !-top-1" />
      <Handle type="source" position={Position.Bottom} className="!bg-node-split !w-2.5 !h-2.5 !border-2 !border-white !-bottom-1" />
    </div>
  );
}
