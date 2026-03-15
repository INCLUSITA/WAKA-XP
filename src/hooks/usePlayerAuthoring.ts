/**
 * usePlayerAuthoring — Undo/redo, insert blocks, edit/duplicate/delete, auto-save.
 * Extracted from WakaPlayerDemo for modularity.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import type { PlayerMessage, DataMode } from "@/components/player/WakaSovereignPlayer";
import type { InsertableBlockType } from "@/components/player/PlayerContextMenu";
import { toast } from "sonner";

interface VersionEntry {
  id: string;
  label: string;
  timestamp: string;
  messageCount: number;
}

interface UsePlayerAuthoringParams {
  messages: PlayerMessage[];
  setMessages: React.Dispatch<React.SetStateAction<PlayerMessage[]>>;
  saveMessage: (msg: PlayerMessage, extra?: any) => void;
  sendToAI: (text: string, mode: DataMode) => Promise<Partial<PlayerMessage> | null>;
  dataMode: DataMode;
  activeFlowId: string | null;
  tenantId: string | null;
  activeScenarioConfig: Record<string, any>;
  updateFlowConversation: (flowId: string, messages: PlayerMessage[], mode: DataMode, config: Record<string, any>) => Promise<void>;
}

export function usePlayerAuthoring({
  messages, setMessages, saveMessage, sendToAI, dataMode,
  activeFlowId, tenantId, activeScenarioConfig, updateFlowConversation,
}: UsePlayerAuthoringParams) {
  const [versionCount, setVersionCount] = useState(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [versionEntries, setVersionEntries] = useState<VersionEntry[]>([]);
  const undoStack = useRef<PlayerMessage[][]>([]);
  const redoStack = useRef<PlayerMessage[][]>([]);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, []);

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
  }, [messages, setMessages, triggerAutoSave]);

  const handleRedo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    undoStack.current.push([...messages]);
    const next = redoStack.current.pop()!;
    setMessages(next);
    setCanUndo(true);
    setCanRedo(redoStack.current.length > 0);
    triggerAutoSave();
  }, [messages, setMessages, triggerAutoSave]);

  const addVersionEntry = useCallback((label: string) => {
    setVersionEntries((prev) => [
      { id: `ve-${Date.now()}`, label, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), messageCount: messages.length },
      ...prev,
    ]);
  }, [messages.length]);

  const handleMessageEdit = useCallback((msgId: string, newText: string) => {
    pushUndo();
    setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, text: newText } : m)));
    triggerAutoSave();
    addVersionEntry(`Editado: "${newText.substring(0, 30)}…"`);
    toast.success("Mensaje editado");
  }, [pushUndo, setMessages, triggerAutoSave, addVersionEntry]);

  const handleDuplicateMessage = useCallback((msgId: string) => {
    pushUndo();
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === msgId);
      if (idx === -1) return prev;
      const clone = { ...prev[idx], id: `dup-${Date.now()}`, timestamp: new Date() };
      const next = [...prev];
      next.splice(idx + 1, 0, clone);
      return next;
    });
    triggerAutoSave();
    toast.success("Mensaje duplicado");
  }, [pushUndo, setMessages, triggerAutoSave]);

  const handleDeleteMessage = useCallback((msgId: string) => {
    pushUndo();
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
    triggerAutoSave();
    toast.success("Mensaje eliminado");
  }, [pushUndo, setMessages, triggerAutoSave]);

  const handleMoveMessage = useCallback((msgId: string, dir: "up" | "down") => {
    pushUndo();
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === msgId);
      if (idx === -1) return prev;
      const swapIdx = dir === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next;
    });
    triggerAutoSave();
  }, [pushUndo, setMessages, triggerAutoSave]);

  const handleAIImprove = useCallback(async (msgId: string) => {
    const msg = messages.find((m) => m.id === msgId);
    if (!msg?.text) return;
    toast.info("Mejorando con IA…");
    const response = await sendToAI(
      `Améliore ce message pour qu'il soit plus clair, professionnel et engageant. Garde le même sens. Message original: "${msg.text}"`,
      dataMode
    );
    if (response?.text) {
      pushUndo();
      setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, text: response.text! } : m));
      triggerAutoSave();
      addVersionEntry(`IA: "${response.text!.substring(0, 30)}…"`);
      toast.success("Mensaje mejorado con IA");
    }
  }, [messages, sendToAI, dataMode, pushUndo, setMessages, triggerAutoSave, addVersionEntry]);

  const handleAISimplify = useCallback(async (msgId: string) => {
    const msg = messages.find((m) => m.id === msgId);
    if (!msg?.text) return;
    toast.info("Simplificando…");
    const response = await sendToAI(
      `Simplifie ce message pour qu'il soit compréhensible par un utilisateur avec un faible niveau de lecture. Utilise des mots courts et des phrases simples. Message: "${msg.text}"`,
      dataMode
    );
    if (response?.text) {
      pushUndo();
      setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, text: response.text! } : m));
      triggerAutoSave();
      addVersionEntry(`Simplificado: "${response.text!.substring(0, 30)}…"`);
      toast.success("Mensaje simplificado");
    }
  }, [messages, sendToAI, dataMode, pushUndo, setMessages, triggerAutoSave, addVersionEntry]);

  const handleAIMobileFriendly = useCallback(async (msgId: string) => {
    const msg = messages.find((m) => m.id === msgId);
    if (!msg?.text) return;
    toast.info("Adaptando para mobile…");
    const response = await sendToAI(
      `Adapte ce message pour un écran mobile : plus court, plus direct, sans fioritures, idéal pour une connexion lente. Message: "${msg.text}"`,
      dataMode
    );
    if (response?.text) {
      pushUndo();
      setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, text: response.text! } : m));
      triggerAutoSave();
      addVersionEntry(`Mobile: "${response.text!.substring(0, 30)}…"`);
      toast.success("Adaptado para mobile");
    }
  }, [messages, sendToAI, dataMode, pushUndo, setMessages, triggerAutoSave, addVersionEntry]);

  const handleAITranslate = useCallback(async (msgId: string) => {
    const msg = messages.find((m) => m.id === msgId);
    if (!msg?.text) return;
    toast.info("Traduciendo…");
    const response = await sendToAI(
      `Traduis ce message en français simple et naturel (si c'est déjà en français, traduis en anglais). Message: "${msg.text}"`,
      dataMode
    );
    if (response?.text) {
      pushUndo();
      setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, text: response.text! } : m));
      triggerAutoSave();
      addVersionEntry(`Traducido: "${response.text!.substring(0, 30)}…"`);
      toast.success("Mensaje traducido");
    }
  }, [messages, sendToAI, dataMode, pushUndo, setMessages, triggerAutoSave, addVersionEntry]);

  /** Insert a sovereign block into the conversation */
  const handleInsertBlock = useCallback((type: InsertableBlockType): "voiceCall" | "avatar" | null => {
    if (type === "voiceCall") return "voiceCall";
    if (type === "avatar") return "avatar";

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
        blockMsg.payment = { title: "Paiement", total: "15.000 FCFA", currency: "XOF", items: [{ label: "Service", amount: "15.000 FCFA" }], methods: ["mobile_money", "card"] };
        break;
      case "rating":
        blockMsg.rating = { title: "Évaluez notre service", type: "stars" };
        break;
      case "certificate":
        blockMsg.certificate = { title: "Certificat de Formation", recipient: "Nom du participant", module: "Formation WAKA", date: new Date().toISOString().split("T")[0], badge: "🏆" };
        break;
      case "training":
        blockMsg.training = {
          title: "Formation en cours", overallProgress: 35,
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
          title: "Forfaits disponibles", category: "general",
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
    addVersionEntry(`Bloque "${type}" insertado`);
    toast.success(`Bloc "${type}" inséré`);
    return null;
  }, [pushUndo, setMessages, saveMessage, triggerAutoSave, addVersionEntry]);

  return {
    handleUndo,
    handleRedo,
    handleMessageEdit,
    handleDuplicateMessage,
    handleDeleteMessage,
    handleMoveMessage,
    handleAIImprove,
    handleAISimplify,
    handleAIMobileFriendly,
    handleAITranslate,
    handleInsertBlock,
    triggerAutoSave,
    versionCount,
    versionEntries,
    canUndo,
    canRedo,
  };
}
