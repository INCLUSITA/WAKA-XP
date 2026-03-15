/**
 * UniversalContextMenu — Enterprise-grade context menu for the Experience Canvas.
 * 
 * Desktop: positioned popup at cursor
 * Mobile: animated bottom sheet
 * 
 * Action groups: Insert, Edit, AI Enhance, Link, Version/Governance
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus, Pencil, Sparkles, GitBranch,
  MessageSquare, ShoppingCart, FileText, MapPin, CreditCard, Star,
  Award, GraduationCap, Image as ImageIcon, Calculator, UserCheck,
  Wallet, LayoutList, Receipt, FileSignature, Lock, Phone, User,
  Copy, Trash2, ArrowUp, ArrowDown, Wand2, Languages, Smartphone,
  GitCompare, Upload, RotateCcw, Redo2, Camera,
  ChevronRight, X, Link, Zap, BookOpen, MessageCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

const INSERT_ITEMS: { type: InsertableBlockType; label: string; icon: React.ElementType; group: string }[] = [
  { type: "text", label: "Message texte", icon: MessageSquare, group: "Mensajes" },
  { type: "richCard", label: "Carte enrichie", icon: Sparkles, group: "Mensajes" },
  { type: "menu", label: "Menu interactif", icon: LayoutList, group: "Mensajes" },
  { type: "quickReplies", label: "Réponses rapides", icon: MessageCircle, group: "Mensajes" },
  { type: "catalog", label: "Catalogue", icon: ShoppingCart, group: "Comercio" },
  { type: "payment", label: "Paiement", icon: CreditCard, group: "Comercio" },
  { type: "inlineForm", label: "Formulaire", icon: FileText, group: "Formularios" },
  { type: "creditSimulation", label: "Simulation crédit", icon: Calculator, group: "Finanzas" },
  { type: "rating", label: "Évaluation", icon: Star, group: "Formularios" },
  { type: "mediaCarousel", label: "Carrousel", icon: ImageIcon, group: "Media" },
  { type: "training", label: "Formation", icon: GraduationCap, group: "Media" },
  { type: "voiceCall", label: "WAKA Voice", icon: Phone, group: "Canales" },
  { type: "avatar", label: "Avatar", icon: User, group: "Canales" },
];

/* ── Component ── */

export function UniversalContextMenu({
  x, y, target, onClose,
  onInsertBlock,
  onEditMessage, onDuplicateMessage, onDeleteMessage, onMoveUp, onMoveDown,
  onAIImprove, onAITranslate, onAISimplify, onAIMobileFriendly, onAIExpand,
  onCreateBranch, onCompareVersions, onPromote, onUndo, onRedo,
}: UniversalContextMenuProps) {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [insertSubOpen, setInsertSubOpen] = useState(false);
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
    if (isMobile) return; // Bottom sheet handles its own dismiss
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const t = setTimeout(() => window.addEventListener("mousedown", h), 50);
    return () => { clearTimeout(t); window.removeEventListener("mousedown", h); };
  }, [onClose, isMobile]);

  const isMessage = target.type === "message";
  const isBlock = target.type === "block";
  const msgId = (target as any).messageId;

  // Build action groups
  const groups: ActionGroup[] = [];

  groups.push({
    id: "insert", label: "Insertar", icon: Plus, color: "hsl(var(--primary))",
    items: [{ id: "insert-block", label: "Insertar bloque…", icon: Plus }],
  });

  if (isMessage || isBlock) {
    const editItems: ActionItem[] = [];
    if (isMessage) editItems.push({ id: "edit", label: "Editar mensaje", icon: Pencil, shortcut: "Dbl-clic" });
    editItems.push({ id: "duplicate", label: "Duplicar", icon: Copy });
    editItems.push({ id: "move-up", label: "Mover arriba", icon: ArrowUp });
    editItems.push({ id: "move-down", label: "Mover abajo", icon: ArrowDown });
    editItems.push({ id: "delete", label: "Eliminar", icon: Trash2, danger: true });
    groups.push({ id: "edit", label: "Editar", icon: Pencil, color: "hsl(220,55%,50%)", items: editItems });
  }

  if (isMessage || isBlock) {
    groups.push({
      id: "ai", label: "Mejorar con IA", icon: Sparkles, color: "hsl(270,55%,55%)",
      items: [
        { id: "ai-improve", label: "Reescribir / Mejorar", icon: Wand2 },
        { id: "ai-simplify", label: "Simplificar", icon: BookOpen },
        { id: "ai-translate", label: "Traducir FR↔EN", icon: Languages },
        { id: "ai-mobile", label: "Adaptar mobile-first", icon: Smartphone },
        { id: "ai-expand", label: "Expandir / Enriquecer", icon: Sparkles },
      ],
    });
  }

  groups.push({
    id: "version", label: "Versión", icon: GitBranch, color: "hsl(160,50%,40%)",
    items: [
      { id: "undo", label: "Deshacer", icon: RotateCcw, shortcut: "Ctrl+Z" },
      { id: "redo", label: "Rehacer", icon: Redo2, shortcut: "Ctrl+Y" },
      { id: "branch", label: "Crear rama", icon: GitBranch },
      { id: "compare", label: "Comparar versiones", icon: GitCompare },
      { id: "promote", label: "Promover a producción", icon: Upload },
    ],
  });

  const handleAction = useCallback((actionId: string) => {
    switch (actionId) {
      case "insert-block": setInsertSubOpen(true); return;
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

  const menuContent = (
    <>
      {/* Target indicator */}
      <div className="px-3 py-2 border-b border-border bg-muted/30">
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
          {target.type === "message" && `Mensaje ${(target as any).direction === "inbound" ? "usuario" : "bot"}`}
          {target.type === "block" && `Bloque: ${(target as any).blockType}`}
          {target.type === "canvas" && "Canvas"}
          {target.type === "group" && `${(target as any).messageIds.length} seleccionados`}
        </p>
        {isMessage && (target as any).text && (
          <p className="text-[10px] text-foreground mt-0.5 truncate max-w-[230px]">
            "{((target as any).text as string).substring(0, 50)}"
          </p>
        )}
      </div>

      {/* Action groups */}
      <div className="py-1 max-h-[360px] overflow-y-auto">
        {groups.map((group, gi) => (
          <div key={group.id}>
            {gi > 0 && <div className="my-1 mx-3 h-px bg-border" />}
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider px-3 pt-1.5 pb-0.5 flex items-center gap-1.5">
              <group.icon className="h-3 w-3" style={{ color: group.color }} />
              {group.label}
            </p>
            {group.items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleAction(item.id)}
                disabled={item.disabled}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors group",
                  item.danger ? "hover:bg-destructive/10 text-destructive" : "hover:bg-accent",
                  item.disabled && "opacity-40 cursor-not-allowed"
                )}
              >
                <item.icon className={cn("h-3.5 w-3.5 shrink-0", item.danger ? "text-destructive" : "text-muted-foreground group-hover:text-foreground")} />
                <span className={cn("text-[11px] font-medium flex-1", item.danger ? "" : "text-foreground")}>{item.label}</span>
                {item.shortcut && <span className="text-[9px] text-muted-foreground">{item.shortcut}</span>}
                {item.id === "insert-block" && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
              </button>
            ))}
          </div>
        ))}
      </div>
    </>
  );

  const insertContent = insertSubOpen && (
    <div className={cn(isMobile ? "border-t border-border" : "w-[230px] rounded-xl border border-border bg-popover shadow-2xl overflow-hidden")}>
      <div className="px-3 py-2 border-b border-border bg-muted/30 flex items-center justify-between">
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <Plus className="h-3 w-3" />
          Bloques disponibles
        </p>
        {isMobile && (
          <button onClick={() => setInsertSubOpen(false)} className="text-muted-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="py-1 max-h-[300px] overflow-y-auto">
        {INSERT_ITEMS.map((item) => (
          <button
            key={item.type}
            onClick={() => { onInsertBlock(item.type); onClose(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-accent transition-colors"
          >
            <item.icon className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-[11px] font-medium text-foreground">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // ── Mobile: Bottom Sheet ──
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[199] bg-black/40"
          onClick={onClose}
        />
        {/* Sheet */}
        <motion.div
          ref={ref}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 400, damping: 35 }}
          className="fixed inset-x-0 bottom-0 z-[200] rounded-t-2xl bg-popover border-t border-border shadow-2xl max-h-[75vh] overflow-hidden flex flex-col"
        >
          {/* Drag handle */}
          <div className="flex justify-center py-2 shrink-0">
            <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
          </div>

          <div className="flex-1 overflow-y-auto">
            {insertSubOpen ? insertContent : menuContent}
          </div>
        </motion.div>
      </>
    );
  }

  // ── Desktop: Positioned Popup ──
  const menuW = insertSubOpen ? 500 : 260;
  const menuH = 420;
  const left = Math.min(x, window.innerWidth - menuW - 8);
  const top = Math.min(y, window.innerHeight - menuH - 8);

  return (
    <div ref={ref} style={{ position: "fixed", left, top, zIndex: 200 }} className="flex gap-0.5">
      <div className="w-[260px] rounded-xl border border-border bg-popover shadow-2xl overflow-hidden">
        {menuContent}
      </div>
      {insertContent}
    </div>
  );
}

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
