/**
 * Waka Sovereign Player — Demo / Preview page
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
        {
          id: `user-${Date.now()}`,
          text,
          direction: "inbound",
          timestamp: new Date(),
        },
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
        {
          id: `qr-${Date.now()}`,
          text: label,
          direction: "inbound",
          timestamp: new Date(),
        },
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
        // Simulate receiving a voice message
        setMessages((prev) => [
          ...prev,
          {
            id: `voice-${Date.now()}`,
            text: "",
            direction: "inbound",
            timestamp: new Date(),
            isVoice: true,
          },
        ]);
        addBotReply("J'ai bien reçu votre message vocal. Laissez-moi l'analyser…");
      }
    },
    [addBotReply]
  );

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

      {/* Body */}
      <div className="flex flex-1 items-center justify-center overflow-y-auto py-8 gradient-mesh">
        <WakaSovereignPlayer
          messages={messages}
          botName="WAKA XP"
          status={status}
          onSend={handleSend}
          onQuickReply={handleQuickReply}
          onVoiceToggle={handleVoiceToggle}
        />
      </div>
    </div>
  );
}
