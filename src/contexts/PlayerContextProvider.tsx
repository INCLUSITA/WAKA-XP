/**
 * PlayerContextProvider — Neutral context layer for the WAKA XP Player.
 *
 * Today: reads from scenario_config, YAML/JSON, and API endpoints.
 * Future: accepts pluggable providers (e.g., AxiomContextProvider).
 *
 * This provider exposes a stable contract that the Player UI consumes,
 * without coupling to any specific backend knowledge engine.
 *
 * Architecture:
 *   PlayerContextProvider (this file)
 *     └── reads from: ScenarioContextSource (default, reads scenario_config)
 *     └── future:     AxiomContextSource (pluggable, reads from AXIOM API)
 *
 * The UI never knows where the context comes from.
 */

import { createContext, useContext, useMemo, type ReactNode } from "react";

/* ── Contract Types ── */

export interface PlayerPersona {
  name: string;
  language: string;
  role: string;
  avatar?: string;
  greeting?: string;
}

export interface PlayerTool {
  id: string;
  name: string;
  description: string;
  endpoint?: string;
  parameters?: Record<string, any>;
}

export interface PlayerEndpoint {
  id: string;
  url: string;
  method: string;
  headers?: Record<string, string>;
  description?: string;
}

export interface PlayerKnowledge {
  id: string;
  type: "yaml" | "json" | "text" | "url";
  label: string;
  content?: string;
  url?: string;
}

export interface PlayerPolicy {
  id: string;
  rule: string;
  priority: number;
  scope: "global" | "scenario" | "block";
}

export interface ExperienceSettings {
  defaultMode: "framed" | "expanded" | "unbound";
  autoExpand: boolean;
  avatarEnabled: boolean;
  voiceEnabled: boolean;
  dataPolicyDefault: "libre" | "subventionné" | "zero-rated";
}

export interface PlayerContextValue {
  /** Active persona for the AI agent */
  persona: PlayerPersona;
  /** Recognized intents / topics */
  intents: string[];
  /** Available tools the AI can use */
  tools: PlayerTool[];
  /** API endpoints available */
  endpoints: PlayerEndpoint[];
  /** Knowledge base entries */
  knowledge: PlayerKnowledge[];
  /** Business rules / policies */
  policies: PlayerPolicy[];
  /** Experience rendering settings */
  experienceSettings: ExperienceSettings;
  /** Raw scenario config (for passthrough) */
  scenarioConfig: Record<string, any>;
  /** System prompt derived from all context */
  systemPrompt: string | null;
  /** Whether context is loaded */
  isReady: boolean;
  /** Source identifier (for debugging) */
  source: "scenario" | "axiom" | "hybrid";
}

/* ── Default values ── */

const DEFAULT_PERSONA: PlayerPersona = {
  name: "WAKA XP",
  language: "fr",
  role: "assistant",
};

const DEFAULT_EXPERIENCE: ExperienceSettings = {
  defaultMode: "expanded",
  autoExpand: true,
  avatarEnabled: false,
  voiceEnabled: true,
  dataPolicyDefault: "libre",
};

/* ── Context ── */

const PlayerCtx = createContext<PlayerContextValue | null>(null);

/* ── Provider Props ── */

interface PlayerContextProviderProps {
  children: ReactNode;
  /** Scenario config (the primary source today) */
  scenarioConfig?: Record<string, any>;
  /** Override system prompt */
  systemPrompt?: string | null;
  /** Additional tools from flow definition */
  tools?: PlayerTool[];
  /** Additional knowledge entries */
  knowledge?: PlayerKnowledge[];
  /** Additional endpoints */
  endpoints?: PlayerEndpoint[];
  /** Override persona */
  persona?: Partial<PlayerPersona>;
  /** Override experience settings */
  experienceSettings?: Partial<ExperienceSettings>;
}

/**
 * Extracts intents from scenario_config.
 * Convention: scenario_config.intents or scenario_config.topics
 */
function extractIntents(config: Record<string, any>): string[] {
  if (Array.isArray(config.intents)) return config.intents;
  if (Array.isArray(config.topics)) return config.topics;
  return [];
}

/**
 * Extracts tools from scenario_config.
 * Convention: scenario_config.tools
 */
function extractTools(config: Record<string, any>): PlayerTool[] {
  if (!Array.isArray(config.tools)) return [];
  return config.tools.map((t: any, i: number) => ({
    id: t.id || `tool-${i}`,
    name: t.name || t.function?.name || `Tool ${i + 1}`,
    description: t.description || t.function?.description || "",
    endpoint: t.endpoint,
    parameters: t.parameters || t.function?.parameters,
  }));
}

/**
 * Extracts policies from scenario_config.
 * Convention: scenario_config.policies or scenario_config.rules
 */
function extractPolicies(config: Record<string, any>): PlayerPolicy[] {
  const raw = config.policies || config.rules;
  if (!Array.isArray(raw)) return [];
  return raw.map((p: any, i: number) => ({
    id: p.id || `policy-${i}`,
    rule: typeof p === "string" ? p : p.rule || p.text || "",
    priority: p.priority ?? i,
    scope: p.scope || "scenario",
  }));
}

/* ── Provider Implementation ── */

export function PlayerContextProvider({
  children,
  scenarioConfig = {},
  systemPrompt = null,
  tools: additionalTools = [],
  knowledge: additionalKnowledge = [],
  endpoints: additionalEndpoints = [],
  persona: personaOverride,
  experienceSettings: settingsOverride,
}: PlayerContextProviderProps) {
  const value = useMemo<PlayerContextValue>(() => {
    // Extract from scenario_config
    const configTools = extractTools(scenarioConfig);
    const configIntents = extractIntents(scenarioConfig);
    const configPolicies = extractPolicies(scenarioConfig);

    // Merge persona
    const persona: PlayerPersona = {
      ...DEFAULT_PERSONA,
      ...(scenarioConfig.persona || {}),
      ...personaOverride,
    };

    // Merge experience settings
    const experienceSettings: ExperienceSettings = {
      ...DEFAULT_EXPERIENCE,
      ...(scenarioConfig.experience || {}),
      ...settingsOverride,
    };

    return {
      persona,
      intents: configIntents,
      tools: [...configTools, ...additionalTools],
      endpoints: additionalEndpoints,
      knowledge: additionalKnowledge,
      policies: configPolicies,
      experienceSettings,
      scenarioConfig,
      systemPrompt: systemPrompt || scenarioConfig.systemPrompt || null,
      isReady: true,
      source: "scenario",
    };
  }, [scenarioConfig, systemPrompt, additionalTools, additionalKnowledge, additionalEndpoints, personaOverride, settingsOverride]);

  return (
    <PlayerCtx.Provider value={value}>
      {children}
    </PlayerCtx.Provider>
  );
}

/* ── Hook ── */

export function usePlayerContext(): PlayerContextValue {
  const ctx = useContext(PlayerCtx);
  if (!ctx) {
    // Graceful fallback: return defaults if not wrapped in provider
    return {
      persona: DEFAULT_PERSONA,
      intents: [],
      tools: [],
      endpoints: [],
      knowledge: [],
      policies: [],
      experienceSettings: DEFAULT_EXPERIENCE,
      scenarioConfig: {},
      systemPrompt: null,
      isReady: false,
      source: "scenario",
    };
  }
  return ctx;
}
