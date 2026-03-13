/**
 * Sovereign Block: Credit Contract Confirmation
 * Shows credit creation result with voice_id, status, and next steps.
 */
import { motion } from "framer-motion";
import { FileText, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDataMode } from "../dataMode";

export interface CreditContractData {
  title: string;
  credit_voice_id: string;
  credit_type: string;
  amount: string;
  term?: string;
  frequency?: string;
  monthly_payment?: string;
  status: "active" | "pending" | "approved" | "rejected";
  status_explanation?: string;
  device_lock?: boolean;
  product_name?: string;
  next_steps?: string[];
  icon?: string;
  actions?: string[];
}

interface Props {
  data: CreditContractData;
  onAction?: (action: string) => void;
}

const statusConfig = {
  active: { icon: CheckCircle2, color: "hsl(160,55%,40%)", bg: "hsl(160,40%,96%)", label: "Actif" },
  approved: { icon: CheckCircle2, color: "hsl(160,55%,40%)", bg: "hsl(160,40%,96%)", label: "Approuvé" },
  pending: { icon: Clock, color: "hsl(35,70%,50%)", bg: "hsl(35,50%,96%)", label: "En attente" },
  rejected: { icon: AlertTriangle, color: "hsl(0,65%,50%)", bg: "hsl(0,40%,96%)", label: "Refusé" },
};

export function CreditContractCard({ data, onAction }: Props) {
  const mode = useDataMode();
  const st = statusConfig[data.status] || statusConfig.pending;

  if (mode === "zero-rated") {
    return (
      <div className="rounded-lg border border-[hsl(160,30%,85%)] bg-white px-3 py-2 max-w-[90%]">
        <p className="text-[11px] font-bold text-[hsl(220,15%,20%)]">
          {data.icon || "📄"} {data.title}
        </p>
        <div className="text-[10px] text-[hsl(220,10%,40%)] mt-1 space-y-0.5">
          <div className="flex justify-between"><span>Réf</span><span className="font-bold">{data.credit_voice_id}</span></div>
          <div className="flex justify-between"><span>Montant</span><span className="font-bold">{data.amount}</span></div>
          {data.monthly_payment && <div className="flex justify-between"><span>Mensualité</span><span>{data.monthly_payment}</span></div>}
          <div className="flex justify-between"><span>Statut</span><span className="font-bold">{st.label}</span></div>
          {data.device_lock && <p className="text-[9px] text-[hsl(35,70%,45%)]">🔒 Device lock activé</p>}
        </div>
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
      className="rounded-xl border border-[hsl(220,20%,88%)] bg-white overflow-hidden shadow-sm max-w-[90%]"
    >
      <div className="px-3 py-2.5 flex items-center gap-2" style={{ background: "linear-gradient(135deg, hsl(220,55%,45%), hsl(240,50%,48%))" }}>
        <span className="text-lg">{data.icon || "📄"}</span>
        <div className="flex-1">
          <p className="text-[12px] font-bold text-white">{data.title}</p>
          {data.product_name && <p className="text-[9px] text-white/70">{data.product_name}</p>}
        </div>
        <FileText className="h-4 w-4 text-white/40" />
      </div>

      <div className="px-3 py-2.5 space-y-2">
        {/* Voice ID badge */}
        <div className="flex items-center justify-between bg-[hsl(220,15%,97%)] rounded-lg px-2.5 py-2">
          <div>
            <p className="text-[8px] text-[hsl(220,10%,55%)] uppercase tracking-wider">Référence Crédit</p>
            <p className="text-[16px] font-bold font-mono text-[hsl(220,50%,45%)] tracking-wider">{data.credit_voice_id}</p>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: st.bg }}>
            <st.icon className="h-3 w-3" style={{ color: st.color }} />
            <span className="text-[9px] font-bold" style={{ color: st.color }}>{st.label}</span>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-2">
          <div className="px-2 py-1">
            <p className="text-[8px] text-[hsl(220,10%,55%)]">Montant</p>
            <p className="text-[13px] font-bold text-[hsl(220,15%,20%)]">{data.amount}</p>
          </div>
          {data.monthly_payment && (
            <div className="px-2 py-1">
              <p className="text-[8px] text-[hsl(220,10%,55%)]">Mensualité</p>
              <p className="text-[13px] font-bold text-[hsl(160,60%,30%)]">{data.monthly_payment}</p>
            </div>
          )}
          {data.term && (
            <div className="px-2 py-1">
              <p className="text-[8px] text-[hsl(220,10%,55%)]">Durée</p>
              <p className="text-[11px] font-medium text-[hsl(220,15%,25%)]">{data.term}</p>
            </div>
          )}
          {data.frequency && (
            <div className="px-2 py-1">
              <p className="text-[8px] text-[hsl(220,10%,55%)]">Fréquence</p>
              <p className="text-[11px] font-medium text-[hsl(220,15%,25%)]">{data.frequency}</p>
            </div>
          )}
        </div>

        {/* Device lock warning */}
        {data.device_lock && (
          <div className="flex items-center gap-1.5 bg-[hsl(35,60%,96%)] rounded-lg px-2.5 py-1.5 border border-[hsl(35,50%,88%)]">
            <span className="text-sm">🔒</span>
            <p className="text-[10px] text-[hsl(35,60%,35%)]">Device lock activé — le téléphone sera verrouillé en cas de non-paiement</p>
          </div>
        )}

        {data.status_explanation && (
          <p className="text-[10px] text-[hsl(220,10%,45%)] italic px-1">{data.status_explanation}</p>
        )}

        {/* Next steps */}
        {data.next_steps && data.next_steps.length > 0 && (
          <div className="border-t border-[hsl(220,15%,92%)] pt-1.5">
            <p className="text-[8px] text-[hsl(220,10%,55%)] uppercase tracking-wider mb-1 px-1">Prochaines étapes</p>
            {data.next_steps.map((step, i) => (
              <p key={i} className="text-[10px] text-[hsl(220,15%,30%)] px-1">• {step}</p>
            ))}
          </div>
        )}
      </div>

      {data.actions && data.actions.length > 0 && (
        <div className="divide-y divide-[hsl(220,15%,93%)] border-t border-[hsl(220,15%,92%)]">
          {data.actions.map((action, i) => (
            <button
              key={i}
              onClick={() => onAction?.(action)}
              className="w-full px-3 py-2.5 text-[12px] font-medium text-[hsl(220,55%,45%)] hover:bg-[hsl(220,20%,97%)] transition-colors text-center"
            >
              {action}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
