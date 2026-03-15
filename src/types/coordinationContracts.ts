/**
 * Coordination Contracts — Avatar, Voice & Orchestration
 * ──────────────────────────────────────────────────────
 * Typed contracts for coordinating avatar, voice and UI.
 * The runtime emits cues; consumer components react.
 * No AXIOM dependency — purely neutral contracts.
 */

import type { DeviceClass, DataPolicy, BlockZone } from "./experienceRuntime";

/* ── Avatar ── */

/** Role the avatar assumes during a given cue */
export type AvatarRole = "narrator" | "coach" | "operator";

/** Emotion/state for avatar expression */
export type AvatarExpression =
  | "neutral"
  | "greeting"
  | "thinking"
  | "explaining"
  | "celebrating"
  | "empathetic"
  | "confirming";

export interface AvatarCue {
  id: string;
  /** When this cue should fire (step id or block type) */
  trigger: AvatarTrigger;
  /** Role the avatar plays for this cue */
  role: AvatarRole;
  /** Visual expression */
  expression: AvatarExpression;
  /** Text the avatar speaks (NOT duplicated in chat) */
  speech?: string;
  /** How long the avatar stays visible (ms). 0 = until dismissed */
  durationMs: number;
  /** Whether the avatar cue blocks user input while active */
  blocking: boolean;
  /** Priority — higher wins if two cues fire simultaneously */
  priority: number;
}

export interface AvatarTrigger {
  type: "step" | "block" | "event" | "idle";
  /** Step ID, block type, or event name */
  value: string;
  /** Optional condition */
  condition?: string;
}

/** Rules for avatar degradation based on device/policy */
export interface AvatarDegradation {
  /** Device class → avatar rendering mode */
  deviceRules: Record<DeviceClass, AvatarRenderMode>;
  /** Data policy → override */
  policyRules: Record<DataPolicy, AvatarRenderMode>;
}

export type AvatarRenderMode =
  | "full"         // Full avatar with animation
  | "mini"         // Small face + caption (mobile)
  | "caption-only" // Text-only fallback (zero-rated)
  | "none";        // Disabled

export const DEFAULT_AVATAR_DEGRADATION: AvatarDegradation = {
  deviceRules: {
    desktop: "full",
    tablet: "full",
    mobile: "mini",
  },
  policyRules: {
    libre: "full",
    "subventionné": "mini",
    "zero-rated": "caption-only",
  },
};

/* ── Voice ── */

/** When voice should activate */
export type VoiceMoment =
  | "welcome"
  | "reentry"
  | "block-explanation"
  | "confirmation"
  | "error"
  | "celebration"
  | "idle-prompt";

export interface VoiceCue {
  id: string;
  /** When this voice cue fires */
  moment: VoiceMoment;
  /** Text to speak via TTS */
  utterance: string;
  /** Language code */
  language: string;
  /** Whether to show captions on screen */
  showCaption: boolean;
  /** Priority (higher wins) */
  priority: number;
  /** Maximum duration in ms (auto-cut) */
  maxDurationMs: number;
  /** Should voice pause if user starts typing? */
  interruptible: boolean;
}

/** Rules for voice degradation */
export interface VoiceDegradation {
  deviceRules: Record<DeviceClass, boolean>;
  policyRules: Record<DataPolicy, boolean>;
}

export const DEFAULT_VOICE_DEGRADATION: VoiceDegradation = {
  deviceRules: {
    desktop: true,
    tablet: true,
    mobile: true,
  },
  policyRules: {
    libre: true,
    "subventionné": true,
    "zero-rated": false, // No voice in zero-rated
  },
};

/* ── Orchestration ── */

/**
 * OrchestrationRule — Governs how avatar, voice, and UI
 * coordinate for a given moment in the experience.
 */
export interface OrchestrationRule {
  id: string;
  /** What triggers this rule */
  trigger: {
    type: "block-render" | "step-enter" | "journey-resume" | "journey-complete" | "error" | "idle";
    blockType?: string;
    stepId?: string;
  };
  /** Avatar behavior (optional — null means no avatar) */
  avatar: AvatarCue | null;
  /** Voice behavior (optional — null means silent) */
  voice: VoiceCue | null;
  /** UI coordination */
  ui: {
    /** Which zone should be active/focused */
    focusZone?: BlockZone;
    /** Whether to auto-expand the related block */
    autoExpand?: boolean;
    /** Whether to dim other surfaces */
    dimOthers?: boolean;
    /** Delay before this rule activates (ms) */
    delayMs?: number;
  };
  /** Device/policy conditions for this rule to apply */
  conditions?: {
    devices?: DeviceClass[];
    policies?: DataPolicy[];
    minScreenWidth?: number;
  };
}

/* ── Memory Contracts ── */

/**
 * Structured memory model for the Player.
 * Separates concerns: session vs journey vs user vs tenant.
 */

export interface SessionMemory {
  sessionId: string;
  startedAt: string;
  lastInteractionAt: string;
  /** Current data mode preference for this session */
  dataMode: string;
  /** Current experience mode */
  experienceMode: string;
  /** Ephemeral state (form drafts, scroll position, etc.) */
  ephemeral: Record<string, unknown>;
}

export interface JourneyMemory {
  journeyId: string;
  journeyName: string;
  /** Current step ID */
  currentStepId: string | null;
  /** Step label for display */
  currentStepLabel: string | null;
  /** Total steps (if known) */
  totalSteps: number | null;
  /** Completed step IDs */
  completedSteps: string[];
  /** When the journey started */
  startedAt: string;
  /** Last interaction within this journey */
  lastInteractionAt: string;
  /** Journey-specific context data */
  context: Record<string, unknown>;
  /** Status */
  status: "active" | "paused" | "completed" | "abandoned";
}

export interface UserProfileMemory {
  /** Preferred language */
  language: string;
  /** Preferred data mode */
  preferredDataMode: string;
  /** Total sessions count */
  totalSessions: number;
  /** Features the user has used */
  engagedFeatures: string[];
  /** Last products/services viewed */
  lastViewedItems: string[];
  /** Custom preferences */
  preferences: Record<string, unknown>;
}

export interface TenantContextMemory {
  tenantId: string;
  /** Tenant-level defaults */
  defaults: Record<string, unknown>;
  /** Active campaigns or promotions */
  activeCampaigns: string[];
  /** Tenant policies that affect UX */
  policies: Record<string, unknown>;
}

/**
 * Full memory snapshot — what the runtime exposes.
 */
export interface PlayerMemoryState {
  session: SessionMemory;
  journeys: JourneyMemory[];
  userProfile: UserProfileMemory | null;
  tenantContext: TenantContextMemory | null;
  /** The most recent active journey (convenience accessor) */
  activeJourney: JourneyMemory | null;
  /** Whether memory has been loaded from persistence */
  isLoaded: boolean;
}

/**
 * ContinuitySignal — What the welcome-back strip shows.
 */
export interface ContinuitySignal {
  type: "journey-resume" | "last-action" | "recommendation";
  title: string;
  subtitle?: string;
  journeyId?: string;
  stepId?: string;
  actionLabel: string;
  icon?: string;
}
