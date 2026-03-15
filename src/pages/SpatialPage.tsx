/**
 * SpatialPage — Entry point for WAKA XP Spatial experience.
 * Wraps SpatialRoot with necessary providers from Player core.
 */

import { SpatialRoot } from "@/xp-spatial/components/SpatialRoot";
import { PlayerContextProvider } from "@/contexts/PlayerContextProvider";
import { PlayerMemoryProvider } from "@/contexts/PlayerMemoryProvider";

export default function SpatialPage() {
  return (
    <PlayerContextProvider>
      <PlayerMemoryProvider>
        <SpatialRoot />
      </PlayerMemoryProvider>
    </PlayerContextProvider>
  );
}
