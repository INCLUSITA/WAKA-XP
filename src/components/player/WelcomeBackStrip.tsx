/**
 * WelcomeBackStrip — Continuity signal bar.
 * Shows when user has a pending journey to resume.
 * Non-invasive: user can dismiss or ignore.
 */

import { motion, AnimatePresence } from "framer-motion";
import { Play, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlayerMemory } from "@/contexts/PlayerMemoryProvider";

interface WelcomeBackStripProps {
  onResume?: (journeyId: string, stepId?: string) => void;
  className?: string;
}

export function WelcomeBackStrip({ onResume, className }: WelcomeBackStripProps) {
  const { getContinuitySignal, dismissContinuity } = usePlayerMemory();
  const signal = getContinuitySignal();

  if (!signal) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "overflow-hidden border-b border-primary/20",
          className
        )}
      >
        <div className="flex items-center gap-3 px-4 py-2.5 bg-primary/5">
          <div className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 shrink-0">
            <Play className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-foreground truncate">
              {signal.title}
            </p>
            {signal.subtitle && (
              <p className="text-[10px] text-muted-foreground truncate">
                {signal.subtitle}
              </p>
            )}
          </div>
          <button
            onClick={() => onResume?.(signal.journeyId!, signal.stepId)}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-semibold hover:bg-primary/90 transition-colors"
          >
            {signal.actionLabel}
          </button>
          <button
            onClick={dismissContinuity}
            className="shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
