import { Handle, Position, NodeProps } from "@xyflow/react";
import { Bot } from "lucide-react";
import { EntryNodeMarker } from "./EntryNodeMarker";

export function CallAINode({ data, selected }: NodeProps) {
  const d = data as any;
  return (
    <div
      className={`relative min-w-[200px] max-w-[280px] rounded-lg border bg-white shadow-md transition-all ${
        selected ? "ring-2 ring-[hsl(270,70%,55%)]/50 shadow-lg" : "border-border/60"
      }`}
    >
      {d._isEntryNode && <EntryNodeMarker inferred={d._entryInferred} />}
      <div className="flex items-center gap-2 rounded-t-lg px-3 py-1.5" style={{ background: "hsl(270, 70%, 55%)" }}>
        <Bot className="h-3.5 w-3.5 text-white" />
        <span className="text-xs font-bold tracking-wide text-white uppercase">Call AI Service</span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-[13px] text-foreground">{d.prompt || "AI prompt..."}</p>
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
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !border-2 !border-white !-top-1" style={{ background: "hsl(270, 70%, 55%)" }} />
      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !border-2 !border-white !-bottom-1" style={{ background: "hsl(270, 70%, 55%)" }} />
    </div>
  );
}
