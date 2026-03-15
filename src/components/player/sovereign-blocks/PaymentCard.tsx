/**
 * Sovereign Block: Payment / Checkout
 * WhatsApp: Only pay button (limited regions).
 * WAKA: Full inline checkout with itemized receipt, payment methods, confirmation.
 *
 * Variant-aware: compact shows summary, expanded shows full detail.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, CreditCard, Smartphone, Shield, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDataMode } from "../dataMode";
import { useBlockVariant } from "../BlockVariantWrapper";

export interface PaymentItem {
  label: string;
  amount: string;
}

export interface PaymentCardData {
  title: string;
  items: PaymentItem[];
  total: string;
  currency?: string;
  methods?: string[];
  icon?: string;
}

interface PaymentCardProps {
  payment: PaymentCardData;
  onPay?: (method: string) => void;
}

export function PaymentCard({ payment, onPay }: PaymentCardProps) {
  const mode = useDataMode();
  const { variant } = useBlockVariant();
  const [selectedMethod, setSelectedMethod] = useState(payment.methods?.[0] || "mobile_money");
  const [paid, setPaid] = useState(false);

  const handlePay = () => {
    setPaid(true);
    onPay?.(selectedMethod);
  };

  if (paid) {
    const W = mode === "zero-rated" ? "div" : motion.div;
    return (
      <W
        {...(mode !== "zero-rated" ? { initial: { scale: 0.9 }, animate: { scale: 1 }, transition: { type: "spring" } } : {})}
        className="rounded-xl border-2 border-[hsl(160,55%,50%)] bg-[hsl(160,40%,96%)] px-3 py-3 max-w-[90%] text-center"
      >
        <motion.div
          initial={mode === "libre" ? { scale: 0 } : {}}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
          className="h-10 w-10 rounded-full bg-[hsl(160,55%,40%)] flex items-center justify-center mx-auto mb-1.5"
        >
          <Check className="h-5 w-5 text-white" />
        </motion.div>
        <p className="text-[13px] font-bold text-[hsl(160,50%,25%)]">Paiement confirmé</p>
        <p className="text-[11px] text-[hsl(160,40%,45%)]">{payment.total} {payment.currency || "FCFA"}</p>
      </W>
    );
  }

  // Zero-rated
  if (mode === "zero-rated" || variant === "zero-rated") {
    return (
      <div className="max-w-[90%]">
        <p className="waka-block-title">{payment.icon || "💳"} {payment.title}</p>
        {payment.items.map((item, i) => (
          <div key={i} className="flex justify-between text-[10px] text-foreground mt-0.5">
            <span>{item.label}</span>
            <span>{item.amount}</span>
          </div>
        ))}
        <div className="flex justify-between text-[11px] font-bold text-primary mt-1 pt-1 border-t border-border">
          <span>Total</span>
          <span>{payment.total}</span>
        </div>
        <button onClick={handlePay} className="mt-1.5 w-full py-1.5 text-[11px] font-bold text-primary underline underline-offset-2 text-left">→ Payer {payment.total} {payment.currency || "FCFA"}</button>
      </div>
    );
  }

  // Compact: condensed summary
  if (variant === "compact") {
    return (
      <div className="rounded-xl border border-[hsl(160,30%,85%)] bg-white overflow-hidden max-w-[90%]">
        <div className="waka-block-header px-3 py-2 flex items-center gap-2" style={{ background: "linear-gradient(135deg, hsl(160,60%,35%), hsl(175,55%,38%))" }}>
          <span className="text-base">{payment.icon || "💳"}</span>
          <p className="text-[11px] font-bold text-white flex-1">{payment.title}</p>
          <span className="text-[12px] font-bold text-white">{payment.total}</span>
        </div>
        <div className="px-3 py-2">
          <button onClick={handlePay} className="w-full py-2.5 rounded-lg bg-[hsl(160,55%,38%)] text-white text-[12px] font-bold active:scale-[0.97] transition-all">
            Payer {payment.total} {payment.currency || "FCFA"}
          </button>
        </div>
      </div>
    );
  }

  const methodIcons: Record<string, React.ReactNode> = {
    mobile_money: <Smartphone className="h-3.5 w-3.5" />,
    card: <CreditCard className="h-3.5 w-3.5" />,
  };

  const methodLabels: Record<string, string> = {
    mobile_money: "Moov Money",
    card: "Carte bancaire",
  };

  // Expanded: full detail with receipt feel
  if (variant === "expanded") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-[hsl(160,30%,85%)] bg-white overflow-hidden"
      >
        <div
          className="waka-block-header px-5 py-4 flex items-center gap-3"
          style={{ background: "linear-gradient(135deg, hsl(160,60%,35%), hsl(175,55%,38%))" }}
        >
          <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center">
            <Receipt className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="waka-block-title text-white">{payment.title}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Shield className="h-2.5 w-2.5 text-white/60" />
              <span className="text-[9px] text-white/60">Paiement sécurisé WAKA</span>
            </div>
          </div>
        </div>

        {/* Itemized receipt */}
        <div className="px-5 py-4 space-y-2">
          {payment.items.map((item, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-[13px] text-[hsl(220,10%,45%)]">{item.label}</span>
              <span className="text-[13px] font-medium text-[hsl(220,15%,25%)]">{item.amount}</span>
            </div>
          ))}
          <div className="flex justify-between pt-3 mt-3 border-t-2 border-[hsl(160,20%,88%)]">
            <span className="text-[14px] font-bold text-[hsl(220,15%,15%)]">Total</span>
            <span className="text-[16px] font-bold text-[hsl(160,60%,30%)]">{payment.total} {payment.currency || "FCFA"}</span>
          </div>
        </div>

        {/* Payment methods */}
        {payment.methods && payment.methods.length > 1 && (
          <div className="px-5 py-3 border-t border-[hsl(160,20%,92%)] bg-[hsl(160,20%,98%)]">
            <p className="text-[11px] text-[hsl(220,10%,55%)] mb-2 font-medium">Mode de paiement</p>
            <div className="flex gap-2">
              {payment.methods.map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMethod(m)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-medium border-2 transition-all",
                    selectedMethod === m
                      ? "border-[hsl(160,55%,40%)] bg-[hsl(160,40%,96%)] text-[hsl(160,50%,28%)] shadow-sm"
                      : "border-[hsl(220,15%,90%)] text-[hsl(220,10%,50%)]"
                  )}
                >
                  {methodIcons[m] || <CreditCard className="h-3.5 w-3.5" />}
                  {methodLabels[m] || m}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="px-5 py-4 border-t border-[hsl(160,20%,92%)]">
          <button onClick={handlePay}>
            Payer {payment.total} {payment.currency || "FCFA"}
          </button>
        </div>
      </motion.div>
    );
  }

  // Standard
  return (
    <motion.div
      initial={mode === "libre" ? { opacity: 0, y: 12 } : { opacity: 0 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[hsl(160,30%,85%)] bg-white overflow-hidden shadow-sm max-w-[90%]"
    >
      <div
        className="waka-block-header px-3 py-2.5 flex items-center gap-2"
        style={{ background: "linear-gradient(135deg, hsl(160,60%,35%), hsl(175,55%,38%))" }}
      >
        <span className="text-lg">{payment.icon || "💳"}</span>
        <div>
          <p className="text-[12px] font-bold text-white">{payment.title}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Shield className="h-2.5 w-2.5 text-white/60" />
            <span className="text-[9px] text-white/60">Paiement sécurisé WAKA</span>
          </div>
        </div>
      </div>

      <div className="px-3 py-2 space-y-1">
        {payment.items.map((item, i) => (
          <div key={i} className="flex justify-between">
            <span className="text-[11px] text-[hsl(220,10%,45%)]">{item.label}</span>
            <span className="text-[11px] text-[hsl(220,15%,25%)]">{item.amount}</span>
          </div>
        ))}
        <div className="flex justify-between pt-1.5 mt-1.5 border-t border-[hsl(160,20%,90%)]">
          <span className="text-[12px] font-bold text-[hsl(220,15%,15%)]">Total</span>
          <span className="text-[13px] font-bold text-[hsl(160,60%,30%)]">{payment.total} {payment.currency || "FCFA"}</span>
        </div>
      </div>

      {payment.methods && payment.methods.length > 1 && (
        <div className="px-3 py-2 border-t border-[hsl(160,20%,92%)]">
          <p className="text-[10px] text-[hsl(220,10%,55%)] mb-1.5">Mode de paiement</p>
          <div className="flex gap-1.5">
            {payment.methods.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMethod(m)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium border transition-all",
                  selectedMethod === m
                    ? "border-[hsl(160,55%,40%)] bg-[hsl(160,40%,96%)] text-[hsl(160,50%,28%)]"
                    : "border-[hsl(220,15%,90%)] text-[hsl(220,10%,50%)]"
                )}
              >
                {methodIcons[m] || <CreditCard className="h-3 w-3" />}
                {methodLabels[m] || m}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-3 py-2 border-t border-[hsl(160,20%,92%)]">
        <button
          onClick={handlePay}
          className="w-full py-2.5 rounded-lg bg-[hsl(160,55%,38%)] text-white text-[12px] font-bold shadow-sm hover:bg-[hsl(160,55%,42%)] transition-colors active:scale-[0.98]"
        >
          Payer {payment.total} {payment.currency || "FCFA"}
        </button>
      </div>
    </motion.div>
  );
}
