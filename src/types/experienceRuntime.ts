/**
 * Experience Runtime Types
 * ────────────────────────
 * Defines the type system for the Adaptive Experience Runtime.
 * Core concept: ONE canonical journey, MULTIPLE adaptive renderings.
 */

/* ── Device & Environment ── */

export type DeviceClass = "mobile" | "tablet" | "desktop";
export type ConnectivityTier = "offline" | "2g" | "3g" | "4g" | "wifi";
export type DataPolicy = "libre" | "subventionné" | "zero-rated";

export interface DeviceCapabilities {
  deviceClass: DeviceClass;
  connectivity: ConnectivityTier;
  touchEnabled: boolean;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  reducedMotion: boolean;
  /** Whether voice input/output is available */
  voiceEnabled: boolean;
  /** Whether avatar rendering is supported */
  avatarEnabled: boolean;
}

/* ── Block Placement ── */

/**
 * Where a block can render in the experience canvas.
 * The runtime decides placement based on device, block type, and tenant policy.
 */
export type BlockZone =
  | "phone-inline"       // Inside the phone chat flow (default)
  | "phone-anchored"     // Attached to phone frame (e.g., persistent status bar)
  | "side-panel"         // Expanded panel next to phone (desktop only)
  | "overlay"            // Floating overlay on top of the canvas
  | "modal"              // Centered modal dialog
  | "fullscreen"         // Takes over the entire viewport
  | "bottom-sheet"       // Mobile bottom sheet (mobile only)
  ;

export interface BlockPlacementRule {
  /** Block type identifier */
  blockType: string;
  /** Preferred zone on desktop */
  desktop: BlockZone;
  /** Preferred zone on mobile */
  mobile: BlockZone;
  /** Whether the block can be expanded/collapsed between zones */
  expandable: boolean;
  /** Minimum screen width to use desktop placement */
  desktopMinWidth?: number;
}

/**
 * Default placement rules for sovereign blocks.
 * These define where each block type prefers to render.
 */
export const DEFAULT_BLOCK_PLACEMENTS: BlockPlacementRule[] = [
  // Messages always inline
  { blockType: "text",               desktop: "phone-inline",  mobile: "phone-inline",  expandable: false },
  { blockType: "quickReplies",       desktop: "phone-inline",  mobile: "phone-inline",  expandable: false },
  { blockType: "menu",               desktop: "phone-inline",  mobile: "phone-inline",  expandable: true },
  { blockType: "richCard",           desktop: "phone-inline",  mobile: "phone-inline",  expandable: true },

  // Commerce — expand on desktop
  { blockType: "catalog",            desktop: "side-panel",    mobile: "phone-inline",  expandable: true },
  { blockType: "payment",            desktop: "side-panel",    mobile: "phone-inline",  expandable: true },
  { blockType: "paymentConfirmation",desktop: "side-panel",    mobile: "phone-inline",  expandable: true },
  { blockType: "servicePlans",       desktop: "side-panel",    mobile: "phone-inline",  expandable: true },

  // Finance — expand on desktop
  { blockType: "creditSimulation",   desktop: "side-panel",    mobile: "phone-inline",  expandable: true },
  { blockType: "creditContract",     desktop: "side-panel",    mobile: "phone-inline",  expandable: true },
  { blockType: "clientStatus",       desktop: "side-panel",    mobile: "phone-inline",  expandable: true },
  { blockType: "momoAccount",        desktop: "side-panel",    mobile: "phone-inline",  expandable: true },
  { blockType: "deviceLockConsent",  desktop: "modal",         mobile: "bottom-sheet",  expandable: false },

  // Forms — expand on desktop
  { blockType: "inlineForm",         desktop: "side-panel",    mobile: "phone-inline",  expandable: true },
  { blockType: "rating",             desktop: "phone-inline",  mobile: "phone-inline",  expandable: false },

  // Media & Training — immersive on desktop
  { blockType: "mediaCarousel",      desktop: "side-panel",    mobile: "phone-inline",  expandable: true },
  { blockType: "training",           desktop: "side-panel",    mobile: "phone-inline",  expandable: true },
  { blockType: "certificate",        desktop: "overlay",       mobile: "phone-inline",  expandable: true },
  { blockType: "location",           desktop: "side-panel",    mobile: "phone-inline",  expandable: true },

  // Channels — fullscreen takeover
  { blockType: "voiceCall",          desktop: "overlay",       mobile: "fullscreen",    expandable: false },
  { blockType: "avatar",             desktop: "side-panel",    mobile: "fullscreen",    expandable: false },
];

/* ── Persistent Memory ── */

export interface UserMemory {
  /** User preferences (language, theme, accessibility) */
  preferences: Record<string, any>;
  /** Progress tracking per journey */
  journeyProgress: Record<string, JourneyProgress>;
  /** Behavioral signals (last visit, interaction count, etc.) */
  behavior: BehaviorSignals;
  /** Session-specific ephemeral state */
  sessionState: Record<string, any>;
}

export interface JourneyProgress {
  journeyId: string;
  currentStep: string;
  completedSteps: string[];
  startedAt: string;
  lastInteractionAt: string;
  /** Custom data saved during the journey */
  context: Record<string, any>;
}

export interface BehaviorSignals {
  totalSessions: number;
  lastSessionAt: string;
  preferredDataMode: DataPolicy;
  preferredLanguage: string;
  interactionCount: number;
  /** Average response time in ms */
  avgResponseTime: number;
  /** Features the user has engaged with */
  engagedFeatures: string[];
}

/* ── Canonical Journey ── */

export interface CanonicalJourneyStep {
  id: string;
  type: "message" | "block" | "decision" | "wait" | "effect";
  /** The block type if type is "block" */
  blockType?: string;
  /** Placement override (otherwise uses default rules) */
  placementOverride?: Partial<Record<DeviceClass, BlockZone>>;
  /** Content/config for this step */
  content: Record<string, any>;
  /** Conditions for this step to be active */
  conditions?: StepCondition[];
}

export interface StepCondition {
  type: "device" | "connectivity" | "dataPolicy" | "memory" | "tenant" | "custom";
  operator: "eq" | "neq" | "gt" | "lt" | "in" | "notIn";
  field: string;
  value: any;
}

/* ── Runtime State ── */

export interface ExperienceRuntimeState {
  device: DeviceCapabilities;
  dataPolicy: DataPolicy;
  tenantId: string | null;
  /** Currently expanded block (showing in side-panel/overlay/modal) */
  expandedBlock: ExpandedBlockState | null;
  /** User persistent memory */
  memory: UserMemory;
  /** Active journey context */
  journeyId: string | null;
}

export interface ExpandedBlockState {
  messageId: string;
  blockType: string;
  zone: BlockZone;
  data: Record<string, any>;
}
