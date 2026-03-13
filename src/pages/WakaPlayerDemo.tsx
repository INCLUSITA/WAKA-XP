/**
 * Waka Sovereign Player — Demo page
 * Full showcase of ALL sovereign capabilities beyond WhatsApp Business
 */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wifi, Signal, BatteryFull } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { WakaSovereignPlayer, type PlayerMessage, type DataMode } from "@/components/player/WakaSovereignPlayer";
import type { CatalogProduct } from "@/components/player/sovereign-blocks";

const INITIAL_MESSAGES: PlayerMessage[] = [
  {
    id: "sys-1",
    text: "⚡ WAKA NEXUS · Canal soberano activé",
    direction: "outbound",
    timestamp: new Date(Date.now() - 300_000),
    isSystemEvent: true,
  },
  {
    id: "1",
    text: "🇧🇫 Bienvenue sur WAKA !\n\nVotre canal intelligent, gratuit et sans limites.\nTout ce que WhatsApp ne peut pas faire — nous le faisons.",
    direction: "outbound",
    timestamp: new Date(Date.now() - 280_000),
    source: "WAKA NEXUS",
    reaction: "👋",
  },
  // Rich Card — WhatsApp has templates, WAKA has freedom
  {
    id: "card-1",
    text: "",
    direction: "outbound",
    timestamp: new Date(Date.now() - 260_000),
    richCard: {
      title: "Offre de Bienvenue",
      description: "0% frais · +300 FCFA bonus · Sans limites",
      icon: "🎁",
      bgGradient: "linear-gradient(135deg, hsl(160,65%,35%), hsl(200,60%,40%))",
      actions: ["Activer maintenant", "En savoir plus"],
    },
  },
  // Product Catalog — WhatsApp: max 30 items. WAKA: unlimited carousel
  {
    id: "catalog-1",
    text: "Découvrez nos forfaits :",
    direction: "outbound",
    timestamp: new Date(Date.now() - 240_000),
    source: "WAKA Commerce",
    catalog: {
      title: "Forfaits Internet Moov",
      products: [
        { id: "p1", name: "Forfait Jour", price: "200 FCFA", emoji: "📱", rating: 4, badge: "POPULAIRE", description: "1 Go · 24h" },
        { id: "p2", name: "Forfait Semaine", price: "1.000 FCFA", emoji: "🚀", rating: 5, description: "5 Go · 7 jours" },
        { id: "p3", name: "Forfait Mois", price: "3.500 FCFA", emoji: "💎", rating: 5, badge: "-20%", description: "20 Go · 30 jours" },
        { id: "p4", name: "Nuit Illimitée", price: "100 FCFA", emoji: "🌙", rating: 4, description: "Illimité · 22h-06h" },
      ],
    },
  },
  {
    id: "user-1",
    text: "Je veux le Forfait Semaine !",
    direction: "inbound",
    timestamp: new Date(Date.now() - 220_000),
    reaction: "👍",
  },
  // Inline Form — WhatsApp: IMPOSSIBLE. WAKA: full forms in chat
  {
    id: "form-1",
    text: "Parfait ! Complétez vos informations :",
    direction: "outbound",
    timestamp: new Date(Date.now() - 200_000),
    source: "WAKA Forms",
    inlineForm: {
      title: "Activation Forfait Semaine",
      icon: "📝",
      submitLabel: "Activer le forfait",
      fields: [
        { id: "phone", label: "Numéro Moov", type: "phone", placeholder: "+226 XX XX XX XX", required: true },
        { id: "plan", label: "Durée", type: "select", options: ["7 jours", "14 jours", "30 jours"], required: true },
        { id: "email", label: "E-mail (optionnel)", type: "email", placeholder: "votre@email.com" },
      ],
    },
  },
  // Payment — WhatsApp: limited pay button. WAKA: full checkout
  {
    id: "payment-1",
    text: "",
    direction: "outbound",
    timestamp: new Date(Date.now() - 180_000),
    payment: {
      title: "Récapitulatif commande",
      icon: "🧾",
      items: [
        { label: "Forfait Semaine 5 Go", amount: "1.000" },
        { label: "Bonus fidélité", amount: "-100" },
        { label: "Taxes", amount: "90" },
      ],
      total: "990",
      currency: "FCFA",
      methods: ["mobile_money", "card"],
    },
  },
  // Location Card — WhatsApp: static pin. WAKA: rich card
  {
    id: "location-1",
    text: "Point de vente le plus proche :",
    direction: "outbound",
    timestamp: new Date(Date.now() - 160_000),
    source: "WAKA Maps",
    location: {
      name: "Agence Moov Ouaga 2000",
      address: "Av. de la Résistance du 17 Mai, Ouagadougou",
      hours: "8h–18h",
      phone: "+226 25 50 00 00",
      emoji: "🏪",
      distance: "1,2 km",
    },
  },
  // Training Module — WhatsApp: NOT POSSIBLE. WAKA: capacity building
  {
    id: "training-1",
    text: "Votre parcours de formation :",
    direction: "outbound",
    timestamp: new Date(Date.now() - 140_000),
    source: "WAKA Academy",
    training: {
      title: "Formation Agent Moov Money",
      overallProgress: 45,
      modules: [
        { id: "m1", name: "Introduction au Mobile Money", emoji: "📖", status: "completed" },
        { id: "m2", name: "Opérations de base", emoji: "💵", status: "completed" },
        { id: "m3", name: "Gestion des réclamations", emoji: "🎯", status: "current", progress: 60 },
        { id: "m4", name: "Sécurité et conformité", emoji: "🔒", status: "locked" },
        { id: "m5", name: "Certification finale", emoji: "🏅", status: "locked" },
      ],
    },
  },
  // Rating — WhatsApp: NOT POSSIBLE inline. WAKA: stars, NPS, emoji
  {
    id: "rating-1",
    text: "Comment évaluez-vous votre expérience ?",
    direction: "outbound",
    timestamp: new Date(Date.now() - 120_000),
    rating: { title: "Évaluation du service", type: "stars" },
  },
  // Interactive Menu
  {
    id: "menu-1",
    text: "Que souhaitez-vous faire ensuite ?",
    direction: "outbound",
    timestamp: new Date(Date.now() - 100_000),
    source: "AXIOM Brain",
    menu: [
      { label: "Envoyer argent", icon: "💸", description: "Transfert instantané" },
      { label: "Payer facture", icon: "🧾", description: "Eau, électricité, TV" },
      { label: "Consulter solde", icon: "💰", description: "Solde et historique" },
      { label: "Support client", icon: "🆘", description: "Aide en direct" },
    ],
    menuTitle: "Services Moov Money",
    quickReplies: ["📊 Tableau de bord", "🏅 Mon certificat", "❓ Aide"],
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

      if (label.includes("certificat")) {
        addBotReply("Voici votre certificat :", {
          certificate: {
            title: "Agent Moov Money",
            recipient: "Amadou Ouédraogo",
            date: "13 mars 2026",
            module: "Formation complète",
            badge: "🏆",
          },
        });
      } else {
        addBotReply(`Vous avez choisi : ${label}`, {
          richCard: {
            title: "Résultat",
            description: "Traitement en cours…",
            icon: "⚡",
            bgGradient: "linear-gradient(135deg, hsl(35,80%,50%), hsl(25,85%,45%))",
            actions: ["Confirmer", "Annuler"],
          },
        });
      }
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

  const handleAddToCart = useCallback(
    (product: CatalogProduct) => {
      addBotReply(`${product.emoji || "📦"} "${product.name}" ajouté au panier — ${product.price}`, {
        reaction: "🛒",
        quickReplies: ["🛒 Voir panier", "🛍 Continuer"],
      });
    },
    [addBotReply]
  );

  const handleFormSubmit = useCallback(
    (values: Record<string, string>) => {
      addBotReply("Formulaire reçu ! Activation en cours… ⏳", {
        reaction: "✅",
        payment: {
          title: "Confirmation d'activation",
          icon: "💳",
          items: [
            { label: "Forfait sélectionné", amount: "1.000" },
            { label: "Frais d'activation", amount: "0" },
          ],
          total: "1.000",
          currency: "FCFA",
          methods: ["mobile_money"],
        },
      });
    },
    [addBotReply]
  );

  const handlePayment = useCallback(
    (method: string) => {
      addBotReply(`Paiement via ${method === "mobile_money" ? "Moov Money" : "carte"} confirmé ! 🎉`, {
        reaction: "🎉",
        rating: { title: "Comment s'est passé le paiement ?", type: "emoji" },
      });
    },
    [addBotReply]
  );

  const handleRate = useCallback(
    (value: number | string) => {
      addBotReply(`Merci pour votre note ${typeof value === "string" ? value : `${value}/5 ⭐`} ! Votre avis compte.`, {
        reaction: "💚",
      });
    },
    [addBotReply]
  );

  const handleModuleClick = useCallback(
    (moduleId: string) => {
      addBotReply(`Module "${moduleId}" ouvert. Bonne formation ! 📚`, {
        progress: 60,
        progressLabel: "En cours de formation",
      });
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
                onAddToCart={handleAddToCart}
                onFormSubmit={handleFormSubmit}
                onPayment={handlePayment}
                onRate={handleRate}
                onModuleClick={handleModuleClick}
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
