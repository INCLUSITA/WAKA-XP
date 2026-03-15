/**
 * UniversalContextMenu — Enterprise-grade context menu for the Experience Canvas.
 * 
 * Desktop: positioned popup at cursor with grouped actions
 * Mobile: animated bottom sheet with swipe-to-dismiss and large touch targets
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus, Pencil, Sparkles, GitBranch,
  MessageSquare, ShoppingCart, FileText, MapPin, CreditCard, Star,
  Award, GraduationCap, Image as ImageIcon, Calculator, UserCheck,
  Wallet, LayoutList, Receipt, FileSignature, Lock, Phone, User,
  Copy, Trash2, ArrowUp, ArrowDown, Wand2, Languages, Smartphone,
  GitCompare, Upload, RotateCcw, Redo2,
  ChevronRight, X, BookOpen, MessageCircle, GripHorizontal,
} from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";
import { useExperienceRuntime } from "@/contexts/ExperienceRuntimeContext";
import type { InsertableBlockType } from "./PlayerContextMenu";

/* ── Types ── */

export type ContextTarget =
  | { type: "message"; messageId: string; direction: "inbound" | "outbound"; text?: string }
  | { type: "block"; messageId: string; blockType: string }
  | { type: "canvas" }
  | { type: "group"; messageIds: string[] };

interface ActionItem {
  id: string;
  label: string;
  icon: React.ElementType;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
}

interface ActionGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  items: ActionItem[];
}

interface UniversalContextMenuProps {
  x: number;
  y: number;
  target: ContextTarget;
  onClose: () => void;
  onInsertBlock: (type: InsertableBlockType) => void;
  onEditMessage?: (messageId: string) => void;
  onDuplicateMessage?: (messageId: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onMoveUp?: (messageId: string) => void;
  onMoveDown?: (messageId: string) => void;
  onAIImprove?: (messageId: string) => void;
  onAITranslate?: (messageId: string) => void;
  onAISimplify?: (messageId: string) => void;
  onAIMobileFriendly?: (messageId: string) => void;
  onAIExpand?: (messageId: string) => void;
  onCreateBranch?: () => void;
  onCompareVersions?: () => void;
  onPromote?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

/* ── Insert sub-menu items ── */

const INSERT_GROUPS: { label: string; items: { type: InsertableBlockType; label: string; icon: React.ElementType }[] }[] = [
  {
    label: "Messages",
    items: [
      { type: "text", label: "Message texte", icon: MessageSquare },
      { type: "richCard", label: "Carte enrichie", icon: Sparkles },
      { type: "menu", label: "Menu interactif", icon: LayoutList },
      { type: "quickReplies", label: "Réponses rapides", icon: MessageCircle },
    ],
  },
  {
    label: "Commerce",
    items: [
      { type: "catalog", label: "Catalogue", icon: ShoppingCart },
      { type: "payment", label: "Paiement", icon: CreditCard },
    ],
  },
  {
    label: "Finance",
    items: [
      { type: "creditSimulation", label: "Simulation crédit", icon: Calculator },
    ],
  },
  {
    label: "Formulaires",
    items: [
      { type: "inlineForm", label: "Formulaire", icon: FileText },
      { type: "rating", label: "Évaluation", icon: Star },
    ],
  },
  {
    label: "Média & Canaux",
    items: [
      { type: "mediaCarousel", label: "Carrousel", icon: ImageIcon },
      { type: "training", label: "Formation", icon: GraduationCap },
      { type: "voiceCall", label: "WAKA Voice", icon: Phone },
      { type: "avatar", label: "Avatar", icon: User },
    ],
  },
];

/* ── Component ── */

export function UniversalContextMenu({
  x, y, target, onClose,
  onInsertBlock,
  onEditMessage, onDuplicateMessage, onDeleteMessage, onMoveUp, onMoveDown,
  onAIImprove, onAITranslate, onAISimplify, onAIMobileFriendly, onAIExpand,
  onCreateBranch, onCompareVersions, onPromote, onUndo, onRedo,
}: UniversalContextMenuProps) {
  const [activeView, setActiveView] = useState<"main" | "insert">("main");
  const ref = useRef<HTMLDivElement>(null);

  let isMobile = false;
  try {
    const runtime = useExperienceRuntime();
    isMobile = runtime.isMobile;
  } catch {
    isMobile = window.innerWidth < 768;
  }

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => {
    if (isMobile) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const t = setTimeout(() => window.addEventListener("mousedown", h), 50);
    return () => { clearTimeout(t); window.removeEventListener("mousedown", h); };
  }, [onClose, isMobile]);

  // Back button handler for mobile browser
  useEffect(() => {
    if (!isMobile) return;
    const handlePopState = () => onClose();
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isMobile, onClose]);

  const isMessage = target.type === "message";
  const isBlock = target.type === "block";
  const msgId = (target as any).messageId;

  // Build action groups
  const groups: ActionGroup[] = [];

  groups.push({
    id: "insert", label: "Insérer", icon: Plus, color: "hsl(var(--primary))",
    items: [{ id: "insert-block", label: "Insérer un bloc…", icon: Plus }],
  });

  if (isMessage || isBlock) {
    const editItems: ActionItem[] = [];
    if (isMessage) editItems.push({ id: "edit", label: "Éditer le message", icon: Pencil, shortcut: "Dbl-clic" });
    editItems.push({ id: "duplicate", label: "Dupliquer", icon: Copy });
    editItems.push({ id: "move-up", label: "Monter", icon: ArrowUp });
    editItems.push({ id: "move-down", label: "Descendre", icon: ArrowDown });
    editItems.push({ id: "delete", label: "Supprimer", icon: Trash2, danger: true });
    groups.push({ id: "edit", label: "Éditer", icon: Pencil, color: "hsl(220,55%,50%)", items: editItems });
  }

  if (isMessage || isBlock) {
    groups.push({
      id: "ai", label: "Améliorer avec IA", icon: Sparkles, color: "hsl(var(--accent))",
      items: [
        { id: "ai-improve", label: "Réécrire / Améliorer", icon: Wand2 },
        { id: "ai-simplify", label: "Simplifier", icon: BookOpen },
        { id: "ai-translate", label: "Traduire FR↔EN", icon: Languages },
        { id: "ai-mobile", label: "Adapter mobile-first", icon: Smartphone },
        { id: "ai-expand", label: "Enrichir / Développer", icon: Sparkles },
      ],
    });
  }

  groups.push({
    id: "version", label: "Version", icon: GitBranch, color: "hsl(160,50%,40%)",
    items: [
      { id: "undo", label: "Annuler", icon: RotateCcw, shortcut: "⌘Z" },
      { id: "redo", label: "Refaire", icon: Redo2, shortcut: "⌘Y" },
      { id: "branch", label: "Créer branche", icon: GitBranch },
      { id: "compare", label: "Comparer versions", icon: GitCompare },
      { id: "promote", label: "Promouvoir", icon: Upload },
    ],
  });

  const handleAction = useCallback((actionId: string) => {
    switch (actionId) {
      case "insert-block": setActiveView("insert"); return;
      case "edit": onEditMessage?.(msgId); break;
      case "duplicate": onDuplicateMessage?.(msgId); break;
      case "delete": onDeleteMessage?.(msgId); break;
      case "move-up": onMoveUp?.(msgId); break;
      case "move-down": onMoveDown?.(msgId); break;
      case "ai-improve": onAIImprove?.(msgId); break;
      case "ai-translate": onAITranslate?.(msgId); break;
      case "ai-simplify": onAISimplify?.(msgId); break;
      case "ai-mobile": onAIMobileFriendly?.(msgId); break;
      case "ai-expand": onAIExpand?.(msgId); break;
      case "undo": onUndo?.(); break;
      case "redo": onRedo?.(); break;
      case "branch": onCreateBranch?.(); break;
      case "compare": onCompareVersions?.(); break;
      case "promote": onPromote?.(); break;
    }
    onClose();
  }, [msgId, onClose, onEditMessage, onDuplicateMessage, onDeleteMessage, onMoveUp, onMoveDown, onAIImprove, onAITranslate, onAISimplify, onAIMobileFriendly, onAIExpand, onUndo, onRedo, onCreateBranch, onCompareVersions, onPromote]);

  /* ── Target badge ── */
  const targetBadge = (
    <div className={cn(
      "border-b border-border/50",
      isMobile ? "px-5 py-3 bg-muted/15" : "px-4 py-2.5 bg-muted/30"
    )}>
      <p className={cn(
        "font-bold text-muted-foreground uppercase tracking-widest",
        isMobile ? "text-[10px]" : "text-[9px]"
      )}>
        {target.type === "message" && `Message ${(target as any).direction === "inbound" ? "utilisateur" : "bot"}`}
        {target.type === "block" && `Bloc: ${(target as any).blockType}`}
        {target.type === "canvas" && "Canvas"}
        {target.type === "group" && `${(target as any).messageIds.length} sélectionnés`}
      </p>
      {isMessage && (target as any).text && (
        <p className={cn(
          "text-foreground/70 mt-0.5 truncate italic",
          isMobile ? "text-[11px] max-w-[300px]" : "text-[10px] max-w-[260px]"
        )}>
          "{((target as any).text as string).substring(0, 60)}"
        </p>
      )}
    </div>
  );

  /* ── Main menu content ── */
  const mainContent = (
    <>
      {targetBadge}
      <div className={cn("py-1.5", isMobile ? "max-h-[55vh]" : "max-h-[380px]", "overflow-y-auto overscroll-contain")}>
        {groups.map((group, gi) => (
          <div key={group.id}>
            {gi > 0 && <div className={cn("h-px bg-border/40", isMobile ? "my-2 mx-5" : "my-1.5 mx-4")} />}
            <p className={cn(
              "font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5",
              isMobile ? "text-[9px] px-5 pt-3 pb-1.5" : "text-[8px] px-4 pt-2 pb-1"
            )}>
              <group.icon className="h-3 w-3" style={{ color: group.color }} />
              {group.label}
            </p>
            {group.items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleAction(item.id)}
                disabled={item.disabled}
                className={cn(
                  "w-full flex items-center gap-3 text-left transition-colors group",
                  isMobile ? "px-5 py-3.5 min-h-[48px]" : "px-4 py-2",
                  item.danger
                    ? "hover:bg-destructive/8 active:bg-destructive/12 text-destructive"
                    : "hover:bg-accent/30 active:bg-accent/50",
                  item.disabled && "opacity-40 cursor-not-allowed"
                )}
              >
                <item.icon className={cn(
                  "shrink-0",
                  isMobile ? "h-5 w-5" : "h-3.5 w-3.5",
                  item.danger ? "text-destructive" : "text-muted-foreground group-hover:text-foreground"
                )} />
                <span className={cn(
                  "font-medium flex-1",
                  isMobile ? "text-[14px]" : "text-[11px]",
                  item.danger ? "" : "text-foreground"
                )}>{item.label}</span>
                {item.shortcut && !isMobile && (
                  <span className="text-[9px] text-muted-foreground/60 font-mono">{item.shortcut}</span>
                )}
                {item.id === "insert-block" && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />}
              </button>
            ))}
          </div>
        ))}
      </div>
    </>
  );

  /* ── Insert blocks view ── */
  const insertContent = (
    <>
      <div className={cn(
        "border-b border-border/50 flex items-center justify-between",
        isMobile ? "px-5 py-3 bg-muted/15" : "px-4 py-2.5 bg-muted/30"
      )}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView("main")}
            className={cn(
              "rounded-md flex items-center justify-center hover:bg-accent/50 transition-colors",
              isMobile ? "h-8 w-8" : "h-6 w-6"
            )}
          >
            <ChevronRight className={cn("text-muted-foreground rotate-180", isMobile ? "h-4 w-4" : "h-3.5 w-3.5")} />
          </button>
          <p className={cn(
            "font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5",
            isMobile ? "text-[10px]" : "text-[9px]"
          )}>
            <Plus className="h-3 w-3 text-primary" />
            Blocs disponibles
          </p>
        </div>
      </div>
      <div className={cn("py-1.5", isMobile ? "max-h-[55vh]" : "max-h-[380px]", "overflow-y-auto overscroll-contain")}>
        {INSERT_GROUPS.map((group, gi) => (
          <div key={group.label}>
            {gi > 0 && <div className={cn("h-px bg-border/30", isMobile ? "my-1.5 mx-5" : "my-1 mx-4")} />}
            <p className={cn(
              "font-bold text-muted-foreground uppercase tracking-widest",
              isMobile ? "text-[9px] px-5 pt-3 pb-1.5" : "text-[8px] px-4 pt-2 pb-1"
            )}>
              {group.label}
            </p>
            {group.items.map((item) => (
              <button
                key={item.type}
                onClick={() => { onInsertBlock(item.type); onClose(); }}
                className={cn(
                  "w-full flex items-center gap-3 text-left hover:bg-accent/30 active:bg-accent/50 transition-colors",
                  isMobile ? "px-5 py-3.5 min-h-[48px]" : "px-4 py-2",
                )}
              >
                <item.icon className={cn("text-primary shrink-0", isMobile ? "h-5 w-5" : "h-3.5 w-3.5")} />
                <span className={cn("font-medium text-foreground", isMobile ? "text-[14px]" : "text-[11px]")}>{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </>
  );

  // ── Mobile: Bottom Sheet with swipe-to-dismiss ──
  if (isMobile) {
    return <MobileBottomSheet ref={ref} onClose={onClose} activeView={activeView}>
      {activeView === "insert" ? insertContent : mainContent}
    </MobileBottomSheet>;
  }

  // ── Desktop: Positioned Popup ──
  const menuW = 280;
  const menuH = 420;
  const left = Math.min(x, window.innerWidth - menuW - 12);
  const top = Math.min(y, window.innerHeight - menuH - 12);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.96, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.12 }}
      style={{ position: "fixed", left, top, zIndex: 200 }}
    >
      <div className="w-[280px] rounded-xl border border-border/60 bg-popover shadow-2xl overflow-hidden">
        {activeView === "insert" ? insertContent : mainContent}
      </div>
    </motion.div>
  );
}

/* ── Mobile Bottom Sheet with swipe-to-dismiss ── */

import React from "react";

const MobileBottomSheet = React.forwardRef<
  HTMLDivElement,
  { onClose: () => void; activeView: string; children: React.ReactNode }
>(({ onClose, activeView, children }, ref) => {
  const sheetY = useMotionValue(0);
  const backdropOpacity = useTransform(sheetY, [0, 300], [1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ opacity: backdropOpacity }}
        className="fixed inset-0 z-[199] bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />
      {/* Sheet */}
      <motion.div
        ref={ref}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ y: sheetY }}
        className="fixed inset-x-0 bottom-0 z-[200] rounded-t-2xl bg-popover border-t border-border/60 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Drag handle */}
        <div className="flex justify-center py-3.5 shrink-0 cursor-grab active:cursor-grabbing touch-none">
          <div className="waka-bottom-sheet-handle" />
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain pb-safe">
          {children}
        </div>

        {/* Safe area bottom padding for iOS */}
        <div className="h-2 shrink-0" style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }} />
      </motion.div>
    </>
  );
});
MobileBottomSheet.displayName = "MobileBottomSheet";

/* ── Long Press Hook for mobile ── */

export function useLongPress(callback: (e: React.TouchEvent) => void, ms = 500) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    timerRef.current = setTimeout(() => {
      callbackRef.current(e);
    }, ms);
  }, [ms]);

  const onTouchEnd = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return { onTouchStart, onTouchEnd, onTouchMove: onTouchEnd };
}
