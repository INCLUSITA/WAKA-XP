import { useState } from "react";
import { X, Plus, Trash2, Database, User, ToggleLeft, ExternalLink, GripVertical } from "lucide-react";
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
  entity: { label: "Entity", icon: User, color: "hsl(var(--primary))" },
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

  return (
    <div className="absolute left-0 top-0 z-20 flex h-full w-80 flex-col border-r border-border bg-card shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Database className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-bold text-foreground">Flow Context</h2>
        <Badge variant="outline" className="ml-auto text-[10px]">
          {items.length} items
        </Badge>
        <button onClick={onClose} className="ml-1 rounded p-1 hover:bg-muted transition-colors">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Add form */}
      <div className="border-b border-border p-3 space-y-2">
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Variable name..."
            className="h-8 text-xs flex-1"
            onKeyDown={(e) => e.key === "Enter" && addItem()}
          />
          <Select value={newCategory} onValueChange={(v) => setNewCategory(v as ContextItem["category"])}>
            <SelectTrigger className="h-8 w-24 text-xs">
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
        <div className="p-3 space-y-1.5">
          {items.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-6 text-center">
              <Database className="mx-auto h-6 w-6 text-muted-foreground/40 mb-2" />
              <p className="text-xs font-medium text-foreground">No context items</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Add variables, entities, and states that this flow uses
              </p>
            </div>
          )}

          {items.map((item) => {
            const cfg = CATEGORY_CONFIG[item.category];
            const Icon = cfg.icon;
            return (
              <div
                key={item.id}
                className="group flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-2 hover:border-primary/30 transition-colors"
              >
                <GripVertical className="h-3 w-3 text-muted-foreground/30" />
                <div
                  className="flex h-5 w-5 items-center justify-center rounded"
                  style={{ background: `${cfg.color}20` }}
                >
                  <Icon className="h-3 w-3" style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <Input
                    value={item.name}
                    onChange={(e) => updateItem(item.id, { name: e.target.value })}
                    className="h-5 border-none bg-transparent p-0 text-xs font-mono font-medium focus-visible:ring-0"
                  />
                </div>
                <Select
                  value={item.category}
                  onValueChange={(v) => updateItem(item.id, { category: v as ContextItem["category"] })}
                >
                  <SelectTrigger className="h-5 w-16 border-none bg-transparent p-0 text-[10px] text-muted-foreground focus:ring-0 [&>svg]:h-2.5 [&>svg]:w-2.5">
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
                  <Trash2 className="h-3 w-3 text-destructive/70" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Suggestions */}
        {unusedSuggestions.length > 0 && (
          <div className="border-t border-border p-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Suggestions
            </p>
            <div className="flex flex-wrap gap-1">
              {unusedSuggestions.map((s) => (
                <button
                  key={s.name}
                  onClick={() => addSuggested(s.name, s.category)}
                  className="rounded-md border border-dashed border-border px-2 py-1 text-[10px] text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
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
