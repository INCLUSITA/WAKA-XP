/**
 * Sovereign Block: MoMo (Mobile Money) Account Card
 * Shows account opening confirmation, status, or action prompt.
 */
import { motion } from "framer-motion";
import { Smartphone, CheckCircle2, Clock, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDataMode } from "../dataMode";

export interface MoMoAccountData {
  title: string;
  account_number?: string;
  account_type?: "standard" | "merchant";
  status?: string;
  message?: string;
  icon?: string;
  actions?: string[];
}

interface Props {
  data: MoMoAccountData;
  onAction?: (action: string) => void;
}

export function MoMoAccountCard({ data, onAction }: Props) {
  const mode = useDataMode();

  const statusIcon = data.status === "account_created" || data.status === "active"
    ? <CheckCircle2 className="h-4 w-4 text-[hsl(160,55%,40%)]" />
    : data.status === "pending_verification"
    ? <Clock className="h-4 w-4 text-[hsl(35,70%,50%)]" />
    : <Smartphone className="h-4 w-4 text-[hsl(220,40%,55%)]" />;

  const typeLabel = data.account_type === "merchant" ? "Commerçant" : "Particulier";
  const typeEmoji = data.account_type === "merchant" ? "🏪" : "👤";

  if (mode === "zero-rated") {
    return (
      <div className="rounded-lg border border-[hsl(160,30%,85%)] bg-white px-3 py-2 max-w-[90%]">
        <p className="text-[11px] font-bold text-[hsl(220,15%,20%)]">
          {data.icon || "📱"} {data.title}
        </p>
        {data.account_number && <p className="text-[10px] text-[hsl(220,10%,50%)]">N°: {data.account_number}</p>}
        <p className="text-[10px] text-[hsl(220,10%,50%)]">{typeEmoji} {typeLabel}</p>
        {data.message && <p className="text-[10px] text-[hsl(160,40%,35%)] mt-0.5">{data.message}</p>}
        {data.actions?.map((a, i) => (
          <button key={i} onClick={() => onAction?.(a)} className="block w-full text-left text-[11px] text-[hsl(160,60%,30%)] font-medium mt-1 underline">
            → {a}
          </button>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={mode === "libre" ? { opacity: 0, y: 12, scale: 0.95 } : { opacity: 0 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-[hsl(45,70%,80%)] bg-white overflow-hidden shadow-sm max-w-[90%]"
    >
      <div className="px-3 py-2.5 flex items-center gap-2" style={{ background: "linear-gradient(135deg, hsl(45,75%,50%), hsl(35,80%,48%))" }}>
        <span className="text-lg">{data.icon || "📱"}</span>
        <div className="flex-1">
          <p className="text-[12px] font-bold text-white">{data.title}</p>
          <p className="text-[9px] text-white/70">{typeEmoji} Compte {typeLabel}</p>
        </div>
        <Shield className="h-4 w-4 text-white/40" />
      </div>

      <div className="px-3 py-2.5 space-y-2">
        {data.account_number && (
          <div className="bg-[hsl(45,50%,96%)] rounded-lg px-2.5 py-2 flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-[hsl(45,70%,45%)]" />
            <div>
              <p className="text-[8px] text-[hsl(45,40%,45%)] uppercase tracking-wider">Numéro de compte</p>
              <p className="text-[14px] font-bold text-[hsl(45,60%,30%)] tracking-wide">{data.account_number}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 px-1">
          {statusIcon}
          {data.message && (
            <p className="text-[11px] text-[hsl(220,10%,40%)] leading-tight">{data.message}</p>
          )}
        </div>
      </div>

      {data.actions && data.actions.length > 0 && (
        <div className="divide-y divide-[hsl(45,30%,90%)] border-t border-[hsl(45,30%,88%)]">
          {data.actions.map((action, i) => (
            <button
              key={i}
              onClick={() => onAction?.(action)}
              className="w-full px-3 py-2.5 text-[12px] font-medium text-[hsl(45,70%,35%)] hover:bg-[hsl(45,40%,97%)] transition-colors text-center"
            >
              {action}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
