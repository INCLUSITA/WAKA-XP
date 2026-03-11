import { Badge } from "@/components/ui/badge";
import type { ChannelInfo } from "@/lib/channelUtils";

interface ChannelBadgeProps {
  channel: ChannelInfo;
  size?: "sm" | "md";
}

export function ChannelBadge({ channel, size = "sm" }: ChannelBadgeProps) {
  const isSm = size === "sm";
  return (
    <Badge
      variant="outline"
      className="gap-1 font-medium border"
      style={{
        borderColor: `${channel.color}`,
        color: channel.color,
        backgroundColor: `color-mix(in srgb, ${channel.color} 8%, transparent)`,
        fontSize: isSm ? "10px" : "11px",
        padding: isSm ? "1px 6px" : "2px 8px",
      }}
    >
      <span
        className="inline-block rounded-full"
        style={{
          width: isSm ? 6 : 7,
          height: isSm ? 6 : 7,
          backgroundColor: channel.color,
        }}
      />
      {isSm ? channel.shortLabel : channel.label}
    </Badge>
  );
}
