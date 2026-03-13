import { useState } from "react";
import { Plus, Hexagon, Trash2, Search, BrainCircuit, User, CreditCard, UserCheck, ShieldCheck, Smartphone, FileText, Package, Pencil, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useExperienceEntities, ExperienceEntity } from "@/hooks/useExperienceEntities";
import { toast } from "sonner";

const ENTITY_TYPES = [
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

function EntityCard({ entity, onUpdate, onDelete }: {
  entity: ExperienceEntity;
  onUpdate: (id: string, updates: Partial<ExperienceEntity>) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(entity.name);
  const [editDesc, setEditDesc] = useState(entity.description || "");
  const [editType, setEditType] = useState(entity.entity_type);

  const typeInfo = ENTITY_TYPE_MAP[entity.entity_type] || ENTITY_TYPE_MAP["custom"];
  const Icon = typeInfo.icon;

  const handleSave = () => {
    onUpdate(entity.id, { name: editName, description: editDesc || null, entity_type: editType });
    setEditing(false);
  };

  const schemaFields = Object.keys(entity.data_schema || {});

  return (
    <Card className="group border-xp-context/15 hover:border-xp-context/30 transition-all hover:shadow-md">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-xp-context/10 shrink-0">
            <Icon className="h-5 w-5 text-xp-context" />
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-2">
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-7 text-sm font-semibold" autoFocus />
                <Select value={editType} onValueChange={setEditType}>
                  <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ENTITY_TYPES.map((t) => <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Description..." className="text-xs min-h-[60px]" />
                <div className="flex gap-1.5">
                  <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setEditing(false)}><X className="h-3 w-3 mr-1" />Cancel</Button>
                  <Button size="sm" className="h-6 text-xs" onClick={handleSave}><Check className="h-3 w-3 mr-1" />Save</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground truncate">{entity.name}</h3>
                  <Badge variant="outline" className="text-[9px] border-xp-context/20 text-xp-context shrink-0">{typeInfo.label}</Badge>
                </div>
                {entity.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{entity.description}</p>
                )}
              </>
            )}
          </div>
          {!editing && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button onClick={() => setEditing(true)} className="rounded p-1 hover:bg-muted"><Pencil className="h-3 w-3 text-muted-foreground" /></button>
              <button onClick={() => onDelete(entity.id)} className="rounded p-1 hover:bg-destructive/10"><Trash2 className="h-3 w-3 text-destructive/70" /></button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        {schemaFields.length > 0 ? (
          <div className="flex flex-wrap gap-1 mt-2">
            {schemaFields.map((f) => (
              <Badge key={f} variant="secondary" className="text-[10px] font-mono">{f}</Badge>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-muted-foreground/50 mt-2 italic">No schema fields defined</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function ContextBoardPage() {
  const { entities, isLoading, createEntity, updateEntity, deleteEntity } = useExperienceEntities();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("custom");
  const [newDesc, setNewDesc] = useState("");

  const filtered = entities.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.entity_type.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (!newName.trim()) return;
    createEntity.mutate(
      { name: newName.trim(), entity_type: newType, description: newDesc || undefined },
      {
        onSuccess: () => {
          toast.success(`Entity "${newName}" created`);
          setNewName("");
          setNewDesc("");
          setNewType("custom");
          setShowCreate(false);
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleUpdate = (id: string, updates: Partial<ExperienceEntity>) => {
    updateEntity.mutate({ id, ...updates }, {
      onSuccess: () => toast.success("Entity updated"),
      onError: (err) => toast.error(err.message),
    });
  };

  const handleDelete = (id: string) => {
    deleteEntity.mutate(id, {
      onSuccess: () => toast.success("Entity deleted"),
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-xp-context/10">
            <BrainCircuit className="h-5 w-5 text-xp-context" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Context Board</h1>
            <p className="text-sm text-muted-foreground">
              Shared business entities across your experiences and flows
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} size="sm" className="bg-xp-context hover:bg-xp-context/90">
          <Plus className="mr-1.5 h-4 w-4" /> New Entity
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <Card className="border-xp-context/20 bg-xp-context/5">
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Entity name..." className="text-sm" autoFocus onKeyDown={(e) => e.key === "Enter" && handleCreate()} />
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ENTITY_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description (optional)" className="text-sm" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button size="sm" onClick={handleCreate} disabled={!newName.trim() || createEntity.isPending}>Create Entity</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search entities..." className="pl-9 text-sm" />
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span><strong className="text-foreground">{entities.length}</strong> entities</span>
        {Object.entries(
          entities.reduce((acc, e) => { acc[e.entity_type] = (acc[e.entity_type] || 0) + 1; return acc; }, {} as Record<string, number>)
        ).map(([type, count]) => (
          <span key={type}>{ENTITY_TYPE_MAP[type]?.label || type}: <strong className="text-foreground">{count}</strong></span>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-32 animate-pulse bg-muted/50" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Hexagon className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-foreground">{search ? "No matching entities" : "No entities yet"}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search ? "Try a different search term" : "Create your first business entity to build shared context"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((entity) => (
            <EntityCard key={entity.id} entity={entity} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
