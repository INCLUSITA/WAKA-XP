/**
 * Waka Sovereign Player — Full iPhone WhatsApp Business aesthetic with WAKA identity
 */

import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Phone, Video, MoreVertical, Check, CheckCheck, Shield } from "lucide-react";
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
  progress?: number;
  progressLabel?: string;
  isVoice?: boolean;
  /** Source label under message e.g. "WAKA NEXUS → WhatsApp" */
  source?: string;
  /** System event (renders as centered gold card) */
  isSystemEvent?: boolean;
}

interface WakaSovereignPlayerProps {
  messages: PlayerMessage[];
  botName?: string;
  botSubtitle?: string;
  avatarUrl?: string;
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
    <div className="flex items-end gap-[2px] h-5">
      {[0.6, 1, 0.4, 0.8, 0.5, 0.9, 0.3, 0.7, 0.5, 1, 0.6, 0.8].map((h, i) => (
        <motion.div
          key={i}
          className="w-[2px] rounded-full"
          style={{ backgroundColor: "hsl(var(--primary))" }}
          initial={{ height: `${h * 20}px`, opacity: 0.3 }}
          animate={
            active
              ? { height: [`${h * 8}px`, `${h * 20}px`, `${h * 12}px`], opacity: [0.4, 0.9, 0.5] }
              : { height: `${h * 6}px`, opacity: 0.2 }
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

/* ── Status Bar (iPhone top) ── */
function IPhoneStatusBar() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return (
    <div className="flex items-center justify-between px-6 py-1.5 text-[11px] font-semibold text-foreground/80">
      <span>{time}</span>
      <div className="absolute left-1/2 -translate-x-1/2 w-[85px] h-[25px] bg-foreground/90 rounded-full" />
      <div className="flex items-center gap-1">
        {/* Signal bars */}
        <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor" className="opacity-70">
          <rect x="0" y="8" width="3" height="3" rx="0.5" />
          <rect x="4" y="5" width="3" height="6" rx="0.5" />
          <rect x="8" y="2" width="3" height="9" rx="0.5" />
          <rect x="12" y="0" width="3" height="11" rx="0.5" opacity="0.3" />
        </svg>
        {/* WiFi */}
        <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor" className="opacity-70">
          <path d="M7 9.5a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zM3.5 6.2a5 5 0 017 0l-.9.9a3.6 3.6 0 00-5.2 0l-.9-.9zM1 3.7a8.5 8.5 0 0112 0l-.9.9a7.1 7.1 0 00-10.2 0L1 3.7z" />
        </svg>
        {/* Battery */}
        <svg width="22" height="11" viewBox="0 0 22 11" fill="currentColor" className="opacity-70">
          <rect x="0" y="1" width="19" height="9" rx="2" stroke="currentColor" strokeWidth="1" fill="none" />
          <rect x="1.5" y="2.5" width="14" height="6" rx="1" />
          <rect x="20" y="3.5" width="2" height="4" rx="0.5" opacity="0.4" />
        </svg>
      </div>
    </div>
  );
}

/* ── Main Component ── */

export function WakaSovereignPlayer({
  messages,
  botName = "WAKA XP",
  botSubtitle = "Business Account · WAKA",
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

  const lastMsg = messages[messages.length - 1];
  const activeQuickReplies = lastMsg?.quickReplies?.length ? lastMsg.quickReplies : [];

  return (
    <div className={cn("flex h-full w-full flex-col bg-background overflow-hidden", className)}>
      {/* ── WhatsApp Business Header (teal/dark) ── */}
      <div className="bg-[hsl(168,76%,26%)] px-3 py-2.5 flex items-center gap-3 relative">
        {/* Back arrow */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="opacity-70 flex-shrink-0">
          <path d="M15 18l-6-6 6-6" />
        </svg>

        {/* Avatar */}
        <div className="h-10 w-10 rounded-full bg-[hsl(160,50%,35%)] flex items-center justify-center flex-shrink-0 border-2 border-white/10 relative">
          <SalamandraSvg className="h-6 w-6 text-white/90" />
        </div>

        {/* Name & subtitle */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[14px] font-semibold text-white truncate">{botName}</p>
            {/* Verified badge */}
            <div className="h-4 w-4 rounded-full bg-[hsl(200,80%,50%)] flex items-center justify-center flex-shrink-0">
              <Check className="h-2.5 w-2.5 text-white" />
            </div>
          </div>
          <p className="text-[11px] text-white/60 truncate">
            {status === "typing" ? "typing…" : botSubtitle}
          </p>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-3">
          <Video className="h-[18px] w-[18px] text-white/60" />
          <Phone className="h-[18px] w-[18px] text-white/60" />
          <MoreVertical className="h-[18px] w-[18px] text-white/60" />
        </div>
      </div>

      {/* ── Chat area — WhatsApp wallpaper ── */}
      <div
        className="flex-1 overflow-y-auto relative"
        ref={scrollRef}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23075e54' fill-opacity='0.04'%3E%3Ccircle cx='40' cy='40' r='3'/%3E%3Ccircle cx='120' cy='80' r='2'/%3E%3Ccircle cx='200' cy='30' r='2.5'/%3E%3Ccircle cx='280' cy='70' r='2'/%3E%3Ccircle cx='360' cy='50' r='3'/%3E%3Ccircle cx='80' cy='140' r='2'/%3E%3Ccircle cx='160' cy='160' r='3'/%3E%3Ccircle cx='240' cy='130' r='2'/%3E%3Ccircle cx='320' cy='150' r='2.5'/%3E%3Ccircle cx='60' cy='240' r='2.5'/%3E%3Ccircle cx='140' cy='260' r='2'/%3E%3Ccircle cx='220' cy='230' r='3'/%3E%3Ccircle cx='300' cy='250' r='2'/%3E%3Ccircle cx='380' cy='230' r='2.5'/%3E%3Ccircle cx='40' cy='340' r='2'/%3E%3Ccircle cx='120' cy='360' r='3'/%3E%3Ccircle cx='200' cy='330' r='2'/%3E%3Ccircle cx='280' cy='350' r='2.5'/%3E%3Ccircle cx='360' cy='340' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: "hsl(225, 25%, 12%)",
        }}
      >
        {/* Salamandra watermark — very subtle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <SalamandraSvg className="h-[50%] w-[50%] text-white opacity-[0.02]" />
        </div>

        <div className="relative z-10 px-3 py-3 space-y-1.5">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <SalamandraSvg className="h-14 w-14 text-white opacity-10 mb-3" />
              <p className="text-[11px] text-white/30">Appuyez sur Lancer Démo</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                /* System event card */
                if (msg.isSystemEvent) {
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-center my-2"
                    >
                      <div className="bg-[hsl(45,80%,35%)]/20 border border-[hsl(45,70%,45%)]/30 rounded-lg px-3 py-2 max-w-[90%]">
                        <p className="text-[11px] text-[hsl(45,80%,70%)] font-medium leading-relaxed whitespace-pre-wrap">
                          {msg.text}
                        </p>
                        {msg.source && (
                          <p className="text-[9px] text-[hsl(45,60%,50%)] mt-1">{msg.source}</p>
                        )}
                      </div>
                    </motion.div>
                  );
                }

                const isOut = msg.direction === "outbound";

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn("flex", isOut ? "justify-start" : "justify-end")}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-lg px-3 py-2 shadow-md relative",
                        isOut
                          ? "bg-[hsl(220,20%,18%)] text-white rounded-tl-none"
                          : "bg-[hsl(160,60%,22%)] text-white rounded-tr-none"
                      )}
                    >
                      {/* WhatsApp tail */}
                      <div
                        className={cn(
                          "absolute top-0 w-0 h-0",
                          isOut
                            ? "left-[-6px] border-t-[8px] border-r-[6px] border-t-[hsl(220,20%,18%)] border-r-transparent"
                            : "right-[-6px] border-t-[8px] border-l-[6px] border-t-[hsl(160,60%,22%)] border-l-transparent"
                        )}
                      />

                      {/* Voice UI */}
                      {msg.isVoice ? (
                        <div className="flex items-center gap-2 min-w-[130px]">
                          <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                            <Mic className="h-3 w-3 text-white/70" />
                          </div>
                          <VoiceWaveform active={false} />
                          <span className="text-[10px] text-white/40 ml-auto">0:12</span>
                        </div>
                      ) : (
                        <p className="text-[13px] leading-[1.6] whitespace-pre-wrap break-words">
                          {msg.text}
                        </p>
                      )}

                      {/* Progress bar */}
                      {msg.progress != null && (
                        <div className="mt-2 space-y-1">
                          <Progress value={msg.progress} className="h-1.5 bg-white/10" />
                          {msg.progressLabel && (
                            <p className="text-[9px] text-white/50">{msg.progressLabel}</p>
                          )}
                        </div>
                      )}

                      {/* Source label + timestamp */}
                      <div className="flex items-center justify-between gap-2 mt-1">
                        {msg.source && (
                          <p className="text-[9px] text-white/30 italic">{msg.source}</p>
                        )}
                        <div className="flex items-center gap-1 ml-auto">
                          <span className="text-[9px] text-white/35">
                            {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {!isOut && <CheckCheck className="h-3 w-3 text-[hsl(200,80%,60%)]" />}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}

          {/* Quick replies */}
          {activeQuickReplies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-1.5 pt-1"
            >
              {activeQuickReplies.map((qr, i) => (
                <button
                  key={i}
                  onClick={() => onQuickReply?.(qr)}
                  className="w-full rounded-lg border border-[hsl(160,70%,40%)]/40 bg-[hsl(220,20%,15%)] px-4 py-2.5 text-[13px] font-medium text-[hsl(160,70%,55%)] hover:bg-[hsl(160,70%,40%)]/10 transition-all active:scale-[0.98] text-left"
                >
                  {qr}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Encryption notice ── */}
      <div className="flex items-center justify-center gap-1.5 py-1 bg-[hsl(225,25%,12%)]">
        <Shield className="h-2.5 w-2.5 text-white/20" />
        <p className="text-[9px] text-white/20">Chiffrement de bout en bout · WAKA Secure</p>
      </div>

      {/* ── Input bar ── */}
      <div className="flex items-center gap-2 px-2 py-2 bg-[hsl(225,25%,10%)]">
        {/* Emoji */}
        <button className="h-9 w-9 rounded-full flex items-center justify-center text-white/40 hover:text-white/60 flex-shrink-0">
          <span className="text-[20px]">😊</span>
        </button>

        {/* Text input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={voiceActive ? "Écoute en cours…" : "Appuyer sur Lancer Démo"}
            disabled={voiceActive}
            className={cn(
              "w-full h-10 rounded-full bg-[hsl(220,20%,18%)] border-none px-4 text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-[hsl(160,70%,40%)]/30 transition-all",
              voiceActive && "opacity-50 cursor-not-allowed"
            )}
          />
        </div>

        {/* Mic or Send */}
        {inputText.trim() ? (
          <button
            onClick={handleSend}
            className="h-10 w-10 rounded-full bg-[hsl(160,70%,35%)] flex items-center justify-center flex-shrink-0 shadow-lg hover:bg-[hsl(160,70%,40%)] transition-colors"
          >
            <Send className="h-4 w-4 text-white" />
          </button>
        ) : (
          <button
            onClick={toggleVoice}
            className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
              voiceActive
                ? "bg-destructive text-white shadow-lg animate-pulse"
                : "bg-[hsl(160,70%,35%)] text-white shadow-lg hover:bg-[hsl(160,70%,40%)]"
            )}
          >
            {voiceActive ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
