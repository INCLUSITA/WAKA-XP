/**
 * Waka Sovereign Player — Hybrid UI
 *
 * Combines WhatsApp familiarity, Telegram elegance, and Waka identity.
 * Ultra-light: all branding via SVG. Aura wallpaper with salamander backdrop.
 * Supports: quick replies, progress bar, voicebot UI.
 */

import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, ChevronDown, Wifi } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SalamandraSvg } from "./SalamandraSvg";
import { Progress } from "@/components/ui/progress";

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
  /** Called when user sends a text message */
  onSend?: (text: string) => void;
  /** Called when user taps a quick-reply */
  onQuickReply?: (label: string) => void;
  /** Called when user taps mic toggle */
  onVoiceToggle?: (active: boolean) => void;
  /** Show online/typing indicator */
  status?: "online" | "typing" | "offline";
  className?: string;
}

/* ── Waka logo mark (inline SVG, ultra-light) ── */
function WakaLogoMark() {
  return (
    <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none">
      <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fontSize="13"
        fontWeight="700"
        fill="currentColor"
        fontFamily="Space Grotesk, sans-serif"
        opacity="0.9"
      >
        W
      </text>
    </svg>
  );
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
    <div
      className={cn(
        "mx-auto w-[320px] rounded-[2.2rem] border-[3px] border-foreground/12 bg-foreground/5 p-1.5 shadow-2xl",
        className
      )}
    >
      {/* ── Notch ── */}
      <div className="mx-auto h-[22px] w-28 rounded-b-2xl bg-foreground/12 flex items-center justify-center gap-2">
        <div className="h-2 w-2 rounded-full bg-foreground/20" />
        <div className="h-1.5 w-10 rounded-full bg-foreground/15" />
      </div>

      {/* ── Screen ── */}
      <div className="rounded-[1.7rem] overflow-hidden bg-background shadow-inner">
        {/* ── Header ── */}
        <div className="relative bg-primary px-4 py-3 flex items-center gap-3 overflow-hidden">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />

          <div className="relative h-9 w-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <WakaLogoMark />
          </div>
          <div className="flex-1 relative">
            <p className="text-[13px] font-bold text-primary-foreground tracking-wide">{botName}</p>
            <div className="flex items-center gap-1.5">
              {status === "online" && (
                <>
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  <p className="text-[10px] text-primary-foreground/70">en ligne</p>
                </>
              )}
              {status === "typing" && (
                <p className="text-[10px] text-primary-foreground/70 italic">en train d'écrire…</p>
              )}
              {status === "offline" && (
                <p className="text-[10px] text-primary-foreground/50">hors ligne</p>
              )}
            </div>
          </div>
          <Wifi className="h-3.5 w-3.5 text-primary-foreground/40 relative" />
        </div>

        {/* ── Chat area with Aura Wallpaper ── */}
        <div className="relative min-h-[340px] max-h-[420px]">
          {/* Salamandra aura background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <SalamandraSvg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[130%] w-[130%] text-primary" />
            {/* Soft radial gradient wash */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background/95" />
          </div>

          {/* Messages scroll */}
          <div
            ref={scrollRef}
            className="relative z-10 px-3 py-3 space-y-2 overflow-y-auto min-h-[340px] max-h-[420px] scrollbar-thin"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[280px] opacity-30">
                <SalamandraSvg className="h-20 w-20 text-primary" />
                <p className="text-[10px] text-muted-foreground mt-2">Intelligence Highway</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className={cn(
                      "flex",
                      msg.direction === "outbound" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[82%] rounded-2xl px-3.5 py-2.5 shadow-md",
                        msg.direction === "outbound"
                          ? "bg-primary text-primary-foreground rounded-br-md shadow-primary/20"
                          : "bg-white dark:bg-card text-foreground rounded-bl-md border border-border/40 shadow-black/5"
                      )}
                    >
                      {/* Voice message UI */}
                      {msg.isVoice ? (
                        <div className="flex items-center gap-2 min-w-[140px]">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Mic className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <VoiceWaveform active={false} />
                          <span className="text-[10px] text-muted-foreground ml-auto">0:12</span>
                        </div>
                      ) : (
                        <p className="text-[13px] leading-[1.55] whitespace-pre-wrap break-words">
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

            {/* Quick replies — anchored after last message */}
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
        <div className="border-t border-border/30 px-3 py-2.5 flex items-center gap-2 bg-background/95 backdrop-blur-sm">
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
          <div className="flex-1 relative">
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
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/50"
                : "bg-muted text-muted-foreground/40"
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        {/* ── Home indicator ── */}
        <div className="flex justify-center py-2 bg-background">
          <div className="h-1 w-28 rounded-full bg-foreground/10" />
        </div>
      </div>
    </div>
  );
}
