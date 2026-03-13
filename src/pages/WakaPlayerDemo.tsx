/**
 * Waka Sovereign Player — Demo page
 * Hybrid model: AI-powered intent engine + sovereign blocks + persistent conversations
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wifi, Signal, BatteryFull, Bot, Zap, RotateCcw, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { WakaSovereignPlayer, type PlayerMessage, type DataMode } from "@/components/player/WakaSovereignPlayer";
import type { CatalogProduct, MediaSlide } from "@/components/player/sovereign-blocks";
import { useWakaPlayerAI } from "@/hooks/useWakaPlayerAI";
import { usePlayerConversation } from "@/hooks/usePlayerConversation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
  const [messages, setMessages] = useState<PlayerMessage[]>(WELCOME_MESSAGES);
  const [dataMode, setDataMode] = useState<DataMode>("libre");
  const { sendToAI, isThinking } = useWakaPlayerAI();
  const { saveMessage, loadHistory, updateDataMode, startNewConversation, messageCount, conversationId } = usePlayerConversation();
  const historyLoaded = useRef(false);

  // Load conversation history on mount
  useEffect(() => {
    if (historyLoaded.current || !conversationId) return;
    historyLoaded.current = true;

    loadHistory().then((history) => {
      if (history.length > 0) {
        setMessages(history);
      } else {
        // Save welcome messages for new conversations
        WELCOME_MESSAGES.forEach((msg) => saveMessage(msg));
      }
    });
  }, [conversationId, loadHistory, saveMessage]);

  const status = isThinking ? "typing" : "online";

  const addUserMessage = useCallback((text: string, imageUrl?: string) => {
    const userMsg: PlayerMessage = {
      id: `user-${Date.now()}`,
      text,
      direction: "inbound",
      timestamp: new Date(),
      imageUrl,
    };
    setMessages((prev) => [...prev, userMsg]);
    saveMessage(userMsg);
    return userMsg;
  }, [saveMessage]);

  const addBotMessage = useCallback((partial: Partial<PlayerMessage>, extra?: { aiModel?: string; aiLatencyMs?: number }) => {
    const botMsg: PlayerMessage = {
      id: `bot-${Date.now()}`,
      text: "",
      direction: "outbound",
      timestamp: new Date(),
      ...partial,
    };
    setMessages((prev) => [...prev, botMsg]);
    saveMessage(botMsg, extra);
  }, [saveMessage]);

  const handleSend = useCallback(
    async (text: string) => {
      addUserMessage(text);
      const t0 = Date.now();
      const response = await sendToAI(text, dataMode);
      const latency = Date.now() - t0;
      if (response) {
        addBotMessage(response, { aiModel: "gemini-3-flash", aiLatencyMs: latency });
      } else {
        addBotMessage({
          text: "Désolé, je n'ai pas pu traiter votre demande. Réessayez.",
          quickReplies: ["🔄 Réessayer", "🏠 Menu principal"],
        });
      }
    },
    [addUserMessage, addBotMessage, sendToAI, dataMode]
  );

  const handleSendImage = useCallback(
    async (imageDataUrl: string, caption?: string) => {
      addUserMessage(caption || "📸 Photo envoyée", imageDataUrl);
      const t0 = Date.now();
      const response = await sendToAI(caption || "", dataMode, imageDataUrl);
      const latency = Date.now() - t0;
      if (response) {
        addBotMessage(response, { aiModel: "gemini-2.5-flash", aiLatencyMs: latency });
      } else {
        addBotMessage({
          text: "Désolé, je n'ai pas pu analyser cette image. Réessayez.",
          quickReplies: ["🔄 Réessayer", "🏠 Menu principal"],
        });
      }
    },
    [addUserMessage, addBotMessage, sendToAI, dataMode]
  );

  const handleQuickReply = useCallback(
    async (label: string) => {
      addUserMessage(label);
      const t0 = Date.now();
      const response = await sendToAI(label, dataMode);
      if (response) addBotMessage(response, { aiModel: "gemini-3-flash", aiLatencyMs: Date.now() - t0 });
    },
    [addUserMessage, addBotMessage, sendToAI, dataMode]
  );

  const handleMenuSelect = useCallback(
    async (label: string) => {
      addUserMessage(label);
      const t0 = Date.now();
      const response = await sendToAI(`J'ai sélectionné : ${label}`, dataMode);
      if (response) addBotMessage(response, { aiModel: "gemini-3-flash", aiLatencyMs: Date.now() - t0 });
    },
    [addUserMessage, addBotMessage, sendToAI, dataMode]
  );

  const handleCardAction = useCallback(
    async (action: string) => {
      addUserMessage(action);
      const t0 = Date.now();
      const response = await sendToAI(`Action : ${action}`, dataMode);
      if (response) addBotMessage(response, { aiModel: "gemini-3-flash", aiLatencyMs: Date.now() - t0 });
    },
    [addUserMessage, addBotMessage, sendToAI, dataMode]
  );

  const handleAddToCart = useCallback(
    async (product: CatalogProduct) => {
      const text = `Ajouter au panier : ${product.name} (${product.price})`;
      addUserMessage(text);
      const t0 = Date.now();
      const response = await sendToAI(text, dataMode);
      if (response) addBotMessage(response, { aiModel: "gemini-3-flash", aiLatencyMs: Date.now() - t0 });
    },
    [addUserMessage, addBotMessage, sendToAI, dataMode]
  );

  const handleFormSubmit = useCallback(
    async (values: Record<string, string>) => {
      const summary = Object.entries(values).map(([k, v]) => `${k}: ${v}`).join(", ");
      const text = `Formulaire soumis : ${summary}`;
      addUserMessage("Formulaire envoyé ✓");
      const t0 = Date.now();
      const response = await sendToAI(text, dataMode);
      if (response) addBotMessage(response, { aiModel: "gemini-3-flash", aiLatencyMs: Date.now() - t0 });
    },
    [addUserMessage, addBotMessage, sendToAI, dataMode]
  );

  const handlePayment = useCallback(
    async (method: string) => {
      const text = `Paiement confirmé via ${method === "mobile_money" ? "Moov Money" : "carte bancaire"}`;
      addUserMessage("Paiement confirmé ✓");
      const t0 = Date.now();
      const response = await sendToAI(text, dataMode);
      if (response) addBotMessage(response, { aiModel: "gemini-3-flash", aiLatencyMs: Date.now() - t0 });
    },
    [addUserMessage, addBotMessage, sendToAI, dataMode]
  );

  const handleRate = useCallback(
    async (value: number | string) => {
      const text = `Note donnée : ${value}`;
      addUserMessage(`Note : ${value}`);
      const t0 = Date.now();
      const response = await sendToAI(text, dataMode);
      if (response) addBotMessage(response, { aiModel: "gemini-3-flash", aiLatencyMs: Date.now() - t0 });
    },
    [addUserMessage, addBotMessage, sendToAI, dataMode]
  );

  const handleModuleClick = useCallback(
    async (moduleId: string) => {
      const text = `Ouvrir le module de formation : ${moduleId}`;
      addUserMessage(`Module : ${moduleId}`);
      const t0 = Date.now();
      const response = await sendToAI(text, dataMode);
      if (response) addBotMessage(response, { aiModel: "gemini-3-flash", aiLatencyMs: Date.now() - t0 });
    },
    [addUserMessage, addBotMessage, sendToAI, dataMode]
  );

  const handleSlideAction = useCallback(
    async (slide: MediaSlide) => {
      const text = `Action sur média : ${slide.caption || slide.id}`;
      addUserMessage(slide.caption || "Média sélectionné");
      const t0 = Date.now();
      const response = await sendToAI(text, dataMode);
      if (response) addBotMessage(response, { aiModel: "gemini-3-flash", aiLatencyMs: Date.now() - t0 });
    },
    [addUserMessage, addBotMessage, sendToAI, dataMode]
  );

  const handleCreditAction = useCallback(
    async (action: string) => {
      addUserMessage(action);
      const t0 = Date.now();
      const response = await sendToAI(`Action crédit : ${action}`, dataMode);
      if (response) addBotMessage(response, { aiModel: "gemini-3-flash", aiLatencyMs: Date.now() - t0 });
    },
    [addUserMessage, addBotMessage, sendToAI, dataMode]
  );

  const handleMomoAction = useCallback(
    async (action: string) => {
      addUserMessage(action);
      const t0 = Date.now();
      const response = await sendToAI(`Action MoMo : ${action}`, dataMode);
      if (response) addBotMessage(response, { aiModel: "gemini-3-flash", aiLatencyMs: Date.now() - t0 });
    },
    [addUserMessage, addBotMessage, sendToAI, dataMode]
  );

  const handleVoiceToggle = useCallback(
    async (active: boolean) => {
      if (!active) {
        const voiceMsg: PlayerMessage = {
          id: `voice-${Date.now()}`,
          text: "",
          direction: "inbound",
          timestamp: new Date(),
          isVoice: true,
        };
        setMessages((prev) => [...prev, voiceMsg]);
        saveMessage(voiceMsg);
        const t0 = Date.now();
        const response = await sendToAI("(Message vocal reçu — l'utilisateur a envoyé un message audio)", dataMode);
        if (response) addBotMessage(response, { aiModel: "gemini-3-flash", aiLatencyMs: Date.now() - t0 });
      }
    },
    [addBotMessage, sendToAI, dataMode, saveMessage]
  );

  const handleDataModeChange = useCallback((mode: DataMode) => {
    setDataMode(mode);
    updateDataMode(mode);
  }, [updateDataMode]);

  const handleNewConversation = useCallback(async () => {
    await startNewConversation();
    historyLoaded.current = false;
    setMessages(WELCOME_MESSAGES);
    WELCOME_MESSAGES.forEach((msg) => saveMessage(msg));
  }, [startNewConversation, saveMessage]);

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
        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary gap-1">
          <Bot className="h-3 w-3" />
          AI-POWERED
        </Badge>
        <Badge className={cn("text-[9px] border-0 font-bold", MODE_COLORS[dataMode])}>
          {MODE_LABELS[dataMode]}
        </Badge>
        {isThinking && (
          <Badge variant="outline" className="text-[9px] border-[hsl(160,50%,50%)]/30 text-[hsl(160,50%,40%)] animate-pulse gap-1">
            <Zap className="h-2.5 w-2.5" />
            Thinking…
          </Badge>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="text-[9px] gap-1 cursor-default">
                <Database className="h-2.5 w-2.5" />
                {messageCount} msgs
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Mensajes persistidos en esta conversación</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleNewConversation} className="h-7 text-[11px] gap-1">
                <RotateCcw className="h-3 w-3" />
                Nueva
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Iniciar una nueva conversación</p>
            </TooltipContent>
          </Tooltip>
        </div>
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
                onDataModeChange={handleDataModeChange}
                onSend={handleSend}
                onSendImage={handleSendImage}
                onQuickReply={handleQuickReply}
                onVoiceToggle={handleVoiceToggle}
                onMenuSelect={handleMenuSelect}
                onCardAction={handleCardAction}
                onAddToCart={handleAddToCart}
                onFormSubmit={handleFormSubmit}
                onPayment={handlePayment}
                onRate={handleRate}
                onModuleClick={handleModuleClick}
                onSlideAction={handleSlideAction}
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
