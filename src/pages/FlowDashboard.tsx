import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { WorkspaceContextBar } from "@/components/WorkspaceContextBar";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Copy, Archive, Trash2, Loader2, Sparkles, Link2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Json } from "@/integrations/supabase/types";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type Flow = Tables<"flows">;

interface Experience {
  id: string;
  name: string;
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-primary/15 text-primary",
  archived: "bg-destructive/15 text-destructive",
};

export default function FlowDashboard() {
  const { tenantId } = useWorkspace();
  const [flows, setFlows] = useState<Flow[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    const [flowsRes, expRes] = await Promise.all([
      supabase
        .from("flows")
        .select("*")
        .eq("tenant_id", tenantId)
        .neq("status", "archived")
        .order("updated_at", { ascending: false }),
      supabase
        .from("experiences")
        .select("id, name")
        .eq("tenant_id", tenantId)
        .order("name"),
    ]);

    if (flowsRes.error) {
      toast.error("Error al cargar flujos");
      console.error(flowsRes.error);
    } else {
      setFlows(flowsRes.data || []);
    }
    setExperiences((expRes.data as Experience[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [tenantId]);

  const createFlow = async () => {
    const { data, error } = await supabase
      .from("flows")
      .insert({ name: "Nuevo Flujo", tenant_id: tenantId, nodes: [] as unknown as Json, edges: [] as unknown as Json })
      .select("id")
      .single();

    if (error) {
      toast.error("Error al crear flujo");
      return;
    }
    navigate(`/editor?id=${data.id}`);
  };

  const duplicateFlow = async (flow: Flow) => {
    const { error } = await supabase
      .from("flows")
      .insert({
        name: `${flow.name} (copia)`,
        tenant_id: tenantId,
        nodes: flow.nodes,
        edges: flow.edges,
        language: flow.language,
        description: flow.description,
        experience_id: flow.experience_id,
      })
      .select("id")
      .single();

    if (error) {
      toast.error("Error al duplicar");
      return;
    }
    toast.success("Flujo duplicado");
    fetchData();
  };

  const archiveFlow = async (id: string) => {
    const { error } = await supabase
      .from("flows")
      .update({ status: "archived" as const })
      .eq("id", id);

    if (error) {
      toast.error("Error al archivar");
      return;
    }
    toast.success("Flujo archivado");
    fetchData();
  };

  const deleteFlow = async (id: string) => {
    const { error } = await supabase.from("flows").delete().eq("id", id);
    if (error) {
      toast.error("Error al eliminar");
      return;
    }
    toast.success("Flujo eliminado");
    fetchData();
  };

  const assignExperience = async (flowId: string, experienceId: string | null) => {
    const { error } = await supabase
      .from("flows")
      .update({ experience_id: experienceId })
      .eq("id", flowId);
    if (error) {
      toast.error("Error assigning experience");
      return;
    }
    toast.success(experienceId ? "Experience linked" : "Experience unlinked");
    fetchData();
  };

  const getExperienceName = (id: string | null) => {
    if (!id) return null;
    return experiences.find((e) => e.id === id)?.name || null;
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <SidebarTrigger />
        <h1 className="text-lg font-bold text-foreground">Flows</h1>
        <Badge variant="outline" className="text-[8px] border-primary/30 text-primary">Classic Builder</Badge>
        <div className="ml-auto flex items-center gap-3">
          <WorkspaceContextBar compact />
          <Button size="sm" variant="outline" onClick={() => navigate("/studio")} className="text-xs gap-1 border-accent/30 text-accent hover:bg-accent/5">
            <Sparkles className="h-3 w-3" /> Open XP Studio
          </Button>
          <Button onClick={createFlow} size="sm">
            <Plus className="mr-1.5 h-4 w-4" /> Nuevo Flujo
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : flows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-lg font-semibold text-foreground">No hay flujos todavía</p>
            <p className="mt-1 text-sm text-muted-foreground">Crea tu primer flujo para empezar</p>
            <Button onClick={createFlow} className="mt-4">
              <Plus className="mr-1.5 h-4 w-4" /> Crear Flujo
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {flows.map((flow) => {
              const expName = getExperienceName(flow.experience_id);
              return (
                <Card key={flow.id} className="group relative transition-shadow hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base line-clamp-1">{flow.name}</CardTitle>
                      <Badge variant="secondary" className={`text-[10px] ${statusColors[flow.status] || ""}`}>{flow.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2 space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Actualizado {format(new Date(flow.updated_at), "dd MMM yyyy, HH:mm", { locale: es })}
                    </p>
                    <p className="text-xs text-muted-foreground">{(flow.nodes as unknown as any[])?.length || 0} nodos</p>

                    {/* Experience assignment */}
                    <div className="flex items-center gap-1.5">
                      <Link2 className="h-3 w-3 text-muted-foreground/50" />
                      <Select
                        value={flow.experience_id || "__none__"}
                        onValueChange={(val) => assignExperience(flow.id, val === "__none__" ? null : val)}
                      >
                        <SelectTrigger className="h-7 text-[11px] border-border/50 bg-transparent w-full">
                          <SelectValue placeholder="No experience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__" className="text-xs text-muted-foreground">No experience</SelectItem>
                          {experiences.map((exp) => (
                            <SelectItem key={exp.id} value={exp.id} className="text-xs">{exp.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                  <CardFooter className="gap-1 pt-0">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/editor?id=${flow.id}`)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => duplicateFlow(flow)}><Copy className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => archiveFlow(flow.id)}><Archive className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteFlow(flow.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
