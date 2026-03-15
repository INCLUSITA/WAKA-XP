/**
 * usePlayerActions — Extracted interaction handlers from WakaPlayerDemo.
 * Handles all AI-driven user interactions: send, quick reply, payments, etc.
 */

import { useCallback } from "react";
import type { PlayerMessage, DataMode } from "@/components/player/WakaSovereignPlayer";
import type { CatalogProduct, MediaSlide } from "@/components/player/sovereign-blocks";

interface UsePlayerActionsParams {
  addUserMessage: (text: string, imageUrl?: string) => PlayerMessage;
  addBotMessage: (partial: Partial<PlayerMessage>, extra?: { aiModel?: string; aiLatencyMs?: number }) => void;
  sendToAI: (text: string, mode: DataMode, image?: string) => Promise<Partial<PlayerMessage> | null>;
  dataMode: DataMode;
  setShowVoiceCall: (show: boolean) => void;
  setShowAvatar: (show: boolean) => void;
  saveMessage: (msg: PlayerMessage, extra?: any) => void;
  updateDataMode: (mode: DataMode) => void;
  setDataMode: (mode: DataMode) => void;
  setMessages: React.Dispatch<React.SetStateAction<PlayerMessage[]>>;
}

export function usePlayerActions({
  addUserMessage, addBotMessage, sendToAI, dataMode,
  setShowVoiceCall, setShowAvatar, saveMessage, updateDataMode, setDataMode, setMessages,
}: UsePlayerActionsParams) {

  /** Common pattern: user message → AI → bot response */
  const sendAndRespond = useCallback(async (
    userText: string,
    aiPrompt: string,
    userImageUrl?: string,
  ) => {
    addUserMessage(userText, userImageUrl);
    const t0 = Date.now();
    const response = await sendToAI(aiPrompt, dataMode, userImageUrl);
    const latency = Date.now() - t0;
    if (response) {
      addBotMessage(response, { aiModel: "gemini-3-flash", aiLatencyMs: latency });
    } else {
      addBotMessage({
        text: "Désolé, je n'ai pas pu traiter votre demande. Réessayez.",
        quickReplies: ["🔄 Réessayer", "🏠 Menu principal"],
      });
    }
  }, [addUserMessage, addBotMessage, sendToAI, dataMode]);

  const handleSend = useCallback(
    (text: string) => sendAndRespond(text, text),
    [sendAndRespond]
  );

  const handleSendImage = useCallback(
    (imageDataUrl: string, caption?: string) =>
      sendAndRespond(caption || "📸 Photo envoyée", caption || "", imageDataUrl),
    [sendAndRespond]
  );

  const handleQuickReply = useCallback(
    async (label: string) => {
      if (label.includes("Llamar") || label.includes("VOICE") || label.includes("📞")) {
        setShowVoiceCall(true);
        return;
      }
      if (label.includes("Avatar") || label.includes("🎭")) {
        setShowAvatar(true);
        return;
      }
      sendAndRespond(label, label);
    },
    [sendAndRespond, setShowVoiceCall, setShowAvatar]
  );

  const handleVoiceCallEnd = useCallback((summary?: string) => {
    setShowVoiceCall(false);
    if (summary) {
      addBotMessage({
        text: `${summary}\n\n¿En qué más puedo ayudarle?`,
        quickReplies: ["🏠 Menu principal", "📞 Llamar de nuevo", "💳 Mon solde"],
      });
    }
  }, [addBotMessage, setShowVoiceCall]);

  const handleAvatarClose = useCallback(() => {
    setShowAvatar(false);
    addBotMessage({
      text: "🎭 Sesión de avatar finalizada. ¿Cómo puedo continuar ayudándole?",
      quickReplies: ["🏠 Menu principal", "🎭 Volver al avatar", "📞 Llamar agente"],
    });
  }, [addBotMessage, setShowAvatar]);

  const handleMenuSelect = useCallback(
    (label: string) => sendAndRespond(label, `J'ai sélectionné : ${label}`),
    [sendAndRespond]
  );

  const handleCardAction = useCallback(
    (action: string) => sendAndRespond(action, `Action : ${action}`),
    [sendAndRespond]
  );

  const handleAddToCart = useCallback(
    (product: CatalogProduct) => {
      const text = `Ajouter au panier : ${product.name} (${product.price})`;
      sendAndRespond(text, text);
    },
    [sendAndRespond]
  );

  const handleFormSubmit = useCallback(
    (values: Record<string, string>) => {
      const summary = Object.entries(values).map(([k, v]) => `${k}: ${v}`).join(", ");
      sendAndRespond("Formulaire envoyé ✓", `Formulaire soumis : ${summary}`);
    },
    [sendAndRespond]
  );

  const handlePayment = useCallback(
    (method: string) => {
      const label = method === "mobile_money" ? "Moov Money" : "carte bancaire";
      sendAndRespond("Paiement confirmé ✓", `Paiement confirmé via ${label}`);
    },
    [sendAndRespond]
  );

  const handleRate = useCallback(
    (value: number | string) => sendAndRespond(`Note : ${value}`, `Note donnée : ${value}`),
    [sendAndRespond]
  );

  const handleModuleClick = useCallback(
    (moduleId: string) => sendAndRespond(`Module : ${moduleId}`, `Ouvrir le module de formation : ${moduleId}`),
    [sendAndRespond]
  );

  const handleSlideAction = useCallback(
    (slide: MediaSlide) => sendAndRespond(
      slide.caption || "Média sélectionné",
      `Action sur média : ${slide.caption || slide.id}`
    ),
    [sendAndRespond]
  );

  const handleCreditAction = useCallback(
    (action: string) => sendAndRespond(action, `Action crédit : ${action}`),
    [sendAndRespond]
  );

  const handleMomoAction = useCallback(
    (action: string) => sendAndRespond(action, `Action MoMo : ${action}`),
    [sendAndRespond]
  );

  const handleSelectPlan = useCallback(
    (sku: string, name: string) => sendAndRespond(
      `Plan sélectionné : ${name}`,
      `Je choisis le plan : ${name} (SKU: ${sku})`
    ),
    [sendAndRespond]
  );

  const handlePaymentConfirmAction = useCallback(
    (action: string) => sendAndRespond(action, `Action paiement : ${action}`),
    [sendAndRespond]
  );

  const handleCreditContractAction = useCallback(
    (action: string) => sendAndRespond(action, `Action contrat crédit : ${action}`),
    [sendAndRespond]
  );

  const handleDeviceLockConsent = useCallback(
    (accepted: boolean) => {
      const userText = accepted ? "✓ Device lock accepté" : "✗ Device lock refusé";
      const aiText = accepted
        ? "J'accepte le device lock. Veuillez créer mon crédit."
        : "Je refuse le device lock.";
      sendAndRespond(userText, aiText);
    },
    [sendAndRespond]
  );

  const handleSendLocation = useCallback(
    (lat: number, lng: number) => sendAndRespond(
      `📍 Position GPS : ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      `L'utilisateur partage sa position GPS : latitude=${lat}, longitude=${lng}. Utilise update_client_location si un client est identifié.`
    ),
    [sendAndRespond]
  );

  const handleSendDocument = useCallback(
    (file: File) => {
      const ext = file.name.split(".").pop()?.toUpperCase() || "FILE";
      const sizeKB = Math.round(file.size / 1024);
      sendAndRespond(
        `📎 Document envoyé : ${file.name} (${ext}, ${sizeKB} KB)`,
        `L'utilisateur a envoyé un document : ${file.name} (type: ${file.type}, taille: ${sizeKB} KB). Confirme la réception et propose les prochaines étapes.`
      );
    },
    [sendAndRespond]
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
    [addBotMessage, sendToAI, dataMode, saveMessage, setMessages]
  );

  const handleDataModeChange = useCallback((mode: DataMode) => {
    setDataMode(mode);
    updateDataMode(mode);
  }, [updateDataMode, setDataMode]);

  return {
    handleSend,
    handleSendImage,
    handleQuickReply,
    handleVoiceCallEnd,
    handleAvatarClose,
    handleMenuSelect,
    handleCardAction,
    handleAddToCart,
    handleFormSubmit,
    handlePayment,
    handleRate,
    handleModuleClick,
    handleSlideAction,
    handleCreditAction,
    handleMomoAction,
    handleSelectPlan,
    handlePaymentConfirmAction,
    handleCreditContractAction,
    handleDeviceLockConsent,
    handleSendLocation,
    handleSendDocument,
    handleVoiceToggle,
    handleDataModeChange,
  };
}
