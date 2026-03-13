/**
 * AvatarOverlay — Fullscreen avatar iframe inside the phone simulator.
 * Shows the avatar taking over the screen with smooth transitions.
 */

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarOverlayProps {
  open: boolean;
  onClose: () => void;
  /** The URL to load in the avatar view */
  avatarUrl: string;
  agentName?: string;
}

export function AvatarOverlay({ open, onClose, avatarUrl, agentName = "WAKA Avatar" }: AvatarOverlayProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = useCallback(() => setIsLoaded(true), []);

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="absolute inset-0 z-50 flex flex-col bg-black"
    >
      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-white/90">{agentName}</span>
        </div>
      </div>

      {/* Avatar content */}
      <div className="flex-1 relative">
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <motion.div
              className="w-16 h-16 rounded-full border-3 border-[hsl(var(--accent))]/30 border-t-[hsl(var(--accent))]"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-xs text-white/50">Cargando avatar...</p>
          </div>
        )}
        <iframe
          src={avatarUrl}
          className={cn(
            "w-full h-full border-0 transition-opacity duration-500",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={handleLoad}
          allow="camera; microphone; autoplay"
          title="WAKA Avatar"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* Bottom bar — return to conversation */}
      <div className="absolute bottom-0 inset-x-0 z-10 bg-gradient-to-t from-black/80 to-transparent px-4 pb-6 pt-8">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[hsl(var(--accent))] text-white text-sm font-semibold shadow-lg"
        >
          <MessageSquare className="h-4 w-4" />
          Volver a la conversación
        </motion.button>
        <p className="text-center text-[9px] text-white/25 mt-2">WAKA Avatar · Interacción visual</p>
      </div>
    </motion.div>
  );
}
