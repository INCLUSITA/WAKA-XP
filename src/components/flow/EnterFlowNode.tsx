import { Handle, Position, NodeProps } from "@xyflow/react";
import { Workflow } from "lucide-react";
import { EntryNodeMarker } from "./EntryNodeMarker";

export function EnterFlowNode({ data, selected }: NodeProps) {
  const d = data as any;
  return (
    <div
      className={`relative min-w-[200px] max-w-[280px] rounded-lg border bg-white shadow-md transition-all ${
        selected ? "ring-2 ring-[hsl(190,70%,45%)]/50 shadow-lg" : "border-border/60"
      }`}
    >
      {d._isEntryNode && <EntryNodeMarker inferred={d._entryInferred} ambiguous={d._entryAmbiguous} pinned={d._isPinnedStart} triggerReady={d._triggerReady} />}
      <div className="flex items-center gap-2 rounded-t-lg px-3 py-1.5" style={{ background: "hsl(190, 70%, 45%)" }}>
        <Workflow className="h-3.5 w-3.5 text-white" />
        <span className="text-xs font-bold tracking-wide text-white uppercase">Enter Another Flow</span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-[13px] text-foreground">{d.flowName || "Select a flow..."}</p>
      </div>
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !border-2 !border-white !-top-1" style={{ background: "hsl(190, 70%, 45%)" }} />
      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !border-2 !border-white !-bottom-1" style={{ background: "hsl(190, 70%, 45%)" }} />
    </div>
  );
}
