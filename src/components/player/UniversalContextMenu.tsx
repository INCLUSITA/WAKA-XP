/**
 * UniversalContextMenu — Enterprise-grade context menu for the Experience Canvas.
 * 
 * Supports right-click on desktop and long-press on mobile.
 * Action groups: Insert, Edit, AI Enhance, Variant/Render, Version/Governance
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus, Pencil, Sparkles, GitBranch, History,
  MessageSquare, ShoppingCart, FileText, MapPin, CreditCard, Star,
  Award, GraduationCap, Image as ImageIcon, Calculator, UserCheck,
  Wallet, LayoutList, Receipt, FileSignature, Lock, Phone, User,
  Copy, Trash2, ArrowUp, ArrowDown, Wand2, Languages,
  GitCompare, Upload, Check, RotateCcw,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
  /** Existing insert handler */
  onInsertBlock: (type: InsertableBlockType) => void;
  /** Edit actions */
  onEditMessage?: (messageId: string) => void;
  onDuplicateMessage?: (messageId: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onMoveUp?: (messageId: string) => void;
  onMoveDown?: (messageId: string) => void;
  /** AI actions */
  onAIImprove?: (messageId: string) => void;
  onAITranslate?: (messageId: string) => void;
  onAIExpand?: (messageId: string) => void;
  /** Version actions */
  onCreateBranch?: () => void;
  onCompareVersions?: () => void;
  onPromote?: () => void;
  onUndo?: () => void;
}

/* ── Insert sub-menu items ── */

const INSERT_ITEMS: { type: InsertableBlockType; label: string; icon: React.ElementType }[] = [
  { type: "text", label: "Message texte", icon: MessageSquare },
  { type: "richCard", label: "Carte enrichie", icon: Sparkles },
  { type: "menu", label: "Menu interactif", icon: LayoutList },
  { type: "quickReplies", label: "Réponses rapides", icon: MessageSquare },
  { type: "catalog", label: "Catalogue", icon: ShoppingCart },
  { type: "payment", label: "Paiement", icon: CreditCard },
  { type: "inlineForm", label: "Formulaire", icon: FileText },
  { type: "creditSimulation", label: "Simulation crédit", icon: Calculator },
  { type: "rating", label: "Évaluation", icon: Star },
  { type: "mediaCarousel", label: "Carrousel", icon: ImageIcon },
  { type: "training", label: "Formation", icon: GraduationCap },
  { type: "voiceCall", label: "WAKA Voice", icon: Phone },
  { type: "avatar", label: "Avatar", icon: User },
];

/* ── Component ── */

export function UniversalContextMenu({
  x, y, target, onClose,
  onInsertBlock,
  onEditMessage, onDuplicateMessage, onDeleteMessage, onMoveUp, onMoveDown,
  onAIImprove, onAITranslate, onAIExpand,
  onCreateBranch, onCompareVersions, onPromote, onUndo,
}: UniversalContextMenuProps) {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [insertSubOpen, setInsertSubOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  // Close on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const t = setTimeout(() => window.addEventListener("mousedown", h), 50);
    return () => { clearTimeout(t); window.removeEventListener("mousedown", h); };
  }, [onClose]);

  const isMessage = target.type === "message";
  const isBlock = target.type === "block";
  const isCanvas = target.type === "canvas";
  const msgId = (target as any).messageId;

  // Build action groups based on target
  const groups: ActionGroup[] = [];

  // 1. INSERT — always available
  groups.push({
    id: "insert",
    label: "Insertar",
    icon: Plus,
    color: "hsl(var(--primary))",
    items: [{ id: "insert-block", label: "Insertar bloque…", icon: Plus }],
  });

  // 2. EDIT — on messages and blocks
  if (isMessage || isBlock) {
    const editItems: ActionItem[] = [];
    if (isMessage) editItems.push({ id: "edit", label: "Editar mensaje", icon: Pencil, shortcut: "Dbl-click" });
    editItems.push({ id: "duplicate", label: "Duplicar", icon: Copy });
    editItems.push({ id: "move-up", label: "Mover arriba", icon: ArrowUp });
    editItems.push({ id: "move-down", label: "Mover abajo", icon: ArrowDown });
    editItems.push({ id: "delete", label: "Eliminar", icon: Trash2, danger: true });
    groups.push({ id: "edit", label: "Editar", icon: Pencil, color: "hsl(220,55%,50%)", items: editItems });
  }

  // 3. AI ENHANCE — on messages and blocks
  if (isMessage || isBlock) {
    groups.push({
      id: "ai",
      label: "IA",
      icon: Sparkles,
      color: "hsl(270,55%,55%)",
      items: [
        { id: "ai-improve", label: "Mejorar con IA", icon: Wand2 },
        { id: "ai-translate", label: "Traducir", icon: Languages },
        { id: "ai-expand", label: "Expandir / Enriquecer", icon: Sparkles },
      ],
    });
  }

  // 4. VERSION / GOVERNANCE — always available
  groups.push({
    id: "version",
    label: "Versión",
    icon: GitBranch,
    color: "hsl(160,50%,40%)",
    items: [
      { id: "undo", label: "Deshacer", icon: RotateCcw, shortcut: "Ctrl+Z" },
      { id: "branch", label: "Crear rama", icon: GitBranch },
      { id: "compare", label: "Comparar versiones", icon: GitCompare },
      { id: "promote", label: "Promover a producción", icon: Upload },
    ],
  });

  const handleAction = useCallback((actionId: string) => {
    switch (actionId) {
      case "insert-block":
        setInsertSubOpen(true);
        return; // Don't close
      case "edit":
        onEditMessage?.(msgId);
        break;
      case "duplicate":
        onDuplicateMessage?.(msgId);
        break;
      case "delete":
        onDeleteMessage?.(msgId);
        break;
      case "move-up":
        onMoveUp?.(msgId);
        break;
      case "move-down":
        onMoveDown?.(msgId);
        break;
      case "ai-improve":
        onAIImprove?.(msgId);
        break;
      case "ai-translate":
        onAITranslate?.(msgId);
        break;
      case "ai-expand":
        onAIExpand?.(msgId);
        break;
      case "undo":
        onUndo?.();
        break;
      case "branch":
        onCreateBranch?.();
        break;
      case "compare":
        onCompareVersions?.();
        break;
      case "promote":
        onPromote?.();
        break;
    }
    onClose();
  }, [msgId, onClose, onEditMessage, onDuplicateMessage, onDeleteMessage, onMoveUp, onMoveDown, onAIImprove, onAITranslate, onAIExpand, onUndo, onCreateBranch, onCompareVersions, onPromote]);

  // Clamp to viewport
  const menuW = insertSubOpen ? 500 : 260;
  const menuH = 420;
  const left = Math.min(x, window.innerWidth - menuW - 8);
  const top = Math.min(y, window.innerHeight - menuH - 8);

  return (
    <div
      ref={ref}
      style={{ position: "fixed", left, top, zIndex: 200 }}
      className="flex gap-0.5"
    >
      {/* Main menu */}
      <div className="w-[260px] rounded-xl border border-border bg-popover shadow-2xl overflow-hidden">
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
                    item.danger
                      ? "hover:bg-destructive/10 text-destructive"
                      : "hover:bg-accent",
                    item.disabled && "opacity-40 cursor-not-allowed"
                  )}
                >
                  <item.icon className={cn("h-3.5 w-3.5 shrink-0", item.danger ? "text-destructive" : "text-muted-foreground group-hover:text-foreground")} />
                  <span className={cn("text-[11px] font-medium flex-1", item.danger ? "" : "text-foreground")}>{item.label}</span>
                  {item.shortcut && (
                    <span className="text-[9px] text-muted-foreground">{item.shortcut}</span>
                  )}
                  {item.id === "insert-block" && (
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Insert sub-menu */}
      {insertSubOpen && (
        <div className="w-[230px] rounded-xl border border-border bg-popover shadow-2xl overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-muted/30">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Plus className="h-3 w-3" />
              Bloques disponibles
            </p>
          </div>
          <div className="py-1 max-h-[360px] overflow-y-auto">
            {INSERT_ITEMS.map((item) => (
              <button
                key={item.type}
                onClick={() => {
                  onInsertBlock(item.type);
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-accent transition-colors"
              >
                <item.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-[11px] font-medium text-foreground">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
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
