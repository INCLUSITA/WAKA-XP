import { useState } from "react";
import { X, Plus, Trash2, Database, User, ToggleLeft, ExternalLink, GripVertical, BrainCircuit, Hexagon, Sparkles, Package, CreditCard, ShieldCheck, Smartphone, UserCheck, FileText, ChevronDown, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  entityType?: string;
}

interface FlowContextPanelProps {
  items: ContextItem[];
  onChange: (items: ContextItem[]) => void;
  onClose: () => void;
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: typeof Database; color: string }> = {
  field: { label: "Field", icon: Database, color: "hsl(var(--node-wait))" },
  entity: { label: "Entity", icon: Hexagon, color: "hsl(var(--xp-context))" },
  state: { label: "State", icon: ToggleLeft, color: "hsl(var(--node-split))" },
  external: { label: "External", icon: ExternalLink, color: "hsl(var(--node-webhook))" },
};

const ENTITY_TYPES: { value: string; label: string; icon: typeof User }[] = [
  { value: "customer", label: "Customer", icon: User },
  { value: "loan", label: "Loan", icon: CreditCard },
  { value: "payment", label: "Payment", icon: CreditCard },
  { value: "identity", label: "Identity", icon: UserCheck },
  { value: "eligibility", label: "Eligibility", icon: ShieldCheck },
  { value: "device", label: "Device", icon: Smartphone },
  { value: "case", label: "Case", icon: FileText },
  { value: "merchant", label: "Merchant", icon: Package },
  { value: "custom", label: "Custom", icon: Hexagon },
];

const ENTITY_TYPE_MAP = Object.fromEntries(ENTITY_TYPES.map((t) => [t.value, t]));

const SUGGESTED_ITEMS: { name: string; category: ContextItem["category"] }[] = [
  { name: "client_id", category: "field" },
  { name: "phone", category: "field" },
  { name: "language", category: "field" },
  { name: "eligibility_status", category: "state" },
  { name: "retry_count", category: "state" },
];

const SUGGESTED_ENTITIES: { name: string; entityType: string }[] = [
  { name: "customer", entityType: "customer" },
  { name: "loan", entityType: "loan" },
  { name: "payment", entityType: "payment" },
];

export function FlowContextPanel({ items, onChange, onClose }: FlowContextPanelProps) {
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<ContextItem["category"]>("field");
  const [newEntityName, setNewEntityName] = useState("");
  const [newEntityType, setNewEntityType] = useState("custom");
  const [entitiesOpen, setEntitiesOpen] = useState(true);
  const [contextsOpen, setContextsOpen] = useState(true);

  const addItem = () => {
    if (!newName.trim()) return;
    const item: ContextItem = {
      id: uuidv4(),
      name: newName.trim(),
      category: newCategory,
      entityType: newCategory === "entity" ? "custom" : undefined,
    };
    onChange([...items, item]);
    setNewName("");
  };

  const addEntity = (name: string, entityType: string) => {
    if (items.some((i) => i.name === name && i.category === "entity")) return;
    onChange([...items, { id: uuidv4(), name, category: "entity" as const, entityType }]);
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

  const unusedEntitySuggestions = SUGGESTED_ENTITIES.filter(
    (s) => !items.some((i) => i.name === s.name && i.category === "entity")
  );

  const entityItems = items.filter((i) => i.category === "entity");
  const nonEntityItems = items.filter((i) => i.category !== "entity");

  return (
    <div className="absolute left-0 top-0 z-20 flex h-full w-80 flex-col border-r border-border bg-card shadow-xl">
      {/* Header */}
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

      {/* Add variable form — only for non-entity items */}
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
              {Object.entries(CATEGORY_CONFIG).filter(([k]) => k !== "entity").map(([key, cfg]) => (
                <SelectItem key={key} value={key} className="text-xs">
                  {cfg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={addItem} disabled={!newName.trim()} className="w-full h-7 text-xs">
          <Plus className="mr-1 h-3 w-3" /> Add Variable
        </Button>
      </div>

      {/* Items list */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {/* Global empty state */}
          {items.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-5 text-center">
              <Database className="mx-auto h-5 w-5 text-muted-foreground/40 mb-2" />
              <p className="text-xs font-medium text-foreground">No context items</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Add variables, states, and entities that this flow uses
              </p>
            </div>
          )}

          {/* ─── ENTITIES SECTION ─── */}
          <Collapsible open={entitiesOpen} onOpenChange={setEntitiesOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex w-full items-center gap-1.5 rounded-md px-1 py-1 text-[9px] hover:bg-xp-context/5 transition-colors group">
                {entitiesOpen ? <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" /> : <ChevronRight className="h-2.5 w-2.5 text-muted-foreground" />}
                <Hexagon className="h-3 w-3 text-xp-context" />
                <span className="font-bold uppercase tracking-widest text-xp-context/80">Entities</span>
                {entityItems.length > 0 && (
                  <span className="ml-1 rounded-full bg-xp-context/10 px-1.5 py-px text-[9px] font-semibold text-xp-context">
                    {entityItems.length}
                  </span>
                )}
                <span className="ml-auto text-[8px] text-xp-context/40 font-medium group-hover:text-xp-context/60 transition-colors">
                  Structured
                </span>
              </button>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="mt-1 space-y-1.5">
                {/* Inline entity creation */}
                <div className="flex gap-1.5 px-1">
                  <Input
                    value={newEntityName}
                    onChange={(e) => setNewEntityName(e.target.value)}
                    placeholder="New entity name..."
                    className="h-6 text-[11px] flex-1 border-xp-context/20 bg-xp-context/5 focus-visible:ring-xp-context/30"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newEntityName.trim()) {
                        addEntity(newEntityName.trim(), newEntityType);
                        setNewEntityName("");
                      }
                    }}
                  />
                  <Select value={newEntityType} onValueChange={setNewEntityType}>
                    <SelectTrigger className="h-6 w-[90px] text-[10px] border-xp-context/20 bg-xp-context/5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ENTITY_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value} className="text-xs">
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (newEntityName.trim()) {
                        addEntity(newEntityName.trim(), newEntityType);
                        setNewEntityName("");
                      }
                    }}
                    disabled={!newEntityName.trim()}
                    className="h-6 w-6 p-0 text-xp-context hover:bg-xp-context/10"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                {/* Quick-add suggestions */}
                {unusedEntitySuggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1 px-1">
                    {unusedEntitySuggestions.map((s) => {
                      const typeInfo = ENTITY_TYPE_MAP[s.entityType];
                      const Icon = typeInfo?.icon || Hexagon;
                      return (
                        <button
                          key={s.name}
                          onClick={() => addEntity(s.name, s.entityType)}
                          className="inline-flex items-center gap-1 rounded-md border border-dashed border-xp-context/20 px-1.5 py-0.5 text-[9px] text-xp-context/60 hover:border-xp-context/40 hover:text-xp-context hover:bg-xp-context/5 transition-colors"
                        >
                          <Icon className="h-2.5 w-2.5" />
                          + {s.name}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Entity empty hint */}
                {entityItems.length === 0 && (
                  <div className="rounded-md border border-dashed border-xp-context/10 bg-xp-context/3 px-2.5 py-2 text-center">
                    <p className="text-[9px] text-muted-foreground/50 leading-relaxed">
                      Entities are structured reusable concepts — like a customer, loan, or payment — shared across the experience.
                    </p>
                  </div>
                )}

                {/* Entity cards */}
                {entityItems.map((item) => {
                  const typeInfo = ENTITY_TYPE_MAP[item.entityType || "custom"] || ENTITY_TYPE_MAP["custom"];
                  const Icon = typeInfo.icon;
                  return (
                    <div
                      key={item.id}
                      className="group rounded-lg border border-xp-context/15 bg-xp-context/5 hover:border-xp-context/30 transition-colors"
                    >
                      {/* Entity card header */}
                      <div className="flex items-center gap-2 px-2.5 py-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-xp-context/10 shrink-0">
                          <Icon className="h-3 w-3 text-xp-context" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Input
                            value={item.name}
                            onChange={(e) => updateItem(item.id, { name: e.target.value })}
                            className="h-5 border-none bg-transparent p-0 text-[12px] font-mono font-semibold text-foreground focus-visible:ring-0"
                          />
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Select
                              value={item.entityType || "custom"}
                              onValueChange={(v) => updateItem(item.id, { entityType: v })}
                            >
                              <SelectTrigger className="h-4 w-auto border-none bg-transparent p-0 text-[9px] text-xp-context/60 focus:ring-0 gap-0.5 [&>svg]:h-2 [&>svg]:w-2">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ENTITY_TYPES.map((t) => (
                                  <SelectItem key={t.value} value={t.value} className="text-xs">
                                    {t.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <span className="text-[8px] text-muted-foreground/40">·</span>
                            <span className="text-[8px] text-xp-context/40 font-medium">XP Entity</span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="rounded p-0.5 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all shrink-0"
                        >
                          <Trash2 className="h-2.5 w-2.5 text-destructive/70" />
                        </button>
                      </div>

                      {/* Entity description */}
                      <div className="px-2.5 pb-2">
                        <Input
                          value={item.description || ""}
                          onChange={(e) => updateItem(item.id, { description: e.target.value })}
                          placeholder="Brief description..."
                          className="h-5 border-none bg-xp-context/5 rounded px-1.5 text-[10px] text-muted-foreground placeholder:text-muted-foreground/40 focus-visible:ring-1 focus-visible:ring-xp-context/20"
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Shared entities hint — only when entities exist */}
                {entityItems.length > 0 && (
                  <div className="flex items-center gap-1.5 px-1 py-1">
                    <Sparkles className="h-2.5 w-2.5 text-xp-context/25" />
                    <span className="text-[8px] text-xp-context/35 font-medium">
                      Experience-level sync coming soon
                    </span>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* ─── VARIABLES & STATES SECTION ─── */}
          <Collapsible open={contextsOpen} onOpenChange={setContextsOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex w-full items-center gap-1.5 rounded-md px-1 py-1 text-[9px] hover:bg-muted/40 transition-colors group">
                {contextsOpen ? <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" /> : <ChevronRight className="h-2.5 w-2.5 text-muted-foreground" />}
                <Database className="h-3 w-3 text-muted-foreground" />
                <span className="font-bold uppercase tracking-widest text-muted-foreground/60">Variables & States</span>
                {nonEntityItems.length > 0 && (
                  <span className="ml-1 rounded-full bg-muted px-1.5 py-px text-[9px] font-semibold text-muted-foreground">
                    {nonEntityItems.length}
                  </span>
                )}
                <span className="ml-auto text-[8px] text-muted-foreground/40 font-medium group-hover:text-muted-foreground/60 transition-colors">
                  Flow-local
                </span>
              </button>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="mt-1 space-y-1">
                {nonEntityItems.length === 0 && (
                  <div className="rounded-md border border-dashed border-border px-3 py-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground/50">
                      No variables or states defined
                    </p>
                  </div>
                )}

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
                          {Object.entries(CATEGORY_CONFIG).filter(([k]) => k !== "entity").map(([key, c]) => (
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

                {/* Suggestions */}
                {unusedSuggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1 px-1 pt-1">
                    {unusedSuggestions.map((s) => (
                      <button
                        key={s.name}
                        onClick={() => addSuggested(s.name, s.category)}
                        className="rounded border border-dashed border-border px-1.5 py-0.5 text-[9px] text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
                      >
                        + {s.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>
    </div>
  );
}
