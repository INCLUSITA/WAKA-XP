import { Cloud, CloudOff, Loader2, Check } from "lucide-react";
import { SaveStatus } from "@/hooks/useFlowPersistence";
import { useEffect, useState } from "react";

interface SaveStatusIndicatorProps {
  status: SaveStatus;
}

export function SaveStatusIndicator({ status }: SaveStatusIndicatorProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status === "saving") {
      setVisible(true);
    } else if (status === "saved") {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 1500);
      return () => clearTimeout(timer);
    } else if (status === "error") {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [status]);

  if (!visible) return null;

  const config = {
    idle: { icon: Cloud, text: "", iconClass: "text-muted-foreground", textClass: "text-muted-foreground" },
    saving: { icon: Loader2, text: "", iconClass: "text-muted-foreground/50 animate-spin", textClass: "" },
    saved: { icon: Check, text: "", iconClass: "text-primary/60", textClass: "" },
    error: { icon: CloudOff, text: "Error", iconClass: "text-destructive", textClass: "text-destructive" },
  }[status];

  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-1 text-xs transition-opacity duration-300 ${status === "saved" ? "opacity-60" : "opacity-100"}`}>
      <Icon className={`h-3 w-3 ${config.iconClass}`} />
      {config.text && <span className={`text-[11px] ${config.textClass}`}>{config.text}</span>}
    </div>
  );
}
