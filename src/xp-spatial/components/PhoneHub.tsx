/**
 * PhoneHub — Layer 1: Conductor smartphone
 * Premium, hyper-realistic phone shell housing the chat.
 * Applies PhonePose transforms for spatial reactions.
 */

import { motion } from "framer-motion";
import { Send, Signal, Wifi, BatteryFull, Mic } from "lucide-react";
import type { PhonePose } from "../types/spatial";
import { cn } from "@/lib/utils";
import type { PlayerMessage } from "@/components/player/WakaSovereignPlayer";
import { useRef, useEffect, useState } from "react";
import wakaLogo from "@/assets/waka-salamandra.jpg";

/* ── Pose transforms ── */
const POSE_VARIANTS: Record<PhonePose, { x: number; scale: number; rotateY: number }> = {
  idle:               { x: 0,     scale: 1,    rotateY: 0 },
  catalog_retreat:    { x: -120,  scale: 0.92, rotateY: 3 },
  scanner_tilt:       { x: -100,  scale: 0.95, rotateY: -5 },
  payment_pulse:      { x: -80,   scale: 0.96, rotateY: 2 },
  focused_panel:      { x: -100,  scale: 0.94, rotateY: 4 },
  confirmation_glow:  { x: 0,     scale: 1.02, rotateY: 0 },
};

interface PhoneHubProps {
  messages: PlayerMessage[];
  phonePose: PhonePose;
  inputText: string;
  onInputChange: (text: string) => void;
  onSend: () => void;
  isThinking?: boolean;
}

export function PhoneHub({
  messages,
  phonePose,
  inputText,
  onInputChange,
  onSend,
  isThinking,
}: PhoneHubProps) {
  const pose = POSE_VARIANTS[phonePose];
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const isGlowing = phonePose === "confirmation_glow" || phonePose === "payment_pulse";

  return (
    <motion.div
      className="relative z-10 flex-shrink-0"
      animate={{ x: pose.x, scale: pose.scale, rotateY: pose.rotateY }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      style={{ perspective: 1200 }}
    >
      {/* Glow ring */}
      {isGlowing && (
        <motion.div
          className="absolute -inset-3 rounded-[3rem] z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          style={{
            background: phonePose === "confirmation_glow"
              ? "radial-gradient(ellipse, hsl(160 84% 45% / 0.25), transparent 70%)"
              : "radial-gradient(ellipse, hsl(270 70% 60% / 0.2), transparent 70%)",
          }}
        />
      )}

      {/* Phone shell */}
      <div className="relative w-[340px] h-[680px] rounded-[2.5rem] overflow-hidden
                      bg-[hsl(228,18%,8%)] border-2 border-[hsl(228,14%,16%)]
                      shadow-[0_20px_80px_-20px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.04)_inset]">

        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] rounded-b-2xl
                       bg-[hsl(228,20%,5%)] z-20 flex items-end justify-center pb-1">
          <div className="w-[50px] h-[5px] rounded-full bg-[hsl(228,14%,18%)]" />
        </div>

        {/* Status bar */}
        <div className="relative z-10 flex items-center justify-between px-6 pt-8 pb-2
                       bg-gradient-to-b from-[hsl(228,20%,10%)] to-transparent">
          <span className="text-[10px] text-[hsl(210,20%,65%)] font-medium">09:41</span>
          <div className="flex gap-1.5 items-center">
            <Signal className="w-3 h-3 text-[hsl(210,20%,65%)]" />
            <Wifi className="w-3 h-3 text-[hsl(210,20%,65%)]" />
            <BatteryFull className="w-3 h-3 text-[hsl(160,60%,50%)]" />
          </div>
        </div>

        {/* Chat header */}
        <div className="relative z-10 flex items-center gap-3 px-4 py-2.5
                       border-b border-[hsl(228,14%,14%)]">
          <img src={wakaLogo} alt="WAKA" className="w-9 h-9 rounded-full ring-2 ring-[hsl(160,84%,45%)]/30" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-[hsl(210,20%,92%)]">WAKA NEXUS</div>
            <div className="text-[10px] text-[hsl(160,60%,50%)] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[hsl(160,84%,45%)] inline-block" />
              {isThinking ? "en train d'écrire…" : "en ligne"}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="relative z-10 flex-1 overflow-y-auto px-3 py-3 space-y-2"
          style={{ height: "calc(100% - 170px)" }}
        >
          {messages.map(msg => (
            <SpatialBubble key={msg.id} msg={msg} />
          ))}
          {isThinking && (
            <div className="flex gap-1 items-center py-2 px-3">
              <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2 }}
                className="w-2 h-2 rounded-full bg-[hsl(160,60%,50%)]" />
              <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}
                className="w-2 h-2 rounded-full bg-[hsl(160,60%,50%)]" />
              <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}
                className="w-2 h-2 rounded-full bg-[hsl(160,60%,50%)]" />
            </div>
          )}
        </div>

        {/* Input guard — IMMUNE */}
        <div className="absolute bottom-0 left-0 right-0 z-30
                       bg-[hsl(228,18%,8%)]/95 backdrop-blur-md
                       border-t border-[hsl(228,14%,16%)] px-3 py-2.5">
          <div className="flex items-center gap-2">
            <input
              value={inputText}
              onChange={e => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Écrivez un message…"
              className="flex-1 bg-[hsl(228,14%,12%)] text-sm text-[hsl(210,20%,90%)]
                        placeholder:text-[hsl(210,10%,40%)] rounded-full px-4 py-2.5
                        border border-[hsl(228,14%,18%)] outline-none
                        focus:border-[hsl(160,60%,40%)]/50 transition-colors"
            />
            <button
              onClick={onSend}
              disabled={!inputText.trim()}
              className="w-9 h-9 rounded-full flex items-center justify-center
                        bg-[hsl(160,84%,39%)] text-[hsl(228,20%,6%)]
                        disabled:opacity-30 disabled:cursor-not-allowed
                        hover:bg-[hsl(160,84%,45%)] transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-[100px] h-[4px] rounded-full
                       bg-[hsl(210,20%,25%)] z-30" />
      </div>
    </motion.div>
  );
}

/* ── Chat Bubble ── */
function SpatialBubble({ msg }: { msg: PlayerMessage }) {
  const isUser = msg.direction === "inbound";
  const isSystem = msg.isSystemEvent;

  if (isSystem) {
    return (
      <div className="flex justify-center py-1">
        <span className="text-[10px] text-[hsl(210,10%,45%)] bg-[hsl(228,14%,12%)] px-3 py-1 rounded-full">
          {msg.text}
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
    >
      <div className={cn(
        "max-w-[85%] px-3.5 py-2 text-[13px] leading-relaxed",
        isUser
          ? "bg-[hsl(160,84%,39%)] text-[hsl(228,20%,6%)] rounded-2xl rounded-br-md"
          : "bg-[hsl(228,14%,14%)] text-[hsl(210,20%,88%)] rounded-2xl rounded-bl-md border border-[hsl(228,14%,18%)]",
      )}>
        <p className="whitespace-pre-wrap">{msg.text}</p>
        <span className={cn(
          "text-[9px] mt-1 block text-right",
          isUser ? "text-[hsl(160,40%,25%)]" : "text-[hsl(210,10%,40%)]"
        )}>
          {msg.timestamp.toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </motion.div>
  );
}
