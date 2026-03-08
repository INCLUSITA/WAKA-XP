import { ChevronLeft, ChevronRight, History, RotateCcw } from "lucide-react";

export interface SandboxVersion {
  id: string;
  jsx: string;
  timestamp: string;
  label: string; // e.g. "Original", "Applied: Make onboarding shorter"
}

interface SandboxVersionBarProps {
  versions: SandboxVersion[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  onRestore: (index: number) => void;
}

export default function SandboxVersionBar({ versions, currentIndex, onNavigate, onRestore }: SandboxVersionBarProps) {
  if (versions.length <= 1) return null;

  const current = versions[currentIndex];
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < versions.length - 1;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/5 bg-slate-800/50">
      <History className="h-3 w-3 text-violet-400/50 shrink-0" />
      <span className="text-[10px] text-white/30 font-semibold">Sandbox versions</span>

      <div className="flex items-center gap-1 ml-2">
        <button
          onClick={() => onNavigate(currentIndex - 1)}
          disabled={!canGoBack}
          className="rounded p-0.5 text-white/30 hover:text-white/60 hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition"
          title="Previous version"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        <span className="text-[10px] text-white/50 font-mono min-w-[3ch] text-center">
          {currentIndex + 1}/{versions.length}
        </span>

        <button
          onClick={() => onNavigate(currentIndex + 1)}
          disabled={!canGoForward}
          className="rounded p-0.5 text-white/30 hover:text-white/60 hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition"
          title="Next version"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <span className="text-[10px] text-white/40 truncate flex-1 ml-1" title={current?.label}>
        {current?.label || "—"}
      </span>

      {currentIndex < versions.length - 1 && (
        <button
          onClick={() => onRestore(currentIndex)}
          className="flex items-center gap-1 rounded-md bg-violet-500/10 px-2 py-0.5 text-[9px] font-semibold text-violet-300/70 hover:bg-violet-500/20 transition shrink-0"
          title="Restore this version as the active sandbox"
        >
          <RotateCcw className="h-2.5 w-2.5" /> Restore
        </button>
      )}

      <span className="text-[9px] text-white/15 shrink-0">
        {current ? new Date(current.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
      </span>
    </div>
  );
}
