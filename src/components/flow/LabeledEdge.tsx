import { EdgeProps, getBezierPath, EdgeLabelRenderer } from "@xyflow/react";
import { CornerDownRight } from "lucide-react";

export function LabeledEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const displayLabel = (label as string) || (data as any)?.label || "";
  const isDefault = displayLabel === "Other";

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {displayLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className={`flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold shadow-sm backdrop-blur-sm ${
              isDefault
                ? "border-border/40 bg-muted/90 text-muted-foreground"
                : "border-primary/20 bg-card/95 text-foreground"
            }`}
          >
            <CornerDownRight className={`h-2.5 w-2.5 ${
              isDefault ? "text-muted-foreground/50" : "text-primary/60"
            }`} />
            {displayLabel}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
