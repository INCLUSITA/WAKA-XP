/**
 * Sovereign Block: Service Plans (Fiber, Insurance, etc.)
 * Shows available plans/variants with pricing and CTA to select.
 */
import { motion } from "framer-motion";
import { Wifi, Shield, Package, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDataMode } from "../dataMode";

export interface ServicePlan {
  sku: string;
  name: string;
  price: string;
  description?: string;
  features?: string[];
  badge?: string;
  icon?: string;
}

export interface ServicePlansData {
  title: string;
  category: "fibre_optique" | "microseguro_salud" | "general";
  plans: ServicePlan[];
  message?: string;
  icon?: string;
}

interface Props {
  data: ServicePlansData;
  onSelectPlan?: (sku: string, name: string) => void;
}

const categoryConfig = {
  fibre_optique: {
    gradient: "linear-gradient(135deg, hsl(200,65%,45%), hsl(220,60%,50%))",
    IconComp: Wifi,
    accentHue: 200,
  },
  microseguro_salud: {
    gradient: "linear-gradient(135deg, hsl(340,55%,50%), hsl(320,50%,45%))",
    IconComp: Shield,
    accentHue: 340,
  },
  general: {
    gradient: "linear-gradient(135deg, hsl(160,60%,40%), hsl(180,55%,42%))",
    IconComp: Package,
    accentHue: 160,
  },
};

export function ServicePlansCard({ data, onSelectPlan }: Props) {
  const mode = useDataMode();
  const config = categoryConfig[data.category] || categoryConfig.general;

  if (mode === "zero-rated") {
    return (
      <div className="rounded-lg border border-[hsl(160,30%,85%)] bg-white px-3 py-2 max-w-[90%]">
        <p className="text-[11px] font-bold text-[hsl(220,15%,20%)]">
          {data.icon || "📋"} {data.title}
        </p>
        {data.message && <p className="text-[10px] text-[hsl(220,10%,50%)] mb-1">{data.message}</p>}
        {data.plans.map((plan) => (
          <button
            key={plan.sku}
            onClick={() => onSelectPlan?.(plan.sku, plan.name)}
            className="block w-full text-left border-t border-[hsl(220,15%,92%)] py-1"
          >
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-medium text-[hsl(220,15%,20%)]">{plan.name}</span>
              <span className="text-[10px] font-bold text-[hsl(160,60%,30%)]">{plan.price}</span>
            </div>
            {plan.description && <p className="text-[9px] text-[hsl(220,10%,55%)]">{plan.description}</p>}
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
      className="rounded-xl border border-[hsl(220,15%,88%)] bg-white overflow-hidden shadow-sm max-w-[90%]"
    >
      {/* Header */}
      <div className="px-3 py-2.5 flex items-center gap-2" style={{ background: config.gradient }}>
        <span className="text-lg">{data.icon || (data.category === "fibre_optique" ? "🌐" : "🏥")}</span>
        <div className="flex-1">
          <p className="text-[12px] font-bold text-white">{data.title}</p>
          {data.message && <p className="text-[9px] text-white/70">{data.message}</p>}
        </div>
        <config.IconComp className="h-4 w-4 text-white/40" />
      </div>

      {/* Plans */}
      <div className="divide-y divide-[hsl(220,15%,93%)]">
        {data.plans.map((plan, i) => (
          <button
            key={plan.sku}
            onClick={() => onSelectPlan?.(plan.sku, plan.name)}
            className="w-full px-3 py-2.5 text-left hover:bg-[hsl(220,10%,98%)] transition-colors active:bg-[hsl(220,10%,96%)]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {plan.icon && <span className="text-sm">{plan.icon}</span>}
                  <p className="text-[12px] font-semibold text-[hsl(220,15%,20%)]">{plan.name}</p>
                  {plan.badge && (
                    <span
                      className="text-[8px] font-bold px-1.5 py-0.5 rounded-full text-white"
                      style={{ background: `hsl(${config.accentHue},60%,50%)` }}
                    >
                      {plan.badge}
                    </span>
                  )}
                </div>
                {plan.description && (
                  <p className="text-[10px] text-[hsl(220,10%,50%)] mt-0.5">{plan.description}</p>
                )}
                {plan.features && plan.features.length > 0 && (
                  <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                    {plan.features.map((f, j) => (
                      <span key={j} className="text-[9px] text-[hsl(220,10%,45%)] flex items-center gap-0.5">
                        <Check className="h-2 w-2" style={{ color: `hsl(${config.accentHue},55%,45%)` }} />
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[13px] font-bold" style={{ color: `hsl(${config.accentHue},55%,35%)` }}>
                  {plan.price}
                </p>
                <p className="text-[8px] text-[hsl(220,10%,55%)]">FCFA/mois</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
