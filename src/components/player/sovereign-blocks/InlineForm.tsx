/**
 * Sovereign Block: Inline Forms
 * WhatsApp: IMPOSSIBLE. Users must leave chat.
 * WAKA: Full form capture inside the conversation.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDataMode } from "../dataMode";

export interface FormField {
  id: string;
  label: string;
  type: "text" | "number" | "select" | "date" | "phone" | "email";
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

interface InlineFormProps {
  title: string;
  fields: FormField[];
  submitLabel?: string;
  icon?: string;
  onSubmit?: (values: Record<string, string>) => void;
}

export function InlineForm({ title, fields, submitLabel = "Confirmer", icon, onSubmit }: InlineFormProps) {
  const mode = useDataMode();
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (id: string, value: string) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    onSubmit?.(values);
  };

  if (submitted) {
    const Wrapper = mode === "zero-rated" ? "div" : motion.div;
    return (
      <Wrapper
        {...(mode !== "zero-rated" ? { initial: { scale: 0.95 }, animate: { scale: 1 } } : {})}
        className="rounded-xl border border-[hsl(160,50%,75%)] bg-[hsl(160,40%,96%)] px-3 py-3 max-w-[90%] flex items-center gap-2"
      >
        <div className="h-6 w-6 rounded-full bg-[hsl(160,55%,40%)] flex items-center justify-center flex-shrink-0">
          <Check className="h-3.5 w-3.5 text-white" />
        </div>
        <p className="text-[12px] font-medium text-[hsl(160,50%,25%)]">Formulaire envoyé ✓</p>
      </Wrapper>
    );
  }

  if (mode === "zero-rated") {
    return (
      <div className="rounded-lg border border-[hsl(160,30%,85%)] bg-white px-3 py-2 max-w-[90%]">
        <p className="text-[11px] font-bold text-[hsl(160,50%,25%)] mb-1.5">{icon} {title}</p>
        {fields.map((f) => (
          <div key={f.id} className="mb-1.5">
            <label className="text-[9px] text-[hsl(220,10%,50%)] font-medium">{f.label}</label>
            <input
              type={f.type === "select" ? "text" : f.type}
              placeholder={f.placeholder}
              value={values[f.id] || ""}
              onChange={(e) => handleChange(f.id, e.target.value)}
              className="w-full h-7 px-2 text-[11px] border border-[hsl(220,15%,88%)] rounded bg-[hsl(220,10%,97%)]"
            />
          </div>
        ))}
        <button
          onClick={handleSubmit}
          className="w-full text-[11px] font-bold text-[hsl(160,60%,30%)] py-1.5 mt-1 border-t border-[hsl(160,20%,90%)]"
        >
          → {submitLabel}
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={mode === "libre" ? { opacity: 0, y: 10 } : { opacity: 0 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[hsl(160,30%,85%)] bg-white overflow-hidden shadow-sm max-w-[90%]"
    >
      <div className="px-3 py-2.5 bg-[hsl(160,40%,96%)] border-b border-[hsl(160,25%,90%)]">
        <p className="text-[12px] font-bold text-[hsl(160,50%,25%)]">
          {icon && <span className="mr-1">{icon}</span>}
          {title}
        </p>
      </div>

      <div className="px-3 py-2.5 space-y-2">
        {fields.map((field) => (
          <div key={field.id}>
            <label className="text-[10px] text-[hsl(220,10%,50%)] font-medium mb-0.5 block">
              {field.label}
              {field.required && <span className="text-[hsl(350,70%,50%)]"> *</span>}
            </label>
            {field.type === "select" && field.options ? (
              <div className="relative">
                <select
                  value={values[field.id] || ""}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  className="w-full h-8 px-2.5 pr-7 text-[12px] border border-[hsl(220,15%,88%)] rounded-lg bg-white appearance-none focus:ring-1 focus:ring-[hsl(160,60%,40%)]/30 focus:outline-none"
                >
                  <option value="">{field.placeholder || "Sélectionner…"}</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-[hsl(220,10%,60%)] pointer-events-none" />
              </div>
            ) : (
              <input
                type={field.type}
                placeholder={field.placeholder}
                value={values[field.id] || ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                className="w-full h-8 px-2.5 text-[12px] border border-[hsl(220,15%,88%)] rounded-lg bg-white focus:ring-1 focus:ring-[hsl(160,60%,40%)]/30 focus:outline-none transition-shadow"
              />
            )}
          </div>
        ))}
      </div>

      <div className="px-3 py-2 border-t border-[hsl(160,20%,92%)]">
        <button
          onClick={handleSubmit}
          className="w-full py-2 rounded-lg bg-[hsl(160,55%,38%)] text-white text-[12px] font-semibold shadow-sm hover:bg-[hsl(160,55%,42%)] transition-colors active:scale-[0.98]"
        >
          {submitLabel}
        </button>
      </div>
    </motion.div>
  );
}
