/**
 * Waka Sovereign Player — Canal soberano WAKA
 *
 * NO es WhatsApp. Es el canal propio de WAKA:
 * - Header WAKA con Salamandra + gradiente esmeralda/teal
 * - Rich cards nativos (imagen, título, botones)
 * - Menús interactivos expandibles
 * - Ultra-ligero, zero-rated friendly (sin imágenes externas, todo SVG/CSS)
 * - Fondo claro con Salamandra difuminada
 */

import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, ChevronRight, CheckCheck, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SalamandraSvg } from "./SalamandraSvg";
import { Progress } from "@/components/ui/progress";

/* ── Types ── */

export interface RichCard {
  title: string;
  description?: string;
  /** CSS gradient or solid color — no images for zero-rated */
  bgGradient?: string;
  icon?: string; // emoji
  actions?: string[];
}

export interface MenuOption {
  label: string;
  icon?: string; // emoji
  description?: string;
}

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
  /** Rich card — WAKA sovereign capability */
  richCard?: RichCard;
  /** Interactive menu — WAKA sovereign capability */
  menu?: MenuOption[];
  menuTitle?: string;
}

interface WakaSovereignPlayerProps {
  messages: PlayerMessage[];
  botName?: string;
  onSend?: (text: string) => void;
  onQuickReply?: (label: string) => void;
  onVoiceToggle?: (active: boolean) => void;
  onMenuSelect?: (label: string) => void;
  onCardAction?: (action: string) => void;
  status?: "online" | "typing" | "offline";
  /** Persistent status bar (e.g. balance, progress) */
  statusBar?: { label: string; value: string; accent?: boolean };
  className?: string;
}

/* ── Voicebot Waveform (ultra-light) ── */
function VoiceWaveform({ active }: { active: boolean }) {
  return (
    <div className="flex items-end gap-[2px] h-5">
      {[0.6, 1, 0.4, 0.8, 0.5, 0.9, 0.3, 0.7].map((h, i) => (
        <motion.div
          key={i}
          className="w-[2px] rounded-full bg-[hsl(160,84%,39%)]"
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

/* ── Collapsible Menu ── */
function InteractiveMenu({
  title,
  options,
  onSelect,
}: {
  title?: string;
  options: MenuOption[];
  onSelect?: (label: string) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-xl border border-[hsl(160,40%,85%)] bg-white overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-[hsl(160,40%,96%)]"
      >
        <span className="text-[12px] font-semibold text-[hsl(160,60%,25%)]">
          {title || "Options"}
        </span>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 text-[hsl(160,50%,40%)]" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-[hsl(160,50%,40%)]" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => onSelect?.(opt.label)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-[hsl(160,30%,96%)] transition-colors border-t border-[hsl(160,20%,92%)] active:bg-[hsl(160,30%,92%)]"
              >
                {opt.icon && <span className="text-[16px] flex-shrink-0">{opt.icon}</span>}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-[hsl(220,15%,20%)]">{opt.label}</p>
                  {opt.description && (
                    <p className="text-[10px] text-[hsl(220,10%,55%)] mt-0.5">{opt.description}</p>
                  )}
                </div>
                <ChevronRight className="h-3 w-3 text-[hsl(220,10%,70%)] flex-shrink-0" />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Rich Card ── */
function RichCardBubble({
  card,
  onAction,
}: {
  card: RichCard;
  onAction?: (action: string) => void;
}) {
  return (
    <div className="rounded-xl border border-[hsl(160,30%,85%)] bg-white overflow-hidden shadow-sm max-w-[85%]">
      {/* Card header with gradient */}
      <div
        className="px-3 py-4 flex items-center gap-2.5"
        style={{
          background: card.bgGradient || "linear-gradient(135deg, hsl(160,70%,40%), hsl(200,70%,45%))",
        }}
      >
        {card.icon && <span className="text-[24px]">{card.icon}</span>}
        <div>
          <p className="text-[13px] font-bold text-white">{card.title}</p>
          {card.description && (
            <p className="text-[11px] text-white/70 mt-0.5">{card.description}</p>
          )}
        </div>
      </div>
      {/* Card actions */}
      {card.actions && card.actions.length > 0 && (
        <div className="divide-y divide-[hsl(160,20%,92%)]">
          {card.actions.map((action, i) => (
            <button
              key={i}
              onClick={() => onAction?.(action)}
              className="w-full px-3 py-2.5 text-[12px] font-medium text-[hsl(160,70%,30%)] hover:bg-[hsl(160,30%,96%)] transition-colors text-center active:bg-[hsl(160,30%,92%)]"
            >
              {action}
            </button>
          ))}
        </div>
      )}
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
  onMenuSelect,
  onCardAction,
  status = "online",
  statusBar,
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
    <div className={cn("flex h-full w-full flex-col overflow-hidden bg-[hsl(40,15%,96%)]", className)}>
      {/* ── WAKA Sovereign Header ── */}
      <div className="relative flex-shrink-0 overflow-hidden">
        <div
          className="px-4 py-3 flex items-center gap-3"
          style={{
            background: "linear-gradient(135deg, hsl(160,70%,28%) 0%, hsl(175,65%,30%) 50%, hsl(190,60%,32%) 100%)",
          }}
        >
          {/* Salamandra avatar */}
          <div className="h-10 w-10 rounded-full bg-white/12 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/15">
            <SalamandraSvg className="h-6 w-6 text-white/85" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-white tracking-wide">{botName}</p>
            <div className="flex items-center gap-1.5">
              {status === "online" && (
                <>
                  <div className="h-1.5 w-1.5 rounded-full bg-[hsl(120,60%,65%)]" />
                  <p className="text-[10px] text-white/55">Intelligence Highway</p>
                </>
              )}
              {status === "typing" && (
                <p className="text-[10px] text-white/55 italic">en train d'écrire…</p>
              )}
              {status === "offline" && (
                <p className="text-[10px] text-white/40">hors ligne</p>
              )}
            </div>
          </div>

          {/* Zero-rated badge */}
          <div className="px-2 py-0.5 rounded-full bg-white/10 border border-white/15 flex-shrink-0">
            <span className="text-[9px] font-bold text-white/60 tracking-wider">ZERO-RATED</span>
          </div>
        </div>
      </div>

      {/* ── Persistent status bar ── */}
      {statusBar && (
        <div className="flex items-center justify-between px-4 py-1.5 bg-[hsl(160,30%,95%)] border-b border-[hsl(160,20%,90%)] flex-shrink-0">
          <span className="text-[10px] text-[hsl(160,30%,40%)] font-medium">{statusBar.label}</span>
          <span
            className={cn(
              "text-[11px] font-bold",
              statusBar.accent ? "text-[hsl(160,70%,35%)]" : "text-[hsl(220,15%,30%)]"
            )}
          >
            {statusBar.value}
          </span>
        </div>
      )}

      {/* ── Chat area — light with subtle Salamandra ── */}
      <div className="flex-1 overflow-y-auto relative" ref={scrollRef}>
        {/* Salamandra watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <SalamandraSvg className="h-[70%] w-[70%] text-[hsl(160,30%,70%)] opacity-[0.05]" />
        </div>

        <div className="relative z-10 px-3 py-3 space-y-2">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <SalamandraSvg className="h-14 w-14 text-[hsl(160,40%,70%)] opacity-25 mb-3" />
              <p className="text-[11px] text-[hsl(220,10%,60%)]">Intelligence Highway</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                /* System event */
                if (msg.isSystemEvent) {
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-center my-1.5"
                    >
                      <div className="bg-[hsl(160,25%,92%)] rounded-lg px-3 py-1.5 max-w-[90%] border border-[hsl(160,20%,87%)]">
                        <p className="text-[10px] text-[hsl(160,30%,35%)] font-medium leading-relaxed whitespace-pre-wrap text-center">
                          {msg.text}
                        </p>
                        {msg.source && (
                          <p className="text-[8px] text-[hsl(160,20%,55%)] text-center mt-0.5">{msg.source}</p>
                        )}
                      </div>
                    </motion.div>
                  );
                }

                const isBot = msg.direction === "outbound";

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn("flex flex-col", isBot ? "items-start" : "items-end")}
                  >
                    {/* Rich Card */}
                    {msg.richCard && (
                      <div className="mb-1">
                        <RichCardBubble card={msg.richCard} onAction={onCardAction} />
                      </div>
                    )}

                    {/* Text bubble */}
                    {(msg.text || msg.isVoice) && (
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-3.5 py-2 shadow-sm",
                          isBot
                            ? "bg-white text-[hsl(220,15%,15%)] rounded-bl-md border border-[hsl(220,15%,92%)]"
                            : "bg-[hsl(160,55%,38%)] text-white rounded-br-md"
                        )}
                      >
                        {msg.isVoice ? (
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <div className="h-6 w-6 rounded-full bg-[hsl(160,50%,90%)] flex items-center justify-center flex-shrink-0">
                              <Mic className="h-3 w-3 text-[hsl(160,60%,35%)]" />
                            </div>
                            <VoiceWaveform active={false} />
                            <span className="text-[9px] opacity-50 ml-auto">0:12</span>
                          </div>
                        ) : (
                          <p className="text-[13px] leading-[1.55] whitespace-pre-wrap break-words">
                            {msg.text}
                          </p>
                        )}

                        {/* Progress */}
                        {msg.progress != null && (
                          <div className="mt-2 space-y-0.5">
                            <Progress value={msg.progress} className="h-1.5 bg-black/5" />
                            {msg.progressLabel && (
                              <p className={cn("text-[9px]", isBot ? "text-[hsl(220,10%,55%)]" : "text-white/60")}>
                                {msg.progressLabel}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Footer: source + time */}
                        <div className="flex items-center justify-between gap-2 mt-1">
                          {msg.source && (
                            <p className={cn("text-[8px] italic", isBot ? "text-[hsl(220,10%,65%)]" : "text-white/40")}>
                              {msg.source}
                            </p>
                          )}
                          <div className="flex items-center gap-1 ml-auto">
                            <span className={cn("text-[9px]", isBot ? "text-[hsl(220,10%,65%)]" : "text-white/45")}>
                              {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            {!isBot && <CheckCheck className="h-2.5 w-2.5 text-white/50" />}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Interactive menu */}
                    {msg.menu && msg.menu.length > 0 && (
                      <div className="mt-1.5 w-full max-w-[85%]">
                        <InteractiveMenu
                          title={msg.menuTitle}
                          options={msg.menu}
                          onSelect={onMenuSelect}
                        />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}

          {/* Quick replies */}
          {activeQuickReplies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-1.5 pt-1"
            >
              {activeQuickReplies.map((qr, i) => (
                <button
                  key={i}
                  onClick={() => onQuickReply?.(qr)}
                  className="rounded-full border border-[hsl(160,50%,70%)] bg-white px-3 py-1.5 text-[11px] font-medium text-[hsl(160,60%,28%)] hover:bg-[hsl(160,40%,96%)] transition-all active:scale-[0.97] shadow-sm"
                >
                  {qr}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Input bar ── */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white border-t border-[hsl(220,15%,92%)] flex-shrink-0">
        <div className="flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={voiceActive ? "Écoute en cours…" : "Message…"}
            disabled={voiceActive}
            className={cn(
              "w-full h-9 rounded-full bg-[hsl(220,15%,96%)] border border-[hsl(220,15%,90%)] px-4 text-[13px] text-[hsl(220,15%,15%)] placeholder:text-[hsl(220,10%,65%)] focus:outline-none focus:ring-1 focus:ring-[hsl(160,60%,40%)]/30 transition-all",
              voiceActive && "opacity-50 cursor-not-allowed"
            )}
          />
        </div>

        {inputText.trim() ? (
          <button
            onClick={handleSend}
            className="h-9 w-9 rounded-full bg-[hsl(160,60%,35%)] flex items-center justify-center flex-shrink-0 shadow-sm hover:bg-[hsl(160,60%,38%)] transition-colors active:scale-95"
          >
            <Send className="h-4 w-4 text-white" />
          </button>
        ) : (
          <button
            onClick={toggleVoice}
            className={cn(
              "h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95",
              voiceActive
                ? "bg-destructive text-white shadow-sm animate-pulse"
                : "bg-[hsl(160,60%,35%)] text-white shadow-sm hover:bg-[hsl(160,60%,38%)]"
            )}
          >
            {voiceActive ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
