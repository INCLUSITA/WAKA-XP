import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace, ContextStatus } from "@/contexts/WorkspaceContext";
import { AlertTriangle, LogOut, RefreshCw, UserX, Building2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import wakaLogo from "@/assets/waka-logo.png";

const statusConfig: Record<
  Exclude<ContextStatus, "loading" | "ready">,
  { icon: typeof AlertTriangle; title: string; description: string }
> = {
  no_profile: {
    icon: UserX,
    title: "Perfil no encontrado",
    description:
      "Tu cuenta de usuario existe pero no tiene un perfil asociado. Contacta al administrador de tu organización para completar la configuración.",
  },
  no_tenant: {
    icon: Building2,
    title: "Sin organización asignada",
    description:
      "Tu perfil no está vinculado a ninguna organización. Contacta al administrador para que te asigne a un tenant.",
  },
  no_workspace: {
    icon: Layers,
    title: "Sin workspace disponible",
    description:
      "Tu organización no tiene ningún workspace configurado. Contacta al administrador para crear el workspace inicial.",
  },
};

export function MissingContextScreen() {
  const { contextStatus, user, reloadContext } = useWorkspace();
  const navigate = useNavigate();

  if (contextStatus === "loading" || contextStatus === "ready") return null;

  const config = statusConfig[contextStatus];
  const Icon = config.icon;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="relative">
            <img src={wakaLogo} alt="WAKA XP" className="h-10 w-10 rounded-lg object-contain" />
            <div className="absolute -inset-1 rounded-lg bg-primary/10 blur-sm -z-10" />
          </div>
        </div>

        {/* Status icon */}
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <Icon className="h-8 w-8 text-destructive" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-foreground">{config.title}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">{config.description}</p>
        </div>

        {/* User info */}
        {user && (
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
            <p className="text-xs text-muted-foreground">Sesión activa como</p>
            <p className="text-sm font-medium text-foreground mt-0.5">{user.email}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button variant="outline" onClick={reloadContext} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </Button>
          <Button variant="ghost" onClick={handleLogout} className="gap-2 text-muted-foreground">
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  );
}
