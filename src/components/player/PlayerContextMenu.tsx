/**
 * PlayerContextMenu — Right-click menu for inserting sovereign blocks
 * into the player conversation flow.
 */

import { useState, useEffect, useRef } from "react";
import {
  MessageSquare, ShoppingCart, FileText, MapPin, CreditCard, Star,
  Award, GraduationCap, Image as ImageIcon, Calculator, UserCheck,
  Wallet, LayoutList, Receipt, FileSignature, Lock, List, Plus,
  Phone, User, Sparkles,
} from "lucide-react";

export type InsertableBlockType =
  | "text" | "richCard" | "menu" | "quickReplies"
  | "catalog" | "inlineForm" | "location" | "payment"
  | "rating" | "certificate" | "training" | "mediaCarousel"
  | "creditSimulation" | "clientStatus" | "momoAccount"
  | "servicePlans" | "paymentConfirmation" | "creditContract"
  | "deviceLockConsent" | "voiceCall" | "avatar";

interface BlockOption {
  type: InsertableBlockType;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

const BLOCK_SECTIONS: { label: string; emoji: string; items: BlockOption[] }[] = [
  {
    label: "Messages",
    emoji: "💬",
    items: [
      { type: "text", label: "Message texte", icon: MessageSquare, color: "hsl(270,45%,50%)", description: "Bulle de texte simple" },
      { type: "richCard", label: "Carte enrichie", icon: Sparkles, color: "hsl(280,50%,55%)", description: "Carte avec gradient et actions" },
      { type: "menu", label: "Menu interactif", icon: List, color: "hsl(200,60%,45%)", description: "Liste d'options cliquables" },
      { type: "quickReplies", label: "Réponses rapides", icon: LayoutList, color: "hsl(160,50%,40%)", description: "Boutons de réponse rapide" },
    ],
  },
  {
    label: "Commerce",
    emoji: "🛒",
    items: [
      { type: "catalog", label: "Catalogue produits", icon: ShoppingCart, color: "hsl(25,80%,50%)", description: "Grille de produits avec panier" },
      { type: "payment", label: "Carte de paiement", icon: CreditCard, color: "hsl(150,60%,40%)", description: "MoMo / carte bancaire" },
      { type: "paymentConfirmation", label: "Confirmation paiement", icon: Receipt, color: "hsl(120,50%,40%)", description: "Reçu de transaction" },
      { type: "servicePlans", label: "Plans / Forfaits", icon: LayoutList, color: "hsl(210,60%,50%)", description: "Sélection de forfaits" },
    ],
  },
  {
    label: "Finance",
    emoji: "💰",
    items: [
      { type: "creditSimulation", label: "Simulation crédit", icon: Calculator, color: "hsl(35,75%,50%)", description: "Calculateur de crédit" },
      { type: "creditContract", label: "Contrat de crédit", icon: FileSignature, color: "hsl(15,70%,45%)", description: "Signature de contrat" },
      { type: "momoAccount", label: "Compte MoMo", icon: Wallet, color: "hsl(45,80%,45%)", description: "Solde et opérations MoMo" },
      { type: "clientStatus", label: "Statut client", icon: UserCheck, color: "hsl(190,55%,45%)", description: "Fiche client avec KYC" },
    ],
  },
  {
    label: "Formulaires & Données",
    emoji: "📋",
    items: [
      { type: "inlineForm", label: "Formulaire inline", icon: FileText, color: "hsl(220,55%,50%)", description: "Champs de saisie intégrés" },
      { type: "location", label: "Carte de position", icon: MapPin, color: "hsl(0,65%,50%)", description: "GPS et localisation" },
      { type: "rating", label: "Évaluation", icon: Star, color: "hsl(50,85%,50%)", description: "Étoiles, emoji ou NPS" },
      { type: "deviceLockConsent", label: "Consentement Device Lock", icon: Lock, color: "hsl(0,50%,45%)", description: "Acceptation verrouillage" },
    ],
  },
  {
    label: "Média & Formation",
    emoji: "🎓",
    items: [
      { type: "mediaCarousel", label: "Carrousel média", icon: ImageIcon, color: "hsl(300,45%,50%)", description: "Galerie d'images/vidéos" },
      { type: "certificate", label: "Certificat", icon: Award, color: "hsl(40,70%,50%)", description: "Attestation de formation" },
      { type: "training", label: "Progression formation", icon: GraduationCap, color: "hsl(170,50%,40%)", description: "Modules et progression" },
    ],
  },
  {
    label: "Canaux",
    emoji: "📡",
    items: [
      { type: "voiceCall", label: "WAKA VOICE", icon: Phone, color: "hsl(160,84%,39%)", description: "Appel vocal IA" },
      { type: "avatar", label: "WAKA Avatar", icon: User, color: "hsl(270,50%,50%)", description: "Agent visuel avatar" },
    ],
  },
];

interface PlayerContextMenuProps {
  x: number;
  y: number;
  onInsert: (type: InsertableBlockType) => void;
  onClose: () => void;
}

export function PlayerContextMenu({ x, y, onInsert, onClose }: PlayerContextMenuProps) {
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const timer = setTimeout(() => window.addEventListener("mousedown", handleClick), 50);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousedown", handleClick);
    };
  }, [onClose]);

  const filteredSections = BLOCK_SECTIONS.map((section) => ({
    ...section,
    items: search
      ? section.items.filter(
          (item) =>
            item.label.toLowerCase().includes(search.toLowerCase()) ||
            item.description.toLowerCase().includes(search.toLowerCase())
        )
      : section.items,
  })).filter((s) => s.items.length > 0);

  // Clamp to viewport
  const menuW = 260;
  const menuH = 440;
  const left = Math.min(x, window.innerWidth - menuW - 8);
  const top = Math.min(y, window.innerHeight - menuH - 8);

  return (
    <div
      ref={ref}
      style={{ position: "fixed", left, top, zIndex: 200 }}
      className="w-[260px] rounded-xl border border-[hsl(270,20%,85%)] bg-white shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-[hsl(270,15%,92%)] bg-[hsl(270,30%,97%)]">
        <p className="text-[10px] font-bold text-[hsl(270,45%,45%)] uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <Plus className="h-3 w-3" />
          Insérer un bloc
        </p>
        <input
          ref={inputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Chercher un bloc…"
          className="w-full rounded-lg bg-white border border-[hsl(270,15%,88%)] px-2.5 py-1.5 text-[11px] text-[hsl(220,15%,15%)] placeholder-[hsl(220,10%,60%)] outline-none focus:border-[hsl(270,45%,55%)] focus:ring-1 focus:ring-[hsl(270,45%,55%)]/20 transition"
        />
      </div>

      {/* Block list */}
      <div className="max-h-[360px] overflow-y-auto py-1">
        {filteredSections.map((section) => (
          <div key={section.label}>
            <p className="text-[9px] font-bold text-[hsl(220,10%,55%)] uppercase tracking-wider px-3 pt-2 pb-0.5">
              {section.emoji} {section.label}
            </p>
            {section.items.map(({ type, label, icon: Icon, color, description }) => (
              <button
                key={type}
                onClick={() => {
                  onInsert(type);
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[hsl(270,20%,97%)] transition-colors group"
              >
                <span
                  className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: color }}
                >
                  <Icon className="h-3.5 w-3.5 text-white" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-[hsl(220,15%,20%)]">{label}</p>
                  <p className="text-[9px] text-[hsl(220,10%,55%)] truncate">{description}</p>
                </div>
                <Plus className="h-3 w-3 text-[hsl(220,10%,75%)] group-hover:text-[hsl(270,45%,50%)] transition-colors" />
              </button>
            ))}
          </div>
        ))}
        {filteredSections.length === 0 && (
          <p className="text-center text-[11px] text-[hsl(220,10%,55%)] py-6">Aucun bloc trouvé</p>
        )}
      </div>
    </div>
  );
}
