import { Check, Lock, ChevronDown, Cpu, Cloud, Server } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

/* ── Engine types ── */
export type EngineId = "waka-ai" | "azure-openai" | "byom";

export interface AIEngine {
  id: EngineId;
  name: string;
  subtitle: string;
  description: string;
  icon: typeof Cpu;
  available: boolean;
  models?: { id: string; label: string }[];
}

export interface EngineSelection {
  engineId: EngineId;
  modelId?: string;
}

const ENGINES: AIEngine[] = [
  {
    id: "waka-ai",
    name: "WAKA LLM",
    subtitle: "Active",
    description: "Motor IA soberano · GPT-5.2, Claude Opus 4.5, o3-pro",
    icon: Cpu,
    available: true,
    models: [
      { id: "gpt-5.2", label: "GPT-5.2" },
      { id: "claude-opus-4.5", label: "Claude Opus 4.5" },
      { id: "o3-pro", label: "o3-pro" },
      { id: "gpt-5.1", label: "GPT-5.1" },
    ],
  },
  {
    id: "azure-openai",
    name: "Azure OpenAI",
    subtitle: "Managed",
    description: "GPT-5.2 via WAKA Azure deployment",
    icon: Cloud,
    available: false,
  },
  {
    id: "byom",
    name: "BYOM",
    subtitle: "Planned",
    description: "Bring your own model · Routed via WAKA infra",
    icon: Server,
    available: false,
  },
];

interface AIEngineSelectorProps {
  selection: EngineSelection;
  onSelect: (selection: EngineSelection) => void;
}

export default function AIEngineSelector({ selection, onSelect }: AIEngineSelectorProps) {
  const [open, setOpen] = useState(false);

  const activeEngine = ENGINES.find((e) => e.id === selection.engineId) || ENGINES[0];
  const ActiveIcon = activeEngine.icon;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition group border border-transparent hover:border-border/50"
        >
          <ActiveIcon className="h-3 w-3 text-primary/70 group-hover:text-primary transition" />
          <span className="truncate max-w-[100px]">{activeEngine.name}</span>
          <ChevronDown className={`h-2.5 w-2.5 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={6}
        className="w-72 rounded-xl border border-border/60 bg-popover/95 backdrop-blur-md shadow-xl p-0 overflow-hidden"
      >
        {/* Header */}
        <div className="px-3.5 py-2.5 border-b border-border/30">
          <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
            AI Engine
          </p>
        </div>

        {/* Engine list */}
        <div className="p-1.5 space-y-0.5">
          {ENGINES.map((engine) => {
            const isSelected = engine.id === selection.engineId;
            const Icon = engine.icon;

            return (
              <button
                key={engine.id}
                onClick={() => {
                  if (engine.available) {
                    onSelect({ engineId: engine.id, modelId: engine.models?.[0]?.id });
                    if (!engine.models) setOpen(false);
                  }
                }}
                disabled={!engine.available}
                className={`w-full flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition ${
                  isSelected
                    ? "bg-primary/10 border border-primary/20"
                    : engine.available
                      ? "hover:bg-secondary/60 border border-transparent"
                      : "opacity-40 cursor-not-allowed border border-transparent"
                }`}
              >
                <div className={`mt-0.5 h-6 w-6 rounded-md flex items-center justify-center shrink-0 ${
                  isSelected ? "bg-primary/15" : "bg-secondary/60"
                }`}>
                  <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-semibold ${isSelected ? "text-primary" : "text-foreground/80"}`}>
                      {engine.name}
                    </span>
                    <span className="text-[9px] text-muted-foreground/50 font-medium uppercase tracking-wider">
                      {engine.subtitle}
                    </span>
                    {!engine.available && <Lock className="h-2.5 w-2.5 text-muted-foreground/30" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">{engine.description}</p>

                  {/* Model sub-selector (if engine selected and has models) */}
                  {isSelected && engine.available && engine.models && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {engine.models.map((model) => (
                        <button
                          key={model.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect({ engineId: engine.id, modelId: model.id });
                          }}
                          className={`px-2 py-0.5 rounded-md text-[9px] font-medium transition ${
                            selection.modelId === model.id
                              ? "bg-primary/20 text-primary border border-primary/30"
                              : "bg-secondary/40 text-muted-foreground hover:text-foreground border border-transparent hover:border-border/40"
                          }`}
                        >
                          {model.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {isSelected && (
                  <Check className="h-3.5 w-3.5 text-primary mt-1 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer hint */}
        <div className="px-3.5 py-2 border-t border-border/20">
          <p className="text-[9px] text-muted-foreground/40">
            Azure OpenAI & BYOM coming soon · Routed via Waka managed infra
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ── Tiny traceability badge ── */
export function EngineBadge({ engineId }: { engineId: EngineId }) {
  const engine = ENGINES.find((e) => e.id === engineId);
  if (!engine) return null;
  const Icon = engine.icon;

  return (
    <span className="inline-flex items-center gap-1 text-[8px] text-muted-foreground/40 font-medium">
      <Icon className="h-2 w-2" />
      {engine.name}
    </span>
  );
}
