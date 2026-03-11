import { Play } from "lucide-react";

/**
 * Lightweight "START" marker rendered above the entry node's top handle.
 * Drop this inside any node component when `data._isEntryNode` is true.
 */
export function EntryNodeMarker({ inferred }: { inferred?: boolean }) {
  return (
    <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 shadow-sm z-10">
      <Play className="h-2.5 w-2.5 text-primary fill-primary" />
      <span className="text-[9px] font-bold uppercase tracking-wider text-primary">
        Start
      </span>
      {inferred && (
        <span className="text-[8px] text-primary/60 font-medium">(inferred)</span>
      )}
    </div>
  );
}
