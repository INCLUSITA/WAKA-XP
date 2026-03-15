/**
 * BlockVariantWrapper — Resolves and applies block variant styles.
 * Wraps sovereign blocks to provide device/data-aware rendering.
 *
 * Variants:
 *   - compact:   Mobile-optimized, touch targets, less chrome
 *   - standard:  Default rendering
 *   - expanded:  Desktop expanded with more detail and space
 *   - zero-rated: Ultra-light, minimal borders, no shadows
 */

import { createContext, useContext, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useExperienceRuntime } from "@/contexts/ExperienceRuntimeContext";
import type { BlockZone, DeviceClass, DataPolicy } from "@/types/experienceRuntime";

export type BlockVariant = "compact" | "standard" | "expanded" | "zero-rated";

interface BlockVariantContextValue {
  variant: BlockVariant;
  zone: BlockZone;
  blockType: string;
}

const BlockVariantCtx = createContext<BlockVariantContextValue>({
  variant: "standard",
  zone: "phone-inline",
  blockType: "",
});

export function useBlockVariant() {
  return useContext(BlockVariantCtx);
}

/** Resolve the appropriate variant for a block */
export function resolveBlockVariant(
  blockType: string,
  deviceClass: DeviceClass,
  dataPolicy: DataPolicy,
  zone: BlockZone = "phone-inline",
): BlockVariant {
  if (dataPolicy === "zero-rated") return "zero-rated";
  if (zone === "side-panel" || zone === "overlay" || zone === "modal" || zone === "fullscreen") return "expanded";
  if (deviceClass === "mobile") return "compact";
  return "standard";
}

/** CSS classes for each variant */
const VARIANT_CLASSES: Record<BlockVariant, string> = {
  compact: "waka-block-compact",
  standard: "waka-block-standard",
  expanded: "waka-block-expanded",
  "zero-rated": "waka-block-zero",
};

interface BlockVariantWrapperProps {
  blockType: string;
  children: ReactNode;
  className?: string;
}

export function BlockVariantWrapper({ blockType, children, className }: BlockVariantWrapperProps) {
  const { device, dataPolicy, resolveBlockZone } = useExperienceRuntime();
  const zone = resolveBlockZone(blockType);
  const variant = resolveBlockVariant(blockType, device.deviceClass, dataPolicy, zone);

  return (
    <BlockVariantCtx.Provider value={{ variant, zone, blockType }}>
      <div
        className={cn(VARIANT_CLASSES[variant], className)}
        data-variant={variant}
        data-zone={zone}
        data-block={blockType}
      >
        {children}
      </div>
    </BlockVariantCtx.Provider>
  );
}
