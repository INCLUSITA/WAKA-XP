/**
 * Waka Sovereign Player — Demo / Preview page
 * Layout: iPhone-like phone frame centered on screen (matching OmnichannelPreview / Simulator aesthetic)
 */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WakaSovereignPlayer, type PlayerMessage } from "@/components/player/WakaSovereignPlayer";

const INITIAL_MESSAGES: PlayerMessage[] = [
  {
    id: "1",
    text: "👋 Bienvenue sur WAKA XP !\nJe suis votre assistant intelligent.",
    direction: "outbound",
    timestamp: new Date(Date.now() - 120_000),
  },
  {
    id: "2",
    text: "Bonjour ! Comment ça marche ?",
    direction: "inbound",
    timestamp: new Date(Date.now() - 90_000),
  },
  {
    id: "3",
    text: "Excellent ! Commençons par un micro-module de formation. Voici votre progression :",
    direction: "outbound",
    timestamp: new Date(Date.now() - 60_000),
    progress: 25,
    progressLabel: "Module 1/4 — Introduction",
  },
  {
    id: "4",
    text: "Quel type de forfait souhaitez-vous découvrir ?",
    direction: "outbound",
    timestamp: new Date(Date.now() - 30_000),
    quickReplies: ["📱 Data", "📞 Appels", "💬 SMS", "🌍 Roaming"],
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
        quickReplies: ["Voir détails", "Comparer", "Souscrire"],
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
        addBotReply("J'ai bien reçu votre message vocal. Laissez-moi l'analyser…");
      }
    },
    [addBotReply]
  );

  const handleReset = useCallback(() => {
    setMessages(INITIAL_MESSAGES);
    setStatus("online");
  }, []);

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-bold text-foreground">Waka Sovereign Player</h1>
        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
          HYBRID UI
        </Badge>
      </div>

      {/* Body — centered phone frame */}
      <div className="flex flex-1 items-center justify-center overflow-hidden py-6 bg-muted/30">
        {/* iPhone-like frame matching OmnichannelPreview */}
        <div className="w-[380px] h-[700px] rounded-[2.5rem] border-4 border-foreground/15 bg-foreground/5 p-1.5 shadow-2xl flex flex-col">
          {/* Notch */}
          <div className="mx-auto h-6 w-28 rounded-b-2xl bg-foreground/15 flex items-center justify-center gap-2 flex-shrink-0">
            <div className="h-2 w-2 rounded-full bg-foreground/20" />
            <div className="h-1.5 w-12 rounded-full bg-foreground/15" />
          </div>

          {/* Screen */}
          <div className="flex-1 rounded-[2rem] overflow-hidden flex flex-col min-h-0">
            <WakaSovereignPlayer
              messages={messages}
              botName="WAKA XP"
              status={status}
              onSend={handleSend}
              onQuickReply={handleQuickReply}
              onVoiceToggle={handleVoiceToggle}
              onReset={handleReset}
            />
          </div>

          {/* Home indicator */}
          <div className="flex justify-center py-2 flex-shrink-0">
            <div className="h-1 w-28 rounded-full bg-foreground/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
