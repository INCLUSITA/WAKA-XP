/**
 * AvatarSlot — Placeholder for the future AvatarCoordinator.
 * Renders a visual slot where the avatar will appear when enabled.
 * 
 * Contract for future implementation:
 *   - In framed mode: avatar is an icon in the phone header
 *   - In expanded mode: avatar is a small panel in the side panel area
 *   - In unbound mode: avatar gets a dedicated panel in the canvas
 *
 * The avatar will NOT duplicate UI content. It will:
 *   - Narrate while UI shows forms/catalogs/receipts
 *   - Coach while UI shows training/tutorials
 *   - Celebrate while UI shows certificates/confirmations
 */

import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExperienceMode } from "./ExperienceModeSwitcher";

interface AvatarSlotProps {
  mode: ExperienceMode;
  className?: string;
  /** When true, show the avatar panel (future: will render actual avatar) */
  enabled?: boolean;
}

export function AvatarSlot({ mode, className, enabled = false }: AvatarSlotProps) {
  // In framed mode, avatar doesn't get a slot (it would be an icon in the phone)
  if (mode === "framed") return null;

  return (
    <div
      className={cn(
        "rounded-xl border border-dashed transition-all",
        enabled
          ? "border-primary/40 bg-primary/5"
          : "border-border/50 bg-muted/20",
        mode === "unbound" ? "p-6" : "p-4",
        className
      )}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <div className={cn(
          "rounded-full flex items-center justify-center",
          enabled ? "bg-primary/15" : "bg-muted/50",
          mode === "unbound" ? "h-16 w-16" : "h-10 w-10",
        )}>
          <User className={cn(
            enabled ? "text-primary/60" : "text-muted-foreground/40",
            mode === "unbound" ? "h-8 w-8" : "h-5 w-5",
          )} />
        </div>
        <div>
          <p className={cn(
            "font-semibold",
            enabled ? "text-primary/70" : "text-muted-foreground/50",
            mode === "unbound" ? "text-xs" : "text-[10px]",
          )}>
            WAKA Avatar
          </p>
          <p className={cn(
            "mt-0.5",
            enabled ? "text-primary/50" : "text-muted-foreground/40",
            mode === "unbound" ? "text-[11px]" : "text-[9px]",
          )}>
            {enabled ? "Avatar activo — narrando" : "Disponible en próxima versión"}
          </p>
        </div>
      </div>
    </div>
  );
}
