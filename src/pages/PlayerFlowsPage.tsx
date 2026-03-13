/**
 * PlayerFlowsPage — Gallery of saved player flows per tenant.
 * Tabs: All / Stable / Sandbox / Production.
 * Clone stable → sandbox, open in player, create new.
 */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Copy, Trash2, Play, Upload, FileJson, Pencil,
  Shield, FlaskConical, Rocket, LayoutGrid, GitBranch, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useSavedPlayerFlows, type SavedPlayerFlow, type FlowStatus } from "@/hooks/useSavedPlayerFlows";
import { FlowContextSelector } from "@/components/player/FlowContextSelector";
import { FlowCreationWizard } from "@/components/player/FlowCreationWizard";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { toast } from "sonner";

const STATUS_META: Record<FlowStatus, { label: string; icon: typeof Shield; color: string }> = {
  stable: { label: "Stable", icon: Shield, color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" },
  sandbox: { label: "Sandbox", icon: FlaskConical, color: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
  production: { label: "Production", icon: Rocket, color: "bg-primary/10 text-primary border-primary/30" },
};

const MODE_LABELS: Record<string, string> = {
  libre: "Libre",
  "subventionné": "Subventionné",
  "zero-rated": "Zero-Rated",
};

export default function PlayerFlowsPage() {
  const navigate = useNavigate();
  const { tenantId } = useWorkspace();
  const {
    flows, isLoading, saveFlow, cloneFlow,
    deleteFlow, updateFlowStatus, updateFlowName,
  } = useSavedPlayerFlows();

  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [cloneTarget, setCloneTarget] = useState<SavedPlayerFlow | null>(null);
  const [cloneName, setCloneName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<SavedPlayerFlow | null>(null);
  const [renameTarget, setRenameTarget] = useState<SavedPlayerFlow | null>(null);
  const [renameName, setRenameName] = useState("");
  const [statusTarget, setStatusTarget] = useState<SavedPlayerFlow | null>(null);
  const [newStatus, setNewStatus] = useState<FlowStatus>("sandbox");

  const filtered = flows.filter((f) => {
    if (tab !== "all" && f.status !== tab) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all: flows.length,
    stable: flows.filter((f) => f.status === "stable").length,
    sandbox: flows.filter((f) => f.status === "sandbox").length,
    production: flows.filter((f) => f.status === "production").length,
  };

  const handleCreate = useCallback(async () => {
    if (!createName.trim()) return;
    setIsCreating(true);
    const id = await saveFlow(createName.trim(), createDesc.trim(), [], "libre", "sandbox");
    setIsCreating(false);
    if (id) {
      toast.success(`Flujo "${createName}" creado`);
      setShowCreate(false);
      setCreateName("");
      setCreateDesc("");
      navigate(`/player/live?flow=${id}`);
    } else {
      toast.error("Error al crear el flujo");
    }
  }, [createName, createDesc, saveFlow, navigate]);

  const handleClone = useCallback(async () => {
    if (!cloneTarget || !cloneName.trim()) return;
    const id = await cloneFlow(cloneTarget.id, cloneName.trim());
    if (id) {
      toast.success(`Clonado como "${cloneName}" (Sandbox)`);
      setCloneTarget(null);
    } else {
      toast.error("Error al clonar");
    }
  }, [cloneTarget, cloneName, cloneFlow]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteFlow(deleteTarget.id);
    toast.success(`"${deleteTarget.name}" eliminado`);
    setDeleteTarget(null);
  }, [deleteTarget, deleteFlow]);

  const handleRename = useCallback(async () => {
    if (!renameTarget || !renameName.trim()) return;
    await updateFlowName(renameTarget.id, renameName.trim());
    toast.success("Nombre actualizado");
    setRenameTarget(null);
  }, [renameTarget, renameName, updateFlowName]);

  const handleStatusChange = useCallback(async () => {
    if (!statusTarget) return;
    await updateFlowStatus(statusTarget.id, newStatus);
    toast.success(`Estado cambiado a ${STATUS_META[newStatus].label}`);
    setStatusTarget(null);
  }, [statusTarget, newStatus, updateFlowStatus]);

  const openInPlayer = (flowId: string) => navigate(`/player/live?flow=${flowId}`);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Waka XP Player
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Flujos conversacionales IA guardados · Gestión de ciclo de vida
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/player/live")} className="gap-1.5 text-xs">
            <Play className="h-3.5 w-3.5" />
            Player libre
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1.5 text-xs">
            <Sparkles className="h-3.5 w-3.5" />
            Crear flujo
          </Button>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="px-6 pt-4">
        <Tabs value={tab} onValueChange={setTab}>
          <div className="flex items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="all" className="text-xs gap-1">
                <LayoutGrid className="h-3 w-3" /> Todos ({counts.all})
              </TabsTrigger>
              <TabsTrigger value="stable" className="text-xs gap-1">
                <Shield className="h-3 w-3" /> Stable ({counts.stable})
              </TabsTrigger>
              <TabsTrigger value="sandbox" className="text-xs gap-1">
                <FlaskConical className="h-3 w-3" /> Sandbox ({counts.sandbox})
              </TabsTrigger>
              <TabsTrigger value="production" className="text-xs gap-1">
                <Rocket className="h-3 w-3" /> Production ({counts.production})
              </TabsTrigger>
            </TabsList>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar flujos..."
              className="max-w-[220px] h-8 text-xs"
            />
          </div>

          {/* Flow Cards */}
          <TabsContent value={tab} className="mt-4">
            <ScrollArea className="h-[calc(100vh-240px)]">
              {isLoading ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
                  Cargando flujos...
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                  <FileJson className="h-12 w-12 opacity-20" />
                  <p className="text-sm font-medium">
                    {flows.length === 0 ? "No hay flujos guardados aún" : "Sin resultados"}
                  </p>
                  <p className="text-xs opacity-60">
                    Crea un nuevo flujo o abre el Player para iniciar una conversación
                  </p>
                  <Button size="sm" onClick={() => setShowCreate(true)} className="mt-2 gap-1.5">
                    <Plus className="h-3.5 w-3.5" /> Crear primer flujo
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
                  {filtered.map((flow) => {
                    const meta = STATUS_META[flow.status];
                    const StatusIcon = meta.icon;
                    return (
                      <Card
                        key={flow.id}
                        className="group hover:shadow-md transition-shadow cursor-pointer border-border/60"
                        onClick={() => openInPlayer(flow.id)}
                      >
                        <CardContent className="p-4 space-y-3">
                          {/* Top row */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold text-foreground truncate">
                                {flow.name}
                              </h3>
                              {flow.description && (
                                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                                  {flow.description}
                                </p>
                              )}
                            </div>
                            <Badge variant="outline" className={cn("text-[9px] shrink-0", meta.color)}>
                              <StatusIcon className="h-2.5 w-2.5 mr-0.5" />
                              {meta.label}
                            </Badge>
                          </div>

                          {/* Metadata */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="text-[9px]">
                              {flow.messageCount} msgs
                            </Badge>
                            <Badge variant="secondary" className="text-[9px]">
                              {MODE_LABELS[flow.dataMode] || flow.dataMode}
                            </Badge>
                            {flow.sourceName && (
                              <Badge variant="outline" className="text-[9px] gap-0.5">
                                <Copy className="h-2 w-2" />
                                {flow.sourceName.length > 18 ? flow.sourceName.slice(0, 18) + "…" : flow.sourceName}
                              </Badge>
                            )}
                          </div>

                          {/* Date */}
                          <p className="text-[10px] text-muted-foreground">
                            Actualizado: {new Date(flow.updatedAt).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>

                          {/* Actions */}
                          <div className="flex items-center gap-1 pt-1 border-t border-border/40" onClick={(e) => e.stopPropagation()}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openInPlayer(flow.id)}>
                                  <Play className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p className="text-xs">Abrir en Player</p></TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost" size="sm" className="h-7 w-7 p-0"
                                  onClick={() => { setCloneTarget(flow); setCloneName(`${flow.name} (copia)`); }}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p className="text-xs">Clonar como Sandbox</p></TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost" size="sm" className="h-7 w-7 p-0"
                                  onClick={() => { setRenameTarget(flow); setRenameName(flow.name); }}
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p className="text-xs">Renombrar</p></TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost" size="sm" className="h-7 w-7 p-0"
                                  onClick={() => { setStatusTarget(flow); setNewStatus(flow.status); }}
                                >
                                  <Upload className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p className="text-xs">Cambiar estado</p></TooltipContent>
                            </Tooltip>

                            <div className="ml-auto">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost" size="sm"
                                    className="h-7 w-7 p-0 text-destructive/60 hover:text-destructive"
                                    onClick={() => setDeleteTarget(flow)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent><p className="text-xs">Eliminar</p></TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Flow Creation Wizard */}
      {tenantId && (
        <FlowCreationWizard
          open={showCreate}
          onClose={() => setShowCreate(false)}
          onCreated={(flowId) => navigate(`/player/live?flow=${flowId}`)}
          tenantId={tenantId}
        />
      )}

      {/* Clone Dialog */}
      <Dialog open={!!cloneTarget} onOpenChange={(o) => !o && setCloneTarget(null)}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <Copy className="h-4 w-4 text-primary" />
              Clonar flujo como Sandbox
            </DialogTitle>
          </DialogHeader>
          <Input
            value={cloneName}
            onChange={(e) => setCloneName(e.target.value)}
            placeholder="Nombre del clon..."
            className="text-sm"
          />
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCloneTarget(null)}>Cancelar</Button>
            <Button size="sm" onClick={handleClone} disabled={!cloneName.trim()}>Clonar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={!!renameTarget} onOpenChange={(o) => !o && setRenameTarget(null)}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="text-sm">Renombrar flujo</DialogTitle>
          </DialogHeader>
          <Input
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            className="text-sm"
          />
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setRenameTarget(null)}>Cancelar</Button>
            <Button size="sm" onClick={handleRename} disabled={!renameName.trim()}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={!!statusTarget} onOpenChange={(o) => !o && setStatusTarget(null)}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle className="text-sm">Cambiar estado</DialogTitle>
          </DialogHeader>
          <Select value={newStatus} onValueChange={(v) => setNewStatus(v as FlowStatus)}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stable">🛡️ Stable</SelectItem>
              <SelectItem value="sandbox">🧪 Sandbox</SelectItem>
              <SelectItem value="production">🚀 Production</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setStatusTarget(null)}>Cancelar</Button>
            <Button size="sm" onClick={handleStatusChange}>Aplicar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el flujo y su historial de conversación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
