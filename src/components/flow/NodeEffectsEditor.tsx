import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2, Sparkles, Save, RefreshCw, Database, Flag, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { v4 as uuidv4 } from "uuid";

export interface NodeEffect {
  id: string;
  type: "save_result" | "update_context" | "update_entity" | "set_state" | "add_reflection";
  key: string;
  value: string;
  scope?: "flow" | "module" | "experience";
}

const EFFECT_META: Record<NodeEffect["type"], { label: string; icon: React.ReactNode; color: string }> = {
  save_result:     { label: "Save Result",      icon: <Save className="h-3 w-3" />,               color: "text-[hsl(var(--xp-execution))]" },
  update_context:  { label: "Update Context",   icon: <RefreshCw className="h-3 w-3" />,          color: "text-[hsl(var(--xp-context))]" },
  update_entity:   { label: "Update Entity",    icon: <Database className="h-3 w-3" />,            color: "text-[hsl(var(--xp-structure))]" },
  set_state:       { label: "Set State",         icon: <Flag className="h-3 w-3" />,               color: "text-[hsl(var(--xp-context))]" },
  add_reflection:  { label: "Add Reflection",   icon: <MessageSquareText className="h-3 w-3" />,  color: "text-muted-foreground" },
};

const SCOPE_HINTS: Record<string, string> = {
  module: "Only within this module",
  flow: "Local to this flow",
  experience: "Shared across flows in this experience",
};

interface NodeEffectsEditorProps {
  effects: NodeEffect[];
  onChange: (effects: NodeEffect[]) => void;
}

export function NodeEffectsEditor({ effects, onChange }: NodeEffectsEditorProps) {
  const [open, setOpen] = useState(effects.length > 0);

  const addEffect = (type: NodeEffect["type"]) => {
    onChange([...effects, { id: uuidv4(), type, key: "", value: "", scope: "flow" }]);
    setOpen(true);
  };

  const updateEffect = (id: string, patch: Partial<NodeEffect>) => {
    onChange(effects.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const removeEffect = (id: string) => {
    onChange(effects.filter((e) => e.id !== id));
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      {/* Section header */}
      <CollapsibleTrigger asChild>
        <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-muted/60 transition-colors group">
          {open ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
          <Sparkles className="h-3 w-3 text-[hsl(var(--xp-context))]" />
          <span className="font-semibold text-foreground tracking-wide">XP Effects</span>
          {effects.length > 0 && (
            <span className="ml-auto rounded-full bg-[hsl(var(--xp-context))]/10 px-1.5 py-px text-[10px] font-semibold text-[hsl(var(--xp-context))]">
              {effects.length}
            </span>
          )}
          {effects.length === 0 && (
            <span className="ml-auto text-[10px] text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
              Optional
            </span>
          )}
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-1 space-y-2 pl-1">
          {/* Empty state */}
          {effects.length === 0 && (
            <div className="rounded-lg border border-dashed border-[hsl(var(--xp-context))]/20 bg-[hsl(var(--xp-surface))] px-3 py-3 text-center">
              <Sparkles className="mx-auto h-4 w-4 text-[hsl(var(--xp-context))]/40" />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Side effects run alongside this node's main action
              </p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                Save results, update context, or set state — without extra nodes.
                Effects can target module, flow, or experience scope.
              </p>
            </div>
          )}

          {/* Effect cards */}
          {effects.map((effect) => {
            const meta = EFFECT_META[effect.type];
            return (
              <div key={effect.id} className="rounded-md border border-border/60 bg-card p-2 space-y-1.5">
                {/* Effect header */}
                <div className="flex items-center gap-1.5">
                  <span className={meta.color}>{meta.icon}</span>
                  <span className="text-[11px] font-medium text-foreground">{meta.label}</span>
                  {effect.scope && (
                    <span className="rounded bg-muted px-1 py-px text-[9px] text-muted-foreground capitalize">{effect.scope}</span>
                  )}
                  <button
                    onClick={() => removeEffect(effect.id)}
                    className="ml-auto rounded p-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </button>
                </div>

                {/* Key / Value fields */}
                <div className="grid grid-cols-2 gap-1.5">
                  <Input
                    value={effect.key}
                    onChange={(e) => updateEffect(effect.id, { key: e.target.value })}
                    placeholder={effect.type === "update_entity" ? "entity.field" : "key"}
                    className="h-7 text-[11px] font-mono"
                  />
                  <Input
                    value={effect.value}
                    onChange={(e) => updateEffect(effect.id, { value: e.target.value })}
                    placeholder="@input.text"
                    className="h-7 text-[11px] font-mono"
                  />
                </div>

                {/* Scope selector for context/entity types */}
                {(effect.type === "update_context" || effect.type === "set_state") && (
                  <div className="space-y-0.5">
                    <Select value={effect.scope || "flow"} onValueChange={(v) => updateEffect(effect.id, { scope: v as NodeEffect["scope"] })}>
                      <SelectTrigger className="h-6 text-[10px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="module">Module — only this module</SelectItem>
                        <SelectItem value="flow">Flow — only this flow</SelectItem>
                        <SelectItem value="experience">Experience — shared across flows</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[9px] text-muted-foreground/70 pl-0.5">
                      {SCOPE_HINTS[effect.scope || "flow"]}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {/* Add effect menu */}
          <div className="flex flex-wrap gap-1 pt-0.5">
            {(Object.entries(EFFECT_META) as [NodeEffect["type"], typeof EFFECT_META[NodeEffect["type"]]][]).map(([type, meta]) => (
              <Button
                key={type}
                variant="ghost"
                size="sm"
                className="h-6 gap-1 px-2 text-[10px] text-muted-foreground hover:text-foreground"
                onClick={() => addEffect(type)}
              >
                <Plus className="h-2.5 w-2.5" />
                {meta.label}
              </Button>
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
