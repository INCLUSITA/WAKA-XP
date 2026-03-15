/**
 * ExperienceModeSwitcher — Toggle between Framed, Expanded, and Unbound modes.
 * Enterprise-grade mode selector for the adaptive experience runtime.
 */

import { Smartphone, Monitor, Maximize } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

export type ExperienceMode = "framed" | "expanded" | "unbound";

interface ExperienceModeSwitcherProps {
  mode: ExperienceMode;
  onChange: (mode: ExperienceMode) => void;
  disabled?: boolean;
}

const MODES: { key: ExperienceMode; icon: typeof Smartphone; label: string; description: string }[] = [
  {
    key: "framed",
    icon: Smartphone,
    label: "Framed",
    description: "Experiencia confinada dentro del teléfono — ideal para testing móvil y zero-rated",
  },
  {
    key: "expanded",
    icon: Monitor,
    label: "Expanded",
    description: "Teléfono visible + bloques expandidos en paneles laterales, overlays y modales",
  },
  {
    key: "unbound",
    icon: Maximize,
    label: "Unbound",
    description: "El teléfono es referencia narrativa — la experiencia se expande por todo el canvas",
  },
];

export function ExperienceModeSwitcher({ mode, onChange, disabled }: ExperienceModeSwitcherProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/50 p-0.5">
        {MODES.map((m) => (
          <Tooltip key={m.key}>
            <TooltipTrigger asChild>
              <button
                onClick={() => !disabled && onChange(m.key)}
                disabled={disabled}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[10px] font-semibold transition-all",
                  mode === m.key
                    ? "bg-background text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <m.icon className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">{m.label}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[220px]">
              <p className="font-semibold text-xs">{m.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{m.description}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
