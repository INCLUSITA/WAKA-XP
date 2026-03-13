/**
 * Waka Sovereign Player — Demo page with full iPhone frame
 */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wifi, Signal, BatteryFull } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WakaSovereignPlayer, type PlayerMessage } from "@/components/player/WakaSovereignPlayer";

const INITIAL_MESSAGES: PlayerMessage[] = [
  {
    id: "sys-1",
    text: "⚡ WAKA NEXUS — SESSION TRIGGER\nWAKA NEXUS — Contact détecté\nCanal : WhatsApp · Langue : FR",
    direction: "outbound",
    timestamp: new Date(Date.now() - 150_000),
    isSystemEvent: true,
    source: "WAKA NEXUS → WhatsApp",
  },
  {
    id: "1",
    text: "🇧🇫 Bonjour !\n\nIci WAKA XP 👋\n\nBienvenue sur votre assistant intelligent.",
    direction: "outbound",
    timestamp: new Date(Date.now() - 120_000),
    source: "WAKA NEXUS → WhatsApp",
  },
  {
    id: "2",
    text: "Bonjour ! Comment ça marche ?",
    direction: "inbound",
    timestamp: new Date(Date.now() - 90_000),
  },
  {
    id: "3",
    text: "Excellent ! Commençons par un micro-module de formation.\n\nVoici votre progression :",
    direction: "outbound",
    timestamp: new Date(Date.now() - 60_000),
    progress: 25,
    progressLabel: "Module 1/4 — Introduction",
    source: "AXIOM Brain — Onboarding",
  },
  {
    id: "4",
    text: "Que souhaitez-vous faire ?",
    direction: "outbound",
    timestamp: new Date(Date.now() - 30_000),
    quickReplies: ["📱 Découvrir Data", "📞 Forfaits Appels", "💬 Offres SMS", "🌍 Roaming"],
    source: "AXIOM Brain — Re-engagement Offer",
  },
];

export default function WakaPlayerDemo() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<PlayerMessage[]>(INITIAL_MESSAGES);
  const [status, setStatus] = useState<"online" | "typing" | "offline">("online");

  const addBotReply = useCallback((text: string, extras?: Partial<PlayerMessage>) => {
    setStatus("typing");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          text,
          direction: "outbound",
          timestamp: new Date(),
          source: "AXIOM Brain → WhatsApp",
          ...extras,
        },
      ]);
      setStatus("online");
    }, 1200);
  }, []);

  const handleSend = useCallback(
    (text: string) => {
      setMessages((prev) => [
        ...prev,
        { id: `user-${Date.now()}`, text, direction: "inbound", timestamp: new Date() },
      ]);
      addBotReply(`Merci pour votre message ! Vous avez dit : "${text}"\n\nVoici la suite du parcours.`, {
        progress: Math.min(100, 25 + Math.floor(Math.random() * 50)),
        progressLabel: "Progression mise à jour",
      });
    },
    [addBotReply]
  );

  const handleQuickReply = useCallback(
    (label: string) => {
      setMessages((prev) => [
        ...prev,
        { id: `qr-${Date.now()}`, text: label, direction: "inbound", timestamp: new Date() },
      ]);
      addBotReply(`Excellent choix : ${label} !\n\n📊 Voici les offres disponibles dans cette catégorie.`, {
        quickReplies: ["✅ Souscrire", "📋 Voir détails", "🔄 Comparer"],
      });
    },
    [addBotReply]
  );

  const handleVoiceToggle = useCallback(
    (active: boolean) => {
      if (!active) {
        setMessages((prev) => [
          ...prev,
          { id: `voice-${Date.now()}`, text: "", direction: "inbound", timestamp: new Date(), isVoice: true },
        ]);
        addBotReply("J'ai bien reçu votre message vocal. Laissez-moi l'analyser…", {
          source: "WAKA VOICE → AXIOM Brain",
        });
      }
    },
    [addBotReply]
  );

  const handleReset = useCallback(() => {
    setMessages(INITIAL_MESSAGES);
    setStatus("online");
  }, []);

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Page Header */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-bold text-foreground">Waka Sovereign Player</h1>
        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
          HYBRID UI
        </Badge>
      </div>

      {/* Body — full iPhone in center */}
      <div className="flex flex-1 items-center justify-center overflow-hidden bg-[hsl(225,30%,8%)]">
        {/* iPhone 15 Pro frame */}
        <div className="relative w-[375px] h-[812px] max-h-[calc(100vh-80px)]">
          {/* Outer shell */}
          <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-b from-[hsl(220,10%,25%)] to-[hsl(220,10%,15%)] shadow-[0_0_60px_rgba(0,0,0,0.5)]" />
          {/* Inner bezel */}
          <div className="absolute inset-[3px] rounded-[2.8rem] bg-black overflow-hidden flex flex-col">
            {/* Status bar */}
            <div className="relative flex items-center justify-between px-7 pt-3 pb-1 bg-[hsl(168,76%,26%)] z-20">
              <span className="text-[12px] font-semibold text-white/90">{timeStr}</span>
              {/* Dynamic Island */}
              <div className="absolute left-1/2 -translate-x-1/2 top-2 w-[100px] h-[28px] bg-black rounded-full z-30" />
              <div className="flex items-center gap-1.5">
                <Signal className="h-3 w-3 text-white/70" />
                <Wifi className="h-3 w-3 text-white/70" />
                <BatteryFull className="h-3.5 w-3.5 text-white/70" />
              </div>
            </div>

            {/* Player content */}
            <div className="flex-1 flex flex-col min-h-0">
              <WakaSovereignPlayer
                messages={messages}
                botName="WAKA XP 🇧🇫"
                botSubtitle="Business Account · WAKA"
                status={status}
                onSend={handleSend}
                onQuickReply={handleQuickReply}
                onVoiceToggle={handleVoiceToggle}
                onReset={handleReset}
              />
            </div>

            {/* Home indicator */}
            <div className="flex justify-center py-2 bg-[hsl(225,25%,10%)]">
              <div className="h-[5px] w-[130px] rounded-full bg-white/20" />
            </div>
          </div>

          {/* Side buttons */}
          <div className="absolute left-[-2px] top-[130px] w-[3px] h-[30px] rounded-l bg-[hsl(220,10%,30%)]" />
          <div className="absolute left-[-2px] top-[175px] w-[3px] h-[55px] rounded-l bg-[hsl(220,10%,30%)]" />
          <div className="absolute left-[-2px] top-[240px] w-[3px] h-[55px] rounded-l bg-[hsl(220,10%,30%)]" />
          <div className="absolute right-[-2px] top-[190px] w-[3px] h-[70px] rounded-r bg-[hsl(220,10%,30%)]" />
        </div>
      </div>
    </div>
  );
}
