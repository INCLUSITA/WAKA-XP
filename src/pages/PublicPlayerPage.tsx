/**
 * PublicPlayerPage — Public-facing player for shared demos.
 * No authentication required. Reads optional ?flow= param.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Wifi, Signal, BatteryFull, Bot, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { WakaSovereignPlayer, type PlayerMessage, type DataMode } from "@/components/player/WakaSovereignPlayer";
import { useWakaPlayerAI } from "@/hooks/useWakaPlayerAI";
import wakaLogo from "@/assets/waka-logo.png";

const WELCOME_MESSAGES: PlayerMessage[] = [
  {
    id: "sys-1",
    text: "⚡ WAKA NEXUS · Canal souverain — Intelligence artificielle activée",
    direction: "outbound",
    timestamp: new Date(Date.now() - 10_000),
    isSystemEvent: true,
  },
  {
    id: "welcome-1",
    text: "🇧🇫 Bienvenue sur WAKA !\n\nJe suis votre assistant intelligent. Pas besoin de mots-clés — dites-moi simplement ce dont vous avez besoin, en texte libre.",
    direction: "outbound",
    timestamp: new Date(Date.now() - 5_000),
    source: "WAKA NEXUS · IA",
    reaction: "👋",
    quickReplies: [
      "📱 Voir les téléphones",
      "🌐 Plans fibre optique",
      "🏥 Assurance santé",
      "💰 Ouvrir compte MoMo",
      "💳 Mon solde",
    ],
  },
];

function extractOptionsFromText(text: string): string[] {
  const options: string[] = [];
  for (const line of text.split("\n")) {
    const match = line.match(/^\s*(?:\d+[.)]\s*|[-•]\s*)([^\n]{3,60})/);
    if (match) {
      let label = match[1].replace(/\*\*/g, "").replace(/\s*[:—–-]\s*.+$/, "").trim();
      if (label.length >= 3 && label.length <= 50 && !label.includes("(") && !label.match(/^\d/)) {
        options.push(label);
      }
    }
  }
  return options.slice(0, 5);
}

export default function PublicPlayerPage() {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<PlayerMessage[]>(WELCOME_MESSAGES);
  const [dataMode] = useState<DataMode>("libre");
  const { sendToAI, isThinking } = useWakaPlayerAI();

  const addUserMessage = useCallback((text: string, imageUrl?: string) => {
    const userMsg: PlayerMessage = { id: `user-${Date.now()}`, text, direction: "inbound", timestamp: new Date(), imageUrl };
    setMessages((prev) => [...prev, userMsg]);
    return userMsg;
  }, []);

  const addBotMessage = useCallback((partial: Partial<PlayerMessage>) => {
    let quickReplies = partial.quickReplies;
    const hasInteraction = partial.quickReplies?.length || partial.menu?.length || partial.catalog ||
      partial.inlineForm || partial.payment || partial.rating || partial.servicePlans ||
      partial.creditSimulation || partial.clientStatus || partial.momoAccount ||
      partial.paymentConfirmation || partial.creditContract || partial.deviceLockConsent;
    if (!quickReplies?.length && !hasInteraction && partial.text) {
      const extracted = extractOptionsFromText(partial.text);
      if (extracted.length >= 2) quickReplies = extracted;
    }
    const botMsg: PlayerMessage = { id: `bot-${Date.now()}`, text: "", direction: "outbound", timestamp: new Date(), ...partial, quickReplies };
    setMessages((prev) => [...prev, botMsg]);
  }, []);

  const handleSend = useCallback(async (text: string, imageUrl?: string) => {
    addUserMessage(text, imageUrl);
    try {
      const result = await sendToAI(text, dataMode, imageUrl);
      if (result) addBotMessage(result);
    } catch {
      addBotMessage({ text: "Désolé, une erreur est survenue. Veuillez réessayer." });
    }
  }, [addUserMessage, addBotMessage, sendToAI, dataMode]);

  const handleQuickReply = useCallback((reply: string) => {
    handleSend(reply);
  }, [handleSend]);

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex flex-col w-full max-w-[420px] h-[90vh] max-h-[860px] rounded-[2.5rem] overflow-hidden border-2 border-white/10 shadow-2xl bg-black">
        {/* Phone status bar */}
        <div className="flex items-center justify-between px-6 py-1.5 bg-black text-white text-[11px]">
          <span className="font-medium">{timeStr}</span>
          <div className="flex items-center gap-1.5">
            <Signal className="h-3 w-3" />
            <Wifi className="h-3 w-3" />
            <BatteryFull className="h-3 w-3" />
          </div>
        </div>

        {/* Chat header */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-900 border-b border-white/10">
          <img src={wakaLogo} alt="WAKA" className="h-8 w-8 rounded-full object-contain bg-white/5 p-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">WAKA</span>
              <Badge className="text-[8px] h-4 bg-emerald-500/20 text-emerald-400 border-0 gap-0.5">
                <Bot className="h-2.5 w-2.5" /> IA
              </Badge>
            </div>
            <p className="text-[10px] text-white/40">
              {isThinking ? "est en train d'écrire…" : "Canal souverain · en ligne"}
            </p>
          </div>
          {isThinking && <Zap className="h-4 w-4 text-amber-400 animate-pulse" />}
        </div>

        {/* Player */}
        <div className="flex-1 overflow-hidden">
          <WakaSovereignPlayer
            messages={messages}
            onSend={handleSend}
            onQuickReply={handleQuickReply}
            status={isThinking ? "typing" : "online"}
            dataMode={dataMode}
          />
        </div>
      </div>
    </div>
  );
}
