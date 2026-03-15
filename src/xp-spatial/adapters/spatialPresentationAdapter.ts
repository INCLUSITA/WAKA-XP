/**
 * Spatial Presentation Adapter
 * Translates Player outputs into Spatial render decisions.
 * This is the bridge between the Player core and the Spatial renderer.
 */

import type {
  RuntimeIntent,
  SpatialRenderDecision,
  SpatialPresentationMode,
  PhonePose,
  SpatialSurfaceType,
} from "../types/spatial";
import type { PlayerMessage } from "@/components/player/WakaSovereignPlayer";

/* ── Intent Resolution ── */

/** Resolve intent from a PlayerMessage */
export function resolveIntent(msg: PlayerMessage): RuntimeIntent {
  // 1. By sovereign block presence
  if (msg.catalog) return "catalog";
  if (msg.payment || msg.paymentConfirmation) return "payment_momo";
  if (msg.momoAccount) return "payment_momo";
  if (msg.creditSimulation || msg.creditContract) return "credit";
  if (msg.inlineForm) return "form";
  if (msg.certificate) return "receipt";
  if (msg.mediaCarousel) return "media";
  if (msg.servicePlans) return "service_plans";
  if (msg.clientStatus) return "info_panel";
  if (msg.training) return "info_panel";
  if (msg.location) return "info_panel";

  // 2. By text heuristic (fallback)
  const t = msg.text.toLowerCase();
  if (/catalog|catalogue|téléphone|produit|bnpl/.test(t)) return "catalog";
  if (/kyc|cni|identit|document|scanner/.test(t)) return "kyc_identity";
  if (/momo|wallet|paiement|payment|compte/.test(t)) return "payment_momo";
  if (/reçu|receipt|comprobante|facture/.test(t)) return "receipt";
  if (/confirm|success|approuvé|validé/.test(t)) return "confirmation";
  if (/crédit|simulation|financement/.test(t)) return "credit";

  return "unknown";
}

/* ── Intent → Spatial Mapping ── */

const INTENT_MAP: Record<RuntimeIntent, {
  mode: SpatialPresentationMode;
  pose: PhonePose;
  surface: SpatialSurfaceType;
}> = {
  catalog:      { mode: "catalog_eruption",    pose: "catalog_retreat",    surface: "catalog_grid_surface" },
  kyc_identity: { mode: "scanner_eruption",    pose: "scanner_tilt",       surface: "kyc_scanner_surface" },
  payment_momo: { mode: "receipt_eruption",     pose: "payment_pulse",      surface: "receipt_surface" },
  receipt:      { mode: "receipt_eruption",     pose: "payment_pulse",      surface: "receipt_surface" },
  credit:       { mode: "floating_panel",      pose: "focused_panel",      surface: "floating_panel_surface" },
  service_plans:{ mode: "floating_panel",      pose: "focused_panel",      surface: "floating_panel_surface" },
  info_panel:   { mode: "floating_panel",      pose: "focused_panel",      surface: "floating_panel_surface" },
  confirmation: { mode: "confirmation_burst",  pose: "confirmation_glow",  surface: "confirmation_surface" },
  form:         { mode: "floating_panel",      pose: "focused_panel",      surface: "form_surface" },
  media:        { mode: "floating_panel",      pose: "idle",               surface: "media_surface" },
  unknown:      { mode: "chat_only",           pose: "idle",               surface: "none" },
};

/* ── Main Adapter ── */

export function resolveSpatialDecision(msg: PlayerMessage): SpatialRenderDecision {
  const intent = resolveIntent(msg);
  const mapping = INTENT_MAP[intent];

  return {
    intent,
    presentationMode: mapping.mode,
    phonePose: mapping.pose,
    surfaceType: mapping.surface,
    hudText: intent !== "unknown" ? getHudText(intent) : undefined,
    triggerHaptics: intent !== "unknown" && intent !== "info_panel",
    keepChatMessage: true,
    closeBehavior: intent === "confirmation" ? "followup_message" : "reset_to_idle",
  };
}

function getHudText(intent: RuntimeIntent): string {
  const map: Record<string, string> = {
    catalog: "Catalogue chargé",
    kyc_identity: "Vérification d'identité",
    payment_momo: "Transaction en cours",
    receipt: "Reçu généré",
    credit: "Simulation de crédit",
    service_plans: "Plans disponibles",
    confirmation: "Confirmé ✓",
    form: "Formulaire actif",
    media: "Média",
    info_panel: "Information",
  };
  return map[intent] || "";
}
