/**
 * Sovereign Block: Credit Simulation Result
 * Shows BNPL or insurance credit simulation with monthly payment details.
 */
import { motion } from "framer-motion";
import { Calculator, TrendingUp, Calendar, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDataMode } from "../dataMode";

export interface CreditSimulationData {
  title: string;
  product_name?: string;
  amount: string;
  term?: string;
  frequency?: string;
  monthly_payment: string;
  total_cost?: string;
  interest_rate?: string;
  icon?: string;
  actions?: string[];
}

interface Props {
  data: CreditSimulationData;
  onAction?: (action: string) => void;
}

export function CreditSimulationCard({ data, onAction }: Props) {
  const mode = useDataMode();

  if (mode === "zero-rated") {
    return (
      <div className="rounded-lg border border-[hsl(160,30%,85%)] bg-white px-3 py-2 max-w-[90%]">
        <p className="text-[11px] font-bold text-[hsl(220,15%,20%)]">
          {data.icon || "🧮"} {data.title}
        </p>
        {data.product_name && <p className="text-[10px] text-[hsl(220,10%,50%)]">{data.product_name}</p>}
        <div className="text-[10px] text-[hsl(220,10%,40%)] mt-1 space-y-0.5">
          <div className="flex justify-between"><span>Montant</span><span className="font-bold">{data.amount}</span></div>
          <div className="flex justify-between"><span>Mensualité</span><span className="font-bold text-[hsl(160,60%,30%)]">{data.monthly_payment}</span></div>
          {data.term && <div className="flex justify-between"><span>Durée</span><span>{data.term}</span></div>}
          {data.total_cost && <div className="flex justify-between"><span>Coût total</span><span>{data.total_cost}</span></div>}
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
      className="rounded-xl border border-[hsl(200,40%,85%)] bg-white overflow-hidden shadow-sm max-w-[90%]"
    >
      {/* Header */}
      <div className="px-3 py-2.5 flex items-center gap-2" style={{ background: "linear-gradient(135deg, hsl(220,60%,45%), hsl(200,55%,50%))" }}>
        <span className="text-lg">{data.icon || "🧮"}</span>
        <div>
          <p className="text-[12px] font-bold text-white">{data.title}</p>
          {data.product_name && <p className="text-[10px] text-white/70">{data.product_name}</p>}
        </div>
        <Calculator className="h-4 w-4 text-white/40 ml-auto" />
      </div>

      {/* Details grid */}
      <div className="px-3 py-2.5 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[hsl(220,15%,97%)] rounded-lg px-2 py-1.5">
            <div className="flex items-center gap-1 mb-0.5">
              <TrendingUp className="h-2.5 w-2.5 text-[hsl(220,40%,55%)]" />
              <span className="text-[8px] text-[hsl(220,10%,55%)] uppercase tracking-wider">Montant</span>
            </div>
            <p className="text-[13px] font-bold text-[hsl(220,15%,20%)]">{data.amount}</p>
          </div>
          <div className="bg-[hsl(160,30%,96%)] rounded-lg px-2 py-1.5">
            <div className="flex items-center gap-1 mb-0.5">
              <Calendar className="h-2.5 w-2.5 text-[hsl(160,50%,40%)]" />
              <span className="text-[8px] text-[hsl(160,30%,45%)] uppercase tracking-wider">Mensualité</span>
            </div>
            <p className="text-[13px] font-bold text-[hsl(160,60%,30%)]">{data.monthly_payment}</p>
          </div>
        </div>

        {(data.term || data.frequency) && (
          <div className="grid grid-cols-2 gap-2">
            {data.term && (
              <div className="flex items-center gap-1.5 px-2 py-1">
                <Calendar className="h-3 w-3 text-[hsl(220,10%,60%)]" />
                <div>
                  <p className="text-[8px] text-[hsl(220,10%,55%)]">Durée</p>
                  <p className="text-[11px] font-medium text-[hsl(220,15%,25%)]">{data.term}</p>
                </div>
              </div>
            )}
            {data.interest_rate && (
              <div className="flex items-center gap-1.5 px-2 py-1">
                <Percent className="h-3 w-3 text-[hsl(220,10%,60%)]" />
                <div>
                  <p className="text-[8px] text-[hsl(220,10%,55%)]">Taux</p>
                  <p className="text-[11px] font-medium text-[hsl(220,15%,25%)]">{data.interest_rate}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {data.total_cost && (
          <div className="flex justify-between items-center pt-1.5 border-t border-[hsl(220,15%,92%)]">
            <span className="text-[10px] text-[hsl(220,10%,50%)]">Coût total</span>
            <span className="text-[12px] font-bold text-[hsl(220,15%,25%)]">{data.total_cost}</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {data.actions && data.actions.length > 0 && (
        <div className="divide-y divide-[hsl(220,15%,93%)] border-t border-[hsl(220,15%,92%)]">
          {data.actions.map((action, i) => (
            <button
              key={i}
              onClick={() => onAction?.(action)}
              className="w-full px-3 py-2.5 text-[12px] font-medium text-[hsl(200,60%,40%)] hover:bg-[hsl(200,30%,97%)] transition-colors text-center active:bg-[hsl(200,30%,93%)]"
            >
              {action}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
