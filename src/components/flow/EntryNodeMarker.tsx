import { Play, AlertTriangle, Pin, Zap } from "lucide-react";

/**
 * Lightweight "START" marker rendered above the entry node's top handle.
 * Shows green for clear/pinned entry, amber for ambiguous root nodes.
 * When trigger-ready, shows a ⚡ icon to signal the node can be auto-launched.
 */
export function EntryNodeMarker({ inferred, ambiguous, pinned, triggerReady }: { inferred?: boolean; ambiguous?: boolean; pinned?: boolean; triggerReady?: boolean }) {
  if (ambiguous && !pinned) {
    return (
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 shadow-sm z-10">
        <AlertTriangle className="h-2.5 w-2.5 text-amber-600" />
        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600">
          Root
        </span>
      </div>
    );
  }

  return (
    <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 shadow-sm z-10">
      {pinned ? (
        <Pin className="h-2.5 w-2.5 text-primary" />
      ) : (
        <Play className="h-2.5 w-2.5 text-primary fill-primary" />
      )}
      <span className="text-[9px] font-bold uppercase tracking-wider text-primary">
        Start
      </span>
      {triggerReady && (
        <Zap className="h-2.5 w-2.5 text-primary fill-primary/30" />
      )}
      {inferred && !pinned && !triggerReady && (
        <span className="text-[8px] text-primary/60 font-medium">(inferred)</span>
      )}
    </div>
  );
}
