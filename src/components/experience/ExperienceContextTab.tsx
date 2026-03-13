import { useState, useEffect } from "react";
import { Plus, Trash2, BrainCircuit, Pencil, X, Check, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useExperienceEntities, ExperienceEntity } from "@/hooks/useExperienceEntities";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { toast } from "sonner";

const ENTITY_TYPES = [
  { value: "string", label: "String" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "customer", label: "Customer" },
  { value: "loan", label: "Loan" },
  { value: "payment", label: "Payment" },
  { value: "identity", label: "Identity" },
  { value: "eligibility", label: "Eligibility" },
  { value: "device", label: "Device" },
  { value: "case", label: "Case" },
  { value: "merchant", label: "Merchant" },
  { value: "custom", label: "Custom" },
];

const TYPE_LABEL_MAP = Object.fromEntries(ENTITY_TYPES.map((t) => [t.value, t.label]));

interface Props {
  experienceId: string;
}

/** Returns flows that reference a variable name via @context.<name> */
function useFlowUsage(experienceId: string, entityNames: string[]) {
  const { tenantId } = useWorkspace();
  const [usage, setUsage] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!tenantId || entityNames.length === 0) return;
    (async () => {
      const { data: flows } = await supabase
        .from("flows")
        .select("id, name, nodes")
        .eq("tenant_id", tenantId)
        .eq("experience_id", experienceId);

      if (!flows) return;

      const result: Record<string, string[]> = {};
      for (const name of entityNames) {
        const pattern = `@context.${name}`;
        const matches = flows.filter((f) => JSON.stringify(f.nodes).includes(pattern));
        if (matches.length > 0) result[name] = matches.map((f) => f.name);
      }
      setUsage(result);
    })();
  }, [tenantId, experienceId, entityNames.join(",")]);

  return usage;
}

export function ExperienceContextTab({ experienceId }: Props) {
  const { entities, createEntity, updateEntity, deleteEntity, isLoading } = useExperienceEntities(experienceId);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("string");
  const [newDesc, setNewDesc] = useState("");
  const [newDefault, setNewDefault] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDefault, setEditDefault] = useState("");

  const entityNames = entities.map((e) => e.name);
  const flowUsage = useFlowUsage(experienceId, entityNames);

  const getDefault = (e: ExperienceEntity) => {
    const schema = e.data_schema as Record<string, unknown> | null;
    return schema?.default_value != null ? String(schema.default_value) : "";
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    const data_schema: Record<string, unknown> = {};
    if (newDefault) data_schema.default_value = newDefault;
    createEntity.mutate(
      { name: newName.trim(), entity_type: newType, description: newDesc || undefined, experience_id: experienceId, data_schema },
      {
        onSuccess: () => {
          toast.success(`Variable "${newName}" created`);
          setNewName(""); setNewDesc(""); setNewType("string"); setNewDefault(""); setShowAdd(false);
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const startEdit = (e: ExperienceEntity) => {
    setEditingId(e.id);
    setEditName(e.name);
    setEditType(e.entity_type);
    setEditDesc(e.description || "");
    setEditDefault(getDefault(e));
  };

  const saveEdit = () => {
    if (!editingId || !editName.trim()) return;
    const data_schema: Record<string, unknown> = {};
    if (editDefault) data_schema.default_value = editDefault;
    updateEntity.mutate(
      { id: editingId, name: editName.trim(), entity_type: editType, description: editDesc || null, data_schema },
      {
        onSuccess: () => { toast.success("Updated"); setEditingId(null); },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleDelete = (id: string, name: string) => {
    deleteEntity.mutate(id, {
      onSuccess: () => toast.success(`"${name}" deleted`),
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Context Variables</p>
          <Badge variant="secondary" className="text-[10px]">{entities.length}</Badge>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(!showAdd)} className="text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10">
          <Plus className="h-3 w-3" /> Add variable
        </Button>
      </div>

      {showAdd && (
        <div className="flex gap-2 items-end rounded-xl border border-primary/20 bg-primary/5 p-3">
          <div className="flex-1 space-y-1">
            <label className="text-[10px] text-muted-foreground">Name</label>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. user_score" className="h-8 text-sm" autoFocus onKeyDown={(e) => e.key === "Enter" && handleCreate()} />
          </div>
          <div className="w-28 space-y-1">
            <label className="text-[10px] text-muted-foreground">Type</label>
            <Select value={newType} onValueChange={setNewType}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ENTITY_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-28 space-y-1">
            <label className="text-[10px] text-muted-foreground">Default</label>
            <Input value={newDefault} onChange={(e) => setNewDefault(e.target.value)} placeholder="Optional" className="h-8 text-sm" />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-[10px] text-muted-foreground">Description</label>
            <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Optional..." className="h-8 text-sm" />
          </div>
          <Button size="sm" onClick={handleCreate} disabled={!newName.trim() || createEntity.isPending} className="h-8">Create</Button>
          <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)} className="h-8"><X className="h-3 w-3" /></Button>
        </div>
      )}

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-[10px] uppercase tracking-wider w-[25%]">Name</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider w-[12%]">Type</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider w-[15%]">Default</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider">Description</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider w-[15%]">Used in</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">Loading...</TableCell>
              </TableRow>
            ) : entities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <BrainCircuit className="h-8 w-8 mx-auto text-muted-foreground/20 mb-2" />
                  <p className="text-sm text-muted-foreground">No context variables defined</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">These variables will be available via @context in your flows</p>
                </TableCell>
              </TableRow>
            ) : (
              entities.map((entity) => (
                <TableRow key={entity.id} className="group">
                  {editingId === entity.id ? (
                    <>
                      <TableCell><Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-7 text-sm" autoFocus /></TableCell>
                      <TableCell>
                        <Select value={editType} onValueChange={setEditType}>
                          <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {ENTITY_TYPES.map((t) => <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell><Input value={editDefault} onChange={(e) => setEditDefault(e.target.value)} className="h-7 text-sm" placeholder="—" /></TableCell>
                      <TableCell><Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="h-7 text-sm" /></TableCell>
                      <TableCell />
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => setEditingId(null)} className="p-1 rounded hover:bg-muted"><X className="h-3 w-3" /></button>
                          <button onClick={saveEdit} className="p-1 rounded hover:bg-primary/10"><Check className="h-3 w-3 text-primary" /></button>
                        </div>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="font-mono text-sm font-medium">{entity.name}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{TYPE_LABEL_MAP[entity.entity_type] || entity.entity_type}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono">{getDefault(entity) || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{entity.description || "—"}</TableCell>
                      <TableCell>
                        {flowUsage[entity.name]?.length > 0 ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 text-xs text-primary cursor-help">
                                  <GitBranch className="h-3 w-3" />
                                  <span>{flowUsage[entity.name].length} flow{flowUsage[entity.name].length > 1 ? "s" : ""}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="bottom" className="text-xs">
                                {flowUsage[entity.name].map((name, i) => <div key={i}>{name}</div>)}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/40">Unused</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEdit(entity)} className="p-1 rounded hover:bg-muted"><Pencil className="h-3 w-3 text-muted-foreground" /></button>
                          <button onClick={() => handleDelete(entity.id, entity.name)} className="p-1 rounded hover:bg-destructive/10"><Trash2 className="h-3 w-3 text-destructive/70" /></button>
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-[10px] text-muted-foreground/50 italic">
        💡 Context variables are accessible in flows via <code className="font-mono text-primary">@context.&lt;name&gt;</code>
      </p>
    </div>
  );
}
