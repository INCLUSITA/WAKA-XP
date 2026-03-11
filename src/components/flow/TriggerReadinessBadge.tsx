import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Zap, ZapOff } from "lucide-react";
import { TriggerReadiness } from "@/lib/flowValidation";

interface TriggerReadinessBadgeProps {
  readiness: TriggerReadiness;
  compact?: boolean;
}

export function TriggerReadinessBadge({ readiness, compact = false }: TriggerReadinessBadgeProps) {
  const Icon = readiness.ready ? Zap : ZapOff;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors cursor-default ${
            readiness.ready
              ? "bg-primary/10 text-primary border border-primary/20"
              : "bg-muted text-muted-foreground border border-border"
          }`}
        >
          <Icon className="h-3 w-3" />
          {!compact && (readiness.ready ? "Trigger-ready" : "Not launchable")}
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[240px] text-xs">
        <p className="font-semibold">{readiness.ready ? "✓ Ready to trigger" : "✗ Not trigger-ready"}</p>
        <p className="mt-0.5 text-muted-foreground">{readiness.reason}</p>
        {readiness.entryNodeType && (
          <p className="mt-0.5 text-muted-foreground">Entry: <code className="text-[10px]">{readiness.entryNodeType}</code></p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
