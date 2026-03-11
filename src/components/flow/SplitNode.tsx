import { Handle, Position, NodeProps } from "@xyflow/react";
import { GitBranch, CornerDownRight } from "lucide-react";
import { EntryNodeMarker } from "./EntryNodeMarker";

const SPLIT_TYPE_LABELS: Record<string, string> = {
  splitExpression: "Split by Expression",
  splitContactField: "Split by Contact Field",
  splitResult: "Split by Flow Result",
  splitRandom: "Split by Random",
  splitGroup: "Split by Group",
};

export function SplitNode({ data, selected, type }: NodeProps) {
  const d = data as any;
  const cases: string[] = d.cases || [];
  const allCategories = [...cases.filter((c: string) => c.trim()), "Other"];
  const splitLabel = SPLIT_TYPE_LABELS[type || ""] || "Split";

  return (
    <div
      className={`relative min-w-[220px] max-w-[300px] rounded-lg border bg-card shadow-md transition-all ${
        selected ? "ring-2 ring-node-split/50 shadow-lg" : "border-border/60"
      }`}
    >
      {d._isEntryNode && <EntryNodeMarker inferred={d._entryInferred} ambiguous={d._entryAmbiguous} />}
      {/* Header */}
      <div className="flex items-center gap-2 rounded-t-lg bg-node-split px-3 py-1.5">
        <GitBranch className="h-3.5 w-3.5 text-primary-foreground" />
        <span className="text-xs font-bold tracking-wide text-primary-foreground uppercase">
          {splitLabel}
        </span>
      </div>

      {/* Operand */}
      <div className="px-3 py-2">
        <p className="text-xs font-mono text-muted-foreground bg-muted/50 rounded px-2 py-1 truncate">
          {d.operand || "@input.text"}
        </p>
      </div>

      {/* Branch categories */}
      <div className="px-3 pb-2.5 space-y-1">
        {allCategories.map((cat, idx) => {
          const isDefault = cat === "Other";
          return (
            <div
              key={`${cat}-${idx}`}
              className={`flex items-center gap-2 rounded px-2 py-1 text-xs transition-colors ${
                isDefault
                  ? "bg-muted/30 text-muted-foreground"
                  : "bg-node-split/8 text-foreground"
              }`}
            >
              <CornerDownRight className={`h-3 w-3 shrink-0 ${
                isDefault ? "text-muted-foreground/50" : "text-node-split"
              }`} />
              <span className={`font-medium truncate ${isDefault ? "italic" : ""}`}>
                {cat || `Case ${idx + 1}`}
              </span>
              <span className={`ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                isDefault
                  ? "bg-muted text-muted-foreground"
                  : "bg-node-split/15 text-node-split"
              }`}>
                {isDefault ? "default" : `#${idx + 1}`}
              </span>
            </div>
          );
        })}
      </div>

      {/* Incoming handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-node-split !w-2.5 !h-2.5 !border-2 !border-white !-top-1"
      />

      {/* Per-category source handles */}
      {allCategories.map((cat, idx) => {
        const total = allCategories.length;
        // Distribute handles evenly along bottom
        const leftPct = total === 1 ? 50 : (idx / (total - 1)) * 80 + 10;
        return (
          <Handle
            key={`handle-${cat}-${idx}`}
            type="source"
            position={Position.Bottom}
            id={cat}
            className={`!w-2.5 !h-2.5 !border-2 !border-white !-bottom-1 ${
              cat === "Other" ? "!bg-muted-foreground/50" : "!bg-node-split"
            }`}
            style={{ left: `${leftPct}%` }}
          />
        );
      })}
    </div>
  );
}
