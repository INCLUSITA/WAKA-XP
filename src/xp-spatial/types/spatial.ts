/**
 * WAKA XP Spatial — Core Types
 * Defines the presentation layer contracts for the Spatial renderer.
 * Consumes outputs from the Player core and translates them into spatial decisions.
 */

export type RuntimeIntent =
  | "catalog"
  | "kyc_identity"
  | "payment_momo"
  | "receipt"
  | "info_panel"
  | "confirmation"
  | "form"
  | "media"
  | "credit"
  | "service_plans"
  | "unknown";

export type SpatialPresentationMode =
  | "chat_only"
  | "hud_hint"
  | "floating_panel"
  | "catalog_eruption"
  | "scanner_eruption"
  | "receipt_eruption"
  | "immersive_overlay"
  | "confirmation_burst";

export type PhonePose =
  | "idle"
  | "catalog_retreat"
  | "scanner_tilt"
  | "payment_pulse"
  | "focused_panel"
  | "confirmation_glow";

export type SpatialSurfaceType =
  | "none"
  | "catalog_grid_surface"
  | "kyc_scanner_surface"
  | "receipt_surface"
  | "floating_panel_surface"
  | "confirmation_surface"
  | "media_surface"
  | "form_surface";

export interface SpatialSurfacePayload {
  title?: string;
  subtitle?: string;
  items?: Array<Record<string, unknown>>;
  metadata?: Record<string, unknown>;
  raw?: unknown;
}

export interface SpatialSurfaceState {
  id: string;
  type: SpatialSurfaceType;
  payload?: SpatialSurfacePayload;
  closable?: boolean;
  priority?: number;
}

export interface SpatialHudState {
  visible: boolean;
  text: string;
  mode?: "idle" | "sync" | "processing" | "success" | "warning";
}

export interface SpatialRenderDecision {
  intent: RuntimeIntent;
  presentationMode: SpatialPresentationMode;
  phonePose: PhonePose;
  surfaceType: SpatialSurfaceType;
  hudText?: string;
  triggerHaptics?: boolean;
  keepChatMessage?: boolean;
  closeBehavior?: "reset_to_idle" | "stay_contextual" | "followup_message";
}
