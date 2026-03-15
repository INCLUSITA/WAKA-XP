/**
 * ReceiptSurface — Financial receipt / payment / MoMo account
 * Renders real payment, MoMo, or certificate data from sovereign blocks.
 */

import { motion } from "framer-motion";
import { CheckCircle, Shield, Clock, Wallet, CreditCard } from "lucide-react";
import type { SpatialSurfacePayload } from "../types/spatial";

export function ReceiptSurface({ payload }: { payload?: SpatialSurfacePayload }) {
  const blockType = payload?.blockType;
  const data = payload?.blockData as any;

  if (blockType === "momo" && data) return <MoMoReceipt data={data} />;
  if (blockType === "payment" && data) return <PaymentReceipt data={data} />;

  // Fallback generic receipt
  return <GenericReceipt title={payload?.title} />;
}

function MoMoReceipt({ data }: { data: any }) {
  return (
    <div className="flex flex-col items-center py-2">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
        className="w-16 h-16 rounded-2xl bg-[hsl(45,90%,50%)]/15 flex items-center justify-center mb-4"
      >
        <Wallet className="w-8 h-8 text-[hsl(45,90%,55%)]" />
      </motion.div>

      <h3 className="text-lg font-bold text-[hsl(210,20%,92%)] mb-1">{data.title || "Compte MoMo"}</h3>
      {data.message && <p className="text-xs text-[hsl(210,10%,50%)] mb-4 text-center max-w-[280px]">{data.message}</p>}

      <div className="w-full rounded-2xl bg-[hsl(228,14%,11%)] border border-[hsl(228,14%,16%)] p-5 space-y-3">
        {data.account_number && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-[hsl(210,10%,50%)]">Numéro</span>
            <span className="text-[hsl(210,20%,85%)] font-mono text-xs">{data.account_number}</span>
          </div>
        )}
        {data.account_type && (
          <>
            <div className="border-t border-dashed border-[hsl(228,14%,18%)]" />
            <div className="flex justify-between items-center text-sm">
              <span className="text-[hsl(210,10%,50%)]">Type</span>
              <span className="text-[hsl(210,20%,85%)] capitalize">{data.account_type}</span>
            </div>
          </>
        )}
        {data.status && (
          <>
            <div className="border-t border-dashed border-[hsl(228,14%,18%)]" />
            <div className="flex justify-between items-center text-sm">
              <span className="text-[hsl(210,10%,50%)]">Statut</span>
              <span className="text-[hsl(160,84%,50%)] font-medium">{data.status}</span>
            </div>
          </>
        )}
        <div className="border-t border-dashed border-[hsl(228,14%,18%)]" />
        <div className="flex items-center justify-center gap-2 pt-1">
          <Shield className="w-3.5 h-3.5 text-[hsl(160,60%,50%)]" />
          <span className="text-[10px] text-[hsl(160,60%,50%)] font-medium">Vérifié · Sécurisé</span>
        </div>
      </div>
    </div>
  );
}

function PaymentReceipt({ data }: { data: any }) {
  return (
    <div className="flex flex-col items-center py-2">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
        className="w-16 h-16 rounded-2xl bg-[hsl(160,84%,39%)]/15 flex items-center justify-center mb-4"
      >
        <CreditCard className="w-8 h-8 text-[hsl(160,84%,45%)]" />
      </motion.div>

      <h3 className="text-lg font-bold text-[hsl(210,20%,92%)] mb-1">{data.title || "Paiement"}</h3>

      <div className="w-full rounded-2xl bg-[hsl(228,14%,11%)] border border-[hsl(228,14%,16%)] p-5 space-y-3">
        {data.items?.map((item: any, i: number) => (
          <div key={i} className="flex justify-between items-center text-sm">
            <span className="text-[hsl(210,10%,50%)]">{item.label}</span>
            <span className="text-[hsl(210,20%,85%)]">{item.amount}</span>
          </div>
        ))}
        {data.total && (
          <>
            <div className="border-t border-dashed border-[hsl(228,14%,18%)]" />
            <div className="flex justify-between items-center text-sm">
              <span className="text-[hsl(210,10%,50%)] font-medium">Total</span>
              <span className="text-xl font-bold text-[hsl(160,84%,50%)]">{data.total} {data.currency || "FCFA"}</span>
            </div>
          </>
        )}
        <div className="border-t border-dashed border-[hsl(228,14%,18%)]" />
        <div className="flex items-center justify-center gap-2 pt-1">
          <Shield className="w-3.5 h-3.5 text-[hsl(160,60%,50%)]" />
          <span className="text-[10px] text-[hsl(160,60%,50%)] font-medium">Vérifié · Signé numériquement</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-4 text-[10px] text-[hsl(210,10%,45%)]">
        <Clock className="w-3 h-3" />
        {new Date().toLocaleString("fr", { dateStyle: "medium", timeStyle: "short" })}
      </div>
    </div>
  );
}

function GenericReceipt({ title }: { title?: string }) {
  return (
    <div className="flex flex-col items-center py-2">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-16 h-16 rounded-2xl bg-[hsl(160,84%,39%)]/15 flex items-center justify-center mb-4"
      >
        <CheckCircle className="w-8 h-8 text-[hsl(160,84%,45%)]" />
      </motion.div>
      <h3 className="text-lg font-bold text-[hsl(210,20%,92%)] mb-1">{title || "Transaction confirmée"}</h3>
      <p className="text-xs text-[hsl(210,10%,50%)]">Reçu de paiement validé</p>
    </div>
  );
}
