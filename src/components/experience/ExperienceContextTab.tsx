import { useState, useCallback, useEffect } from "react";
import { Plus, Trash2, BrainCircuit, Pencil, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useExperienceEntities, ExperienceEntity } from "@/hooks/useExperienceEntities";
import { toast } from "sonner";

const ENTITY_TYPES = [
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

export function ExperienceContextTab({ experienceId }: Props) {
  const { entities, createEntity, updateEntity, deleteEntity, isLoading } = useExperienceEntities(experienceId);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("custom");
  const [newDesc, setNewDesc] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const handleCreate = () => {
    if (!newName.trim()) return;
    createEntity.mutate(
      { name: newName.trim(), entity_type: newType, description: newDesc || undefined, experience_id: experienceId },
      {
        onSuccess: () => {
          toast.success(`Context variable "${newName}" created`);
          setNewName("");
          setNewDesc("");
          setNewType("custom");
          setShowAdd(false);
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
  };

  const saveEdit = () => {
    if (!editingId || !editName.trim()) return;
    updateEntity.mutate(
      { id: editingId, name: editName.trim(), entity_type: editType, description: editDesc || null },
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
          <BrainCircuit className="h-4 w-4 text-xp-context" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Context Variables</p>
          <Badge variant="secondary" className="text-[10px]">{entities.length}</Badge>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(!showAdd)} className="text-xs gap-1 border-xp-context/30 text-xp-context hover:bg-xp-context/10">
          <Plus className="h-3 w-3" /> Add variable
        </Button>
      </div>

      {showAdd && (
        <div className="flex gap-2 items-end rounded-lg border border-xp-context/20 bg-xp-context/5 p-3">
          <div className="flex-1 space-y-1">
            <label className="text-[10px] text-muted-foreground">Name</label>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. customer_id" className="h-8 text-sm" autoFocus onKeyDown={(e) => e.key === "Enter" && handleCreate()} />
          </div>
          <div className="w-36 space-y-1">
            <label className="text-[10px] text-muted-foreground">Type</label>
            <Select value={newType} onValueChange={setNewType}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ENTITY_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-[10px] text-muted-foreground">Description</label>
            <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Optional..." className="h-8 text-sm" />
          </div>
          <Button size="sm" onClick={handleCreate} disabled={!newName.trim() || createEntity.isPending} className="h-8">Create</Button>
          <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)} className="h-8"><X className="h-3 w-3" /></Button>
        </div>
      )}

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-[10px] uppercase tracking-wider w-[35%]">Name</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider w-[20%]">Type</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider">Description</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider w-[90px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">Loading...</TableCell>
              </TableRow>
            ) : entities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
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
                      <TableCell><Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="h-7 text-sm" /></TableCell>
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
                      <TableCell className="text-sm text-muted-foreground">{entity.description || "—"}</TableCell>
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
        💡 Context variables are accessible in flows via <code className="font-mono text-xp-context">@context.&lt;name&gt;</code>
      </p>
    </div>
  );
}
