/**
 * Waka Sovereign Player — Demo page
 * Hybrid model: AI-powered intent engine + sovereign blocks + persistent conversations
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Wifi, Signal, BatteryFull, Bot, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { WakaSovereignPlayer, type PlayerMessage, type DataMode } from "@/components/player/WakaSovereignPlayer";
import type { CatalogProduct, MediaSlide } from "@/components/player/sovereign-blocks";
import { useWakaPlayerAI } from "@/hooks/useWakaPlayerAI";
import { usePlayerConversation } from "@/hooks/usePlayerConversation";
import { useSavedPlayerFlows } from "@/hooks/useSavedPlayerFlows";
import { SaveFlowDialog } from "@/components/player/SaveFlowDialog";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { SavedFlowsPanel } from "@/components/player/SavedFlowsPanel";
import { FlowContextSelector } from "@/components/player/FlowContextSelector";
import { PlayerWorkbench } from "@/components/player/PlayerWorkbench";
import { PlayerBuilderToolbar } from "@/components/player/PlayerBuilderToolbar";
import { ExperienceRuntimeProvider } from "@/contexts/ExperienceRuntimeContext";
import { ExperienceCanvas } from "@/components/player/ExperienceCanvas";
import { ExpandedBlockRenderer } from "@/components/player/ExpandedBlockRenderer";
import { ExperienceModeSwitcher, type ExperienceMode } from "@/components/player/ExperienceModeSwitcher";
import { UniversalContextMenu, type ContextTarget } from "@/components/player/UniversalContextMenu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { toast } from "sonner";
import { VoiceCallOverlay } from "@/components/player/VoiceCallOverlay";
import { AvatarOverlay } from "@/components/player/AvatarOverlay";
import type { InsertableBlockType } from "@/components/player/PlayerContextMenu";

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
  const { tenantId } = useWorkspace();
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<PlayerMessage[]>(WELCOME_MESSAGES);
  const [dataMode, setDataMode] = useState<DataMode>("libre");
  const { sendToAI, isThinking, setFlowContext, resetHistory } = useWakaPlayerAI();
  const { saveMessage, loadHistory, updateDataMode, startNewConversation, messageCount, conversationId } = usePlayerConversation();
  const { saveFlow, loadFlowFull, updateFlowConversation } = useSavedPlayerFlows();
  const historyLoaded = useRef(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showFlowsPanel, setShowFlowsPanel] = useState(false);
  const [showFlowContextSelector, setShowFlowContextSelector] = useState(false);
  const [activeFlowContextName, setActiveFlowContextName] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("https://avatar.waka.africa/agent");
  const voiceUrl = "https://www.waka.services/agents/voice/test/1a840cd6-80ab-49d5-ae53-2622b6b94bbb?primary_color=%234a148c&accent_color=%23ffc107&transcription=false&auto_mic=true";
  const [activeScenarioConfig, setActiveScenarioConfig] = useState<Record<string, any>>({});
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [contextTarget, setContextTarget] = useState<ContextTarget>({ type: "canvas" });
  const [experienceMode, setExperienceMode] = useState<ExperienceMode>("expanded");
  const [versionCount, setVersionCount] = useState(0);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Undo/Redo stack
  const undoStack = useRef<PlayerMessage[][]>([]);
  const redoStack = useRef<PlayerMessage[][]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  // Version history entries
  const [versionEntries, setVersionEntries] = useState<Array<{ id: string; label: string; timestamp: string; messageCount: number }>>([]);
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

      // Always start fresh — don't restore previous conversation
      setMessages([...WELCOME_MESSAGES]);
      setDataMode(full.dataMode);
      setActiveFlowTitle(full.name);
      setActiveScenarioConfig(full.scenarioConfig || {});
      // Reset AI conversation history so it doesn't retain context from previous sessions
      resetHistory();
      startNewConversation();
      toast.success(`Flujo "${full.name}" iniciado desde cero`);
    });
  }, [flowIdParam, loadFlowFull]);

  // When NOT loading a saved flow, always start fresh
  useEffect(() => {
    if (historyLoaded.current || !conversationId || flowIdParam) return;
    historyLoaded.current = true;

    // Start fresh — save welcome messages as the beginning of a new conversation
    resetHistory();
    WELCOME_MESSAGES.forEach((msg) => saveMessage(msg));
  }, [conversationId, saveMessage, flowIdParam, resetHistory]);

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

  const handleWorkbenchResult = useCallback((result: { conversation: any[]; config: Record<string, any> }) => {
    if (result.conversation.length > 0) {
      setMessages(result.conversation);
    }
    if (result.config) {
      setActiveScenarioConfig(result.config);
      if (result.config.systemPrompt) {
        setFlowContext(result.config.systemPrompt);
      }
    }
  }, [setFlowContext]);

  const handleFlowContextSelect = useCallback((flowContext: string, flowName: string) => {
    if (flowContext && flowName) {
      setFlowContext(flowContext);
      setActiveFlowContextName(flowName);
    } else {
      setFlowContext(null);
      setActiveFlowContextName(null);
    }
  }, [setFlowContext]);

  // ── Auto-save after changes ──
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      if (!activeFlowId || !tenantId) return;
      try {
        await updateFlowConversation(activeFlowId, messages, dataMode, activeScenarioConfig);
        setVersionCount((v) => v + 1);
      } catch (err) {
        console.error("Auto-save error:", err);
      }
    }, 1500);
  }, [activeFlowId, tenantId, messages, dataMode, activeScenarioConfig, updateFlowConversation]);

  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, []);

  // ── Undo / Redo ──
  const pushUndo = useCallback(() => {
    undoStack.current.push([...messages]);
    if (undoStack.current.length > 50) undoStack.current.shift();
    redoStack.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, [messages]);

  const handleUndo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    redoStack.current.push([...messages]);
    const prev = undoStack.current.pop()!;
    setMessages(prev);
    setCanUndo(undoStack.current.length > 0);
    setCanRedo(true);
    triggerAutoSave();
  }, [messages, triggerAutoSave]);

  const handleRedo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    undoStack.current.push([...messages]);
    const next = redoStack.current.pop()!;
    setMessages(next);
    setCanUndo(true);
    setCanRedo(redoStack.current.length > 0);
    triggerAutoSave();
  }, [messages, triggerAutoSave]);

  // ── Message editing (double-click) ──
  const handleMessageEdit = useCallback((msgId: string, newText: string) => {
    pushUndo();
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, text: newText } : m))
    );
    triggerAutoSave();
    // Add version entry
    setVersionEntries((prev) => [
      { id: `ve-${Date.now()}`, label: `Editado: "${newText.substring(0, 30)}…"`, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), messageCount: messages.length },
      ...prev,
    ]);
    toast.success("Mensaje editado");
  }, [pushUndo, triggerAutoSave, messages.length]);

  // ── Block insertion from context menu ──
  const handleInsertBlock = useCallback((type: InsertableBlockType) => {
    setContextMenuPos(null);
    setContextTarget({ type: "canvas" });

    if (type === "voiceCall") {
      setShowVoiceCall(true);
      return;
    }
    if (type === "avatar") {
      setShowAvatar(true);
      return;
    }

    const blockMsg: PlayerMessage = {
      id: `block-${Date.now()}`,
      text: "",
      direction: "outbound",
      timestamp: new Date(),
      source: "WAKA Builder",
    };

    switch (type) {
      case "text":
        blockMsg.text = "Nouveau message — double-cliquez pour éditer";
        break;
      case "richCard":
        blockMsg.richCard = { title: "Titre de la carte", description: "Description", icon: "🎯", bgGradient: "linear-gradient(135deg, hsl(270,50%,45%), hsl(300,40%,50%))", actions: ["Action 1", "Action 2"] };
        break;
      case "menu":
        blockMsg.text = "Sélectionnez une option :";
        blockMsg.menu = [
          { label: "Option 1", icon: "📱", description: "Description option 1" },
          { label: "Option 2", icon: "💼", description: "Description option 2" },
          { label: "Option 3", icon: "🎯", description: "Description option 3" },
        ];
        blockMsg.menuTitle = "Menu";
        break;
      case "quickReplies":
        blockMsg.text = "Choisissez une réponse :";
        blockMsg.quickReplies = ["Réponse 1", "Réponse 2", "Réponse 3"];
        break;
      case "catalog":
        blockMsg.catalog = {
          title: "Nos produits",
          products: [
            { id: "p1", name: "Produit 1", price: "5.000 FCFA", image: "", emoji: "📱" },
            { id: "p2", name: "Produit 2", price: "12.000 FCFA", image: "", emoji: "💻" },
          ],
        };
        break;
      case "inlineForm":
        blockMsg.inlineForm = {
          title: "Formulaire",
          fields: [
            { id: "name", label: "Nom complet", type: "text", required: true },
            { id: "phone", label: "Téléphone", type: "phone", required: true },
          ],
          submitLabel: "Envoyer",
          icon: "📝",
        };
        break;
      case "location":
        blockMsg.location = { name: "Ouagadougou", address: "Burkina Faso", distance: "2.5 km" };
        break;
      case "payment":
        blockMsg.payment = {
          title: "Paiement",
          total: "15.000 FCFA",
          currency: "XOF",
          items: [{ label: "Service", amount: "15.000 FCFA" }],
          methods: ["mobile_money", "card"],
        };
        break;
      case "rating":
        blockMsg.rating = { title: "Évaluez notre service", type: "stars" };
        break;
      case "certificate":
        blockMsg.certificate = { title: "Certificat de Formation", recipient: "Nom du participant", module: "Formation WAKA", date: new Date().toISOString().split("T")[0], badge: "🏆" };
        break;
      case "training":
        blockMsg.training = {
          title: "Formation en cours",
          overallProgress: 35,
          modules: [
            { id: "m1", name: "Module 1", progress: 100, status: "completed" as const },
            { id: "m2", name: "Module 2", progress: 40, status: "current" as const },
            { id: "m3", name: "Module 3", progress: 0, status: "locked" as const },
          ],
        };
        break;
      case "mediaCarousel":
        blockMsg.mediaCarousel = {
          title: "Galerie",
          slides: [
            { id: "s1", type: "image", src: "/placeholder.svg", caption: "Image 1" },
            { id: "s2", type: "image", src: "/placeholder.svg", caption: "Image 2" },
          ],
        };
        break;
      case "creditSimulation":
        blockMsg.creditSimulation = { title: "Simulation crédit", amount: "150.000 FCFA", monthly_payment: "13.125 FCFA", total_cost: "157.500 FCFA", interest_rate: "8.5%", term: "12 mois" };
        break;
      case "clientStatus":
        blockMsg.clientStatus = { client_name: "Client Test", phone: "+226 70 00 00 00", active_credits: 1, total_balance: "25.000 FCFA" };
        break;
      case "momoAccount":
        blockMsg.momoAccount = { title: "Compte MoMo", account_number: "70-00-00-00", account_type: "standard", status: "Actif", message: "Votre compte est prêt" };
        break;
      case "servicePlans":
        blockMsg.servicePlans = {
          title: "Forfaits disponibles",
          category: "general",
          plans: [
            { sku: "basic", name: "Basic", price: "2.000 FCFA/mois", features: ["1 GB data", "Appels illimités"] },
            { sku: "pro", name: "Pro", price: "5.000 FCFA/mois", features: ["5 GB data", "Appels illimités", "SMS illimités"], badge: "⭐ Recommandé" },
          ],
        };
        break;
      case "paymentConfirmation":
        blockMsg.paymentConfirmation = { title: "Confirmation de paiement", amount_paid: "15.000 FCFA", status: "success", message: "Paiement reçu via Moov Money" };
        break;
      case "creditContract":
        blockMsg.creditContract = { title: "Contrat de crédit", credit_voice_id: `CTR-${Date.now()}`, credit_type: "BNPL", amount: "150.000 FCFA", term: "12 mois", monthly_payment: "13.125 FCFA", status: "pending" };
        break;
      case "deviceLockConsent":
        blockMsg.deviceLockConsent = { title: "Consentement Device Lock", device_name: "Samsung Galaxy A14", amount: "150.000 FCFA", message: "En acceptant, votre appareil sera verrouillé en cas de défaut de paiement." };
        break;
    }

    pushUndo();
    setMessages((prev) => [...prev, blockMsg]);
    saveMessage(blockMsg);
    triggerAutoSave();
    // Add version entry for block insertion
    setVersionEntries((prev) => [
      { id: `ve-${Date.now()}`, label: `Bloque "${type}" insertado`, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), messageCount: messages.length + 1 },
      ...prev,
    ]);
    toast.success(`Bloc "${type}" inséré`);
  }, [saveMessage, triggerAutoSave, pushUndo, messages.length]);

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Get the last message that has expandable blocks for the side panel renderer
  const expandedBlockForRenderer = (() => {
    // Find the most recent message with an expandable sovereign block
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.direction !== "outbound") continue;
      if (msg.catalog) return { blockType: "catalog", data: { catalog: msg.catalog } };
      if (msg.payment) return { blockType: "payment", data: { payment: msg.payment } };
      if (msg.paymentConfirmation) return { blockType: "paymentConfirmation", data: { paymentConfirmation: msg.paymentConfirmation } };
      if (msg.creditSimulation) return { blockType: "creditSimulation", data: { creditSimulation: msg.creditSimulation } };
      if (msg.creditContract) return { blockType: "creditContract", data: { creditContract: msg.creditContract } };
      if (msg.clientStatus) return { blockType: "clientStatus", data: { clientStatus: msg.clientStatus } };
      if (msg.momoAccount) return { blockType: "momoAccount", data: { momoAccount: msg.momoAccount } };
      if (msg.servicePlans) return { blockType: "servicePlans", data: { servicePlans: msg.servicePlans } };
      if (msg.inlineForm) return { blockType: "inlineForm", data: { inlineForm: msg.inlineForm } };
      if (msg.training) return { blockType: "training", data: { training: msg.training } };
      if (msg.mediaCarousel) return { blockType: "mediaCarousel", data: { mediaCarousel: msg.mediaCarousel } };
      if (msg.location) return { blockType: "location", data: { location: msg.location } };
      if (msg.certificate) return { blockType: "certificate", data: { certificate: msg.certificate } };
    }
    return null;
  })();

  return (
    <ExperienceRuntimeProvider tenantId={tenantId} dataPolicy={dataMode}>
      <ExperienceCanvas
        header={
          <div className="flex items-center gap-3 border-b border-border px-6 py-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/player")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-bold text-foreground">Waka XP Runtime</h1>
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary gap-1">
              <Bot className="h-3 w-3" />
              ADAPTIVE
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
            {activeFlowId && versionCount > 0 && (
              <Badge variant="outline" className="text-[9px] border-[hsl(160,50%,40%)]/30 text-[hsl(160,50%,35%)] gap-1">
                v{versionCount} guardado
              </Badge>
            )}
          </div>
        }
        phone={
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
                    onVoiceCall={() => setShowVoiceCall(true)}
                    onAvatarCall={() => setShowAvatar(true)}
                    onContextMenu={(x, y) => setContextMenuPos({ x, y })}
                    onMessageEdit={handleMessageEdit}
                  />
                </div>

                {/* Voice Call Overlay */}
                <VoiceCallOverlay
                  open={showVoiceCall}
                  onClose={handleVoiceCallEnd}
                  agentName="WAKA VOICE"
                  voiceUrl={voiceUrl}
                />

                {/* Avatar Overlay */}
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
        }
        sidePanelContent={
          <ExpandedBlockRenderer
            blockType={expandedBlockForRenderer?.blockType || ""}
            data={expandedBlockForRenderer?.data || {}}
            onAction={handleCardAction}
            onAddToCart={handleAddToCart}
            onFormSubmit={handleFormSubmit}
            onPayment={handlePayment}
            onRate={handleRate}
            onModuleClick={handleModuleClick}
            onSlideAction={handleSlideAction}
            onSelectPlan={handleSelectPlan}
            onDeviceLockConsent={handleDeviceLockConsent}
          />
        }
        toolbar={
          <PlayerBuilderToolbar
            versionCount={versionCount}
            versions={versionEntries}
            onInsertBlock={handleInsertBlock}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onRestart={handleNewConversation}
            onSave={() => setShowSaveDialog(true)}
            canUndo={canUndo}
            canRedo={canRedo}
            activeFlowId={activeFlowId}
          />
        }
        workbench={
          <div className="w-[360px] border-l border-border bg-card flex flex-col shrink-0">
            <PlayerWorkbench
              flowId={activeFlowId}
              flowTitle={activeFlowTitle}
              scenarioConfig={activeScenarioConfig}
              messageCount={messageCount}
              tenantId={tenantId || ""}
              onInstructionsSent={handleWorkbenchResult}
              onNewConversation={handleNewConversation}
              onSave={() => setShowSaveDialog(true)}
              onOpenFlows={() => setShowFlowsPanel(true)}
            />
          </div>
        }
      />

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

      {/* Right-click context menu */}
      {contextMenuPos && (
        <PlayerContextMenu
          x={contextMenuPos.x}
          y={contextMenuPos.y}
          onInsert={handleInsertBlock}
          onClose={() => setContextMenuPos(null)}
        />
      )}
    </ExperienceRuntimeProvider>
  );
}
