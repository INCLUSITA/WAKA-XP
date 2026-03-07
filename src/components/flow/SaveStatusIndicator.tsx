import { Cloud, CloudOff, Loader2, Check } from "lucide-react";
import { SaveStatus } from "@/hooks/useFlowPersistence";

interface SaveStatusIndicatorProps {
  status: SaveStatus;
}

export function SaveStatusIndicator({ status }: SaveStatusIndicatorProps) {
  const config = {
    idle: { icon: Cloud, text: "", className: "text-muted-foreground" },
    saving: { icon: Loader2, text: "Guardando...", className: "text-muted-foreground animate-spin" },
    saved: { icon: Check, text: "Guardado ✓", className: "text-primary" },
    error: { icon: CloudOff, text: "Error", className: "text-destructive" },
  }[status];

  if (status === "idle") return null;

  const Icon = config.icon;

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <Icon className={`h-3.5 w-3.5 ${config.className}`} />
      <span className={config.className}>{config.text}</span>
    </div>
  );
}
