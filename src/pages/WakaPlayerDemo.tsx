/**
 * Waka Sovereign Player — Demo page
 * Hybrid model: AI-powered intent engine + sovereign blocks + persistent conversations
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Wifi, Signal, BatteryFull, Bot, Zap, RotateCcw, Database, Save, FolderOpen, GitBranch, Phone, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { WakaSovereignPlayer, type PlayerMessage, type DataMode } from "@/components/player/WakaSovereignPlayer";
import type { CatalogProduct, MediaSlide } from "@/components/player/sovereign-blocks";
import { useWakaPlayerAI } from "@/hooks/useWakaPlayerAI";
import { usePlayerConversation } from "@/hooks/usePlayerConversation";
import { useSavedPlayerFlows } from "@/hooks/useSavedPlayerFlows";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SaveFlowDialog } from "@/components/player/SaveFlowDialog";
import { SavedFlowsPanel } from "@/components/player/SavedFlowsPanel";
import { FlowContextSelector } from "@/components/player/FlowContextSelector";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { toast } from "sonner";
import { VoiceCallOverlay } from "@/components/player/VoiceCallOverlay";
import { AvatarOverlay } from "@/components/player/AvatarOverlay";

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
  libre: "bg-[hsl(270,40%,50%)]/10 text-[hsl(270,40%,45%)]",
  "subventionné": "bg-[hsl(35,80%,50%)]/10 text-[hsl(35,70%,40%)]",
  "zero-rated": "bg-[hsl(220,10%,50%)]/10 text-[hsl(220,10%,40%)]",
};

export default function WakaPlayerDemo() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<PlayerMessage[]>(WELCOME_MESSAGES);
  const [dataMode, setDataMode] = useState<DataMode>("libre");
  const { sendToAI, isThinking, setFlowContext } = useWakaPlayerAI();
  const { saveMessage, loadHistory, updateDataMode, startNewConversation, messageCount, conversationId } = usePlayerConversation();
  const { saveFlow, loadFlowFull } = useSavedPlayerFlows();
  const historyLoaded = useRef(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showFlowsPanel, setShowFlowsPanel] = useState(false);
  const [showFlowContextSelector, setShowFlowContextSelector] = useState(false);
  const [activeFlowContextName, setActiveFlowContextName] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("https://avatar.waka.africa/agent");

  // Determine if we're in "saved flow" mode
  const flowIdParam = searchParams.get("flow");
  const [activeFlowId, setActiveFlowId] = useState<string | null>(flowIdParam);
  const [activeFlowTitle, setActiveFlowTitle] = useState<string | null>(null);

  // Load selected flow from query param and react to param changes
  const loadedFlowIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!flowIdParam) {
      loadedFlowIdRef.current = null;
      setActiveFlowId(null);
      setActiveFlowTitle(null);
      return;
    }

    if (loadedFlowIdRef.current === flowIdParam) return;
    loadedFlowIdRef.current = flowIdParam;

    setActiveFlowId(flowIdParam);
    loadFlowFull(flowIdParam).then((full) => {
      if (!full) {
        toast.error("No se pudo cargar el flujo seleccionado");
        return;
      }

      setMessages(full.conversationSnapshot.length > 0 ? full.conversationSnapshot : WELCOME_MESSAGES);
      setDataMode(full.dataMode);
      setActiveFlowTitle(full.name);
      toast.success(`Flujo "${full.name}" cargado`);
    });
  }, [flowIdParam, loadFlowFull]);

  // Load generic conversation history only when NOT loading a saved flow
  useEffect(() => {
    if (historyLoaded.current || !conversationId || flowIdParam) return;
    historyLoaded.current = true;

    loadHistory().then((history) => {
      if (history.length > 0) {
        setMessages(history);
      } else {
        WELCOME_MESSAGES.forEach((msg) => saveMessage(msg));
      }
    });
  }, [conversationId, loadHistory, saveMessage, flowIdParam]);

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

  const FALLBACK_REPLIES = [
    "📱 Voir les téléphones",
    "💳 Mon solde",
    "🏥 Assurance santé",
    "🏠 Menu principal",
  ];

  /** Extract numbered/bulleted options from text to generate quick reply buttons */
  const extractOptionsFromText = (text: string): string[] => {
    const options: string[] = [];
    // Match patterns like "1. 📱 **Option Name**" or "- **Option**" or "1. Option"
    const lines = text.split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*(?:\d+[.)]\s*|[-•]\s*)([^\n]{3,60})/);
      if (match) {
        // Clean markdown bold markers and trim
        let label = match[1].replace(/\*\*/g, "").replace(/\s*[:—–-]\s*.+$/, "").trim();
        // Only include if it looks like a selectable option (not a description)
        if (label.length >= 3 && label.length <= 50 && !label.includes("(") && !label.match(/^\d/)) {
          options.push(label);
        }
      }
    }
    return options.slice(0, 5); // Max 5 buttons
  };

  const addBotMessage = useCallback((partial: Partial<PlayerMessage>, extra?: { aiModel?: string; aiLatencyMs?: number }) => {
    const hasInteraction = partial.quickReplies?.length || partial.menu?.length || partial.catalog ||
      partial.inlineForm || partial.payment || partial.rating || partial.servicePlans ||
      partial.creditSimulation || partial.clientStatus || partial.momoAccount ||
      partial.paymentConfirmation || partial.creditContract || partial.deviceLockConsent;

    // Try to extract options from text if no quick replies provided
    let quickReplies = partial.quickReplies;
    if (!quickReplies?.length && !hasInteraction && partial.text) {
      const extracted = extractOptionsFromText(partial.text);
      if (extracted.length >= 2) {
        quickReplies = extracted;
      }
    }

    // Ultimate fallback: always show navigation menu
    if (!quickReplies?.length && !hasInteraction) {
      quickReplies = FALLBACK_REPLIES;
    }

    const botMsg: PlayerMessage = {
      id: `bot-${Date.now()}`,
      text: "",
      direction: "outbound",
      timestamp: new Date(),
      ...partial,
      quickReplies,
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
      // Intercept voice/avatar quick replies
      if (label.includes("Llamar") || label.includes("VOICE") || label.includes("📞")) {
        setShowVoiceCall(true);
        return;
      }
      if (label.includes("Avatar") || label.includes("🎭")) {
        setShowAvatar(true);
        return;
      }
      addUserMessage(label);
      const t0 = Date.now();
      const response = await sendToAI(label, dataMode);
      if (response) addBotMessage(response, { aiModel: "gemini-3-flash", aiLatencyMs: Date.now() - t0 });
    },
    [addUserMessage, addBotMessage, sendToAI, dataMode]
  );

  const handleVoiceCallEnd = useCallback((summary?: string) => {
    setShowVoiceCall(false);
    if (summary) {
      addBotMessage({
        text: `${summary}\n\n¿En qué más puedo ayudarle?`,
        quickReplies: ["🏠 Menu principal", "📞 Llamar de nuevo", "💳 Mon solde"],
      });
    }
  }, [addBotMessage]);

  const handleAvatarClose = useCallback(() => {
    setShowAvatar(false);
    addBotMessage({
      text: "🎭 Sesión de avatar finalizada. ¿Cómo puedo continuar ayudándole?",
      quickReplies: ["🏠 Menu principal", "🎭 Volver al avatar", "📞 Llamar agente"],
    });
  }, [addBotMessage]);

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

  const handleSelectPlan = useCallback(
    async (sku: string, name: string) => {
      const text = `Je choisis le plan : ${name} (SKU: ${sku})`;
      addUserMessage(`Plan sélectionné : ${name}`);
      const t0 = Date.now();
      const response = await sendToAI(text, dataMode);
      if (response) addBotMessage(response, { aiModel: "gemini-3-flash", aiLatencyMs: Date.now() - t0 });
    },
    [addUserMessage, addBotMessage, sendToAI, dataMode]
  );

  const handlePaymentConfirmAction = useCallback(
    async (action: string) => {
      addUserMessage(action);
      const t0 = Date.now();
      const response = await sendToAI(`Action paiement : ${action}`, dataMode);
      if (response) addBotMessage(response, { aiModel: "gemini-3-flash", aiLatencyMs: Date.now() - t0 });
    },
    [addUserMessage, addBotMessage, sendToAI, dataMode]
  );

  const handleCreditContractAction = useCallback(
    async (action: string) => {
      addUserMessage(action);
      const t0 = Date.now();
      const response = await sendToAI(`Action contrat crédit : ${action}`, dataMode);
      if (response) addBotMessage(response, { aiModel: "gemini-3-flash", aiLatencyMs: Date.now() - t0 });
    },
    [addUserMessage, addBotMessage, sendToAI, dataMode]
  );

  const handleDeviceLockConsent = useCallback(
    async (accepted: boolean) => {
      const text = accepted
        ? "J'accepte le device lock. Veuillez créer mon crédit."
        : "Je refuse le device lock.";
      addUserMessage(accepted ? "✓ Device lock accepté" : "✗ Device lock refusé");
      const t0 = Date.now();
      const response = await sendToAI(text, dataMode);
      if (response) addBotMessage(response, { aiModel: "gemini-3-flash", aiLatencyMs: Date.now() - t0 });
    },
    [addUserMessage, addBotMessage, sendToAI, dataMode]
  );

  const handleSendLocation = useCallback(
    async (lat: number, lng: number) => {
      addUserMessage(`📍 Position GPS : ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      const t0 = Date.now();
      const response = await sendToAI(
        `L'utilisateur partage sa position GPS : latitude=${lat}, longitude=${lng}. Utilise update_client_location si un client est identifié.`,
        dataMode
      );
      if (response) addBotMessage(response, { aiModel: "gemini-3-flash", aiLatencyMs: Date.now() - t0 });
    },
    [addUserMessage, addBotMessage, sendToAI, dataMode]
  );

  const handleSendDocument = useCallback(
    async (file: File) => {
      const ext = file.name.split(".").pop()?.toUpperCase() || "FILE";
      const sizeKB = Math.round(file.size / 1024);
      addUserMessage(`📎 Document envoyé : ${file.name} (${ext}, ${sizeKB} KB)`);
      const t0 = Date.now();
      const response = await sendToAI(
        `L'utilisateur a envoyé un document : ${file.name} (type: ${file.type}, taille: ${sizeKB} KB). Confirme la réception et propose les prochaines étapes.`,
        dataMode
      );
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

  const handleSaveFlow = useCallback(async (name: string, description: string, status: "stable" | "sandbox" | "production") => {
    setIsSaving(true);
    const id = await saveFlow(name, description, messages, dataMode, status);
    setIsSaving(false);
    if (id) toast.success(`Flujo "${name}" guardado`);
    else toast.error("Error al guardar el flujo");
  }, [saveFlow, messages, dataMode]);

  const handleLoadFlow = useCallback((flowId: string) => {
    setShowFlowsPanel(false);
    if (flowId === flowIdParam) return;
    navigate(`/player/live?flow=${flowId}`);
  }, [navigate, flowIdParam]);

  const handleFlowContextSelect = useCallback((flowContext: string, flowName: string) => {
    if (flowContext && flowName) {
      setFlowContext(flowContext);
      setActiveFlowContextName(flowName);
    } else {
      setFlowContext(null);
      setActiveFlowContextName(null);
    }
  }, [setFlowContext]);

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex h-full bg-background">
      {/* ─── Left: Phone Simulator ─── */}
      <div className="flex flex-1 flex-col">
        {/* Minimal page header */}
        <div className="flex items-center gap-3 border-b border-border px-6 py-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/player")}>
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
          {activeFlowTitle && (
            <Badge variant="outline" className="text-[9px] border-primary/30 text-primary">
              {activeFlowTitle.length > 28 ? `${activeFlowTitle.slice(0, 28)}…` : activeFlowTitle}
            </Badge>
          )}
          {isThinking && (
            <Badge variant="outline" className="text-[9px] border-[hsl(270,40%,55%)]/30 text-[hsl(270,40%,48%)] animate-pulse gap-1">
              <Zap className="h-2.5 w-2.5" />
              Thinking…
            </Badge>
          )}
        </div>

        {/* Body — iPhone frame */}
        <div className="flex flex-1 items-center justify-center overflow-hidden bg-muted/30">
          <div className="relative w-[375px] h-[812px] max-h-[calc(100vh-80px)]">
            <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-b from-[hsl(220,8%,80%)] to-[hsl(220,8%,68%)] shadow-[0_0_50px_rgba(0,0,0,0.12)]" />
            <div className="absolute inset-[3px] rounded-[2.8rem] bg-black overflow-hidden flex flex-col">
              <div
                className="relative flex items-center justify-between px-7 pt-3 pb-1 z-20"
                style={{
                  background:
                    dataMode === "zero-rated"
                      ? "hsl(270,35%,35%)"
                      : "linear-gradient(135deg, hsl(270,40%,38%) 0%, hsl(280,45%,42%) 50%, hsl(290,40%,45%) 100%)",
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
                  onSendLocation={handleSendLocation}
                  onSendDocument={handleSendDocument}
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
                  onCreditAction={handleCreditAction}
                  onMomoAction={handleMomoAction}
                  onSelectPlan={handleSelectPlan}
                  onPaymentConfirmAction={handlePaymentConfirmAction}
                  onCreditContractAction={handleCreditContractAction}
                  onDeviceLockConsent={handleDeviceLockConsent}
                />
              </div>

              {/* Voice Call Overlay — takes over phone screen */}
              <VoiceCallOverlay
                open={showVoiceCall}
                onClose={handleVoiceCallEnd}
                agentName="WAKA VOICE"
              />

              {/* Avatar Overlay — takes over phone screen */}
              <AvatarOverlay
                open={showAvatar}
                onClose={handleAvatarClose}
                avatarUrl={avatarUrl}
                agentName="WAKA Avatar"
              />

              <div className="flex justify-center py-2 bg-white">
                <div className="h-[5px] w-[130px] rounded-full bg-black/15" />
              </div>
            </div>
            <div className="absolute left-[-2px] top-[130px] w-[3px] h-[30px] rounded-l bg-[hsl(220,8%,72%)]" />
            <div className="absolute left-[-2px] top-[175px] w-[3px] h-[55px] rounded-l bg-[hsl(220,8%,72%)]" />
            <div className="absolute left-[-2px] top-[240px] w-[3px] h-[55px] rounded-l bg-[hsl(220,8%,72%)]" />
            <div className="absolute right-[-2px] top-[190px] w-[3px] h-[70px] rounded-r bg-[hsl(220,8%,72%)]" />
          </div>
        </div>
      </div>

      {/* ─── Right: Persistent Toolbox Panel ─── */}
      <div className="w-[320px] border-l border-border bg-card flex flex-col shrink-0">
        {/* Toolbox Header */}
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Panel de control
          </h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Herramientas de iteración y producción
          </p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* ── Session Info ── */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Sesión</h3>
              <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Mensajes</span>
                  <Badge variant="secondary" className="text-[9px] gap-1">
                    <Database className="h-2.5 w-2.5" />
                    {messageCount}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Modo datos</span>
                  <Badge className={cn("text-[9px] border-0 font-bold", MODE_COLORS[dataMode])}>
                    {MODE_LABELS[dataMode]}
                  </Badge>
                </div>
                {activeFlowContextName && (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">Contexto IA</span>
                    <Badge variant="outline" className="text-[9px] gap-1 max-w-[140px] truncate">
                      <GitBranch className="h-2.5 w-2.5 shrink-0" />
                      {activeFlowContextName}
                    </Badge>
                  </div>
                )}
                {activeFlowTitle && (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">Flujo activo</span>
                    <Badge variant="outline" className="text-[9px] border-primary/30 text-primary max-w-[140px] truncate">
                      {activeFlowTitle}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* ── Iteration Tools ── */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Iteración</h3>
              <div className="space-y-1.5">
                <Button
                  variant={activeFlowContextName ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowFlowContextSelector(true)}
                  className="w-full justify-start h-8 text-[11px] gap-2"
                >
                  <GitBranch className="h-3.5 w-3.5" />
                  {activeFlowContextName ? "Cambiar contexto IA" : "Cargar contexto IA"}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNewConversation}
                  className="w-full justify-start h-8 text-[11px] gap-2"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Nueva conversación
                </Button>
              </div>
            </div>

            {/* ── WAKA VOICE & Avatar ── */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Canales interactivos</h3>
              <div className="space-y-1.5">
                <Button
                  variant={showVoiceCall ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowVoiceCall(true)}
                  className="w-full justify-start h-8 text-[11px] gap-2"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Llamar WAKA VOICE
                </Button>

                <Button
                  variant={showAvatar ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowAvatar(true)}
                  className="w-full justify-start h-8 text-[11px] gap-2"
                >
                  <User className="h-3.5 w-3.5" />
                  Abrir Avatar
                </Button>

                <div className="pt-1">
                  <label className="text-[10px] text-muted-foreground block mb-1">URL del avatar</label>
                  <Input
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://avatar.waka.africa/agent"
                    className="h-7 text-[10px]"
                  />
                </div>
              </div>
            <div className="space-y-2">
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Ciclo de vida</h3>
              <div className="space-y-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSaveDialog(true)}
                  disabled={messages.length <= 2}
                  className="w-full justify-start h-8 text-[11px] gap-2"
                >
                  <Save className="h-3.5 w-3.5" />
                  Guardar como flujo
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFlowsPanel(true)}
                  className="w-full justify-start h-8 text-[11px] gap-2"
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  Ver flujos guardados
                </Button>
              </div>
            </div>

            {/* ── Saved Flows Quick List ── */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Flujos recientes</h3>
              <SavedFlowsPanel
                onLoad={handleLoadFlow}
                onClose={() => {}}
                activeFlowId={activeFlowId}
                compact
              />
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Save Flow Dialog */}
      <SaveFlowDialog
        open={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={handleSaveFlow}
        isSaving={isSaving}
      />

      {/* Saved Flows Full Panel */}
      <Sheet open={showFlowsPanel} onOpenChange={setShowFlowsPanel}>
        <SheetContent side="right" className="w-[400px] p-0">
          <SavedFlowsPanel
            onLoad={handleLoadFlow}
            onClose={() => setShowFlowsPanel(false)}
            activeFlowId={activeFlowId}
          />
        </SheetContent>
      </Sheet>

      {/* Flow Context Selector */}
      <FlowContextSelector
        open={showFlowContextSelector}
        onClose={() => setShowFlowContextSelector(false)}
        onSelect={handleFlowContextSelect}
        activeFlowName={activeFlowContextName}
      />
    </div>
  );
}
