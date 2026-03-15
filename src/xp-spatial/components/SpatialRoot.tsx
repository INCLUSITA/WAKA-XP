/**
 * SpatialRoot — Master composition for WAKA XP Spatial
 * Orchestrates all layers: Void → Phone → FrontStage → HUD
 */

import { QuantumVoidScene } from "./QuantumVoidScene";
import { PhoneHub } from "./PhoneHub";
import { FrontStage } from "./FrontStage";
import { PeripheralHUD } from "./PeripheralHUD";
import { useSpatialExperience } from "../hooks/useSpatialExperience";
import { resolveSpatialDecision } from "../adapters/spatialPresentationAdapter";
import type { PlayerMessage } from "@/components/player/WakaSovereignPlayer";
import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useWakaPlayerAI } from "@/hooks/useWakaPlayerAI";
import { PlayerContextProvider } from "@/contexts/PlayerContextProvider";
import { PlayerMemoryProvider } from "@/contexts/PlayerMemoryProvider";
import { motion } from "framer-motion";
import { Monitor } from "lucide-react";

const WELCOME_MESSAGES: PlayerMessage[] = [
  {
    id: "sys-1",
    text: "⚡ WAKA NEXUS · Spatial Experience — Intelligence artificielle activée",
    direction: "outbound",
    timestamp: new Date(Date.now() - 10_000),
    isSystemEvent: true,
  },
  {
    id: "welcome-1",
    text: "🇧🇫 Bienvenue dans WAKA Spatial !\n\nExplorez nos services : téléphones, paiements, crédits — le tout dans une expérience immersive.",
    direction: "outbound",
    timestamp: new Date(Date.now() - 5_000),
    source: "WAKA NEXUS · IA",
    quickReplies: [
      "📱 Voir les téléphones",
      "💰 Ouvrir compte MoMo",
      "🔍 Vérification KYC",
      "💳 Simuler un crédit",
    ],
  },
];

export function SpatialRoot() {
  const [messages, setMessages] = useState<PlayerMessage[]>(WELCOME_MESSAGES);
  const [inputText, setInputText] = useState("");
  const spatial = useSpatialExperience();
  const { sendToAI, isThinking } = useWakaPlayerAI();
  const msgIdCounter = useRef(100);
  const navigate = useNavigate();

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText("");

    // User message
    const userMsg: PlayerMessage = {
      id: `user-${++msgIdCounter.current}`,
      text,
      direction: "inbound",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    // Set HUD to processing
    spatial.setHud({ visible: true, text: "Traitement en cours…", mode: "processing" });

    // AI response
    const aiResponse = await sendToAI(text, "libre");

    if (aiResponse) {
      const botMsg: PlayerMessage = {
        id: `bot-${++msgIdCounter.current}`,
        direction: "outbound",
        timestamp: new Date(),
        text: aiResponse.text || "",
        ...aiResponse,
      };
      setMessages(prev => [...prev, botMsg]);

      // Resolve spatial decision
      const decision = resolveSpatialDecision(botMsg);
      if (decision.surfaceType !== "none") {
        // Enrich surface payload from message data
        const payload: any = {};
        if (botMsg.catalog) {
          payload.title = botMsg.catalog.title;
          payload.items = botMsg.catalog.products;
        }
        if (botMsg.payment) payload.raw = botMsg.payment;
        if (botMsg.creditSimulation) payload.raw = botMsg.creditSimulation;

        spatial.applySpatialDecision({
          ...decision,
        });
      } else {
        spatial.setHud({ visible: false, text: "", mode: "idle" });
      }
    } else {
      spatial.setHud({ visible: false, text: "", mode: "idle" });
    }
  }, [inputText, sendToAI, spatial]);

  // Quick reply handler
  const handleQuickReply = useCallback((label: string) => {
    setInputText(label);
    // Trigger send on next tick
    setTimeout(() => {
      const syntheticMsg: PlayerMessage = {
        id: `user-${++msgIdCounter.current}`,
        text: label,
        direction: "inbound",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, syntheticMsg]);
      spatial.setHud({ visible: true, text: "Traitement en cours…", mode: "processing" });

      sendToAI(label, "libre").then(aiResponse => {
        if (aiResponse) {
          const botMsg: PlayerMessage = {
            id: `bot-${++msgIdCounter.current}`,
            direction: "outbound",
            timestamp: new Date(),
            text: aiResponse.text || "",
            ...aiResponse,
          };
          setMessages(prev => [...prev, botMsg]);
          const decision = resolveSpatialDecision(botMsg);
          if (decision.surfaceType !== "none") {
            spatial.applySpatialDecision(decision);
          } else {
            spatial.setHud({ visible: false, text: "", mode: "idle" });
          }
        }
      });
    }, 50);
    setInputText("");
  }, [sendToAI, spatial]);

  // Get last message quick replies
  const lastBotMsg = [...messages].reverse().find(m => m.direction === "outbound" && !m.isSystemEvent);

  return (
    <div className="fixed inset-0 overflow-hidden select-none" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
      {/* Layer 0: Quantum Void */}
      <QuantumVoidScene />

      {/* Spatial layout */}
      <div className="relative z-10 flex items-center justify-center h-full gap-8 px-8">
        {/* Layer 1: Conductor Hub (phone) */}
        <PhoneHub
          messages={messages}
          phonePose={spatial.phonePose}
          inputText={inputText}
          onInputChange={setInputText}
          onSend={handleSend}
          isThinking={isThinking}
        />

        {/* Layer 3: Eruption Stage (front-stage) */}
        <FrontStage
          activeSurface={spatial.activeSurface}
          onClose={spatial.closeSurface}
        />
      </div>

      {/* Quick replies floating below phone */}
      {lastBotMsg?.quickReplies && lastBotMsg.quickReplies.length > 0 && !spatial.activeSurface && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-wrap gap-2 justify-center max-w-[500px]"
        >
          {lastBotMsg.quickReplies.map((qr, i) => (
            <button
              key={i}
              onClick={() => handleQuickReply(qr)}
              className="px-4 py-2 text-xs font-medium rounded-full
                        bg-[hsl(228,14%,12%)]/80 backdrop-blur-xl
                        border border-[hsl(228,14%,20%)]
                        text-[hsl(210,20%,80%)]
                        hover:border-[hsl(160,60%,40%)]/50 hover:text-[hsl(160,84%,50%)]
                        transition-all duration-200"
            >
              {qr}
            </button>
          ))}
        </motion.div>
      )}

      {/* Layer HUD */}
      <PeripheralHUD hud={spatial.hud} />

      {/* WAKA Spatial branding */}
      <div className="fixed bottom-6 left-8 z-20 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[hsl(160,84%,45%)]" />
        <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-[hsl(210,10%,35%)]">
          WAKA XP Spatial
        </span>
      </div>
    </div>
  );
}
