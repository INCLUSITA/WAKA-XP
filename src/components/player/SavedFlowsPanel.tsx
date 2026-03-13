/**
 * Panel to list, manage, and load saved player flows.
 * Similar UX to demo management: status badges, clone, delete.
 */

import { useState } from "react";
import { useSavedPlayerFlows, type SavedPlayerFlow, type FlowStatus } from "@/hooks/useSavedPlayerFlows";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Play, Copy, Trash2, Search, MessageSquare, Shield, FlaskConical, Rocket, X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<FlowStatus, { label: string; icon: React.ReactNode; className: string }> = {
  stable: { label: "Stable", icon: <Shield className="h-3 w-3" />, className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  sandbox: { label: "Sandbox", icon: <FlaskConical className="h-3 w-3" />, className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  production: { label: "Production", icon: <Rocket className="h-3 w-3" />, className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
};

interface SavedFlowsPanelProps {
  onLoad: (flowId: string) => void;
  onClose: () => void;
  activeFlowId?: string | null;
}

export function SavedFlowsPanel({ onLoad, onClose, activeFlowId = null }: SavedFlowsPanelProps) {
  const { flows, isLoading, updateFlowStatus, deleteFlow, cloneFlow } = useSavedPlayerFlows();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FlowStatus | "all">("all");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = flows.filter((f) => {
    if (statusFilter !== "all" && f.status !== statusFilter) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleClone = async (flow: SavedPlayerFlow) => {
    const newId = await cloneFlow(flow.id, `${flow.name} (Sandbox)`);
    if (newId) toast.success("Flujo clonado como Sandbox");
  };

  const handleDelete = async (id: string) => {
    await deleteFlow(id);
    setConfirmDelete(null);
    toast.success("Flujo eliminado");
  };

  const handleStatusChange = async (flow: SavedPlayerFlow, status: FlowStatus) => {
    if (flow.status === "stable" && status !== "stable") {
      // Require confirmation for stable flows
      if (!window.confirm(`¿Cambiar "${flow.name}" de Stable a ${STATUS_CONFIG[status].label}?`)) return;
    }
    await updateFlowStatus(flow.id, status);
    toast.success(`Estado cambiado a ${STATUS_CONFIG[status].label}`);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">Flujos guardados</h2>
          <Badge variant="secondary" className="text-[9px]">{flows.length}</Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="h-7 pl-7 text-xs"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="h-7 w-[100px] text-[10px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">Todos</SelectItem>
            <SelectItem value="stable" className="text-xs">Stable</SelectItem>
            <SelectItem value="sandbox" className="text-xs">Sandbox</SelectItem>
            <SelectItem value="production" className="text-xs">Production</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-xs text-muted-foreground">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
            <MessageSquare className="h-8 w-8 opacity-30" />
            <p className="text-xs">No hay flujos guardados</p>
          </div>
        ) : (
          <div className="p-2 space-y-1.5">
            {filtered.map((flow) => {
              const sc = STATUS_CONFIG[flow.status];
              const isActive = activeFlowId === flow.id;

              return (
                <div
                  key={flow.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onLoad(flow.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onLoad(flow.id);
                    }
                  }}
                  className={cn(
                    "group rounded-lg border p-3 transition-colors cursor-pointer",
                    isActive
                      ? "border-primary/50 bg-primary/10"
                      : "border-border/50 bg-card/50 hover:bg-card"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs font-semibold text-foreground truncate">{flow.name}</span>
                        <Badge variant="outline" className={`text-[9px] gap-0.5 border ${sc.className}`}>
                          {sc.icon} {sc.label}
                        </Badge>
                        {isActive && (
                          <Badge variant="secondary" className="text-[9px]">Activo</Badge>
                        )}
                      </div>
                      {flow.description && (
                        <p className="text-[10px] text-muted-foreground truncate">{flow.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[9px] text-muted-foreground">{flow.messageCount} msgs</span>
                        <span className="text-[9px] text-muted-foreground">
                          {new Date(flow.updatedAt).toLocaleDateString()}
                        </span>
                        {flow.sourceName && (
                          <span className="text-[9px] text-muted-foreground/50">← {flow.sourceName}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          onLoad(flow.id);
                        }}
                        title="Cargar"
                      >
                        <Play className="h-3 w-3 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClone(flow);
                        }}
                        title="Clonar como Sandbox"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Select
                        value={flow.status}
                        onValueChange={(v) => handleStatusChange(flow, v as FlowStatus)}
                      >
                        <SelectTrigger
                          className="h-6 w-6 p-0 border-0 bg-transparent [&>svg]:hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {sc.icon}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sandbox" className="text-xs">Sandbox</SelectItem>
                          <SelectItem value="stable" className="text-xs">Stable</SelectItem>
                          <SelectItem value="production" className="text-xs">Production</SelectItem>
                        </SelectContent>
                      </Select>
                      {flow.status !== "stable" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive/60 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete(flow.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Delete confirmation */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar este flujo?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Esta acción no se puede deshacer.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => confirmDelete && handleDelete(confirmDelete)}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
