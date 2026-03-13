/**
 * Sovereign Block: Certificate / Achievement Card
 * WhatsApp: NOT POSSIBLE.
 * WAKA: Rich certificate for training completion, badges, gamification.
 */

import { motion } from "framer-motion";
import { Award, Download } from "lucide-react";
import { useDataMode } from "../dataMode";

export interface CertificateData {
  title: string;
  recipient: string;
  date: string;
  module: string;
  badge?: string;
}

interface CertificateCardProps {
  certificate: CertificateData;
  onDownload?: () => void;
}

export function CertificateCard({ certificate, onDownload }: CertificateCardProps) {
  const mode = useDataMode();

  if (mode === "zero-rated") {
    return (
      <div className="rounded-lg border border-[hsl(45,60%,75%)] bg-white px-3 py-2 max-w-[90%]">
        <p className="text-[11px] font-bold text-[hsl(45,60%,35%)]">
          🏅 CERTIFICAT : {certificate.title}
        </p>
        <p className="text-[10px] text-[hsl(220,10%,50%)]">
          {certificate.recipient} · {certificate.date}
        </p>
        <button onClick={onDownload} className="text-[10px] text-[hsl(160,60%,30%)] underline mt-0.5">
          ↓ Télécharger
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={mode === "libre" ? { opacity: 0, scale: 0.9, rotateX: 15 } : { opacity: 0 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-xl overflow-hidden shadow-md max-w-[90%] border-2 border-[hsl(45,70%,65%)]"
    >
      {/* Ornate header */}
      <div
        className="px-4 py-4 text-center relative"
        style={{
          background: "linear-gradient(135deg, hsl(45,65%,55%) 0%, hsl(35,70%,50%) 50%, hsl(45,65%,55%) 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)" }}
        />
        <div className="relative">
          <motion.div
            initial={mode === "libre" ? { rotate: -20, scale: 0 } : {}}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="inline-block"
          >
            <Award className="h-8 w-8 text-white mx-auto mb-1" />
          </motion.div>
          <p className="text-[9px] font-semibold text-white/70 uppercase tracking-[2px]">Certificat</p>
          <p className="text-[14px] font-bold text-white mt-0.5">{certificate.title}</p>
        </div>
      </div>

      <div className="bg-white px-4 py-3 text-center">
        <p className="text-[10px] text-[hsl(220,10%,55%)]">Décerné à</p>
        <p className="text-[14px] font-bold text-[hsl(220,15%,15%)] mt-0.5">{certificate.recipient}</p>
        <p className="text-[10px] text-[hsl(220,10%,55%)] mt-1.5">Module : {certificate.module}</p>
        <p className="text-[10px] text-[hsl(220,10%,60%)]">{certificate.date}</p>
        {certificate.badge && (
          <motion.p
            className="text-3xl mt-2"
            initial={mode === "libre" ? { scale: 0, rotate: -30 } : {}}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 400 }}
          >
            {certificate.badge}
          </motion.p>
        )}
      </div>

      <button
        onClick={onDownload}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-[hsl(45,65%,55%)] text-white text-[11px] font-semibold hover:bg-[hsl(45,65%,50%)] transition-colors"
      >
        <Download className="h-3 w-3" />
        Télécharger le certificat
      </button>
    </motion.div>
  );
}
