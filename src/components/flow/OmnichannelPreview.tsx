import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Channel = "whatsapp" | "telegram";

const CHANNEL_CONFIG: Record<Channel, {
  name: string;
  headerBg: string;
  bubbleBg: string;
  bubbleText: string;
  bgPattern: string;
  accentColor: string;
}> = {
  whatsapp: {
    name: "WhatsApp",
    headerBg: "bg-[hsl(142,70%,35%)]",
    bubbleBg: "bg-[hsl(142,30%,90%)]",
    bubbleText: "text-[hsl(142,10%,15%)]",
    bgPattern: "bg-[hsl(30,20%,93%)]",
    accentColor: "text-emerald-600",
  },
  telegram: {
    name: "Telegram",
    headerBg: "bg-[hsl(200,75%,45%)]",
    bubbleBg: "bg-[hsl(200,60%,92%)]",
    bubbleText: "text-[hsl(200,10%,15%)]",
    bgPattern: "bg-[hsl(200,30%,95%)]",
    accentColor: "text-sky-600",
  },
};

interface Props {
  messages: string[];
  quickReplies?: string[];
  contactName?: string;
}

export function OmnichannelPreview({ messages, quickReplies = [], contactName = "User" }: Props) {
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const config = CHANNEL_CONFIG[channel];

  return (
    <div className="space-y-3">
      {/* Channel toggle */}
      <div className="flex gap-1.5">
        {(Object.keys(CHANNEL_CONFIG) as Channel[]).map((ch) => (
          <button
            key={ch}
            onClick={() => setChannel(ch)}
            className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
              channel === ch
                ? `${CHANNEL_CONFIG[ch].accentColor} bg-current/10 ring-1 ring-current/20`
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {CHANNEL_CONFIG[ch].name}
          </button>
        ))}
      </div>

      {/* Phone frame */}
      <div className="mx-auto w-[280px] rounded-[2rem] border-4 border-foreground/15 bg-foreground/5 p-1 shadow-xl">
        {/* Notch */}
        <div className="mx-auto h-5 w-24 rounded-b-xl bg-foreground/15 mb-0.5" />

        {/* Screen */}
        <div className="rounded-[1.5rem] overflow-hidden bg-background">
          {/* Header */}
          <div className={`${config.headerBg} px-4 py-2.5 flex items-center gap-2`}>
            <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center">
              <MessageSquare className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-semibold text-white">WAKA Bot</p>
              <p className="text-[9px] text-white/70">online</p>
            </div>
          </div>

          {/* Chat area */}
          <div className={`${config.bgPattern} px-3 py-3 min-h-[260px] max-h-[320px] overflow-y-auto space-y-2`}>
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[10px] text-muted-foreground/40">No messages to preview</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className="flex justify-start">
                  <div className={`${config.bubbleBg} rounded-xl rounded-tl-sm px-3 py-2 max-w-[85%] shadow-sm`}>
                    <p className={`text-[12px] leading-relaxed ${config.bubbleText} whitespace-pre-wrap`}>
                      {msg || "Empty message"}
                    </p>
                    <p className="text-[8px] text-muted-foreground/50 text-right mt-0.5">
                      {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))
            )}

            {/* Quick replies */}
            {quickReplies.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {quickReplies.map((qr, i) => (
                  <button
                    key={i}
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors ${
                      channel === "whatsapp"
                        ? "border-emerald-400/40 text-emerald-700 hover:bg-emerald-50"
                        : "border-sky-400/40 text-sky-700 hover:bg-sky-50"
                    }`}
                  >
                    {qr}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input bar */}
          <div className="border-t border-border/30 px-3 py-2 flex items-center gap-2 bg-background">
            <div className="flex-1 h-7 rounded-full bg-muted/50 border border-border/30 px-3 flex items-center">
              <span className="text-[10px] text-muted-foreground/40">Type a message…</span>
            </div>
            <div className={`h-7 w-7 rounded-full ${config.headerBg} flex items-center justify-center`}>
              <Send className="h-3 w-3 text-white" />
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-[9px] text-muted-foreground/40">
        Preview on {config.name} — actual rendering may vary
      </p>
    </div>
  );
}
