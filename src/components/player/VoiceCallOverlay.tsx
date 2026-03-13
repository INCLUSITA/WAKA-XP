/**
 * VoiceCallOverlay — Fullscreen call screen inside the phone simulator.
 * Connects to WAKA VOICE endpoint. Shows animated waves, call duration, controls.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceCallOverlayProps {
  open: boolean;
  onClose: (summary?: string) => void;
  agentName?: string;
  /** WAKA VOICE WebSocket/API endpoint (optional, for future real integration) */
  voiceEndpoint?: string;
}

export function VoiceCallOverlay({ open, onClose, agentName = "WAKA VOICE", voiceEndpoint }: VoiceCallOverlayProps) {
  const [callState, setCallState] = useState<"connecting" | "active" | "ending">("connecting");
  const [elapsed, setElapsed] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  // Start call timer
  useEffect(() => {
    if (!open) {
      setCallState("connecting");
      setElapsed(0);
      setIsMuted(false);
      setIsSpeakerOn(true);
      return;
    }

    // Simulate connection delay
    const connectTimeout = setTimeout(() => setCallState("active"), 1800);
    return () => clearTimeout(connectTimeout);
  }, [open]);

  useEffect(() => {
    if (callState === "active") {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [callState]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handleEndCall = useCallback(() => {
    setCallState("ending");
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(() => {
      onClose(elapsed > 3 ? `📞 Llamada de voz finalizada (${formatTime(elapsed)})` : undefined);
    }, 600);
  }, [onClose, elapsed]);

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col"
      style={{
        background: "linear-gradient(160deg, hsl(270,45%,18%) 0%, hsl(280,40%,12%) 40%, hsl(260,35%,8%) 100%)",
      }}
    >
      {/* Top section */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 pt-12">
        {/* Avatar ring */}
        <div className="relative">
          {/* Animated pulse rings */}
          {callState === "active" && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-[hsl(270,60%,60%)]/30"
                animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                style={{ width: 96, height: 96, margin: "auto", top: 0, bottom: 0, left: 0, right: 0 }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-[hsl(270,60%,60%)]/20"
                animate={{ scale: [1, 2.2], opacity: [0.4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                style={{ width: 96, height: 96, margin: "auto", top: 0, bottom: 0, left: 0, right: 0 }}
              />
            </>
          )}

          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[hsl(270,50%,50%)] to-[hsl(290,45%,40%)] flex items-center justify-center shadow-2xl shadow-[hsl(270,50%,30%)]/40">
            <Phone className="h-10 w-10 text-white" />
          </div>
        </div>

        {/* Agent info */}
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-white tracking-wide">{agentName}</h2>
          <p className="text-sm text-white/50">
            {callState === "connecting" && "Conectando..."}
            {callState === "active" && formatTime(elapsed)}
            {callState === "ending" && "Finalizando..."}
          </p>
        </div>

        {/* Audio visualizer waves */}
        {callState === "active" && (
          <div className="flex items-end justify-center gap-[3px] h-12">
            {Array.from({ length: 24 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-[3px] rounded-full bg-[hsl(270,60%,65%)]"
                animate={{
                  height: [4, 6 + Math.random() * 30, 4],
                  opacity: [0.4, 0.9, 0.4],
                }}
                transition={{
                  duration: 0.5 + Math.random() * 0.8,
                  repeat: Infinity,
                  delay: i * 0.04,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        )}

        {/* Connecting spinner */}
        {callState === "connecting" && (
          <motion.div
            className="w-8 h-8 border-3 border-white/20 border-t-white/80 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>

      {/* Bottom controls */}
      <div className="pb-16 px-8">
        <div className="flex items-center justify-center gap-6">
          {/* Mute */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center transition-colors",
              isMuted ? "bg-white/20" : "bg-white/10"
            )}
          >
            {isMuted ? <MicOff className="h-5 w-5 text-white/70" /> : <Mic className="h-5 w-5 text-white/70" />}
          </button>

          {/* End call */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleEndCall}
            className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30"
          >
            <PhoneOff className="h-6 w-6 text-white" />
          </motion.button>

          {/* Speaker */}
          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center transition-colors",
              isSpeakerOn ? "bg-white/20" : "bg-white/10"
            )}
          >
            {isSpeakerOn ? <Volume2 className="h-5 w-5 text-white/70" /> : <VolumeX className="h-5 w-5 text-white/70" />}
          </button>
        </div>

        <p className="text-center text-[10px] text-white/30 mt-4">WAKA VOICE · Canal soberano</p>
      </div>
    </motion.div>
  );
}
