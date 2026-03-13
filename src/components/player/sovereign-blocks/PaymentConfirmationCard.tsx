/**
 * Sovereign Block: Payment Confirmation / Receipt
 * Shows payment result with amount, remaining balance, and next steps.
 */
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDataMode } from "../dataMode";

export interface PaymentConfirmationData {
  title: string;
  status: "success" | "partial" | "failed";
  amount_paid: string;
  remaining_balance?: string;
  credit_voice_id?: string;
  payment_date?: string;
  next_payment_date?: string;
  next_payment_amount?: string;
  message?: string;
  icon?: string;
  actions?: string[];
}

interface Props {
  data: PaymentConfirmationData;
  onAction?: (action: string) => void;
}

export function PaymentConfirmationCard({ data, onAction }: Props) {
  const mode = useDataMode();

  const isSuccess = data.status === "success" || data.status === "partial";
  const StatusIcon = isSuccess ? CheckCircle2 : AlertCircle;
  const statusColor = isSuccess ? "hsl(160,55%,40%)" : "hsl(0,65%,50%)";
  const statusBg = isSuccess
    ? "linear-gradient(135deg, hsl(160,60%,40%), hsl(170,55%,38%))"
    : "linear-gradient(135deg, hsl(0,60%,50%), hsl(15,55%,48%))";

  if (mode === "zero-rated") {
    return (
      <div className="rounded-lg border border-[hsl(160,30%,85%)] bg-white px-3 py-2 max-w-[90%]">
        <p className="text-[11px] font-bold text-[hsl(220,15%,20%)]">
          {isSuccess ? "✅" : "❌"} {data.title}
        </p>
        <div className="text-[10px] text-[hsl(220,10%,40%)] mt-1 space-y-0.5">
          <div className="flex justify-between"><span>Montant payé</span><span className="font-bold">{data.amount_paid}</span></div>
          {data.remaining_balance && <div className="flex justify-between"><span>Reste à payer</span><span className="font-bold">{data.remaining_balance}</span></div>}
          {data.credit_voice_id && <div className="flex justify-between"><span>Réf. crédit</span><span>{data.credit_voice_id}</span></div>}
        </div>
        {data.message && <p className="text-[10px] text-[hsl(160,40%,35%)] mt-1">{data.message}</p>}
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
      className="rounded-xl border border-[hsl(160,30%,85%)] bg-white overflow-hidden shadow-sm max-w-[90%]"
    >
      <div className="px-3 py-2.5 flex items-center gap-2" style={{ background: statusBg }}>
        <StatusIcon className="h-5 w-5 text-white" />
        <div>
          <p className="text-[12px] font-bold text-white">{data.title}</p>
          {data.payment_date && <p className="text-[9px] text-white/70">{data.payment_date}</p>}
        </div>
        <Receipt className="h-4 w-4 text-white/40 ml-auto" />
      </div>

      <div className="px-3 py-2.5 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[hsl(160,30%,96%)] rounded-lg px-2 py-1.5">
            <p className="text-[8px] text-[hsl(160,30%,45%)] uppercase tracking-wider">Payé</p>
            <p className="text-[14px] font-bold text-[hsl(160,60%,30%)]">{data.amount_paid}</p>
          </div>
          {data.remaining_balance && (
            <div className="bg-[hsl(220,15%,97%)] rounded-lg px-2 py-1.5">
              <p className="text-[8px] text-[hsl(220,10%,55%)] uppercase tracking-wider">Reste</p>
              <p className="text-[14px] font-bold text-[hsl(220,15%,25%)]">{data.remaining_balance}</p>
            </div>
          )}
        </div>

        {data.credit_voice_id && (
          <div className="flex items-center gap-1.5 px-1">
            <span className="text-[9px] text-[hsl(220,10%,55%)]">Réf:</span>
            <span className="text-[11px] font-mono font-bold text-[hsl(220,40%,50%)]">{data.credit_voice_id}</span>
          </div>
        )}

        {(data.next_payment_date || data.next_payment_amount) && (
          <div className="flex justify-between items-center pt-1.5 border-t border-[hsl(220,15%,92%)]">
            <span className="text-[10px] text-[hsl(220,10%,50%)]">Prochaine échéance</span>
            <div className="text-right">
              {data.next_payment_amount && <span className="text-[11px] font-bold text-[hsl(220,15%,25%)]">{data.next_payment_amount}</span>}
              {data.next_payment_date && <p className="text-[9px] text-[hsl(220,10%,55%)]">{data.next_payment_date}</p>}
            </div>
          </div>
        )}

        {data.message && (
          <p className="text-[10px] text-[hsl(160,40%,35%)] italic px-1">{data.message}</p>
        )}
      </div>

      {data.actions && data.actions.length > 0 && (
        <div className="divide-y divide-[hsl(160,20%,92%)] border-t border-[hsl(160,20%,90%)]">
          {data.actions.map((action, i) => (
            <button
              key={i}
              onClick={() => onAction?.(action)}
              className="w-full px-3 py-2.5 text-[12px] font-medium text-[hsl(160,60%,35%)] hover:bg-[hsl(160,30%,97%)] transition-colors text-center"
            >
              {action}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
