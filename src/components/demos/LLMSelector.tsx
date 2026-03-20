import { useState, useRef, useEffect } from "react";
import { Settings, Check, Lock } from "lucide-react";

export interface LLMOption {
  id: string;
  name: string;
  provider: string;
  description: string;
  available: boolean;
}

const LLM_OPTIONS: LLMOption[] = [
  { id: "waka-llm-gpt52", name: "WAKA LLM", provider: "GPT-5.2 · Azure", description: "Default — motor soberano WAKA", available: true },
  { id: "waka-llm-claude", name: "WAKA LLM", provider: "Claude Opus 4.5", description: "Razonamiento avanzado · Anthropic", available: true },
  { id: "waka-llm-o3", name: "WAKA LLM", provider: "o3-pro", description: "Razonamiento profundo · OpenAI", available: true },
  { id: "waka-llm-gpt51", name: "WAKA LLM", provider: "GPT-5.1 · Azure", description: "Balance rendimiento/coste", available: true },
];

interface LLMSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function LLMSelector({ selectedId, onSelect }: LLMSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const selected = LLM_OPTIONS.find((o) => o.id === selectedId) || LLM_OPTIONS[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[9px] text-white/25 hover:text-white/50 transition group"
        title="Select AI engine"
      >
        <Settings className="h-3 w-3 text-violet-400/50 group-hover:text-violet-400 transition" />
        <span>Engine: {selected.name} ({selected.provider})</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-64 rounded-xl border border-white/10 bg-slate-800/95 backdrop-blur-md shadow-xl overflow-hidden">
          <div className="px-3 py-2 border-b border-white/5">
            <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">AI Engine</p>
          </div>
          <div className="p-1.5 space-y-0.5">
            {LLM_OPTIONS.map((opt) => {
              const isSelected = opt.id === selectedId;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    if (opt.available) {
                      onSelect(opt.id);
                      setOpen(false);
                    }
                  }}
                  disabled={!opt.available}
                  className={`w-full flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition ${
                    isSelected
                      ? "bg-violet-500/15 border border-violet-500/30"
                      : opt.available
                        ? "hover:bg-white/5 border border-transparent"
                        : "opacity-40 cursor-not-allowed border border-transparent"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-semibold ${isSelected ? "text-violet-300" : "text-white/70"}`}>
                        {opt.name}
                      </span>
                      {!opt.available && <Lock className="h-2.5 w-2.5 text-white/20" />}
                    </div>
                    <p className="text-[9px] text-white/30">{opt.provider}</p>
                    <p className="text-[9px] text-white/20 mt-0.5">{opt.description}</p>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-violet-400 mt-0.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
