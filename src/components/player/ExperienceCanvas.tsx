/**
 * ExperienceCanvas
 * ────────────────
 * The multi-zone layout for the Adaptive Experience Runtime.
 * Supports three visual modes:
 *   - framed:   Phone is the only container, everything inside
 *   - expanded: Phone visible + blocks escape to side panel/overlay/modal
 *   - unbound:  Phone shrinks to narrative reference, canvas dominates
 */

import { type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useExperienceRuntime } from "@/contexts/ExperienceRuntimeContext";
import type { ExperienceMode } from "./ExperienceModeSwitcher";

interface ExperienceCanvasProps {
  /** The phone simulator component */
  phone: ReactNode;
  /** The builder toolbar (between phone and workbench) */
  toolbar?: ReactNode;
  /** The workbench panel */
  workbench?: ReactNode;
  /** Content to render in the expanded side panel */
  sidePanelContent?: ReactNode;
  /** Content for the overlay zone */
  overlayContent?: ReactNode;
  /** Content for the modal zone */
  modalContent?: ReactNode;
  /** Content for the fullscreen zone */
  fullscreenContent?: ReactNode;
  /** Page header */
  header?: ReactNode;
  /** Current experience mode */
  mode?: ExperienceMode;
  className?: string;
}

export function ExperienceCanvas({
  phone,
  toolbar,
  workbench,
  sidePanelContent,
  overlayContent,
  modalContent,
  fullscreenContent,
  header,
  mode = "expanded",
  className,
}: ExperienceCanvasProps) {
  const { isDesktop, isMobile, expandedBlock, collapseBlock } = useExperienceRuntime();

  const effectiveMode = isMobile ? "framed" : mode;

  const showSidePanel =
    effectiveMode !== "framed" &&
    isDesktop &&
    (sidePanelContent || expandedBlock?.zone === "side-panel");
  const showOverlay = overlayContent || expandedBlock?.zone === "overlay";
  const showModal = modalContent || expandedBlock?.zone === "modal";
  const showFullscreen = fullscreenContent || expandedBlock?.zone === "fullscreen";

  return (
    <div className={cn("flex h-full flex-col bg-background overflow-hidden", className)}>
      {header}

      <div className="flex flex-1 min-h-0 relative">
        {/* ─── Phone Zone ─── */}
        <div
          className={cn(
            "flex flex-col transition-all duration-300 ease-out",
            effectiveMode === "framed" && "flex-1",
            effectiveMode === "expanded" && "flex-1",
            effectiveMode === "unbound" && "w-[260px] shrink-0 border-r border-border"
          )}
        >
          {phone}
        </div>

        {/* ─── Unbound Canvas Zone ── (only in unbound mode) ─── */}
        {effectiveMode === "unbound" && (
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 overflow-auto p-6">
              {sidePanelContent ? (
                <div className="max-w-[720px] mx-auto space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
                      {expandedBlock?.blockType ? getBlockLabel(expandedBlock.blockType) : "Experience Canvas"}
                    </span>
                  </div>
                  {sidePanelContent}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-3 max-w-[300px]">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                      <span className="text-2xl">🎨</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">Modo Unbound</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Los bloques soberanos se renderizan aquí en alta fidelidad.
                      Interactúa con el player para generar contenido expandido.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Side Panel Zone (expanded mode, desktop only) ─── */}
        <AnimatePresence>
          {showSidePanel && effectiveMode === "expanded" && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 420, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="border-l border-border bg-card overflow-hidden shrink-0"
            >
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
                      {expandedBlock?.blockType ? getBlockLabel(expandedBlock.blockType) : "Panel expandido"}
                    </span>
                  </div>
                  <button
                    onClick={collapseBlock}
                    className="h-6 w-6 rounded-md flex items-center justify-center hover:bg-accent transition-colors"
                  >
                    <Minimize2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {sidePanelContent}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Builder Toolbar ─── */}
        {effectiveMode !== "unbound" && toolbar}

        {/* ─── Workbench (rightmost) ─── */}
        {effectiveMode !== "unbound" && workbench}
      </div>

      {/* ─── Overlay Zone ─── */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) collapseBlock(); }}
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden max-w-[90vw] max-h-[85vh] min-w-[400px]"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <span className="text-sm font-semibold text-foreground">
                  {expandedBlock?.blockType ? getBlockLabel(expandedBlock.blockType) : "Detalle"}
                </span>
                <button onClick={collapseBlock} className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-accent transition-colors">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <div className="p-5 overflow-y-auto max-h-[calc(85vh-48px)]">
                {overlayContent}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Modal Zone ─── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) collapseBlock(); }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden w-[520px] max-w-[90vw] max-h-[80vh]"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <span className="text-sm font-semibold text-foreground">
                  {expandedBlock?.blockType ? getBlockLabel(expandedBlock.blockType) : "Acción requerida"}
                </span>
                <button onClick={collapseBlock} className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-accent transition-colors">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <div className="p-5 overflow-y-auto max-h-[calc(80vh-48px)]">
                {modalContent}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Fullscreen Zone ─── */}
      <AnimatePresence>
        {showFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
              <span className="text-sm font-semibold text-foreground">
                {expandedBlock?.blockType ? getBlockLabel(expandedBlock.blockType) : "Experiencia inmersiva"}
              </span>
              <button onClick={collapseBlock} className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-accent transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {fullscreenContent}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Block Expand Button ── */

export function BlockExpandButton({
  blockType,
  messageId,
  data,
  className: cls,
}: {
  blockType: string;
  messageId: string;
  data: Record<string, any>;
  className?: string;
}) {
  const { shouldExpand, expandBlock, isDesktop } = useExperienceRuntime();
  if (!isDesktop || !shouldExpand(blockType)) return null;

  return (
    <button
      onClick={() => expandBlock(messageId, blockType, data)}
      className={cn(
        "h-5 w-5 rounded-md flex items-center justify-center bg-primary/10 hover:bg-primary/20 transition-colors",
        cls
      )}
      title="Expandir en panel lateral"
    >
      <Minimize2 className="h-3 w-3 text-primary rotate-180" />
    </button>
  );
}

/* ── Helpers ── */

function getBlockLabel(blockType: string): string {
  const labels: Record<string, string> = {
    catalog: "Catálogo de productos",
    payment: "Pago",
    paymentConfirmation: "Confirmación de pago",
    creditSimulation: "Simulación de crédito",
    creditContract: "Contrato de crédito",
    clientStatus: "Estado del cliente",
    momoAccount: "Cuenta MoMo",
    servicePlans: "Planes de servicio",
    deviceLockConsent: "Consentimiento Device Lock",
    inlineForm: "Formulario",
    mediaCarousel: "Galería multimedia",
    training: "Formación",
    certificate: "Certificado",
    location: "Ubicación",
    voiceCall: "WAKA Voice",
    avatar: "WAKA Avatar",
  };
  return labels[blockType] || blockType;
}
