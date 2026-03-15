/**
 * ConfirmationSurface — Success confirmation moment
 * Renders real paymentConfirmation data or generic success.
 */

import { motion } from "framer-motion";
import { CheckCircle, Sparkles, Shield, Clock } from "lucide-react";
import type { SpatialSurfacePayload } from "../types/spatial";

export function ConfirmationSurface({ payload }: { payload?: SpatialSurfacePayload }) {
  const data = payload?.blockData as any;
  const isPaymentConfirmation = payload?.blockType === "paymentConfirmation" && data;

  return (
    <div className="flex flex-col items-center justify-center py-6">
      {/* Success burst */}
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 250, damping: 18 }}
        className="relative mb-6"
      >
        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
          data?.status === "failed" 
            ? "bg-[hsl(0,70%,50%)]/20" 
            : "bg-[hsl(160,84%,39%)]/20"
        }`}>
          <CheckCircle className={`w-10 h-10 ${
            data?.status === "failed" ? "text-[hsl(0,70%,50%)]" : "text-[hsl(160,84%,45%)]"
          }`} />
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute -top-2 -right-2"
        >
          <Sparkles className="w-5 h-5 text-[hsl(35,95%,55%)]" />
        </motion.div>
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-bold text-[hsl(210,20%,92%)] mb-2"
      >
        {payload?.title || "Opération réussie"}
      </motion.h3>

      {(payload?.subtitle || data?.message) && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-sm text-[hsl(210,10%,50%)] text-center max-w-[280px] mb-4"
        >
          {payload?.subtitle || data?.message}
        </motion.p>
      )}

      {/* Payment confirmation details */}
      {isPaymentConfirmation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full rounded-xl bg-[hsl(228,14%,11%)] border border-[hsl(228,14%,16%)] p-4 space-y-2.5"
        >
          {data.amount_paid && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-[hsl(210,10%,50%)]">Montant payé</span>
              <span className="text-base font-bold text-[hsl(160,84%,50%)]">{data.amount_paid}</span>
            </div>
          )}
          {data.remaining_balance && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-[hsl(210,10%,50%)]">Solde restant</span>
              <span className="text-[hsl(210,20%,85%)]">{data.remaining_balance}</span>
            </div>
          )}
          {data.credit_voice_id && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-[hsl(210,10%,50%)]">Réf. crédit</span>
              <span className="text-[hsl(210,20%,85%)] font-mono text-xs">{data.credit_voice_id}</span>
            </div>
          )}
          {data.payment_date && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-[hsl(210,10%,50%)]">Date</span>
              <span className="text-[hsl(210,20%,85%)]">{data.payment_date}</span>
            </div>
          )}
          {data.next_payment_date && (
            <>
              <div className="border-t border-dashed border-[hsl(228,14%,18%)]" />
              <div className="flex justify-between items-center text-sm">
                <span className="text-[hsl(210,10%,50%)]">Prochain paiement</span>
                <span className="text-[hsl(35,90%,55%)]">{data.next_payment_date}</span>
              </div>
              {data.next_payment_amount && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[hsl(210,10%,50%)]">Montant dû</span>
                  <span className="text-[hsl(35,90%,55%)] font-medium">{data.next_payment_amount}</span>
                </div>
              )}
            </>
          )}
          <div className="border-t border-dashed border-[hsl(228,14%,18%)]" />
          <div className="flex items-center justify-center gap-2 pt-1">
            <Shield className="w-3.5 h-3.5 text-[hsl(160,60%,50%)]" />
            <span className="text-[10px] text-[hsl(160,60%,50%)] font-medium">Vérifié</span>
          </div>
        </motion.div>
      )}

      {!isPaymentConfirmation && (
        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-[hsl(210,10%,45%)]">
          <Clock className="w-3 h-3" />
          {new Date().toLocaleString("fr", { dateStyle: "medium", timeStyle: "short" })}
        </div>
      )}
    </div>
  );
}
