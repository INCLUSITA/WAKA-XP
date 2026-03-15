/**
 * useBlockExpansion — Auto-expands eligible sovereign blocks to the side panel
 * when in Expanded or Unbound mode on desktop.
 */

import { useEffect, useRef } from "react";
import type { PlayerMessage } from "@/components/player/WakaSovereignPlayer";
import type { ExperienceMode } from "@/components/player/ExperienceModeSwitcher";
import { useExperienceRuntime } from "@/contexts/ExperienceRuntimeContext";

/** Block types that can be auto-expanded */
const EXPANDABLE_BLOCK_KEYS: Array<keyof PlayerMessage> = [
  "catalog", "payment", "paymentConfirmation", "creditSimulation",
  "creditContract", "clientStatus", "momoAccount", "servicePlans",
  "inlineForm", "training", "mediaCarousel", "location", "certificate",
];

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
 */
export function useBlockExpansion(
  messages: PlayerMessage[],
  experienceMode: ExperienceMode,
) {
  const { expandBlock, isDesktop, shouldExpand } = useExperienceRuntime();
  const prevLength = useRef(messages.length);

  useEffect(() => {
    // Only auto-expand when messages grow
    if (messages.length <= prevLength.current) {
      prevLength.current = messages.length;
      return;
    }
    prevLength.current = messages.length;

    // Only auto-expand in expanded/unbound mode on desktop
    if (experienceMode === "framed" || !isDesktop) return;

    // Check the last message for expandable blocks
    const lastMsg = messages[messages.length - 1];
    const detected = detectExpandableBlock(lastMsg);
    if (detected && shouldExpand(detected.blockType)) {
      // Small delay to let the message render first
      setTimeout(() => {
        expandBlock(lastMsg.id, detected.blockType, detected.data);
      }, 300);
    }
  }, [messages.length, experienceMode, isDesktop, expandBlock, shouldExpand, messages]);
}
