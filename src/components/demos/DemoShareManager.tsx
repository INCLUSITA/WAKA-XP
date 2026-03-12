import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { Plus, Copy, ExternalLink, Power, Trash2, Eye, Clock, Link2 } from "lucide-react";

interface DemoShareForm {
  title: string;
  description: string;
  demo_url: string;
  demo_type: string;
  expires_days: number | null;
  max_views: number | null;
}

const INITIAL_FORM: DemoShareForm = {
  title: "",
  description: "",
  demo_url: "",
  demo_type: "iframe",
  expires_days: null,
  max_views: null,
};

export default function DemoShareManager() {
  const { tenant, user } = useWorkspace();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<DemoShareForm>(INITIAL_FORM);

  const { data: shares = [], isLoading } = useQuery({
    queryKey: ["demo-shares", tenant?.id],
    queryFn: async () => {
      let query = (supabase as any)
        .from("demo_shares")
        .select("*")
        .order("created_at", { ascending: false });

      if (tenant?.id) {
        query = query.eq("tenant_id", tenant.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createShare = useMutation({
    mutationFn: async (formData: DemoShareForm) => {
      const expiresAt = formData.expires_days
        ? new Date(Date.now() + formData.expires_days * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { data, error } = await (supabase as any)
        .from("demo_shares")
        .insert({
          title: formData.title,
          description: formData.description || null,
          demo_url: formData.demo_url,
          demo_type: formData.demo_type,
          expires_at: expiresAt,
          max_views: formData.max_views,
          created_by: user!.id,
          tenant_id: tenant?.id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["demo-shares"] });
      setDialogOpen(false);
      setForm(INITIAL_FORM);
      const shareUrl = `${PUBLIC_SHARE_ORIGIN}/shared/${data.token}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link creado y copiado al portapapeles", { description: shareUrl });
    },
    onError: (err: any) => {
      toast.error("Error al crear el link", { description: err.message });
    },
  });

  const toggleShare = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await (supabase as any).from("demo_shares").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demo-shares"] });
      toast.success("Link actualizado");
    },
  });

  const deleteShare = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("demo_shares").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demo-shares"] });
      toast.success("Link eliminado");
    },
  });

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/shared/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.demo_url) {
      toast.error("Título y URL son requeridos");
      return;
    }
    createShare.mutate(form);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Demo Share Links</h2>
          <p className="text-sm text-muted-foreground">
            Genera links públicos para compartir demos con clientes sin necesidad de login.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Crear Link
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nuevo Demo Share Link</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Título de la demo *</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="M-Pesa Ethiopia Demo"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">URL de la demo *</label>
                <Input
                  value={form.demo_url}
                  onChange={(e) => setForm({ ...form, demo_url: e.target.value })}
                  placeholder="https://wakaxp.wakacore.com/demo/mpesaethiopiademo-3"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Descripción</label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Demo de integración M-Pesa para el mercado etíope..."
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Tipo de embed</label>
                  <Select value={form.demo_type} onValueChange={(v) => setForm({ ...form, demo_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iframe">iFrame (embebido)</SelectItem>
                      <SelectItem value="redirect">Redirección</SelectItem>
                      <SelectItem value="link">Link externo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Expiración (días)</label>
                  <Input
                    type="number"
                    value={form.expires_days ?? ""}
                    onChange={(e) => setForm({ ...form, expires_days: e.target.value ? Number(e.target.value) : null })}
                    placeholder="Sin límite"
                    min={1}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Límite de vistas</label>
                <Input
                  type="number"
                  value={form.max_views ?? ""}
                  onChange={(e) => setForm({ ...form, max_views: e.target.value ? Number(e.target.value) : null })}
                  placeholder="Sin límite"
                  min={1}
                />
              </div>
              <Button type="submit" className="w-full" disabled={createShare.isPending}>
                {createShare.isPending ? "Creando..." : "Crear y copiar link"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Shares list */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : shares.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Link2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="font-medium text-muted-foreground">Sin links compartidos</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Crea tu primer link para compartir una demo.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {shares.map((share: any) => {
            const isExpired = share.expires_at && new Date(share.expires_at) < new Date();
            const isMaxed = share.max_views && share.view_count >= share.max_views;
            const isAvailable = share.is_active && !isExpired && !isMaxed;

            return (
              <Card key={share.id}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">{share.title}</span>
                        {isAvailable ? (
                          <Badge variant="default" className="text-[10px] px-1.5 py-0 bg-emerald-600">
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {isExpired ? "Expirado" : isMaxed ? "Límite alcanzado" : "Inactivo"}
                          </Badge>
                        )}
                      </div>
                      {share.description && (
                        <p className="text-xs text-muted-foreground truncate">{share.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground/60">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {share.view_count} vistas{share.max_views ? ` / ${share.max_views}` : ""}
                        </span>
                        {share.expires_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {isExpired ? "Expiró" : "Expira"} {format(new Date(share.expires_at), "dd/MM/yyyy")}
                          </span>
                        )}
                        <span className="font-mono text-[10px]">{share.token.slice(0, 8)}…</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyLink(share.token)} title="Copiar link">
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => window.open(`/shared/${share.token}`, "_blank")}
                        title="Abrir"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleShare.mutate({ id: share.id, is_active: !share.is_active })}
                        title={share.is_active ? "Desactivar" : "Activar"}
                      >
                        <Power className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm("¿Eliminar este link permanentemente?")) {
                            deleteShare.mutate(share.id);
                          }
                        }}
                        title="Eliminar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
