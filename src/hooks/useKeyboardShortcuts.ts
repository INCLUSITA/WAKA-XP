/**
 * useKeyboardShortcuts — Global keyboard shortcuts for authoring UX.
 *
 * Shortcuts:
 *   ⌘Z / Ctrl+Z  — Undo
 *   ⌘Y / Ctrl+Y / ⌘⇧Z — Redo
 *   Escape        — Close overlays / context menu / modals
 *   ⌘I / Ctrl+I  — Open insert block menu (optional)
 */

import { useEffect, useCallback, useRef } from "react";

interface KeyboardShortcutActions {
  onUndo?: () => void;
  onRedo?: () => void;
  onEscape?: () => void;
  onInsert?: () => void;
  /** Whether shortcuts are active (disable in text inputs) */
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onUndo,
  onRedo,
  onEscape,
  onInsert,
  enabled = true,
}: KeyboardShortcutActions) {
  const actionsRef = useRef({ onUndo, onRedo, onEscape, onInsert });
  actionsRef.current = { onUndo, onRedo, onEscape, onInsert };

  const handler = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    // Don't intercept when typing in inputs/textareas/contenteditable
    const target = e.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      // Allow Escape even in inputs
      if (e.key === "Escape") {
        actionsRef.current.onEscape?.();
        return;
      }
      return;
    }

    const mod = e.metaKey || e.ctrlKey;

    // Undo: ⌘Z / Ctrl+Z (no shift)
    if (mod && e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      actionsRef.current.onUndo?.();
      return;
    }

    // Redo: ⌘Y / Ctrl+Y or ⌘⇧Z / Ctrl+⇧Z
    if (mod && (e.key === "y" || (e.key === "z" && e.shiftKey) || (e.key === "Z" && e.shiftKey))) {
      e.preventDefault();
      actionsRef.current.onRedo?.();
      return;
    }

    // Insert: ⌘I / Ctrl+I
    if (mod && e.key === "i") {
      e.preventDefault();
      actionsRef.current.onInsert?.();
      return;
    }

    // Escape
    if (e.key === "Escape") {
      actionsRef.current.onEscape?.();
      return;
    }
  }, [enabled]);

  useEffect(() => {
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handler]);
}
