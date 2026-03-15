/**
 * ReceiptSurface — Financial receipt / validated proof
 * Clean, trustworthy, verified style.
 */

import { motion } from "framer-motion";
import { Receipt, CheckCircle, Shield, Clock } from "lucide-react";

export function ReceiptSurface({ payload }: { payload?: any }) {
  return (
    <div className="flex flex-col items-center py-2">
      {/* Verified header */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
        className="w-16 h-16 rounded-2xl bg-[hsl(160,84%,39%)]/15 flex items-center justify-center mb-4"
      >
        <CheckCircle className="w-8 h-8 text-[hsl(160,84%,45%)]" />
      </motion.div>

      <h3 className="text-lg font-bold text-[hsl(210,20%,92%)] mb-1">Transaction confirmée</h3>
      <p className="text-xs text-[hsl(210,10%,50%)] mb-6">Reçu de paiement validé</p>

      {/* Receipt card */}
      <div className="w-full rounded-2xl bg-[hsl(228,14%,11%)] border border-[hsl(228,14%,16%)] p-5 space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-[hsl(210,10%,50%)]">Référence</span>
          <span className="text-[hsl(210,20%,85%)] font-mono text-xs">TXN-2026-0315-4782</span>
        </div>
        <div className="border-t border-dashed border-[hsl(228,14%,18%)]" />

        <div className="flex justify-between items-center text-sm">
          <span className="text-[hsl(210,10%,50%)]">Montant</span>
          <span className="text-xl font-bold text-[hsl(160,84%,50%)]">89 900 FCFA</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-[hsl(210,10%,50%)]">Méthode</span>
          <span className="text-[hsl(210,20%,85%)]">MoMo Wallet</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-[hsl(210,10%,50%)]">Bénéficiaire</span>
          <span className="text-[hsl(210,20%,85%)]">WAKA Telecom BF</span>
        </div>

        <div className="border-t border-dashed border-[hsl(228,14%,18%)]" />

        <div className="flex items-center justify-center gap-2 pt-1">
          <Shield className="w-3.5 h-3.5 text-[hsl(160,60%,50%)]" />
          <span className="text-[10px] text-[hsl(160,60%,50%)] font-medium">
            Vérifié · Signé numériquement
          </span>
        </div>
      </div>

      {/* Timestamp */}
      <div className="flex items-center gap-1.5 mt-4 text-[10px] text-[hsl(210,10%,45%)]">
        <Clock className="w-3 h-3" />
        {new Date().toLocaleString("fr", { dateStyle: "medium", timeStyle: "short" })}
      </div>
    </div>
  );
}
