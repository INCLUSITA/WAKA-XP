/**
 * PlayerMemoryProvider — Manages session & journey memory.
 * 
 * Persists to player_conversations metadata.
 * Exposes continuity signals for welcome-back strip.
 * No AXIOM dependency.
 */

import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type {
  PlayerMemoryState,
  SessionMemory,
  JourneyMemory,
  UserProfileMemory,
  ContinuitySignal,
} from "@/types/coordinationContracts";

/* ── Context Value ── */

interface PlayerMemoryContextValue {
  memory: PlayerMemoryState;
  /** Record progress on the active journey */
  updateJourneyStep: (journeyId: string, stepId: string, stepLabel?: string, totalSteps?: number) => void;
  /** Start tracking a new journey */
  startJourney: (journeyId: string, journeyName: string) => void;
  /** Mark journey as completed */
  completeJourney: (journeyId: string) => void;
  /** Get continuity signal for welcome-back strip */
  getContinuitySignal: () => ContinuitySignal | null;
  /** Dismiss the continuity signal */
  dismissContinuity: () => void;
  /** Whether there's a pending journey to resume */
  hasPendingJourney: boolean;
  /** Save a user preference */
  setPreference: (key: string, value: unknown) => void;
  /** Record that user viewed an item */
  trackViewedItem: (itemId: string) => void;
}

const PlayerMemoryCtx = createContext<PlayerMemoryContextValue | null>(null);

/* ── Session ID ── */

const SESSION_KEY = "waka_memory_session_id";
function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/* ── Storage Keys ── */
const MEMORY_STORAGE_KEY = "waka_player_memory";

function loadMemoryFromStorage(): Partial<PlayerMemoryState> {
  try {
    const raw = localStorage.getItem(MEMORY_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function saveMemoryToStorage(state: PlayerMemoryState) {
  try {
    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify({
      journeys: state.journeys,
      userProfile: state.userProfile,
    }));
  } catch { /* ignore */ }
}

/* ── Provider ── */

interface Props {
  children: ReactNode;
  tenantId?: string;
  sessionId?: string;
}

export function PlayerMemoryProvider({ children, tenantId, sessionId: externalSessionId }: Props) {
  const sessionId = externalSessionId || getSessionId();
  const [dismissed, setDismissed] = useState(false);

  const [memory, setMemory] = useState<PlayerMemoryState>(() => {
    const stored = loadMemoryFromStorage();
    return {
      session: {
        sessionId,
        startedAt: new Date().toISOString(),
        lastInteractionAt: new Date().toISOString(),
        dataMode: "libre",
        experienceMode: "expanded",
        ephemeral: {},
      },
      journeys: (stored.journeys as JourneyMemory[]) || [],
      userProfile: (stored.userProfile as UserProfileMemory) || {
        language: "fr",
        preferredDataMode: "libre",
        totalSessions: 0,
        engagedFeatures: [],
        lastViewedItems: [],
        preferences: {},
      },
      tenantContext: tenantId ? { tenantId, defaults: {}, activeCampaigns: [], policies: {} } : null,
      activeJourney: null,
      isLoaded: true,
    };
  });

  // Derive active journey
  const activeJourney = useMemo(() =>
    memory.journeys.find(j => j.status === "active") || null,
    [memory.journeys]
  );

  // Persist on change
  useEffect(() => {
    saveMemoryToStorage(memory);
  }, [memory.journeys, memory.userProfile]);

  const startJourney = useCallback((journeyId: string, journeyName: string) => {
    setMemory(prev => {
      const exists = prev.journeys.find(j => j.journeyId === journeyId);
      if (exists) {
        return {
          ...prev,
          journeys: prev.journeys.map(j =>
            j.journeyId === journeyId ? { ...j, status: "active" as const, lastInteractionAt: new Date().toISOString() } : j
          ),
        };
      }
      const newJourney: JourneyMemory = {
        journeyId,
        journeyName,
        currentStepId: null,
        currentStepLabel: null,
        totalSteps: null,
        completedSteps: [],
        startedAt: new Date().toISOString(),
        lastInteractionAt: new Date().toISOString(),
        context: {},
        status: "active",
      };
      return { ...prev, journeys: [...prev.journeys, newJourney] };
    });
  }, []);

  const updateJourneyStep = useCallback((journeyId: string, stepId: string, stepLabel?: string, totalSteps?: number) => {
    setMemory(prev => ({
      ...prev,
      journeys: prev.journeys.map(j =>
        j.journeyId === journeyId
          ? {
              ...j,
              currentStepId: stepId,
              currentStepLabel: stepLabel || j.currentStepLabel,
              totalSteps: totalSteps ?? j.totalSteps,
              completedSteps: j.completedSteps.includes(stepId) ? j.completedSteps : [...j.completedSteps, stepId],
              lastInteractionAt: new Date().toISOString(),
            }
          : j
      ),
    }));
  }, []);

  const completeJourney = useCallback((journeyId: string) => {
    setMemory(prev => ({
      ...prev,
      journeys: prev.journeys.map(j =>
        j.journeyId === journeyId ? { ...j, status: "completed" as const } : j
      ),
    }));
  }, []);

  const getContinuitySignal = useCallback((): ContinuitySignal | null => {
    if (dismissed) return null;
    if (!activeJourney) return null;
    const completedCount = activeJourney.completedSteps.length;
    const total = activeJourney.totalSteps;
    const progress = total ? `${completedCount}/${total}` : `${completedCount} étapes`;

    return {
      type: "journey-resume",
      title: `Continuer : ${activeJourney.journeyName}`,
      subtitle: activeJourney.currentStepLabel
        ? `Étape : ${activeJourney.currentStepLabel} — ${progress}`
        : `Progression : ${progress}`,
      journeyId: activeJourney.journeyId,
      stepId: activeJourney.currentStepId || undefined,
      actionLabel: "Reprendre",
      icon: "▶️",
    };
  }, [activeJourney, dismissed]);

  const dismissContinuity = useCallback(() => setDismissed(true), []);

  const setPreference = useCallback((key: string, value: unknown) => {
    setMemory(prev => ({
      ...prev,
      userProfile: prev.userProfile
        ? { ...prev.userProfile, preferences: { ...prev.userProfile.preferences, [key]: value } }
        : prev.userProfile,
    }));
  }, []);

  const trackViewedItem = useCallback((itemId: string) => {
    setMemory(prev => {
      if (!prev.userProfile) return prev;
      const items = [itemId, ...prev.userProfile.lastViewedItems.filter(i => i !== itemId)].slice(0, 10);
      return { ...prev, userProfile: { ...prev.userProfile, lastViewedItems: items } };
    });
  }, []);

  const value = useMemo<PlayerMemoryContextValue>(() => ({
    memory: { ...memory, activeJourney },
    updateJourneyStep,
    startJourney,
    completeJourney,
    getContinuitySignal,
    dismissContinuity,
    hasPendingJourney: !!activeJourney,
    setPreference,
    trackViewedItem,
  }), [memory, activeJourney, updateJourneyStep, startJourney, completeJourney, getContinuitySignal, dismissContinuity, setPreference, trackViewedItem]);

  return (
    <PlayerMemoryCtx.Provider value={value}>
      {children}
    </PlayerMemoryCtx.Provider>
  );
}

/* ── Hook ── */

export function usePlayerMemory(): PlayerMemoryContextValue {
  const ctx = useContext(PlayerMemoryCtx);
  if (!ctx) {
    // Graceful fallback
    return {
      memory: {
        session: { sessionId: "", startedAt: "", lastInteractionAt: "", dataMode: "libre", experienceMode: "expanded", ephemeral: {} },
        journeys: [],
        userProfile: null,
        tenantContext: null,
        activeJourney: null,
        isLoaded: false,
      },
      updateJourneyStep: () => {},
      startJourney: () => {},
      completeJourney: () => {},
      getContinuitySignal: () => null,
      dismissContinuity: () => {},
      hasPendingJourney: false,
      setPreference: () => {},
      trackViewedItem: () => {},
    };
  }
  return ctx;
}
