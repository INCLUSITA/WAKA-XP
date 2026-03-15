/**
 * Sovereign Block: Service Plans (Fiber, Insurance, etc.)
 * Shows available plans/variants with pricing and CTA to select.
 *
 * Variant-aware: compact shows compact list, expanded shows feature-rich cards.
 */
import { motion } from "framer-motion";
import { Wifi, Shield, Package, Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDataMode } from "../dataMode";
import { useBlockVariant } from "../BlockVariantWrapper";

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
  const { variant } = useBlockVariant();
  const config = categoryConfig[data.category] || categoryConfig.general;

  // Zero-rated
  if (mode === "zero-rated" || variant === "zero-rated") {
    return (
      <div className="max-w-[90%]">
        <p className="waka-block-title">
          {data.icon || "📋"} {data.title}
        </p>
        {data.message && <p className="text-[10px] text-muted-foreground mb-1">{data.message}</p>}
        {data.plans.map((plan) => (
          <button
            key={plan.sku}
            onClick={() => onSelectPlan?.(plan.sku, plan.name)}
            className="block w-full text-left border-t border-border py-1"
          >
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-medium text-foreground">{plan.name}</span>
              <span className="text-[10px] font-bold text-primary">{plan.price}</span>
            </div>
          </button>
        ))}
      </div>
    );
  }

  // Compact: minimal plan list
  if (variant === "compact") {
    return (
      <div className="rounded-xl border border-[hsl(220,15%,88%)] bg-white overflow-hidden max-w-[90%]">
        <div className="waka-block-header px-3 py-2 flex items-center gap-2" style={{ background: config.gradient }}>
          <span className="text-base">{data.icon || (data.category === "fibre_optique" ? "🌐" : "🏥")}</span>
          <p className="text-[11px] font-bold text-white flex-1 truncate">{data.title}</p>
        </div>
        <div className="divide-y divide-[hsl(220,15%,93%)]">
          {data.plans.map((plan) => (
            <button
              key={plan.sku}
              onClick={() => onSelectPlan?.(plan.sku, plan.name)}
              className="w-full flex items-center justify-between px-3 py-2.5 active:bg-[hsl(220,10%,96%)]"
            >
              <div className="flex items-center gap-2 min-w-0">
                {plan.icon && <span className="text-sm">{plan.icon}</span>}
                <span className="text-[12px] font-medium text-foreground truncate">{plan.name}</span>
                {plan.badge && (
                  <span className="text-[7px] font-bold px-1 py-0.5 rounded-full text-white shrink-0"
                    style={{ background: `hsl(${config.accentHue},60%,50%)` }}>
                    {plan.badge}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[12px] font-bold" style={{ color: `hsl(${config.accentHue},55%,35%)` }}>{plan.price}</span>
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Expanded: feature-rich cards
  if (variant === "expanded") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-[hsl(220,15%,88%)] bg-white overflow-hidden"
      >
        <div className="waka-block-header px-5 py-4 flex items-center gap-3" style={{ background: config.gradient }}>
          <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center">
            <config.IconComp className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="waka-block-title text-white">{data.title}</p>
            {data.message && <p className="text-[10px] text-white/70 mt-0.5">{data.message}</p>}
          </div>
          <span className="text-[10px] text-white/50 font-medium">{data.plans.length} plans</span>
        </div>

        <div className="p-4 space-y-3">
          {data.plans.map((plan, i) => (
            <motion.button
              key={plan.sku}
              onClick={() => onSelectPlan?.(plan.sku, plan.name)}
              className="w-full text-left p-4 rounded-xl border-2 border-[hsl(220,15%,90%)] hover:border-primary/30 hover:shadow-md transition-all"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {plan.icon && <span className="text-lg">{plan.icon}</span>}
                    <p className="text-[14px] font-bold text-foreground">{plan.name}</p>
                    {plan.badge && (
                      <span
                        className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ background: `hsl(${config.accentHue},60%,50%)` }}
                      >
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  {plan.description && (
                    <p className="waka-block-subtitle mt-1">{plan.description}</p>
                  )}
                  {plan.features && plan.features.length > 0 && (
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                      {plan.features.map((f, j) => (
                        <span key={j} className="text-[10px] text-[hsl(220,10%,45%)] flex items-center gap-1">
                          <Check className="h-2.5 w-2.5" style={{ color: `hsl(${config.accentHue},55%,45%)` }} />
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0 mt-1">
                  <p className="text-[16px] font-bold" style={{ color: `hsl(${config.accentHue},55%,35%)` }}>
                    {plan.price}
                  </p>
                  <p className="text-[9px] text-muted-foreground">FCFA/mois</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  }

  // Standard
  return (
    <motion.div
      initial={mode === "libre" ? { opacity: 0, y: 12, scale: 0.95 } : { opacity: 0 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-[hsl(220,15%,88%)] bg-white overflow-hidden shadow-sm max-w-[90%]"
    >
      <div className="waka-block-header px-3 py-2.5 flex items-center gap-2" style={{ background: config.gradient }}>
        <span className="text-lg">{data.icon || (data.category === "fibre_optique" ? "🌐" : "🏥")}</span>
        <div className="flex-1">
          <p className="text-[12px] font-bold text-white">{data.title}</p>
          {data.message && <p className="text-[9px] text-white/70">{data.message}</p>}
        </div>
        <config.IconComp className="h-4 w-4 text-white/40" />
      </div>

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
