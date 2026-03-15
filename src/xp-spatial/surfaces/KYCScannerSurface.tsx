/**
 * KYCScannerSurface — Identity verification scanner
 * Strong technical identity with scan energy/halo.
 */

import { motion } from "framer-motion";
import { ScanLine, Shield, Camera, CheckCircle } from "lucide-react";

export function KYCScannerSurface({ payload }: { payload?: any }) {
  return (
    <div className="flex flex-col items-center py-4">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-[hsl(200,80%,60%)]" />
        <h3 className="text-lg font-semibold text-[hsl(210,20%,92%)]">
          Vérification d'identité
        </h3>
      </div>

      {/* Scanner viewport */}
      <div className="relative w-[280px] h-[200px] rounded-2xl overflow-hidden
                     bg-[hsl(228,14%,6%)] border-2 border-[hsl(200,80%,50%)]/30">
        {/* Corner markers */}
        <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-[hsl(200,80%,60%)] rounded-tl-lg" />
        <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-[hsl(200,80%,60%)] rounded-tr-lg" />
        <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-[hsl(200,80%,60%)] rounded-bl-lg" />
        <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-[hsl(200,80%,60%)] rounded-br-lg" />

        {/* Scan line */}
        <motion.div
          className="absolute left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-[hsl(200,80%,60%)] to-transparent"
          animate={{ top: ["15%", "85%", "15%"] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        />

        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Camera className="w-12 h-12 text-[hsl(200,80%,60%)]/40" />
          </motion.div>
        </div>

        {/* Halo glow */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none"
             style={{ boxShadow: "inset 0 0 40px rgba(59, 130, 246, 0.1)" }} />
      </div>

      <p className="text-xs text-[hsl(210,10%,50%)] mt-5 text-center max-w-[240px]">
        Placez votre document d'identité dans le cadre pour la vérification automatique
      </p>

      {/* Status badges */}
      <div className="flex gap-3 mt-4">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[hsl(200,80%,50%)]/10 text-[10px] text-[hsl(200,80%,60%)]">
          <ScanLine className="w-3 h-3" /> Scan actif
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[hsl(160,84%,39%)]/10 text-[10px] text-[hsl(160,84%,50%)]">
          <CheckCircle className="w-3 h-3" /> Chiffré
        </div>
      </div>
    </div>
  );
}
