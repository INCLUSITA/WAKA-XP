/**
 * ExperienceRuntimeContext
 * ────────────────────────
 * The brain of the Adaptive Experience Runtime.
 * Detects device capabilities, manages block placement decisions,
 * and provides the runtime state to all experience components.
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import type {
  DeviceCapabilities,
  DeviceClass,
  ConnectivityTier,
  DataPolicy,
  BlockZone,
  BlockPlacementRule,
  ExpandedBlockState,
  UserMemory,
  ExperienceRuntimeState,
} from "@/types/experienceRuntime";
import { DEFAULT_BLOCK_PLACEMENTS } from "@/types/experienceRuntime";

/* ── Device Detection ── */

function detectDeviceClass(width: number): DeviceClass {
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

function detectConnectivity(): ConnectivityTier {
  if (typeof navigator === "undefined") return "wifi";
  const nav = navigator as any;
  if (!nav.connection) return "wifi";
  const type = nav.connection.effectiveType;
  if (type === "slow-2g" || type === "2g") return "2g";
  if (type === "3g") return "3g";
  if (type === "4g") return "4g";
  return "wifi";
}

function detectCapabilities(): DeviceCapabilities {
  const width = window.innerWidth;
  const height = window.innerHeight;
  return {
    deviceClass: detectDeviceClass(width),
    connectivity: detectConnectivity(),
    touchEnabled: "ontouchstart" in window || navigator.maxTouchPoints > 0,
    screenWidth: width,
    screenHeight: height,
    pixelRatio: window.devicePixelRatio || 1,
    reducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false,
    voiceEnabled: typeof window.SpeechRecognition !== "undefined" || typeof (window as any).webkitSpeechRecognition !== "undefined",
    avatarEnabled: true, // Can be refined based on GPU detection
  };
}

/* ── Default Memory ── */

const DEFAULT_MEMORY: UserMemory = {
  preferences: {},
  journeyProgress: {},
  behavior: {
    totalSessions: 0,
    lastSessionAt: new Date().toISOString(),
    preferredDataMode: "libre",
    preferredLanguage: "fr",
    interactionCount: 0,
    avgResponseTime: 0,
    engagedFeatures: [],
  },
  sessionState: {},
};

/* ── Context Interface ── */

interface ExperienceRuntimeContextValue {
  /** Current runtime state */
  state: ExperienceRuntimeState;
  /** Device capabilities (reactive to resize) */
  device: DeviceCapabilities;
  /** Whether we're in desktop expanded mode */
  isDesktop: boolean;
  /** Whether we're in mobile constrained mode */
  isMobile: boolean;
  /** Current data policy */
  dataPolicy: DataPolicy;
  /** Resolve where a block should render */
  resolveBlockZone: (blockType: string, override?: Partial<Record<DeviceClass, BlockZone>>) => BlockZone;
  /** Check if a block type should expand outside the phone */
  shouldExpand: (blockType: string) => boolean;
  /** Expand a block to its designated zone */
  expandBlock: (messageId: string, blockType: string, data: Record<string, any>) => void;
  /** Collapse the expanded block back to phone-inline */
  collapseBlock: () => void;
  /** Get the currently expanded block */
  expandedBlock: ExpandedBlockState | null;
  /** Update data policy */
  setDataPolicy: (policy: DataPolicy) => void;
  /** Update user memory */
  updateMemory: (updater: (mem: UserMemory) => UserMemory) => void;
  /** Track a user interaction for behavioral signals */
  trackInteraction: (feature?: string) => void;
  /** Custom placement rules (merged with defaults) */
  placementRules: BlockPlacementRule[];
}

const ExperienceRuntimeCtx = createContext<ExperienceRuntimeContextValue | null>(null);

/* ── Provider ── */

interface ExperienceRuntimeProviderProps {
  children: ReactNode;
  tenantId?: string | null;
  dataPolicy?: DataPolicy;
  /** Override or extend default placement rules */
  customRules?: BlockPlacementRule[];
}

export function ExperienceRuntimeProvider({
  children,
  tenantId = null,
  dataPolicy: initialPolicy = "libre",
  customRules = [],
}: ExperienceRuntimeProviderProps) {
  const [device, setDevice] = useState<DeviceCapabilities>(detectCapabilities);
  const [dataPolicyState, setDataPolicy] = useState<DataPolicy>(initialPolicy);
  const [expandedBlock, setExpandedBlock] = useState<ExpandedBlockState | null>(null);
  const [memory, setMemory] = useState<UserMemory>(DEFAULT_MEMORY);
  const interactionCount = useRef(0);

  // Merge custom rules with defaults (custom rules take priority)
  const placementRules: BlockPlacementRule[] = [
    ...DEFAULT_BLOCK_PLACEMENTS.filter(
      (d) => !customRules.some((c) => c.blockType === d.blockType)
    ),
    ...customRules,
  ];

  // Reactive device detection
  useEffect(() => {
    const handleResize = () => setDevice(detectCapabilities());
    window.addEventListener("resize", handleResize);

    // Listen for connectivity changes
    const nav = navigator as any;
    if (nav.connection) {
      nav.connection.addEventListener("change", handleResize);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (nav.connection) {
        nav.connection.removeEventListener("change", handleResize);
      }
    };
  }, []);

  // Sync data policy from parent
  useEffect(() => {
    setDataPolicy(initialPolicy);
  }, [initialPolicy]);

  const resolveBlockZone = useCallback(
    (blockType: string, override?: Partial<Record<DeviceClass, BlockZone>>): BlockZone => {
      // Check for explicit override first
      if (override?.[device.deviceClass]) {
        return override[device.deviceClass]!;
      }

      // Find rule
      const rule = placementRules.find((r) => r.blockType === blockType);
      if (!rule) return "phone-inline";

      // Zero-rated mode: everything stays inline for minimum data usage
      if (dataPolicyState === "zero-rated") return "phone-inline";

      // Mobile: use mobile placement
      if (device.deviceClass === "mobile") return rule.mobile;

      // Tablet: use mobile placement unless screen is wide enough
      if (device.deviceClass === "tablet") {
        return device.screenWidth >= (rule.desktopMinWidth || 1024) ? rule.desktop : rule.mobile;
      }

      // Desktop: use desktop placement
      return rule.desktop;
    },
    [device, dataPolicyState, placementRules]
  );

  const shouldExpand = useCallback(
    (blockType: string): boolean => {
      const zone = resolveBlockZone(blockType);
      return zone !== "phone-inline" && zone !== "phone-anchored";
    },
    [resolveBlockZone]
  );

  const expandBlock = useCallback(
    (messageId: string, blockType: string, data: Record<string, any>) => {
      const zone = resolveBlockZone(blockType);
      if (zone === "phone-inline") return; // Don't expand inline blocks
      setExpandedBlock({ messageId, blockType, zone, data });
    },
    [resolveBlockZone]
  );

  const collapseBlock = useCallback(() => {
    setExpandedBlock(null);
  }, []);

  const updateMemory = useCallback((updater: (mem: UserMemory) => UserMemory) => {
    setMemory((prev) => updater(prev));
  }, []);

  const trackInteraction = useCallback((feature?: string) => {
    interactionCount.current += 1;
    setMemory((prev) => ({
      ...prev,
      behavior: {
        ...prev.behavior,
        interactionCount: interactionCount.current,
        lastSessionAt: new Date().toISOString(),
        engagedFeatures: feature && !prev.behavior.engagedFeatures.includes(feature)
          ? [...prev.behavior.engagedFeatures, feature]
          : prev.behavior.engagedFeatures,
      },
    }));
  }, []);

  const state: ExperienceRuntimeState = {
    device,
    dataPolicy: dataPolicyState,
    tenantId,
    expandedBlock,
    memory,
    journeyId: null,
  };

  const value: ExperienceRuntimeContextValue = {
    state,
    device,
    isDesktop: device.deviceClass === "desktop",
    isMobile: device.deviceClass === "mobile",
    dataPolicy: dataPolicyState,
    resolveBlockZone,
    shouldExpand,
    expandBlock,
    collapseBlock,
    expandedBlock,
    setDataPolicy,
    updateMemory,
    trackInteraction,
    placementRules,
  };

  return (
    <ExperienceRuntimeCtx.Provider value={value}>
      {children}
    </ExperienceRuntimeCtx.Provider>
  );
}

/* ── Hook ── */

export function useExperienceRuntime() {
  const ctx = useContext(ExperienceRuntimeCtx);
  if (!ctx) throw new Error("useExperienceRuntime must be used within ExperienceRuntimeProvider");
  return ctx;
}
