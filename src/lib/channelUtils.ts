/**
 * Channel display utilities — derive channel info from contact URNs
 * and provide consistent visual tokens across the product.
 */

export interface ChannelInfo {
  id: string;
  label: string;
  shortLabel: string;
  color: string;
}

const CHANNEL_MAP: Record<string, ChannelInfo> = {
  whatsapp: { id: "whatsapp", label: "WhatsApp", shortLabel: "WA", color: "hsl(142 71% 45%)" },
  telegram: { id: "telegram", label: "Telegram", shortLabel: "TG", color: "hsl(200 80% 50%)" },
  sms: { id: "sms", label: "SMS", shortLabel: "SMS", color: "hsl(270 60% 55%)" },
  email: { id: "email", label: "Email", shortLabel: "Email", color: "hsl(15 80% 55%)" },
  voice: { id: "voice", label: "Voice", shortLabel: "Voice", color: "hsl(210 60% 50%)" },
};

const UNKNOWN_CHANNEL: ChannelInfo = {
  id: "unknown",
  label: "Unknown",
  shortLabel: "—",
  color: "hsl(0 0% 50%)",
};

/** Extract channel from a contact URN like "whatsapp:+226..." or "telegram:12345" */
export function channelFromUrn(urn: string): ChannelInfo {
  if (!urn) return UNKNOWN_CHANNEL;
  const scheme = urn.split(":")[0]?.toLowerCase();
  return CHANNEL_MAP[scheme] ?? UNKNOWN_CHANNEL;
}

/** Get channel info by id */
export function getChannelInfo(id: string): ChannelInfo {
  return CHANNEL_MAP[id] ?? UNKNOWN_CHANNEL;
}
