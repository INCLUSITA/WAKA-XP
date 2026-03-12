/** Lightweight trigger rule types for flow launch behavior. */

export interface TriggerRule {
  id: string;
  type: "keyword" | "catch_all";
  active: boolean;
  /** Channel scope — null means all channels */
  channel: string | null;
  /** Keywords for type=keyword (ignored for catch_all) */
  keywords: string[];
}

export function createDefaultKeywordRule(channel: string | null = null): TriggerRule {
  return {
    id: crypto.randomUUID(),
    type: "keyword",
    active: true,
    channel,
    keywords: [],
  };
}

export function createDefaultCatchAllRule(channel: string | null = null): TriggerRule {
  return {
    id: crypto.randomUUID(),
    type: "catch_all",
    active: true,
    channel,
    keywords: [],
  };
}

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  sms: "SMS",
  telegram: "Telegram",
};

export function channelLabel(ch: string | null): string {
  if (!ch) return "All channels";
  return CHANNEL_LABELS[ch] || ch;
}

export function ruleSummary(rule: TriggerRule): string {
  if (rule.type === "catch_all") return "Any inbound message";
  if (rule.keywords.length === 0) return "No keywords set";
  return rule.keywords.join(", ");
}
