/**
 * Waka Sovereign Player — Demo page (Refactored)
 * Uses extracted hooks: usePlayerActions, usePlayerAuthoring, useBlockExpansion
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Wifi, Signal, BatteryFull, Bot, Zap, RotateCcw, Globe, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { WakaSovereignPlayer, type PlayerMessage, type DataMode } from "@/components/player/WakaSovereignPlayer";
import { useWakaPlayerAI } from "@/hooks/useWakaPlayerAI";
import { usePlayerConversation } from "@/hooks/usePlayerConversation";
import { useSavedPlayerFlows } from "@/hooks/useSavedPlayerFlows";
import { usePlayerActions } from "@/hooks/usePlayerActions";
import { usePlayerAuthoring } from "@/hooks/usePlayerAuthoring";
import { useBlockExpansion, findLastExpandableBlock } from "@/hooks/useBlockExpansion";
import { SaveFlowDialog } from "@/components/player/SaveFlowDialog";
import { QuickShareDialog } from "@/components/player/QuickShareDialog";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { SavedFlowsPanel } from "@/components/player/SavedFlowsPanel";
import { FlowContextSelector } from "@/components/player/FlowContextSelector";
import { PlayerWorkbench } from "@/components/player/PlayerWorkbench";
import { PlayerBuilderToolbar } from "@/components/player/PlayerBuilderToolbar";
import { ExperienceRuntimeProvider } from "@/contexts/ExperienceRuntimeContext";
import { PlayerContextProvider } from "@/contexts/PlayerContextProvider";
import { PlayerMemoryProvider, usePlayerMemory } from "@/contexts/PlayerMemoryProvider";
import { ExperienceCanvas } from "@/components/player/ExperienceCanvas";
import { ExpandedBlockRenderer } from "@/components/player/ExpandedBlockRenderer";
import { ExperienceModeSwitcher, type ExperienceMode } from "@/components/player/ExperienceModeSwitcher";
import { UniversalContextMenu, type ContextTarget } from "@/components/player/UniversalContextMenu";
import { WelcomeBackStrip } from "@/components/player/WelcomeBackStrip";
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

// FALLBACK_REPLIES removed — AI provides 100% contextual buttons or none

/** Extract numbered/bulleted options from text */
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

export default function WakaPlayerDemo() {
  const { tenantId } = useWorkspace();
  const [dataMode, setDataMode] = useState<DataMode>("libre");
  const [scenarioConfig, setScenarioConfig] = useState<Record<string, any>>({});

  return (
    <ExperienceRuntimeProvider tenantId={tenantId} dataPolicy={dataMode}>
      <PlayerContextProvider scenarioConfig={scenarioConfig} systemPrompt={scenarioConfig.systemPrompt || null}>
        <PlayerMemoryProvider tenantId={tenantId || undefined}>
          <WakaPlayerDemoInner dataMode={dataMode} setDataMode={setDataMode} scenarioConfig={scenarioConfig} setScenarioConfig={setScenarioConfig} />
        </PlayerMemoryProvider>
      </PlayerContextProvider>
    </ExperienceRuntimeProvider>
  );
}

function WakaPlayerDemoInner({ dataMode, setDataMode, scenarioConfig: activeScenarioConfigProp, setScenarioConfig: setActiveScenarioConfigProp }: { dataMode: DataMode; setDataMode: React.Dispatch<React.SetStateAction<DataMode>>; scenarioConfig: Record<string, any>; setScenarioConfig: React.Dispatch<React.SetStateAction<Record<string, any>>> }) {
  const navigate = useNavigate();
  const { tenantId } = useWorkspace();
  const [searchParams] = useSearchParams();

  // ── Core State ──
  const [messages, setMessages] = useState<PlayerMessage[]>(WELCOME_MESSAGES);
  const [experienceMode, setExperienceMode] = useState<ExperienceMode>("expanded");
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showFlowsPanel, setShowFlowsPanel] = useState(false);
  const [showFlowContextSelector, setShowFlowContextSelector] = useState(false);
  const [activeFlowContextName, setActiveFlowContextName] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const activeScenarioConfig = activeScenarioConfigProp;
  const setActiveScenarioConfig = setActiveScenarioConfigProp;
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [contextTarget, setContextTarget] = useState<ContextTarget>({ type: "canvas" });
  const historyLoaded = useRef(false);

  const voiceUrl = "https://www.waka.services/agents/voice/test/1a840cd6-80ab-49d5-ae53-2622b6b94bbb?primary_color=%234a148c&accent_color=%23ffc107&transcription=false&auto_mic=true";
  const avatarUrl = "https://avatar.waka.africa/agent";

  // ── External Hooks ──
  const { sendToAI, isThinking, setFlowContext, resetHistory, setHistoryFromMessages } = useWakaPlayerAI();
  const { saveMessage, updateDataMode, startNewConversation, messageCount, conversationId } = usePlayerConversation();
  const { saveFlow, loadFlowFull, updateFlowConversation } = useSavedPlayerFlows();

  // ── Flow Lifecycle ──
  const flowIdParam = searchParams.get("flow");
  const [activeFlowId, setActiveFlowId] = useState<string | null>(flowIdParam);
  const [activeFlowTitle, setActiveFlowTitle] = useState<string | null>(null);
  const loadedFlowIdRef = useRef<string | null>(null);
  const [flowLoadKey, setFlowLoadKey] = useState(0);

  /** Core flow loader — called both from URL changes and direct selection */
  const loadFlowById = useCallback(async (flowId: string) => {
    // Immediately reset state to prevent stale data bleed
    setMessages([...WELCOME_MESSAGES]);
    setActiveScenarioConfig({});
    setActiveFlowTitle(null);
    resetHistory();
    setHistoryFromMessages([]);
    setFlowContext(null);
    loadedFlowIdRef.current = flowId;
    setActiveFlowId(flowId);

    const full = await loadFlowFull(flowId);
    // Guard: if user switched again while loading
    if (loadedFlowIdRef.current !== flowId) return;

    if (!full) {
      toast.error("No se pudo cargar el flujo seleccionado");
      return;
    }

    const savedConversation = full.conversationSnapshot;
    if (savedConversation && savedConversation.length > 0) {
      const rehydrated = savedConversation.map((msg: any) => ({
        ...msg,
        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
      }));
      setMessages(rehydrated);
      setHistoryFromMessages(rehydrated);
    } else {
      setHistoryFromMessages([]);
    }

    setDataMode(full.dataMode);
    setActiveFlowTitle(full.name);
    const cfg = full.scenarioConfig || {};
    setActiveScenarioConfig(cfg);

    // Feed stored context into AI engine
    if (cfg.systemPrompt) setFlowContext(cfg.systemPrompt);
    else if (cfg.sourceData?.yaml) setFlowContext(cfg.sourceData.yaml);
    else if (cfg.sourceData?.instructions) setFlowContext(cfg.sourceData.instructions);
    else setFlowContext(null);

    await startNewConversation();
    toast.success(`Flujo "${full.name}" cargado`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadFlowFull, resetHistory, setFlowContext, setHistoryFromMessages, startNewConversation, setDataMode]);

  // Keep a stable ref to loadFlowById to avoid stale closures in callbacks
  const loadFlowByIdRef = useRef(loadFlowById);
  loadFlowByIdRef.current = loadFlowById;

  // Load flow from URL param on mount or URL change
  useEffect(() => {
    if (!flowIdParam) {
      loadedFlowIdRef.current = null;
      setActiveFlowId(null);
      setActiveFlowTitle(null);
      return;
    }
    if (loadedFlowIdRef.current === flowIdParam) return;
    loadFlowByIdRef.current(flowIdParam);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowIdParam, flowLoadKey]);

  useEffect(() => {
    if (historyLoaded.current || !conversationId || flowIdParam) return;
    historyLoaded.current = true;
    resetHistory();
    WELCOME_MESSAGES.forEach((msg) => saveMessage(msg));
  }, [conversationId, saveMessage, flowIdParam, resetHistory]);

  // ── Message Helpers ──
  const addUserMessage = useCallback((text: string, imageUrl?: string) => {
    const userMsg: PlayerMessage = { id: `user-${Date.now()}`, text, direction: "inbound", timestamp: new Date(), imageUrl };
    setMessages((prev) => [...prev, userMsg]);
    saveMessage(userMsg);
    return userMsg;
  }, [saveMessage]);

  const addBotMessage = useCallback((partial: Partial<PlayerMessage>, extra?: { aiModel?: string; aiLatencyMs?: number }) => {
    const hasInteraction = partial.quickReplies?.length || partial.menu?.length || partial.catalog ||
      partial.inlineForm || partial.payment || partial.rating || partial.servicePlans ||
      partial.creditSimulation || partial.clientStatus || partial.momoAccount ||
      partial.paymentConfirmation || partial.creditContract || partial.deviceLockConsent;
    let quickReplies = partial.quickReplies;
    if (!quickReplies?.length && !hasInteraction && partial.text) {
      const extracted = extractOptionsFromText(partial.text);
      if (extracted.length >= 2) quickReplies = extracted;
    }
    // No fallback: trust the AI to provide contextual replies or none at all
    const botMsg: PlayerMessage = { id: `bot-${Date.now()}`, text: "", direction: "outbound", timestamp: new Date(), ...partial, quickReplies };
    setMessages((prev) => [...prev, botMsg]);
    saveMessage(botMsg, extra);

    // Auto-extract client info from sovereign blocks to update header dynamically
    if (partial.clientStatus) {
      const cs = partial.clientStatus as Record<string, any>;
      const name = cs.client_name || cs.clientName;
      if (name) {
        setActiveScenarioConfig((prev: Record<string, any>) => ({
          ...prev,
          clientName: name,
          balance: cs.total_balance || cs.balance || prev.balance || "",
        }));
      }
    }
    if (partial.momoAccount) {
      const ma = partial.momoAccount as Record<string, any>;
      const name = ma.holder_name || ma.holderName || ma.client_name;
      if (name) {
        setActiveScenarioConfig((prev: Record<string, any>) => ({
          ...prev,
          clientName: name,
          balance: ma.balance || prev.balance || "",
        }));
      }
    }
  }, [saveMessage, setActiveScenarioConfig]);

  // ── Extracted Hooks ──
  const actions = usePlayerActions({
    addUserMessage, addBotMessage, sendToAI, dataMode,
    setShowVoiceCall, setShowAvatar, saveMessage, updateDataMode, setDataMode, setMessages,
  });

  const authoring = usePlayerAuthoring({
    messages, setMessages, saveMessage, sendToAI, dataMode,
    activeFlowId, tenantId, activeScenarioConfig, updateFlowConversation,
  });

  // ── Auto-expand blocks ──
  useBlockExpansion(messages, experienceMode);

  // ── Keyboard Shortcuts ──
  useKeyboardShortcuts({
    onUndo: authoring.handleUndo,
    onRedo: authoring.handleRedo,
    onEscape: useCallback(() => {
      if (contextMenuPos) setContextMenuPos(null);
      else if (showSaveDialog) setShowSaveDialog(false);
      else if (showFlowsPanel) setShowFlowsPanel(false);
      else if (showVoiceCall) setShowVoiceCall(false);
      else if (showAvatar) setShowAvatar(false);
    }, [contextMenuPos, showSaveDialog, showFlowsPanel, showVoiceCall, showAvatar]),
    onInsert: useCallback(() => {
      // Open context menu centered for insert
      setContextTarget({ type: "canvas" });
      setContextMenuPos({ x: window.innerWidth / 2 - 140, y: window.innerHeight / 2 - 200 });
    }, []),
  });

  // ── Handlers ──
  const handleInsertBlock = useCallback((type: any) => {
    setContextMenuPos(null);
    const result = authoring.handleInsertBlock(type);
    if (result === "voiceCall") setShowVoiceCall(true);
    else if (result === "avatar") setShowAvatar(true);
  }, [authoring]);

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
    // Load flow immediately BEFORE closing panel to avoid Sheet unmount interference
    loadedFlowIdRef.current = null;
    window.history.replaceState(null, "", `/player/live?flow=${flowId}`);
    loadFlowByIdRef.current(flowId);
    // Close panel after load is initiated
    setShowFlowsPanel(false);
  }, []);

  const handleWorkbenchResult = useCallback((result: { conversation: any[]; config: Record<string, any> }) => {
    if (result.conversation.length > 0) setMessages(result.conversation);
    if (result.config) {
      setActiveScenarioConfig(result.config);
      if (result.config.systemPrompt) setFlowContext(result.config.systemPrompt);
    }
  }, [setFlowContext]);

  const handleFlowContextSelect = useCallback((flowContext: string, flowName: string) => {
    if (flowContext && flowName) { setFlowContext(flowContext); setActiveFlowContextName(flowName); }
    else { setFlowContext(null); setActiveFlowContextName(null); }
  }, [setFlowContext]);

  // ── Expanded block for side panel renderer ──
  const expandedBlockForRenderer = findLastExpandableBlock(messages);

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const status = isThinking ? "typing" : "online";

  return (
    <>
      <ExperienceCanvas
        mode={experienceMode}
        avatarEnabled={false}
        header={
          <div className="flex flex-col">
            <div className="flex items-center gap-3 border-b border-border/60 px-6 py-2.5 bg-card/50 backdrop-blur-sm">
              <Button variant="ghost" size="sm" onClick={() => navigate("/player")} className="h-8 w-8 p-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-foreground tracking-tight">WAKA XP</h1>
                <Badge variant="outline" className="text-[9px] border-primary/20 text-primary gap-1 h-5">
                  <Bot className="h-2.5 w-2.5" /> RUNTIME
                </Badge>
              </div>
              <div className="h-4 w-px bg-border/50" />
              <Badge className={cn("text-[8px] border-0 font-bold h-5", MODE_COLORS[dataMode])}>
                {MODE_LABELS[dataMode]}
              </Badge>
              {activeFlowTitle && (
                <Badge variant="outline" className="text-[9px] border-accent/20 text-accent h-5">
                  {activeFlowTitle.length > 24 ? `${activeFlowTitle.slice(0, 24)}…` : activeFlowTitle}
                </Badge>
              )}
              {isThinking && (
                <Badge variant="outline" className="text-[9px] border-accent/30 text-accent animate-pulse gap-1 h-5">
                  <Zap className="h-2.5 w-2.5" /> IA…
                </Badge>
              )}
              {activeFlowId && authoring.versionCount > 0 && (
                <Badge variant="outline" className="text-[9px] border-primary/20 text-primary/70 gap-1 h-5">
                  v{authoring.versionCount}
                </Badge>
              )}
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNewConversation}
                  className="h-7 text-[10px] text-muted-foreground hover:text-foreground gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  Recommencer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowShareDialog(true)}
                  className="h-7 text-[10px] gap-1 border-accent/20 text-accent/70 hover:text-accent hover:border-accent/40"
                >
                  <Share2 className="h-3 w-3" />
                  Compartir
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/spatial")}
                  className="h-7 text-[10px] gap-1 border-primary/20 text-primary/70 hover:text-primary hover:border-primary/40"
                >
                  <Globe className="h-3 w-3" />
                  Spatial
                </Button>
                <ExperienceModeSwitcher mode={experienceMode} onChange={setExperienceMode} />
              </div>
            </div>
            <WelcomeBackStrip
              onResume={(journeyId) => {
                toast.info(`Reprise du parcours: ${journeyId}`);
              }}
            />
          </div>
        }
        phone={
          <div className={cn(
            "flex flex-1 items-center justify-center overflow-hidden",
            experienceMode === "unbound" ? "items-start pt-6 bg-muted/10" : "bg-muted/30",
          )}>
            <div className={cn(
              "relative transition-all duration-500 ease-out",
              experienceMode === "unbound"
                ? "w-[250px] h-[540px] scale-[0.92] opacity-90"
                : "w-[375px] h-[812px] max-h-[calc(100vh-80px)]",
              experienceMode === "expanded" && "phone-anchor-glow",
            )}>
              <div className={cn(
                "absolute inset-0 rounded-[3rem] bg-gradient-to-b from-[hsl(220,8%,80%)] to-[hsl(220,8%,68%)]",
                experienceMode === "unbound"
                  ? "shadow-[0_0_30px_rgba(0,0,0,0.08)]"
                  : "shadow-[0_0_50px_rgba(0,0,0,0.12)]"
              )} />
              <div className="absolute inset-[3px] rounded-[2.8rem] bg-black overflow-hidden flex flex-col">
                <div
                  className="relative flex items-center justify-between px-7 pt-3 pb-1 z-20"
                  style={{
                    background: dataMode === "zero-rated"
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
                    statusBar={{
                      label: activeScenarioConfig?.clientName
                        ? `👤 ${activeScenarioConfig.clientName}`
                        : "Bienvenue sur WAKA XP",
                      value: activeScenarioConfig?.clientName
                        ? (activeScenarioConfig.balance || "")
                        : "Votre assistant intelligent",
                      accent: !!activeScenarioConfig?.clientName,
                    }}
                    dataMode={dataMode}
                    onDataModeChange={actions.handleDataModeChange}
                    onSend={actions.handleSend}
                    onSendImage={actions.handleSendImage}
                    onSendLocation={actions.handleSendLocation}
                    onSendDocument={actions.handleSendDocument}
                    onQuickReply={actions.handleQuickReply}
                    onVoiceToggle={actions.handleVoiceToggle}
                    onMenuSelect={actions.handleMenuSelect}
                    onCardAction={actions.handleCardAction}
                    onAddToCart={actions.handleAddToCart}
                    onFormSubmit={actions.handleFormSubmit}
                    onPayment={actions.handlePayment}
                    onRate={actions.handleRate}
                    onModuleClick={actions.handleModuleClick}
                    onSlideAction={actions.handleSlideAction}
                    onCreditAction={actions.handleCreditAction}
                    onMomoAction={actions.handleMomoAction}
                    onSelectPlan={actions.handleSelectPlan}
                    onPaymentConfirmAction={actions.handlePaymentConfirmAction}
                    onCreditContractAction={actions.handleCreditContractAction}
                    onDeviceLockConsent={actions.handleDeviceLockConsent}
                    onVoiceCall={() => setShowVoiceCall(true)}
                    onAvatarCall={() => setShowAvatar(true)}
                    onContextMenu={(cx, cy) => { setContextMenuPos({ x: cx, y: cy }); setContextTarget({ type: "canvas" }); }}
                    onMessageEdit={authoring.handleMessageEdit}
                  />
                </div>
                <VoiceCallOverlay open={showVoiceCall} onClose={actions.handleVoiceCallEnd} agentName="WAKA VOICE" voiceUrl={voiceUrl} />
                <AvatarOverlay open={showAvatar} onClose={actions.handleAvatarClose} avatarUrl={avatarUrl} agentName="WAKA Avatar" />
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
          expandedBlockForRenderer ? (
            <ExpandedBlockRenderer
              blockType={expandedBlockForRenderer.blockType}
              data={expandedBlockForRenderer.data}
              onAction={actions.handleCardAction}
              onAddToCart={actions.handleAddToCart}
              onFormSubmit={actions.handleFormSubmit}
              onPayment={actions.handlePayment}
              onRate={actions.handleRate}
              onModuleClick={actions.handleModuleClick}
              onSlideAction={actions.handleSlideAction}
              onSelectPlan={actions.handleSelectPlan}
              onDeviceLockConsent={actions.handleDeviceLockConsent}
            />
          ) : undefined
        }
        toolbar={
          <PlayerBuilderToolbar
            versionCount={authoring.versionCount}
            versions={authoring.versionEntries}
            onInsertBlock={handleInsertBlock}
            onUndo={authoring.handleUndo}
            onRedo={authoring.handleRedo}
            onRestart={handleNewConversation}
            onSave={() => setShowSaveDialog(true)}
            canUndo={authoring.canUndo}
            canRedo={authoring.canRedo}
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

      <SaveFlowDialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)} onSave={handleSaveFlow} isSaving={isSaving} />
      <QuickShareDialog open={showShareDialog} onClose={() => setShowShareDialog(false)} flowTitle={activeFlowTitle} currentUrl={window.location.href} />

      <Sheet open={showFlowsPanel} onOpenChange={setShowFlowsPanel}>
        <SheetContent side="right" className="w-[400px] p-0">
          <SavedFlowsPanel onLoad={handleLoadFlow} onClose={() => setShowFlowsPanel(false)} activeFlowId={activeFlowId} />
        </SheetContent>
      </Sheet>

      <FlowContextSelector
        open={showFlowContextSelector}
        onClose={() => setShowFlowContextSelector(false)}
        onSelect={handleFlowContextSelect}
        activeFlowName={activeFlowContextName}
      />

      {contextMenuPos && (
        <UniversalContextMenu
          x={contextMenuPos.x}
          y={contextMenuPos.y}
          target={contextTarget}
          onClose={() => setContextMenuPos(null)}
          onInsertBlock={handleInsertBlock}
          onEditMessage={(id) => {
            const msg = messages.find((m) => m.id === id);
            if (msg?.text) authoring.handleMessageEdit(id, msg.text);
          }}
          onDuplicateMessage={authoring.handleDuplicateMessage}
          onDeleteMessage={authoring.handleDeleteMessage}
          onMoveUp={(id) => authoring.handleMoveMessage(id, "up")}
          onMoveDown={(id) => authoring.handleMoveMessage(id, "down")}
          onAIImprove={authoring.handleAIImprove}
          onAISimplify={authoring.handleAISimplify}
          onAIMobileFriendly={authoring.handleAIMobileFriendly}
          onAITranslate={authoring.handleAITranslate}
          onUndo={authoring.handleUndo}
          onRedo={authoring.handleRedo}
        />
      )}
    </>
  );
}
