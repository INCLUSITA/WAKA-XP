import { useWorkspace, AppRole, Environment } from "@/contexts/WorkspaceContext";
import { Badge } from "@/components/ui/badge";
import { Building2, Eye, Shield } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const roleLabels: Record<AppRole, string> = {
  superadmin: "Superadmin",
  tenant_admin: "Tenant Admin",
  editor: "Editor",
  viewer: "Viewer",
};

const envLabels: Record<Environment, string> = {
  draft: "Draft",
  sandbox: "Sandbox",
  production: "Production",
};

export function WorkspaceContextBar({ compact = false }: { compact?: boolean }) {
  const { tenant, workspace, environment, setEnvironment, role, setRole } = useWorkspace();

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5 items-center">
        <Badge variant="outline" className="text-[10px] gap-1 border-border/50">
          <Building2 className="h-3 w-3" /> {tenant.displayName || tenant.name}
        </Badge>
        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
          {envLabels[environment]}
        </Badge>
        <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">
          {roleLabels[role]}
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div className="flex items-center gap-2 rounded-lg bg-secondary/60 border border-border/50 px-3 py-1.5">
        <Building2 className="h-3.5 w-3.5 text-primary" />
        <span className="text-[11px] font-medium text-foreground">{tenant.displayName || tenant.name}</span>
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-secondary/60 border border-border/50 px-3 py-1.5">
        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] font-medium text-foreground">{workspace.name}</span>
      </div>

      {/* Environment selector */}
      <Select value={environment} onValueChange={(v) => setEnvironment(v as Environment)}>
        <SelectTrigger className="h-7 w-auto text-[10px] border-primary/30 text-primary bg-transparent gap-1 px-2">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(envLabels) as Environment[]).map((e) => (
            <SelectItem key={e} value={e} className="text-xs">{envLabels[e]}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Role selector (simulated) */}
      <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
        <SelectTrigger className="h-7 w-auto text-[10px] bg-primary/10 text-primary border-primary/20 gap-1 px-2">
          <Shield className="h-3 w-3" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(roleLabels) as AppRole[]).map((r) => (
            <SelectItem key={r} value={r} className="text-xs">{roleLabels[r]}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
