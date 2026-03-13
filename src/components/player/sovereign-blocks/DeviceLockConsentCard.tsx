/**
 * Sovereign Block: Device Lock Consent
 * BNPL-specific consent card — required before create_credit.
 */
import { motion } from "framer-motion";
import { Lock, ShieldCheck, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useDataMode } from "../dataMode";

export interface DeviceLockConsentData {
  title: string;
  device_name?: string;
  amount?: string;
  message?: string;
  icon?: string;
}

interface Props {
  data: DeviceLockConsentData;
  onConsent?: (accepted: boolean) => void;
}

export function DeviceLockConsentCard({ data, onConsent }: Props) {
  const mode = useDataMode();
  const [responded, setResponded] = useState<boolean | null>(null);

  const handleResponse = (accepted: boolean) => {
    setResponded(accepted);
    onConsent?.(accepted);
  };

  if (responded !== null) {
    const Wrapper = mode === "zero-rated" ? "div" : motion.div;
    return (
      <Wrapper
        {...(mode !== "zero-rated" ? { initial: { scale: 0.95 }, animate: { scale: 1 } } : {})}
        className={cn(
          "rounded-xl border px-3 py-3 max-w-[90%] flex items-center gap-2",
          responded
            ? "border-[hsl(160,50%,75%)] bg-[hsl(160,40%,96%)]"
            : "border-[hsl(0,40%,80%)] bg-[hsl(0,30%,97%)]"
        )}
      >
        {responded ? (
          <>
            <ShieldCheck className="h-5 w-5 text-[hsl(160,55%,40%)]" />
            <p className="text-[12px] font-medium text-[hsl(160,50%,25%)]">✓ Device lock accepté</p>
          </>
        ) : (
          <>
            <AlertTriangle className="h-5 w-5 text-[hsl(0,60%,50%)]" />
            <p className="text-[12px] font-medium text-[hsl(0,50%,35%)]">✗ Device lock refusé</p>
          </>
        )}
      </Wrapper>
    );
  }

  if (mode === "zero-rated") {
    return (
      <div className="rounded-lg border border-[hsl(35,50%,80%)] bg-white px-3 py-2 max-w-[90%]">
        <p className="text-[11px] font-bold text-[hsl(220,15%,20%)]">🔒 {data.title}</p>
        {data.device_name && <p className="text-[10px] text-[hsl(220,10%,50%)]">{data.device_name} — {data.amount}</p>}
        <p className="text-[10px] text-[hsl(35,60%,35%)] mt-0.5">
          {data.message || "Le téléphone sera verrouillé en cas de non-paiement."}
        </p>
        <div className="flex gap-2 mt-1.5">
          <button onClick={() => handleResponse(true)} className="flex-1 text-[11px] font-bold text-[hsl(160,60%,30%)] py-1 border border-[hsl(160,40%,75%)] rounded">
            ✓ J'accepte
          </button>
          <button onClick={() => handleResponse(false)} className="flex-1 text-[11px] font-bold text-[hsl(0,50%,45%)] py-1 border border-[hsl(0,30%,80%)] rounded">
            ✗ Je refuse
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={mode === "libre" ? { opacity: 0, y: 12, scale: 0.95 } : { opacity: 0 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-[hsl(35,50%,80%)] bg-white overflow-hidden shadow-sm max-w-[90%]"
    >
      <div className="px-3 py-2.5 flex items-center gap-2" style={{ background: "linear-gradient(135deg, hsl(35,70%,50%), hsl(25,65%,48%))" }}>
        <Lock className="h-5 w-5 text-white" />
        <div>
          <p className="text-[12px] font-bold text-white">{data.title}</p>
          {data.device_name && <p className="text-[9px] text-white/70">{data.device_name}</p>}
        </div>
      </div>

      <div className="px-3 py-2.5 space-y-2">
        <div className="flex items-start gap-2 bg-[hsl(35,50%,97%)] rounded-lg px-2.5 py-2 border border-[hsl(35,40%,90%)]">
          <AlertTriangle className="h-4 w-4 text-[hsl(35,70%,45%)] flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-[hsl(35,50%,30%)] leading-relaxed">
            {data.message || "Pour sécuriser votre crédit, le téléphone sera verrouillé en cas de non-paiement. Cette mesure protège votre contrat."}
          </p>
        </div>

        {data.amount && (
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] text-[hsl(220,10%,50%)]">Montant du crédit</span>
            <span className="text-[12px] font-bold text-[hsl(220,15%,25%)]">{data.amount}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 border-t border-[hsl(35,30%,88%)]">
        <button
          onClick={() => handleResponse(true)}
          className="px-3 py-3 text-[12px] font-bold text-[hsl(160,55%,35%)] hover:bg-[hsl(160,30%,97%)] transition-colors text-center border-r border-[hsl(35,30%,88%)]"
        >
          ✓ J'accepte
        </button>
        <button
          onClick={() => handleResponse(false)}
          className="px-3 py-3 text-[12px] font-bold text-[hsl(0,50%,45%)] hover:bg-[hsl(0,20%,97%)] transition-colors text-center"
        >
          ✗ Je refuse
        </button>
      </div>
    </motion.div>
  );
}
