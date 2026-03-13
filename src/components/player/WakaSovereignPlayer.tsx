/**
 * Waka Sovereign Player — Full iPhone WhatsApp Business aesthetic with WAKA identity
 * Light background with subtle Salamandra watermark
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
  source?: string;
  isSystemEvent?: boolean;
}

interface WakaSovereignPlayerProps {
  messages: PlayerMessage[];
  botName?: string;
  botSubtitle?: string;
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
          className="w-[2px] rounded-full bg-[hsl(168,76%,26%)]"
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
    <div className={cn("flex h-full w-full flex-col overflow-hidden", className)}>
      {/* ── WhatsApp Business Header ── */}
      <div className="bg-[hsl(168,76%,26%)] px-3 py-2.5 flex items-center gap-3 flex-shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="opacity-70 flex-shrink-0">
          <path d="M15 18l-6-6 6-6" />
        </svg>

        {/* Avatar with Salamandra */}
        <div className="h-10 w-10 rounded-full bg-[hsl(160,50%,35%)] flex items-center justify-center flex-shrink-0 border-2 border-white/15">
          <SalamandraSvg className="h-6 w-6 text-white/90" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[14px] font-semibold text-white truncate">{botName}</p>
            <div className="h-4 w-4 rounded-full bg-[hsl(200,80%,50%)] flex items-center justify-center flex-shrink-0">
              <Check className="h-2.5 w-2.5 text-white" />
            </div>
          </div>
          <p className="text-[11px] text-white/60 truncate">
            {status === "typing" ? "typing…" : botSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Video className="h-[18px] w-[18px] text-white/60" />
          <Phone className="h-[18px] w-[18px] text-white/60" />
          <MoreVertical className="h-[18px] w-[18px] text-white/60" />
        </div>
      </div>

      {/* ── Chat area — LIGHT background with subtle Salamandra ── */}
      <div
        className="flex-1 overflow-y-auto relative"
        ref={scrollRef}
        style={{ backgroundColor: "hsl(30, 20%, 93%)" }}
      >
        {/* Salamandra watermark — large, very faint, centered — like waka.ai hero */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <SalamandraSvg className="h-[80%] w-[80%] text-[hsl(30,30%,65%)] opacity-[0.07]" />
        </div>

        {/* Subtle WhatsApp-style pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.35]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c8b898' fill-opacity='0.12'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 px-3 py-3 space-y-1.5">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <SalamandraSvg className="h-14 w-14 text-[hsl(30,25%,60%)] opacity-30 mb-3" />
              <p className="text-[11px] text-[hsl(30,10%,55%)]">Appuyez sur Lancer Démo</p>
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
                      <div className="bg-[hsl(45,60%,88%)] border border-[hsl(45,50%,78%)] rounded-lg px-3 py-2 max-w-[90%] shadow-sm">
                        <p className="text-[11px] text-[hsl(45,40%,30%)] font-medium leading-relaxed whitespace-pre-wrap">
                          {msg.text}
                        </p>
                        {msg.source && (
                          <p className="text-[9px] text-[hsl(45,30%,50%)] mt-1">{msg.source}</p>
                        )}
                      </div>
                    </motion.div>
                  );
                }

                const isBot = msg.direction === "outbound";

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn("flex", isBot ? "justify-start" : "justify-end")}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-lg px-3 py-2 shadow-sm relative",
                        isBot
                          ? "bg-white text-[hsl(220,15%,15%)] rounded-tl-none"
                          : "bg-[hsl(142,40%,86%)] text-[hsl(142,15%,15%)] rounded-tr-none"
                      )}
                    >
                      {/* WhatsApp tail */}
                      <div
                        className={cn(
                          "absolute top-0 w-0 h-0",
                          isBot
                            ? "left-[-6px] border-t-[8px] border-r-[6px] border-t-white border-r-transparent"
                            : "right-[-6px] border-t-[8px] border-l-[6px] border-t-[hsl(142,40%,86%)] border-l-transparent"
                        )}
                      />

                      {/* Voice UI */}
                      {msg.isVoice ? (
                        <div className="flex items-center gap-2 min-w-[130px]">
                          <div className="h-7 w-7 rounded-full bg-[hsl(168,76%,26%)]/10 flex items-center justify-center flex-shrink-0">
                            <Mic className="h-3 w-3 text-[hsl(168,76%,26%)]" />
                          </div>
                          <VoiceWaveform active={false} />
                          <span className="text-[10px] text-[hsl(220,10%,55%)] ml-auto">0:12</span>
                        </div>
                      ) : (
                        <p className="text-[13px] leading-[1.6] whitespace-pre-wrap break-words">
                          {msg.text}
                        </p>
                      )}

                      {/* Progress bar */}
                      {msg.progress != null && (
                        <div className="mt-2 space-y-1">
                          <Progress value={msg.progress} className="h-1.5 bg-[hsl(220,10%,90%)]" />
                          {msg.progressLabel && (
                            <p className="text-[9px] text-[hsl(220,10%,50%)]">{msg.progressLabel}</p>
                          )}
                        </div>
                      )}

                      {/* Source label + timestamp */}
                      <div className="flex items-center justify-between gap-2 mt-1">
                        {msg.source && (
                          <p className="text-[9px] text-[hsl(220,10%,60%)] italic">{msg.source}</p>
                        )}
                        <div className="flex items-center gap-1 ml-auto">
                          <span className="text-[9px] text-[hsl(220,10%,60%)]">
                            {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {!isBot && <CheckCheck className="h-3 w-3 text-[hsl(200,80%,50%)]" />}
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
                  className="w-full rounded-lg border border-[hsl(168,70%,35%)]/30 bg-white px-4 py-2.5 text-[13px] font-medium text-[hsl(168,76%,26%)] hover:bg-[hsl(168,70%,95%)] transition-all active:scale-[0.98] text-left shadow-sm"
                >
                  {qr}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Encryption notice ── */}
      <div className="flex items-center justify-center gap-1.5 py-1 bg-[hsl(30,15%,91%)] flex-shrink-0">
        <Shield className="h-2.5 w-2.5 text-[hsl(30,10%,60%)]" />
        <p className="text-[9px] text-[hsl(30,10%,55%)]">Chiffrement de bout en bout · WAKA Secure</p>
      </div>

      {/* ── Input bar ── */}
      <div className="flex items-center gap-2 px-2 py-2 bg-[hsl(30,10%,95%)] flex-shrink-0">
        <button className="h-9 w-9 rounded-full flex items-center justify-center text-[hsl(220,10%,50%)] hover:text-[hsl(220,10%,30%)] flex-shrink-0">
          <span className="text-[20px]">😊</span>
        </button>

        <div className="flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={voiceActive ? "Écoute en cours…" : "Tapez un message…"}
            disabled={voiceActive}
            className={cn(
              "w-full h-10 rounded-full bg-white border border-[hsl(220,15%,85%)] px-4 text-[13px] text-[hsl(220,15%,15%)] placeholder:text-[hsl(220,10%,65%)] focus:outline-none focus:ring-1 focus:ring-[hsl(168,76%,26%)]/30 transition-all",
              voiceActive && "opacity-50 cursor-not-allowed"
            )}
          />
        </div>

        {inputText.trim() ? (
          <button
            onClick={handleSend}
            className="h-10 w-10 rounded-full bg-[hsl(168,76%,26%)] flex items-center justify-center flex-shrink-0 shadow-md hover:bg-[hsl(168,76%,30%)] transition-colors"
          >
            <Send className="h-4 w-4 text-white" />
          </button>
        ) : (
          <button
            onClick={toggleVoice}
            className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
              voiceActive
                ? "bg-destructive text-white shadow-md animate-pulse"
                : "bg-[hsl(168,76%,26%)] text-white shadow-md hover:bg-[hsl(168,76%,30%)]"
            )}
          >
            {voiceActive ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
