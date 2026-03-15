/**
 * FrontStage — Layer 3: Eruption Stage
 * Renders spatial surfaces based on the active surface state.
 * Declarative: type → component mapping.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { SpatialSurfaceState } from "../types/spatial";
import { X } from "lucide-react";
import { CatalogGridSurface } from "../surfaces/CatalogGridSurface";
import { KYCScannerSurface } from "../surfaces/KYCScannerSurface";
import { ReceiptSurface } from "../surfaces/ReceiptSurface";
import { FloatingPanelSurface } from "../surfaces/FloatingPanelSurface";
import { ConfirmationSurface } from "../surfaces/ConfirmationSurface";

interface FrontStageProps {
  activeSurface: SpatialSurfaceState | null;
  onClose: () => void;
}

export function FrontStage({ activeSurface, onClose }: FrontStageProps) {
  return (
    <AnimatePresence mode="wait">
      {activeSurface && (
        <motion.div
          key={activeSurface.id}
          initial={{ opacity: 0, scale: 0.9, z: -50 }}
          animate={{ opacity: 1, scale: 1, z: 0 }}
          exit={{ opacity: 0, scale: 0.95, z: -30 }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
          className="relative z-20 flex-1 max-w-[560px] min-w-[320px]"
        >
          {/* Glass container */}
          <div className="relative rounded-3xl overflow-hidden
                         bg-[hsl(228,18%,9%)]/80 backdrop-blur-2xl
                         border border-[hsl(228,14%,18%)]/60
                         shadow-[0_30px_100px_-30px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.03)_inset]">

            {/* Close button */}
            {activeSurface.closable !== false && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full
                          bg-[hsl(228,14%,14%)] border border-[hsl(228,14%,20%)]
                          flex items-center justify-center
                          hover:bg-[hsl(228,14%,18%)] transition-colors"
              >
                <X className="w-4 h-4 text-[hsl(210,20%,65%)]" />
              </button>
            )}

            {/* Surface content */}
            <div className="p-6 min-h-[300px]">
              <SurfaceRenderer type={activeSurface.type} payload={activeSurface.payload} />
            </div>
          </div>

          {/* Eruption glow beneath surface */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 rounded-full blur-2xl
                         bg-[hsl(160,84%,45%)]/10 pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SurfaceRenderer({ type, payload }: { type: string; payload?: any }) {
  switch (type) {
    case "catalog_grid_surface":
      return <CatalogGridSurface payload={payload} />;
    case "kyc_scanner_surface":
      return <KYCScannerSurface payload={payload} />;
    case "receipt_surface":
      return <ReceiptSurface payload={payload} />;
    case "floating_panel_surface":
    case "form_surface":
    case "media_surface":
      return <FloatingPanelSurface payload={payload} />;
    case "confirmation_surface":
      return <ConfirmationSurface payload={payload} />;
    default:
      return (
        <div className="text-center text-[hsl(210,10%,45%)] text-sm py-12">
          Surface: {type}
        </div>
      );
  }
}
