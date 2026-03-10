import { Handle, Position, NodeProps } from "@xyflow/react";
import { Users } from "lucide-react";

export function AddGroupNode({ data, selected }: NodeProps) {
  const groupName = (data as any).groupName || "Group";

  return (
    <div
      className={`min-w-[180px] rounded-xl border-2 bg-card px-3 py-2.5 shadow-md transition-shadow ${
        selected ? "border-primary shadow-lg ring-2 ring-primary/20" : "border-emerald-500/40"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-emerald-500 !w-2.5 !h-2.5" />
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15">
          <Users className="h-3.5 w-3.5 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Add to Group</p>
          <p className="text-xs text-foreground truncate">{groupName}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-emerald-500 !w-2.5 !h-2.5" />
    </div>
  );
}
