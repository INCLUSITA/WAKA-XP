/**
 * useSpatialExperience — Visual state layer for Spatial renderer.
 * Separated from the Player's conversation store.
 */

import { useState, useCallback } from "react";
import type {
  SpatialSurfaceState,
  SpatialHudState,
  PhonePose,
  SpatialRenderDecision,
} from "../types/spatial";

export interface SpatialExperienceState {
  activeSurface: SpatialSurfaceState | null;
  phonePose: PhonePose;
  hud: SpatialHudState;
  lastDecision: SpatialRenderDecision | null;
}

const INITIAL_STATE: SpatialExperienceState = {
  activeSurface: null,
  phonePose: "idle",
  hud: { visible: false, text: "", mode: "idle" },
  lastDecision: null,
};

export function useSpatialExperience() {
  const [state, setState] = useState<SpatialExperienceState>(INITIAL_STATE);

  const applySpatialDecision = useCallback((decision: SpatialRenderDecision) => {
    // Haptics
    if (decision.triggerHaptics && navigator.vibrate) {
      navigator.vibrate(20);
    }

    setState({
      activeSurface: decision.surfaceType !== "none"
        ? {
            id: `surface-${Date.now()}`,
            type: decision.surfaceType,
            payload: decision.payload,
            closable: true,
            priority: 1,
          }
        : null,
      phonePose: decision.phonePose,
      hud: decision.hudText
        ? { visible: true, text: decision.hudText, mode: "sync" }
        : { visible: false, text: "", mode: "idle" },
      lastDecision: decision,
    });

    // Auto-hide HUD after 3s
    if (decision.hudText) {
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          hud: { ...prev.hud, visible: false },
        }));
      }, 3000);
    }
  }, []);

  const closeSurface = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeSurface: null,
      phonePose: "idle",
    }));
  }, []);

  const resetPhonePose = useCallback(() => {
    setState(prev => ({ ...prev, phonePose: "idle" }));
  }, []);

  const setHud = useCallback((hud: SpatialHudState) => {
    setState(prev => ({ ...prev, hud }));
  }, []);

  return {
    ...state,
    applySpatialDecision,
    closeSurface,
    resetPhonePose,
    setHud,
  };
}
