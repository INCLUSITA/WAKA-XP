/**
 * Waka Sovereign Player — Hybrid UI
 *
 * Matches the WhatsApp Simulator aesthetic: professional phone-frame,
 * WhatsApp-style chat area, clean bubbles, Waka branding in header.
 * Supports: quick replies, progress bar, voicebot UI.
 */

import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Bot, RotateCcw, MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SalamandraSvg } from "./SalamandraSvg";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

/* ── Types ── */

export interface PlayerMessage {
  id: string;
  text: string;
  direction: "inbound" | "outbound";
  timestamp: Date;
  quickReplies?: string[];
  /** 0-100 progress bar shown under the message */
  progress?: number;
  progressLabel?: string;
  /** voicebot flag — renders waveform UI */
  isVoice?: boolean;
}

interface WakaSovereignPlayerProps {
  messages: PlayerMessage[];
  botName?: string;
  onSend?: (text: string) => void;
  onQuickReply?: (label: string) => void;
  onVoiceToggle?: (active: boolean) => void;
  onReset?: () => void;
  status?: "online" | "typing" | "offline";
  className?: string;
}

/* ── Voicebot Waveform ── */
function VoiceWaveform({ active }: { active: boolean }) {
  return (
    <div className="flex items-end gap-[3px] h-6">
      {[0.6, 1, 0.4, 0.8, 0.5, 0.9, 0.3, 0.7, 0.5, 1, 0.6, 0.8].map((h, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-primary"
          initial={{ height: `${h * 24}px`, opacity: 0.3 }}
          animate={
            active
              ? {
                  height: [`${h * 10}px`, `${h * 24}px`, `${h * 14}px`],
                  opacity: [0.4, 0.9, 0.5],
                }
              : { height: `${h * 8}px`, opacity: 0.2 }
          }
          transition={
            active
              ? { duration: 0.6, repeat: Infinity, repeatType: "mirror", delay: i * 0.05 }
              : { duration: 0.3 }
          }
        />
      ))}
    </div>
  );
}

/* ── Main Component ── */

export function WakaSovereignPlayer({
  messages,
  botName = "WAKA",
  onSend,
  onQuickReply,
  onVoiceToggle,
  onReset,
  status = "online",
  className,
}: WakaSovereignPlayerProps) {
  const [inputText, setInputText] = useState("");
  const [voiceActive, setVoiceActive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || !onSend) return;
    onSend(trimmed);
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoice = () => {
    const next = !voiceActive;
    setVoiceActive(next);
    onVoiceToggle?.(next);
  };

  // Last message quick replies
  const lastMsg = messages[messages.length - 1];
  const activeQuickReplies = lastMsg?.quickReplies?.length ? lastMsg.quickReplies : [];

  return (
    <div className={cn("flex h-full w-full flex-col border-l border-border bg-background shadow-2xl", className)}>
      {/* ── Header — WhatsApp Simulator style ── */}
      <div className="flex items-center gap-3 bg-primary px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/20">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-primary-foreground">{botName}</p>
          <p className="text-xs text-primary-foreground/70">
            {status === "online" && "en ligne"}
            {status === "typing" && (
              <span className="italic">en train d'écrire…</span>
            )}
            {status === "offline" && "hors ligne"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {onReset && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onReset}
              className="text-primary-foreground hover:bg-primary-foreground/20"
              title="Réinitialiser"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ── Chat area — WhatsApp-style patterned background ── */}
      <div
        className="flex-1 overflow-y-auto px-3 py-4 relative"
        ref={scrollRef}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5ddd5' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: "hsl(var(--muted))",
        }}
      >
        {/* Salamandra watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <SalamandraSvg className="h-[60%] w-[60%] text-primary opacity-[0.04]" />
        </div>

        <div className="relative z-10 space-y-2">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <SalamandraSvg className="h-16 w-16 text-primary opacity-20 mb-3" />
              <p className="text-sm font-medium">Aucun message</p>
              <p className="text-[10px] mt-1">Envoyez un message pour commencer</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className={cn(
                    "flex gap-2",
                    msg.direction === "outbound" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm",
                      msg.direction === "outbound"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-card border border-border text-foreground rounded-bl-md"
                    )}
                  >
                    {/* Voice message UI */}
                    {msg.isVoice ? (
                      <div className="flex items-center gap-2 min-w-[140px]">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Mic className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <VoiceWaveform active={false} />
                        <span className="text-[10px] text-muted-foreground ml-auto">0:12</span>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap break-words leading-relaxed">
                        {msg.text}
                      </p>
                    )}

                    {/* Progress bar (micro-learning) */}
                    {msg.progress != null && (
                      <div className="mt-2 space-y-1">
                        <Progress value={msg.progress} className="h-1.5" />
                        {msg.progressLabel && (
                          <p
                            className={cn(
                              "text-[9px]",
                              msg.direction === "outbound"
                                ? "text-primary-foreground/60"
                                : "text-muted-foreground"
                            )}
                          >
                            {msg.progressLabel}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Timestamp */}
                    <p
                      className={cn(
                        "text-[9px] text-right mt-1",
                        msg.direction === "outbound"
                          ? "text-primary-foreground/50"
                          : "text-muted-foreground/50"
                      )}
                    >
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Quick replies */}
          {activeQuickReplies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-1.5 pt-1"
            >
              {activeQuickReplies.map((qr, i) => (
                <button
                  key={i}
                  onClick={() => onQuickReply?.(qr)}
                  className="rounded-full border border-primary/30 bg-background/90 backdrop-blur-sm px-3 py-1.5 text-[11px] font-medium text-primary hover:bg-primary/10 hover:border-primary/50 transition-all active:scale-95 shadow-sm"
                >
                  {qr}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Input bar ── */}
      <div className="border-t border-border px-3 py-2.5 flex items-center gap-2 bg-background">
        {/* Voice toggle */}
        <button
          onClick={toggleVoice}
          className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center transition-all flex-shrink-0",
            voiceActive
              ? "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/30 animate-pulse"
              : "bg-muted hover:bg-muted/80 text-muted-foreground"
          )}
        >
          {voiceActive ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
        </button>

        {/* Text input */}
        <div className="flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={voiceActive ? "Écoute en cours…" : "Tapez un message…"}
            disabled={voiceActive}
            className={cn(
              "w-full h-9 rounded-full bg-muted/50 border border-border/40 px-4 text-[12px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all",
              voiceActive && "opacity-50 cursor-not-allowed"
            )}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!inputText.trim() || voiceActive}
          className={cn(
            "h-9 w-9 rounded-full flex items-center justify-center transition-all flex-shrink-0",
            inputText.trim() && !voiceActive
              ? "bg-primary text-primary-foreground shadow-md hover:shadow-lg"
              : "bg-muted text-muted-foreground/40"
          )}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
