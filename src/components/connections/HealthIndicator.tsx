import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { HealthStatus } from "@/hooks/useConnectionHealth";

const HEALTH_CONFIG: Record<HealthStatus, {
  label: string;
  icon: React.ReactNode;
  color: string;
}> = {
  healthy: {
    label: "Healthy",
    icon: <CheckCircle2 className="h-3 w-3" />,
    color: "hsl(142 71% 45%)",
  },
  warning: {
    label: "Warning",
    icon: <AlertTriangle className="h-3 w-3" />,
    color: "hsl(38 92% 50%)",
  },
  error: {
    label: "Error",
    icon: <XCircle className="h-3 w-3" />,
    color: "hsl(0 84% 60%)",
  },
  unknown: {
    label: "Unknown",
    icon: <HelpCircle className="h-3 w-3" />,
    color: "hsl(0 0% 50%)",
  },
};

interface HealthIndicatorProps {
  status: HealthStatus;
  checkedAt?: string | null;
  error?: string | null;
}

export function HealthIndicator({ status, checkedAt, error }: HealthIndicatorProps) {
  const config = HEALTH_CONFIG[status];
  const timeAgo = checkedAt ? formatDistanceToNow(new Date(checkedAt), { addSuffix: true }) : null;

  const badge = (
    <Badge
      variant="outline"
      className="gap-1 text-[10px] cursor-default"
      style={{
        borderColor: config.color,
        color: config.color,
        backgroundColor: `color-mix(in srgb, ${config.color} 8%, transparent)`,
      }}
    >
      {config.icon}
      {config.label}
    </Badge>
  );

  if (!timeAgo && !error) return badge;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>{badge}</HoverCardTrigger>
      <HoverCardContent className="w-56 text-xs space-y-1.5" side="bottom">
        <p className="font-medium">Health: {config.label}</p>
        {timeAgo && (
          <p className="text-muted-foreground">Last checked {timeAgo}</p>
        )}
        {error && (
          <p className="text-destructive break-words">{error}</p>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
