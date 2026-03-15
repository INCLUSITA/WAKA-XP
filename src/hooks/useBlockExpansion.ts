/**
 * useBlockExpansion — Auto-expands eligible sovereign blocks to the side panel
 * when in Expanded or Unbound mode on desktop.
 *
 * Refinements:
 *   - Debounce: won't re-expand within 800ms of a previous expansion
 *   - Zero-rated guard: never auto-expands in zero-rated mode
 *   - Only expands the latest message's first block
 *   - Provides collapse callback for inline "return to phone" pill
 */

import { useEffect, useRef, useCallback } from "react";
import type { PlayerMessage } from "@/components/player/WakaSovereignPlayer";
import type { ExperienceMode } from "@/components/player/ExperienceModeSwitcher";
import { useExperienceRuntime } from "@/contexts/ExperienceRuntimeContext";

/** Block types that can be auto-expanded */
const EXPANDABLE_BLOCK_KEYS: Array<keyof PlayerMessage> = [
  "catalog", "payment", "paymentConfirmation", "creditSimulation",
  "creditContract", "clientStatus", "momoAccount", "servicePlans",
  "inlineForm", "training", "mediaCarousel", "location", "certificate",
];

/** Blocks that should NOT auto-expand (too small / disruptive) */
const NEVER_AUTO_EXPAND: string[] = ["rating", "location"];

/** Detect the first expandable block in a message */
export function detectExpandableBlock(msg: PlayerMessage): { blockType: string; data: Record<string, any> } | null {
  if (msg.direction !== "outbound") return null;
  for (const key of EXPANDABLE_BLOCK_KEYS) {
    if (msg[key]) {
      return { blockType: key, data: { [key]: msg[key] } };
    }
  }
  return null;
}

/** Find the last expandable block in the messages array */
export function findLastExpandableBlock(messages: PlayerMessage[]): { blockType: string; data: Record<string, any> } | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const result = detectExpandableBlock(messages[i]);
    if (result) return result;
  }
  return null;
}

/**
 * Auto-expand blocks when new expandable messages appear.
 * Only activates in expanded/unbound mode on desktop.
 * Includes debounce protection and zero-rated guard.
 */
export function useBlockExpansion(
  messages: PlayerMessage[],
  experienceMode: ExperienceMode,
) {
  const { expandBlock, isDesktop, shouldExpand, dataPolicy } = useExperienceRuntime();
  const prevLength = useRef(messages.length);
  const lastExpandTime = useRef(0);
  const expandTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (expandTimer.current) clearTimeout(expandTimer.current);
    };
  }, []);

  useEffect(() => {
    // Only auto-expand when messages grow
    if (messages.length <= prevLength.current) {
      prevLength.current = messages.length;
      return;
    }
    prevLength.current = messages.length;

    // Guards
    if (experienceMode === "framed") return;
    if (!isDesktop) return;
    if (dataPolicy === "zero-rated") return;

    // Debounce: don't auto-expand within 800ms of last expansion
    const now = Date.now();
    if (now - lastExpandTime.current < 800) return;

    // Check the last message for expandable blocks
    const lastMsg = messages[messages.length - 1];
    const detected = detectExpandableBlock(lastMsg);
    if (!detected) return;
    if (NEVER_AUTO_EXPAND.includes(detected.blockType)) return;
    if (!shouldExpand(detected.blockType)) return;

    // Clear any pending expansion
    if (expandTimer.current) clearTimeout(expandTimer.current);

    // Delay to let the message render and feel natural
    expandTimer.current = setTimeout(() => {
      lastExpandTime.current = Date.now();
      expandBlock(lastMsg.id, detected.blockType, detected.data);
    }, 400);
  }, [messages.length, experienceMode, isDesktop, expandBlock, shouldExpand, dataPolicy, messages]);
}
