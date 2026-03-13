/**
 * Sovereign Block: Training / Capacity Building Progress
 * WhatsApp: NOT POSSIBLE.
 * WAKA: Multi-module training tracker with badges and completion state.
 */

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDataMode } from "../dataMode";

export interface TrainingModule {
  id: string;
  name: string;
  emoji?: string;
  status: "completed" | "current" | "locked";
  progress?: number;
}

interface TrainingProgressProps {
  title: string;
  modules: TrainingModule[];
  overallProgress: number;
  onModuleClick?: (moduleId: string) => void;
}

export function TrainingProgress({ title, modules, overallProgress, onModuleClick }: TrainingProgressProps) {
  const mode = useDataMode();

  if (mode === "zero-rated") {
    return (
      <div className="rounded-lg border border-[hsl(160,30%,85%)] bg-white px-3 py-2 max-w-[90%]">
        <p className="text-[11px] font-bold text-[hsl(160,50%,25%)]">📚 {title} — {overallProgress}%</p>
        {modules.map((m) => (
          <div key={m.id} className="flex items-center gap-1.5 mt-1 text-[10px]">
            <span>{m.status === "completed" ? "✅" : m.status === "current" ? "▶" : "🔒"}</span>
            <button
              onClick={() => m.status !== "locked" && onModuleClick?.(m.id)}
              className={cn(
                m.status === "locked" ? "text-[hsl(220,10%,65%)]" : "text-[hsl(220,15%,20%)]",
                m.status === "current" && "font-bold"
              )}
            >
              {m.name}
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={mode === "libre" ? { opacity: 0, y: 10 } : { opacity: 0 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[hsl(160,30%,85%)] bg-white overflow-hidden shadow-sm max-w-[90%]"
    >
      <div className="px-3 py-2.5 bg-[hsl(160,40%,96%)] border-b border-[hsl(160,25%,90%)]">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-bold text-[hsl(160,50%,25%)]">📚 {title}</p>
          <span className="text-[11px] font-bold text-[hsl(160,60%,35%)]">{overallProgress}%</span>
        </div>
        <div className="mt-1.5 h-2 rounded-full bg-[hsl(160,20%,88%)] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, hsl(160,60%,40%), hsl(175,55%,42%))" }}
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="px-3 py-1.5">
        {modules.map((m, i) => {
          const isLast = i === modules.length - 1;
          return (
            <button
              key={m.id}
              onClick={() => m.status !== "locked" && onModuleClick?.(m.id)}
              disabled={m.status === "locked"}
              className={cn(
                "w-full flex items-center gap-2.5 py-2 text-left transition-colors",
                !isLast && "border-b border-[hsl(160,15%,93%)]",
                m.status === "locked" ? "opacity-50" : "hover:bg-[hsl(160,30%,97%)]",
                m.status === "current" && "bg-[hsl(160,35%,97%)]"
              )}
            >
              {/* Status icon */}
              <div className="flex-shrink-0">
                {m.status === "completed" && (
                  <motion.div
                    initial={mode === "libre" ? { scale: 0 } : {}}
                    animate={{ scale: 1 }}
                  >
                    <CheckCircle2 className="h-4.5 w-4.5 text-[hsl(160,55%,42%)]" />
                  </motion.div>
                )}
                {m.status === "current" && (
                  <div className="relative">
                    <Circle className="h-4.5 w-4.5 text-[hsl(160,55%,50%)]" />
                    {mode === "libre" && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-[hsl(160,55%,50%)]"
                        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </div>
                )}
                {m.status === "locked" && <Lock className="h-4 w-4 text-[hsl(220,10%,70%)]" />}
              </div>

              {/* Module info */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-[11px] leading-tight",
                  m.status === "current" ? "font-bold text-[hsl(160,50%,25%)]" : "font-medium text-[hsl(220,15%,25%)]",
                  m.status === "locked" && "text-[hsl(220,10%,60%)]"
                )}>
                  {m.emoji && <span className="mr-1">{m.emoji}</span>}
                  {m.name}
                </p>
              </div>

              {m.status === "current" && m.progress != null && (
                <span className="text-[9px] font-bold text-[hsl(160,55%,40%)]">{m.progress}%</span>
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
