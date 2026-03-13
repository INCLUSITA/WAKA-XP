/**
 * FlowContextSelector — Pick a flow from the DB or upload a TextIt JSON
 * to inject as AI conversation context in the player.
 */

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { GitBranch, Upload, Search, X, Check, FileJson } from "lucide-react";
import { textitFlowToContext, flowContextToPrompt } from "@/lib/textitFlowToContext";
import { toast } from "sonner";

interface FlowRecord {
  id: string;
  name: string;
  description: string | null;
  language: string;
  status: string;
  nodes: any;
  edges: any;
}

interface FlowContextSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (flowContext: string, flowName: string) => void;
  activeFlowName: string | null;
}

export function FlowContextSelector({ open, onClose, onSelect, activeFlowName }: FlowContextSelectorProps) {
  const { tenantId } = useWorkspace();
  const [flows, setFlows] = useState<FlowRecord[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !tenantId) return;
    setLoading(true);
    supabase
      .from("flows")
      .select("id, name, description, language, status, nodes, edges")
      .eq("tenant_id", tenantId)
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        setFlows(data || []);
        setLoading(false);
      });
  }, [open, tenantId]);

  const handleSelectFlow = useCallback((flow: FlowRecord) => {
    try {
      // Convert stored WAKA flow nodes back to TextIt-like format for context extraction
      const nodesArray = Array.isArray(flow.nodes) ? flow.nodes : [];
      const fakeTextIt = {
        flows: [{
          uuid: flow.id,
          name: flow.name,
          language: flow.language,
          type: "messaging",
          nodes: nodesArray.map((n: any) => ({
            uuid: n.id || n.uuid,
            actions: n.data?.actions || [],
            exits: n.data?.exits || [],
            router: n.data?.router || undefined,
          })),
        }],
      };
      const ctx = textitFlowToContext(fakeTextIt);
      const prompt = flowContextToPrompt(ctx);
      onSelect(prompt, flow.name);
      onClose();
      toast.success(`Flujo "${flow.name}" cargado como contexto IA`);
    } catch (e) {
      console.error("Failed to parse flow:", e);
      toast.error("No se pudo parsear el flujo");
    }
  }, [onSelect, onClose]);

  const handleUploadJSON = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const ctx = textitFlowToContext(json);
      const prompt = flowContextToPrompt(ctx);
      onSelect(prompt, ctx.flowName);
      onClose();
      toast.success(`Flujo "${ctx.flowName}" cargado desde JSON`);
    } catch (err) {
      console.error("JSON parse error:", err);
      toast.error("Error al parsear el archivo JSON");
    }
    // Reset input
    e.target.value = "";
  }, [onSelect, onClose]);

  const filtered = flows.filter((f) =>
    !search || f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-primary" />
            Seleccionar flujo como contexto IA
          </DialogTitle>
        </DialogHeader>

        <p className="text-xs text-muted-foreground -mt-1">
          La IA usará el flujo seleccionado como guía conversacional, adaptando los pasos, webhooks y decisiones del flujo original a una conversación fluida y dinámica.
        </p>

        {/* Upload JSON */}
        <div className="flex gap-2">
          <label className="flex-1">
            <input type="file" accept=".json" onChange={handleUploadJSON} className="hidden" />
            <Button variant="outline" className="w-full h-9 text-xs gap-2" asChild>
              <span>
                <Upload className="h-3.5 w-3.5" />
                Importar JSON de TextIt
              </span>
            </Button>
          </label>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar flujos del tenant..."
            className="h-8 pl-7 text-xs"
          />
        </div>

        {/* Flow list */}
        <ScrollArea className="max-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">Cargando flujos...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
              <FileJson className="h-8 w-8 opacity-30" />
              <p className="text-xs">
                {flows.length === 0 ? "No hay flujos en este tenant" : "Sin resultados"}
              </p>
              <p className="text-[10px] opacity-60">Importa un JSON de TextIt para comenzar</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((flow) => {
                const isActive = activeFlowName === flow.name;
                const nodesCount = Array.isArray(flow.nodes) ? flow.nodes.length : 0;
                return (
                  <button
                    key={flow.id}
                    onClick={() => handleSelectFlow(flow)}
                    className={`w-full text-left rounded-lg border p-3 transition-colors hover:bg-accent/50 ${
                      isActive ? "border-primary/50 bg-primary/5" : "border-border/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground truncate">{flow.name}</span>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[9px]">{flow.language}</Badge>
                        <Badge variant="secondary" className="text-[9px]">{nodesCount} nodos</Badge>
                        {isActive && <Check className="h-3.5 w-3.5 text-primary" />}
                      </div>
                    </div>
                    {flow.description && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{flow.description}</p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {activeFlowName && (
          <div className="flex items-center justify-between border-t border-border pt-2">
            <span className="text-[10px] text-muted-foreground">
              Activo: <strong>{activeFlowName}</strong>
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px] gap-1 text-destructive/60"
              onClick={() => { onSelect("", ""); onClose(); toast.info("Contexto de flujo eliminado"); }}
            >
              <X className="h-3 w-3" /> Quitar contexto
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
