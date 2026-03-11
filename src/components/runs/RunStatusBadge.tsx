import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertTriangle, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig = {
  active: {
    icon: Loader2,
    label: "Active",
    className: "border-blue-500/30 bg-blue-500/10 text-blue-600",
    spin: true,
  },
  waiting: {
    icon: Clock,
    label: "Waiting",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-600",
  },
  completed: {
    icon: CheckCircle,
    label: "Completed",
    className: "border-green-500/30 bg-green-500/10 text-green-600",
  },
  expired: {
    icon: AlertTriangle,
    label: "Expired",
    className: "border-orange-500/30 bg-orange-500/10 text-orange-600",
  },
  errored: {
    icon: XCircle,
    label: "Errored",
    className: "border-red-500/30 bg-red-500/10 text-red-600",
  },
} as const;

export function RunStatusBadge({ status }: { status: keyof typeof statusConfig }) {
  const config = statusConfig[status] ?? statusConfig.active;
  const Icon = config.icon;
  const spin = "spin" in config && config.spin;

  return (
    <Badge variant="outline" className={cn("gap-1 font-mono text-xs", config.className)}>
      <Icon className={cn("h-3 w-3", spin && "animate-spin")} />
      {config.label}
    </Badge>
  );
}
