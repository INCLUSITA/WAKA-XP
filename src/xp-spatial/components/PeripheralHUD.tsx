/**
 * PeripheralHUD — Contextual state indicator
 * Elegant, minimal, non-invasive HUD for agent state.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { SpatialHudState } from "../types/spatial";
import { Activity, CheckCircle, AlertTriangle, Loader2, Zap } from "lucide-react";

const MODE_ICON = {
  idle: Activity,
  sync: Loader2,
  processing: Loader2,
  success: CheckCircle,
  warning: AlertTriangle,
} as const;

const MODE_COLOR = {
  idle: "text-[hsl(160,60%,50%)]",
  sync: "text-[hsl(200,80%,60%)]",
  processing: "text-[hsl(35,90%,60%)]",
  success: "text-[hsl(160,84%,45%)]",
  warning: "text-[hsl(35,95%,55%)]",
} as const;

interface PeripheralHUDProps {
  hud: SpatialHudState;
}

export function PeripheralHUD({ hud }: PeripheralHUDProps) {
  const mode = hud.mode || "idle";
  const Icon = MODE_ICON[mode];
  const colorClass = MODE_COLOR[mode];
  const isSpinning = mode === "sync" || mode === "processing";

  return (
    <AnimatePresence>
      {hud.visible && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-6 right-8 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-full
                     bg-[hsl(228,20%,8%)]/80 backdrop-blur-xl border border-[hsl(228,14%,18%)]/60
                     shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
        >
          <Icon className={`w-4 h-4 ${colorClass} ${isSpinning ? "animate-spin" : ""}`} />
          <span className="text-xs font-medium tracking-wide text-[hsl(210,20%,75%)]">
            {hud.text}
          </span>
          <Zap className="w-3 h-3 text-[hsl(160,60%,40%)] opacity-50" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
