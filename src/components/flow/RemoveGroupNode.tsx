import { Handle, Position, NodeProps } from "@xyflow/react";
import { UserMinus } from "lucide-react";
import { EntryNodeMarker } from "./EntryNodeMarker";

export function RemoveGroupNode({ data, selected }: NodeProps) {
  const d = data as any;
  const groupName = d.groupName || "Group";

  return (
    <div
      className={`relative min-w-[180px] rounded-xl border-2 bg-card px-3 py-2.5 shadow-md transition-shadow ${
        selected ? "border-primary shadow-lg ring-2 ring-primary/20" : "border-orange-500/40"
      }`}
    >
      {d._isEntryNode && <EntryNodeMarker inferred={d._entryInferred} ambiguous={d._entryAmbiguous} pinned={d._isPinnedStart} />}
      <Handle type="target" position={Position.Top} className="!bg-orange-500 !w-2.5 !h-2.5" />
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/15">
          <UserMinus className="h-3.5 w-3.5 text-orange-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-orange-600">Remove from Group</p>
          <p className="text-xs text-foreground truncate">{groupName}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-orange-500 !w-2.5 !h-2.5" />
    </div>
  );
}
