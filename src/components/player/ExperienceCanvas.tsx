/**
 * ExperienceCanvas
 * ────────────────
 * Multi-zone layout for the Adaptive Experience Runtime.
 * Modes: framed | expanded | unbound
 * Phone is always the narrative anchor.
 *
 * Surface plan governs: primarySurface, threadSurface, phoneVisible,
 * secondarySurfaces, avatarSlot, overlayAllowed, richnessTier.
 */

import { type ReactNode, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minimize2, Smartphone, Layers, Monitor, Zap, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useExperienceRuntime } from "@/contexts/ExperienceRuntimeContext";
import type { ExperienceMode } from "./ExperienceModeSwitcher";
import { AvatarSlot } from "./AvatarSlot";

interface ExperienceCanvasProps {
  phone: ReactNode;
  toolbar?: ReactNode;
  workbench?: ReactNode;
  sidePanelContent?: ReactNode;
  overlayContent?: ReactNode;
  modalContent?: ReactNode;
  fullscreenContent?: ReactNode;
  header?: ReactNode;
  mode?: ExperienceMode;
  avatarEnabled?: boolean;
  className?: string;
}

/**
 * SurfacePlan — Derived from mode + device + expandedBlock.
 * Governs which zones are active and how they're laid out.
 */
interface SurfacePlan {
  primarySurface: "phone" | "canvas" | "split";
  threadSurface: "phone-inline" | "phone-anchored";
  phoneVisible: boolean;
  secondarySurfaces: ("side-panel" | "overlay" | "modal" | "fullscreen")[];
  avatarSlot: "none" | "inline" | "panel" | "canvas";
  overlayAllowed: boolean;
  richnessTier: "minimal" | "standard" | "rich";
}

function deriveSurfacePlan(
  mode: ExperienceMode,
  isDesktop: boolean,
  isMobile: boolean,
  hasExpandedBlock: boolean,
  avatarEnabled: boolean,
): SurfacePlan {
  if (isMobile || mode === "framed") {
    return {
      primarySurface: "phone",
      threadSurface: "phone-inline",
      phoneVisible: true,
      secondarySurfaces: [],
      avatarSlot: avatarEnabled ? "inline" : "none",
      overlayAllowed: false,
      richnessTier: isMobile ? "minimal" : "standard",
    };
  }

  if (mode === "unbound") {
    return {
      primarySurface: "canvas",
      threadSurface: "phone-anchored",
      phoneVisible: true,
      secondarySurfaces: ["side-panel", "overlay", "modal", "fullscreen"],
      avatarSlot: avatarEnabled ? "canvas" : "none",
      overlayAllowed: true,
      richnessTier: "rich",
    };
  }

  // expanded
  return {
    primarySurface: hasExpandedBlock ? "split" : "phone",
    threadSurface: "phone-inline",
    phoneVisible: true,
    secondarySurfaces: hasExpandedBlock ? ["side-panel"] : [],
    avatarSlot: avatarEnabled ? "panel" : "none",
    overlayAllowed: true,
    richnessTier: "rich",
  };
}

export function ExperienceCanvas({
  phone, toolbar, workbench,
  sidePanelContent, overlayContent, modalContent, fullscreenContent,
  header, mode = "expanded", avatarEnabled = false, className,
}: ExperienceCanvasProps) {
  const { isDesktop, isMobile, expandedBlock, collapseBlock, dataPolicy } = useExperienceRuntime();
  const effectiveMode = isMobile ? "framed" : mode;

  const surfacePlan = useMemo(
    () => deriveSurfacePlan(effectiveMode, isDesktop, isMobile, !!expandedBlock, avatarEnabled),
    [effectiveMode, isDesktop, isMobile, expandedBlock, avatarEnabled]
  );

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

      {/* Surface plan indicator (dev-visible via data attribute) */}
      <div className="flex flex-1 min-h-0 relative" data-surface={surfacePlan.primarySurface} data-richness={surfacePlan.richnessTier}>
        {/* ─── Phone Zone ─── */}
        <div className={cn(
          "flex flex-col transition-all duration-500 ease-out relative",
          effectiveMode === "framed" && "flex-1",
          effectiveMode === "expanded" && (showSidePanel ? "w-[50%] shrink-0" : "flex-1"),
          effectiveMode === "unbound" && "w-[280px] shrink-0 border-r border-border/60"
        )}>
          {/* Mode label overlays */}
          {effectiveMode === "unbound" && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 border border-border/50 shadow-sm">
              <Smartphone className="h-3 w-3 text-muted-foreground" />
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Canal mobile</span>
            </div>
          )}
          {effectiveMode === "expanded" && showSidePanel && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-background/80 backdrop-blur-sm rounded-full px-2.5 py-0.5 border border-primary/15 shadow-sm">
              <Layers className="h-2.5 w-2.5 text-primary/60" />
              <span className="text-[8px] font-bold text-primary/60 uppercase tracking-wider">Ancla narrativa</span>
            </div>
          )}
          {phone}
        </div>

        {/* ─── Unbound Canvas Zone ─── */}
        {effectiveMode === "unbound" && (
          <div className="flex-1 flex flex-col min-w-0 bg-muted/5">
            {/* Canvas header */}
            <div className="flex items-center gap-2 px-6 py-3 border-b border-border/40 bg-card/50 backdrop-blur-sm shrink-0">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                {expandedBlock?.blockType ? getBlockLabel(expandedBlock.blockType) : "Experience Canvas"}
              </span>
              <span className="text-[9px] text-muted-foreground ml-1">
                Unbound · Haute fidélité
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                <Monitor className="h-3 w-3 text-muted-foreground/50" />
                <span className="text-[8px] text-muted-foreground/50 uppercase tracking-wider">
                  {surfacePlan.richnessTier}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-8">
              {sidePanelContent ? (
                <div className="max-w-[720px] mx-auto space-y-6 waka-panel-enter">
                  {sidePanelContent}
                  <AvatarSlot mode="unbound" enabled={avatarEnabled} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4 max-w-[340px]">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/5 flex items-center justify-center mx-auto border border-primary/8">
                      <Layers className="h-8 w-8 text-primary/20" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Mode Unbound</p>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-1.5">
                        Les blocs souverains s'affichent ici en haute fidélité.
                        Interagissez avec le player pour générer du contenu expansé.
                      </p>
                    </div>
                    <AvatarSlot mode="unbound" enabled={avatarEnabled} className="mt-6" />
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
              animate={{ width: "50%", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="border-l border-border/60 bg-card overflow-hidden shrink-0"
            >
              <div className="h-full flex flex-col">
                {/* Panel header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-muted/20">
                  <div className="flex items-center gap-2.5">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                      {expandedBlock?.blockType ? getBlockLabel(expandedBlock.blockType) : "Panel expansé"}
                    </span>
                  </div>
                  <button
                    onClick={collapseBlock}
                    className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-accent/50 transition-colors"
                  >
                    <Minimize2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-4 waka-panel-enter">
                  {sidePanelContent}
                  <AvatarSlot mode="expanded" enabled={avatarEnabled} />
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) collapseBlock(); }}
          >
            <motion.div
              initial={{ y: 20, scale: 0.96 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-card rounded-2xl shadow-2xl border border-border/60 overflow-hidden max-w-[90vw] max-h-[85vh] min-w-[400px]"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-muted/20">
                <span className="text-sm font-bold text-foreground">
                  {expandedBlock?.blockType ? getBlockLabel(expandedBlock.blockType) : "Détail"}
                </span>
                <button onClick={collapseBlock} className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-accent/50 transition-colors">
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
              initial={{ scale: 0.92, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 24 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-card rounded-2xl shadow-2xl border border-border/60 overflow-hidden w-[520px] max-w-[90vw] max-h-[80vh]"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-muted/20">
                <span className="text-sm font-bold text-foreground">
                  {expandedBlock?.blockType ? getBlockLabel(expandedBlock.blockType) : "Action requise"}
                </span>
                <button onClick={collapseBlock} className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-accent/50 transition-colors">
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
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-muted/20">
              <span className="text-sm font-bold text-foreground">
                {expandedBlock?.blockType ? getBlockLabel(expandedBlock.blockType) : "Expérience immersive"}
              </span>
              <button onClick={collapseBlock} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-accent/50 transition-colors">
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
  blockType, messageId, data, className: cls,
}: {
  blockType: string; messageId: string; data: Record<string, any>; className?: string;
}) {
  const { shouldExpand, expandBlock, isDesktop } = useExperienceRuntime();
  if (!isDesktop || !shouldExpand(blockType)) return null;

  return (
    <button
      onClick={() => expandBlock(messageId, blockType, data)}
      className={cn(
        "h-6 w-6 rounded-lg flex items-center justify-center bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/10",
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
    catalog: "Catalogue produits",
    payment: "Paiement",
    paymentConfirmation: "Confirmation de paiement",
    creditSimulation: "Simulation de crédit",
    creditContract: "Contrat de crédit",
    clientStatus: "Statut client",
    momoAccount: "Compte MoMo",
    servicePlans: "Plans de service",
    deviceLockConsent: "Consentement Device Lock",
    inlineForm: "Formulaire",
    mediaCarousel: "Galerie multimédia",
    training: "Formation",
    certificate: "Certificat",
    location: "Localisation",
    voiceCall: "WAKA Voice",
    avatar: "WAKA Avatar",
  };
  return labels[blockType] || blockType;
}
