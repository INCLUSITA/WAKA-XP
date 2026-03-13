/**
 * Sovereign Block: Client Status / Balance Summary
 * Shows quick overview of a client's account and active credits.
 */
import { motion } from "framer-motion";
import { User, Wallet, CreditCard, CalendarClock } from "lucide-react";
import { useDataMode } from "../dataMode";

export interface ClientStatusData {
  client_name: string;
  voice_id?: string;
  phone?: string;
  active_credits?: number;
  total_balance?: string;
  next_payment_date?: string;
  next_payment_amount?: string;
  icon?: string;
}

interface Props {
  data: ClientStatusData;
}

export function ClientStatusCard({ data }: Props) {
  const mode = useDataMode();

  if (mode === "zero-rated") {
    return (
      <div className="rounded-lg border border-[hsl(160,30%,85%)] bg-white px-3 py-2 max-w-[90%]">
        <p className="text-[11px] font-bold text-[hsl(220,15%,20%)]">👤 {data.client_name}</p>
        {data.voice_id && <p className="text-[10px] text-[hsl(220,10%,50%)]">ID: {data.voice_id}</p>}
        {data.total_balance && (
          <div className="flex justify-between text-[10px] mt-1">
            <span>Solde</span><span className="font-bold text-[hsl(160,60%,30%)]">{data.total_balance} FCFA</span>
          </div>
        )}
        {data.active_credits != null && (
          <div className="flex justify-between text-[10px]">
            <span>Crédits actifs</span><span>{data.active_credits}</span>
          </div>
        )}
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
      <div className="px-3 py-2.5 flex items-center gap-2" style={{ background: "linear-gradient(135deg, hsl(160,55%,35%), hsl(175,50%,38%))" }}>
        <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-[12px] font-bold text-white">{data.client_name}</p>
          {data.voice_id && <p className="text-[9px] text-white/60">ID: {data.voice_id}</p>}
          {data.phone && <p className="text-[9px] text-white/60">📱 {data.phone}</p>}
        </div>
      </div>

      <div className="px-3 py-2.5">
        <div className="grid grid-cols-2 gap-2">
          {data.total_balance && (
            <div className="bg-[hsl(160,30%,96%)] rounded-lg px-2.5 py-2">
              <div className="flex items-center gap-1 mb-0.5">
                <Wallet className="h-2.5 w-2.5 text-[hsl(160,50%,40%)]" />
                <span className="text-[8px] text-[hsl(160,30%,45%)] uppercase tracking-wider">Solde</span>
              </div>
              <p className="text-[14px] font-bold text-[hsl(160,60%,28%)]">{data.total_balance}</p>
              <p className="text-[8px] text-[hsl(160,30%,50%)]">FCFA</p>
            </div>
          )}
          {data.active_credits != null && (
            <div className="bg-[hsl(220,15%,97%)] rounded-lg px-2.5 py-2">
              <div className="flex items-center gap-1 mb-0.5">
                <CreditCard className="h-2.5 w-2.5 text-[hsl(220,40%,55%)]" />
                <span className="text-[8px] text-[hsl(220,10%,55%)] uppercase tracking-wider">Crédits</span>
              </div>
              <p className="text-[14px] font-bold text-[hsl(220,15%,25%)]">{data.active_credits}</p>
              <p className="text-[8px] text-[hsl(220,10%,55%)]">actifs</p>
            </div>
          )}
        </div>

        {(data.next_payment_date || data.next_payment_amount) && (
          <div className="mt-2 flex items-center gap-2 bg-[hsl(35,80%,96%)] rounded-lg px-2.5 py-2">
            <CalendarClock className="h-3.5 w-3.5 text-[hsl(35,70%,45%)] flex-shrink-0" />
            <div className="flex-1">
              <p className="text-[9px] text-[hsl(35,50%,40%)]">Prochain paiement</p>
              <div className="flex items-baseline gap-1.5">
                {data.next_payment_amount && (
                  <span className="text-[12px] font-bold text-[hsl(35,70%,35%)]">{data.next_payment_amount} FCFA</span>
                )}
                {data.next_payment_date && (
                  <span className="text-[9px] text-[hsl(35,50%,45%)]">• {data.next_payment_date}</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
