import { useState } from "react";
import { X, Plus, Trash2, Database, User, ToggleLeft, ExternalLink, GripVertical, BrainCircuit, Hexagon, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { v4 as uuidv4 } from "uuid";

export interface ContextItem {
  id: string;
  name: string;
  category: "field" | "entity" | "state" | "external";
  description?: string;
}

interface FlowContextPanelProps {
  items: ContextItem[];
  onChange: (items: ContextItem[]) => void;
  onClose: () => void;
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: typeof Database; color: string }> = {
  field: { label: "Field", icon: Database, color: "hsl(var(--node-wait))" },
  entity: { label: "Entity", icon: User, color: "hsl(var(--xp-context))" },
  state: { label: "State", icon: ToggleLeft, color: "hsl(var(--node-split))" },
  external: { label: "External", icon: ExternalLink, color: "hsl(var(--node-webhook))" },
};

const SUGGESTED_ITEMS: { name: string; category: ContextItem["category"] }[] = [
  { name: "client_id", category: "field" },
  { name: "customer_name", category: "entity" },
  { name: "phone", category: "field" },
  { name: "eligibility_status", category: "state" },
  { name: "language", category: "field" },
  { name: "retry_count", category: "state" },
];

export function FlowContextPanel({ items, onChange, onClose }: FlowContextPanelProps) {
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<ContextItem["category"]>("field");

  const addItem = () => {
    if (!newName.trim()) return;
    const item: ContextItem = {
      id: uuidv4(),
      name: newName.trim(),
      category: newCategory,
    };
    onChange([...items, item]);
    setNewName("");
  };

  const removeItem = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, updates: Partial<ContextItem>) => {
    onChange(items.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  };

  const addSuggested = (name: string, category: ContextItem["category"]) => {
    if (items.some((i) => i.name === name)) return;
    onChange([...items, { id: uuidv4(), name, category }]);
  };

  const unusedSuggestions = SUGGESTED_ITEMS.filter(
    (s) => !items.some((i) => i.name === s.name)
  );

  const entityItems = items.filter((i) => i.category === "entity");
  const nonEntityItems = items.filter((i) => i.category !== "entity");

  return (
    <div className="absolute left-0 top-0 z-20 flex h-full w-80 flex-col border-r border-border bg-card shadow-xl">
      {/* Header — XP contextual layer identity */}
      <div className="flex items-center gap-2 border-b border-xp-context/20 bg-xp-context/5 px-4 py-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-xp-context/10">
          <BrainCircuit className="h-3.5 w-3.5 text-xp-context" />
        </div>
        <div className="flex-1">
          <h2 className="text-xs font-bold text-foreground">Flow Context</h2>
          <p className="text-[9px] text-xp-context/70 font-medium">XP Contextual Layer</p>
        </div>
        <Badge variant="outline" className="text-[9px] border-xp-context/20 text-xp-context">
          {items.length}
        </Badge>
        <button onClick={onClose} className="ml-1 rounded p-1 hover:bg-muted transition-colors">
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Add form */}
      <div className="border-b border-border p-3 space-y-2">
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Variable name..."
            className="h-7 text-xs flex-1"
            onKeyDown={(e) => e.key === "Enter" && addItem()}
          />
          <Select value={newCategory} onValueChange={(v) => setNewCategory(v as ContextItem["category"])}>
            <SelectTrigger className="h-7 w-24 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                <SelectItem key={key} value={key} className="text-xs">
                  {cfg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={addItem} disabled={!newName.trim()} className="w-full h-7 text-xs">
          <Plus className="mr-1 h-3 w-3" /> Add Context Item
        </Button>
      </div>

      {/* Items list */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {/* Variables & States section */}
          {items.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-5 text-center">
              <Database className="mx-auto h-5 w-5 text-muted-foreground/40 mb-2" />
              <p className="text-xs font-medium text-foreground">No context items</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Add variables, entities, and states that this flow uses
              </p>
            </div>
          )}

          {nonEntityItems.length > 0 && (
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1 mb-1.5">
                Variables & States
              </p>
              <div className="space-y-1">
                {nonEntityItems.map((item) => {
                  const cfg = CATEGORY_CONFIG[item.category];
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={item.id}
                      className="group flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5 hover:border-primary/30 transition-colors"
                    >
                      <GripVertical className="h-3 w-3 text-muted-foreground/30" />
                      <div
                        className="flex h-4.5 w-4.5 items-center justify-center rounded"
                        style={{ background: `${cfg.color}20` }}
                      >
                        <Icon className="h-2.5 w-2.5" style={{ color: cfg.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Input
                          value={item.name}
                          onChange={(e) => updateItem(item.id, { name: e.target.value })}
                          className="h-5 border-none bg-transparent p-0 text-[11px] font-mono font-medium focus-visible:ring-0"
                        />
                      </div>
                      <Select
                        value={item.category}
                        onValueChange={(v) => updateItem(item.id, { category: v as ContextItem["category"] })}
                      >
                        <SelectTrigger className="h-5 w-14 border-none bg-transparent p-0 text-[9px] text-muted-foreground focus:ring-0 [&>svg]:h-2 [&>svg]:w-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CATEGORY_CONFIG).map(([key, c]) => (
                            <SelectItem key={key} value={key} className="text-xs">
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="rounded p-0.5 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
                      >
                        <Trash2 className="h-2.5 w-2.5 text-destructive/70" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Entities section — XP entity surface */}
          {entityItems.length > 0 && (
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-xp-context/60 px-1 mb-1.5">
                Entities
              </p>
              <div className="space-y-1">
                {entityItems.map((item) => {
                  const cfg = CATEGORY_CONFIG[item.category];
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={item.id}
                      className="group flex items-center gap-2 rounded-lg border border-xp-context/15 bg-xp-context/5 px-2 py-1.5 hover:border-xp-context/30 transition-colors"
                    >
                      <GripVertical className="h-3 w-3 text-muted-foreground/30" />
                      <div className="flex h-4.5 w-4.5 items-center justify-center rounded bg-xp-context/10">
                        <Icon className="h-2.5 w-2.5 text-xp-context" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Input
                          value={item.name}
                          onChange={(e) => updateItem(item.id, { name: e.target.value })}
                          className="h-5 border-none bg-transparent p-0 text-[11px] font-mono font-medium focus-visible:ring-0"
                        />
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="rounded p-0.5 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
                      >
                        <Trash2 className="h-2.5 w-2.5 text-destructive/70" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Entity layer placeholder — anticipating Codex entities */}
          <div className="rounded-lg border border-dashed border-xp-context/20 bg-xp-context/3 p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Hexagon className="h-3.5 w-3.5 text-xp-context/50" />
              <span className="text-[10px] font-bold text-xp-context/70 uppercase tracking-wider">
                Shared Entities
              </span>
              <Badge variant="outline" className="ml-auto text-[8px] border-xp-context/20 text-xp-context/50 px-1.5 py-0">
                Soon
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
              Shared entities defined at the experience level will appear here, enabling cross-flow context reuse.
            </p>
          </div>
        </div>

        {/* Suggestions */}
        {unusedSuggestions.length > 0 && (
          <div className="border-t border-border p-3">
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Suggestions
            </p>
            <div className="flex flex-wrap gap-1">
              {unusedSuggestions.map((s) => (
                <button
                  key={s.name}
                  onClick={() => addSuggested(s.name, s.category)}
                  className="rounded-md border border-dashed border-border px-2 py-0.5 text-[10px] text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
                >
                  + {s.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
