import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Clock, AlertTriangle, Info } from "lucide-react";

/**
 * Detects if a step output or terminal reason indicates a WhatsApp
 * customer-care-window policy issue.
 */
export function isWindowPolicyError(text?: string | null): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return (
    lower.includes("window") ||
    lower.includes("template") ||
    lower.includes("hsm") ||
    lower.includes("re-engage") ||
    lower.includes("131047") || // Meta error code for outside window
    lower.includes("outside the allowed window") ||
    lower.includes("message failed to send because more than 24 hours")
  );
}

/**
 * Small inline badge shown on run steps / terminal reasons
 * when a WhatsApp window policy issue is detected.
 */
export function WindowPolicyBadge() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Badge
          variant="outline"
          className="gap-1 text-[10px] cursor-help border-amber-400 text-amber-600 bg-amber-500/8"
        >
          <Clock className="h-3 w-3" />
          24h window
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent className="w-72 text-xs space-y-2" side="top">
        <p className="font-semibold flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
          WhatsApp Customer Care Window
        </p>
        <p className="text-muted-foreground leading-relaxed">
          WhatsApp allows free-form messaging only within <strong>24 hours</strong> of 
          the customer's last inbound message. Outside this window, you must use 
          a pre-approved <strong>message template (HSM)</strong> to re-engage.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          If a send failed with a window error, the customer hasn't messaged recently 
          enough for free-form delivery.
        </p>
      </HoverCardContent>
    </HoverCard>
  );
}

/**
 * Compact policy note shown inside the Connections card or flow editor
 * to remind operators about WhatsApp constraints.
 */
export function WhatsAppPolicyNote({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 cursor-help">
            <Info className="h-3 w-3" />
            24h window policy
          </span>
        </HoverCardTrigger>
        <HoverCardContent className="w-72 text-xs space-y-2" side="top">
          <p className="font-semibold">WhatsApp Sending Policy</p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>In-window</strong> (within 24h of customer message): free-form text, 
            interactive buttons, and media are allowed.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>Outside window</strong>: only pre-approved <strong>templates (HSM)</strong> can 
            be sent. Free-form messages will be rejected by the API.
          </p>
        </HoverCardContent>
      </HoverCard>
    );
  }

  return (
    <div className="rounded-md border border-amber-200 bg-amber-50/50 dark:border-amber-500/20 dark:bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
      <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
      <div className="space-y-0.5 leading-relaxed">
        <span className="font-semibold">24h customer care window.</span>{" "}
        Free-form messages are only delivered within 24h of the customer's last message. 
        Outside this window, use a pre-approved template (HSM).
      </div>
    </div>
  );
}
