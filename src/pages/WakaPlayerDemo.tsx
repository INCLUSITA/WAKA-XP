/**
 * Waka Sovereign Player — Demo page
 * Showcases all 3 data modes: libre, subventionné, zero-rated
 */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wifi, Signal, BatteryFull } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { WakaSovereignPlayer, type PlayerMessage, type DataMode } from "@/components/player/WakaSovereignPlayer";

const INITIAL_MESSAGES: PlayerMessage[] = [
  {
    id: "sys-1",
    text: "⚡ WAKA NEXUS · Canal soberano activé",
    direction: "outbound",
    timestamp: new Date(Date.now() - 150_000),
    isSystemEvent: true,
  },
  {
    id: "1",
    text: "🇧🇫 Bienvenue sur WAKA !\n\nVotre canal intelligent, gratuit et sans limites.",
    direction: "outbound",
    timestamp: new Date(Date.now() - 120_000),
    source: "WAKA NEXUS",
    reaction: "👋",
  },
  {
    id: "card-1",
    text: "",
    direction: "outbound",
    timestamp: new Date(Date.now() - 100_000),
    richCard: {
      title: "Offre de Bienvenue",
      description: "0% frais · +300 FCFA bonus",
      icon: "🎁",
      bgGradient: "linear-gradient(135deg, hsl(160,65%,35%), hsl(200,60%,40%))",
      actions: ["Activer maintenant", "En savoir plus"],
    },
  },
  {
    id: "2",
    text: "Bonjour ! Je veux voir mes options.",
    direction: "inbound",
    timestamp: new Date(Date.now() - 80_000),
    reaction: "👍",
  },
  {
    id: "3",
    text: "Voici vos services disponibles :",
    direction: "outbound",
    timestamp: new Date(Date.now() - 60_000),
    progress: 25,
    progressLabel: "Module 1/4 — Introduction",
    source: "AXIOM Brain",
    menu: [
      { label: "Envoyer argent", icon: "💸", description: "Transfert instantané" },
      { label: "Payer facture", icon: "🧾", description: "Eau, électricité, TV" },
      { label: "Consulter solde", icon: "💰", description: "Solde et historique" },
      { label: "Crédit Moov", icon: "📱", description: "Recharge téléphone" },
    ],
    menuTitle: "Services Moov Money",
  },
];

const MODE_LABELS: Record<DataMode, string> = {
  libre: "LIBRE",
  "subventionné": "SUBVENTIONNÉ",
  "zero-rated": "ZERO-RATED",
};

const MODE_COLORS: Record<DataMode, string> = {
  libre: "bg-primary/10 text-primary",
  "subventionné": "bg-[hsl(35,80%,50%)]/10 text-[hsl(35,70%,40%)]",
  "zero-rated": "bg-[hsl(220,10%,50%)]/10 text-[hsl(220,10%,40%)]",
};

export default function WakaPlayerDemo() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<PlayerMessage[]>(INITIAL_MESSAGES);
  const [status, setStatus] = useState<"online" | "typing" | "offline">("online");
  const [dataMode, setDataMode] = useState<DataMode>("libre");

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
          source: "AXIOM Brain",
          ...extras,
        },
      ]);
      setStatus("online");
    }, 800);
  }, []);

  const handleSend = useCallback(
    (text: string) => {
      setMessages((prev) => [
        ...prev,
        { id: `user-${Date.now()}`, text, direction: "inbound", timestamp: new Date() },
      ]);
      addBotReply(`Bien reçu : "${text}"`, {
        quickReplies: ["📊 Voir plus", "🔄 Menu", "❓ Aide"],
        reaction: "⚡",
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
      addBotReply(`Vous avez choisi : ${label}`, {
        richCard: {
          title: "Résultat",
          description: "Traitement en cours…",
          icon: "⚡",
          bgGradient: "linear-gradient(135deg, hsl(35,80%,50%), hsl(25,85%,45%))",
          actions: ["Confirmer", "Annuler"],
        },
      });
    },
    [addBotReply]
  );

  const handleMenuSelect = useCallback(
    (label: string) => {
      setMessages((prev) => [
        ...prev,
        { id: `menu-${Date.now()}`, text: label, direction: "inbound", timestamp: new Date() },
      ]);
      addBotReply(`Service "${label}" sélectionné.`, {
        progress: Math.min(100, 40 + Math.floor(Math.random() * 40)),
        progressLabel: "Chargement du service",
        reaction: "✅",
      });
    },
    [addBotReply]
  );

  const handleCardAction = useCallback(
    (action: string) => {
      setMessages((prev) => [
        ...prev,
        { id: `card-${Date.now()}`, text: action, direction: "inbound", timestamp: new Date() },
      ]);
      addBotReply(`Action "${action}" confirmée ✅`);
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
        addBotReply("Message vocal reçu. Analyse en cours…", { source: "WAKA VOICE" });
      }
    },
    [addBotReply]
  );

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
          SOVEREIGN CHANNEL
        </Badge>
        <Badge className={cn("text-[9px] border-0 font-bold", MODE_COLORS[dataMode])}>
          {MODE_LABELS[dataMode]}
        </Badge>
      </div>

      {/* Body — iPhone frame */}
      <div className="flex flex-1 items-center justify-center overflow-hidden bg-muted/30">
        <div className="relative w-[375px] h-[812px] max-h-[calc(100vh-80px)]">
          {/* Outer shell */}
          <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-b from-[hsl(220,8%,80%)] to-[hsl(220,8%,68%)] shadow-[0_0_50px_rgba(0,0,0,0.12)]" />
          {/* Inner bezel */}
          <div className="absolute inset-[3px] rounded-[2.8rem] bg-black overflow-hidden flex flex-col">
            {/* Status bar */}
            <div
              className="relative flex items-center justify-between px-7 pt-3 pb-1 z-20"
              style={{
                background:
                  dataMode === "zero-rated"
                    ? "hsl(160,50%,30%)"
                    : "linear-gradient(135deg, hsl(160,70%,28%) 0%, hsl(175,65%,30%) 50%, hsl(190,60%,32%) 100%)",
              }}
            >
              <span className="text-[12px] font-semibold text-white/90">{timeStr}</span>
              <div className="absolute left-1/2 -translate-x-1/2 top-2 w-[100px] h-[28px] bg-black rounded-full z-30" />
              <div className="flex items-center gap-1.5">
                <Signal className="h-3 w-3 text-white/70" />
                <Wifi className="h-3 w-3 text-white/70" />
                <BatteryFull className="h-3.5 w-3.5 text-white/70" />
              </div>
            </div>

            {/* Player */}
            <div className="flex-1 flex flex-col min-h-0">
              <WakaSovereignPlayer
                messages={messages}
                botName="WAKA XP 🇧🇫"
                status={status}
                statusBar={{ label: "Solde Moov Money", value: "8.750 FCFA", accent: true }}
                dataMode={dataMode}
                onDataModeChange={setDataMode}
                onSend={handleSend}
                onQuickReply={handleQuickReply}
                onVoiceToggle={handleVoiceToggle}
                onMenuSelect={handleMenuSelect}
                onCardAction={handleCardAction}
              />
            </div>

            {/* Home indicator */}
            <div className="flex justify-center py-2 bg-white">
              <div className="h-[5px] w-[130px] rounded-full bg-black/15" />
            </div>
          </div>

          {/* Side buttons */}
          <div className="absolute left-[-2px] top-[130px] w-[3px] h-[30px] rounded-l bg-[hsl(220,8%,72%)]" />
          <div className="absolute left-[-2px] top-[175px] w-[3px] h-[55px] rounded-l bg-[hsl(220,8%,72%)]" />
          <div className="absolute left-[-2px] top-[240px] w-[3px] h-[55px] rounded-l bg-[hsl(220,8%,72%)]" />
          <div className="absolute right-[-2px] top-[190px] w-[3px] h-[70px] rounded-r bg-[hsl(220,8%,72%)]" />
        </div>
      </div>
    </div>
  );
}
