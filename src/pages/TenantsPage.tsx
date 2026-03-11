import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building2, Users, Shield, Globe, Palette, Clock, Loader2,
  Plus, Pencil, Check, X,
} from "lucide-react";
import { toast } from "sonner";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  country_code: string;
  channels: string[];
  created_at: string;
  display_name: string | null;
  logo_url: string | null;
  primary_color: string | null;
  timezone: string | null;
}

interface SimulatedUser {
  role: "superadmin" | "admin" | "viewer";
  label: string;
  description: string;
}

const SIMULATED_ROLES: SimulatedUser[] = [
  { role: "superadmin", label: "Super Admin", description: "Gestión global de todos los tenants" },
  { role: "admin", label: "Tenant Admin", description: "Gestión completa de su tenant" },
  { role: "viewer", label: "Viewer", description: "Solo lectura" },
];

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [simulatedRole, setSimulatedRole] = useState<SimulatedUser>(SIMULATED_ROLES[0]);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", slug: "", country_code: "", display_name: "", timezone: "", primary_color: "" });

  const fetchTenants = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tenants")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      // Fallback: query with known demo tenant ID directly
      console.error("Error fetching tenants:", error);
      toast.error("Error al cargar tenants");
    }
    setTenants((data as Tenant[]) || []);
    if (data && data.length > 0 && !selectedTenant) {
      setSelectedTenant(data[0] as Tenant);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const startEdit = (tenant: Tenant) => {
    setEditing(true);
    setEditForm({
      name: tenant.name,
      slug: tenant.slug,
      country_code: tenant.country_code,
      display_name: tenant.display_name || "",
      timezone: tenant.timezone || "Africa/Ouagadougou",
      primary_color: tenant.primary_color || "#6366f1",
    });
  };

  const saveEdit = async () => {
    if (!selectedTenant) return;
    const { error } = await supabase
      .from("tenants")
      .update({
        name: editForm.name,
        slug: editForm.slug,
        country_code: editForm.country_code,
        display_name: editForm.display_name || null,
        timezone: editForm.timezone,
        primary_color: editForm.primary_color,
      })
      .eq("id", selectedTenant.id);

    if (error) {
      toast.error("Error al guardar");
      console.error(error);
    } else {
      toast.success("Tenant actualizado");
      setEditing(false);
      fetchTenants();
    }
  };

  const isSuperAdmin = simulatedRole.role === "superadmin";
  const isAdmin = simulatedRole.role === "superadmin" || simulatedRole.role === "admin";

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <SidebarTrigger />
        <Building2 className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-bold text-foreground">Tenants</h1>
        <div className="ml-auto flex items-center gap-2">
          {/* Role Simulator */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 px-2 py-1">
            <Shield className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider mr-1">Simular:</span>
            {SIMULATED_ROLES.map((r) => (
              <button
                key={r.role}
                onClick={() => setSimulatedRole(r)}
                className={`px-2 py-0.5 text-xs rounded-md transition-colors ${
                  simulatedRole.role === r.role
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: Tenant List */}
        <div className="w-72 border-r border-border bg-muted/20 flex flex-col">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tenants ({tenants.length})
            </span>
            {isSuperAdmin && (
              <Button variant="ghost" size="icon" className="h-6 w-6" disabled>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : tenants.length === 0 ? (
              <p className="px-4 py-8 text-sm text-muted-foreground text-center">No hay tenants</p>
            ) : (
              tenants.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setSelectedTenant(t); setEditing(false); }}
                  className={`w-full text-left px-4 py-3 border-b border-border/50 transition-colors ${
                    selectedTenant?.id === t.id
                      ? "bg-primary/10 border-l-2 border-l-primary"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: t.primary_color || "#6366f1" }}
                    />
                    <span className="text-sm font-medium text-foreground truncate">
                      {t.display_name || t.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 ml-5">
                    <span className="text-[10px] text-muted-foreground font-mono">{t.slug}</span>
                    <Badge variant="outline" className="text-[9px] px-1 py-0">
                      {t.country_code}
                    </Badge>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main: Tenant Detail */}
        <div className="flex-1 overflow-auto p-6">
          {!selectedTenant ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Selecciona un tenant
            </div>
          ) : (
            <div className="max-w-2xl space-y-6">
              {/* Tenant Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: selectedTenant.primary_color || "#6366f1" }}
                  >
                    {(selectedTenant.display_name || selectedTenant.name).charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      {selectedTenant.display_name || selectedTenant.name}
                    </h2>
                    <p className="text-sm text-muted-foreground font-mono">{selectedTenant.slug}</p>
                  </div>
                </div>
                {isAdmin && !editing && (
                  <Button variant="outline" size="sm" onClick={() => startEdit(selectedTenant)}>
                    <Pencil className="h-3.5 w-3.5 mr-1.5" /> Editar
                  </Button>
                )}
                {editing && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveEdit}>
                      <Check className="h-3.5 w-3.5 mr-1" /> Guardar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              {/* Info Cards */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      Información
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {editing ? (
                      <>
                        <div className="space-y-1">
                          <Label className="text-xs">Nombre</Label>
                          <Input
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Slug</Label>
                          <Input
                            value={editForm.slug}
                            onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                            className="h-8 text-sm font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Display Name</Label>
                          <Input
                            value={editForm.display_name}
                            onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                            className="h-8 text-sm"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <InfoRow label="Nombre" value={selectedTenant.name} />
                        <InfoRow label="Slug" value={selectedTenant.slug} mono />
                        <InfoRow label="Display" value={selectedTenant.display_name || "—"} />
                        <InfoRow label="ID" value={selectedTenant.id} mono small />
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      Localización
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {editing ? (
                      <>
                        <div className="space-y-1">
                          <Label className="text-xs">País</Label>
                          <Input
                            value={editForm.country_code}
                            onChange={(e) => setEditForm({ ...editForm, country_code: e.target.value })}
                            className="h-8 text-sm font-mono uppercase"
                            maxLength={2}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Timezone</Label>
                          <Input
                            value={editForm.timezone}
                            onChange={(e) => setEditForm({ ...editForm, timezone: e.target.value })}
                            className="h-8 text-sm"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <InfoRow label="País" value={selectedTenant.country_code} />
                        <InfoRow label="Timezone" value={selectedTenant.timezone || "—"} />
                        <InfoRow label="Creado" value={new Date(selectedTenant.created_at).toLocaleDateString()} />
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Palette className="h-4 w-4 text-muted-foreground" />
                      Branding
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {editing ? (
                      <div className="space-y-1">
                        <Label className="text-xs">Color primario</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={editForm.primary_color}
                            onChange={(e) => setEditForm({ ...editForm, primary_color: e.target.value })}
                            className="h-8 w-8 rounded cursor-pointer border-0"
                          />
                          <Input
                            value={editForm.primary_color}
                            onChange={(e) => setEditForm({ ...editForm, primary_color: e.target.value })}
                            className="h-8 text-sm font-mono flex-1"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-6 w-6 rounded-md border border-border"
                            style={{ backgroundColor: selectedTenant.primary_color || "#6366f1" }}
                          />
                          <span className="text-sm font-mono text-muted-foreground">
                            {selectedTenant.primary_color || "#6366f1"}
                          </span>
                        </div>
                        <InfoRow label="Logo" value={selectedTenant.logo_url || "Sin logo"} />
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      Canales
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTenant.channels.map((ch) => (
                        <Badge key={ch} variant="secondary" className="text-xs">
                          {ch}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Access Control Preview */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    Control de Acceso (simulación)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={
                        simulatedRole.role === "superadmin"
                          ? "bg-red-500/15 text-red-600 border-red-500/30"
                          : simulatedRole.role === "admin"
                          ? "bg-primary/15 text-primary border-primary/30"
                          : "bg-muted text-muted-foreground"
                      }>
                        {simulatedRole.label}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{simulatedRole.description}</span>
                    </div>
                    <Separator />
                    <div className="grid gap-1 text-xs">
                      <PermRow label="Ver tenants" allowed />
                      <PermRow label="Editar tenant actual" allowed={isAdmin} />
                      <PermRow label="Crear nuevos tenants" allowed={isSuperAdmin} />
                      <PermRow label="Eliminar tenants" allowed={isSuperAdmin} />
                      <PermRow label="Gestionar usuarios del tenant" allowed={isAdmin} />
                      <PermRow label="Ver datos de otros tenants" allowed={isSuperAdmin} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono, small }: { label: string; value: string; mono?: boolean; small?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm text-foreground ${mono ? "font-mono" : ""} ${small ? "text-xs" : ""} truncate max-w-[200px]`}>
        {value}
      </span>
    </div>
  );
}

function PermRow({ label, allowed }: { label: string; allowed: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-1.5 w-1.5 rounded-full ${allowed ? "bg-green-500" : "bg-red-400"}`} />
      <span className={allowed ? "text-foreground" : "text-muted-foreground line-through"}>{label}</span>
    </div>
  );
}
