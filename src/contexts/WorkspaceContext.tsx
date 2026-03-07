import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { DEMO_TENANT_ID } from "@/lib/constants";

// ── Types ──

export type AppRole = "superadmin" | "tenant_admin" | "editor" | "viewer";
export type Environment = "draft" | "sandbox" | "production";

export interface TenantInfo {
  id: string;
  name: string;
  displayName: string | null;
  slug: string;
}

export interface WorkspaceInfo {
  id: string;
  name: string;
  slug: string;
}

export interface WorkspaceContextValue {
  // Tenant
  tenant: TenantInfo;
  setTenant: (t: TenantInfo) => void;
  tenantId: string;

  // Workspace
  workspace: WorkspaceInfo;
  setWorkspace: (w: WorkspaceInfo) => void;

  // Environment
  environment: Environment;
  setEnvironment: (e: Environment) => void;

  // Role (simulated for now)
  role: AppRole;
  setRole: (r: AppRole) => void;

  // Convenience
  isSuperadmin: boolean;
  isAdmin: boolean;
}

// ── Defaults (simulated) ──

const defaultTenant: TenantInfo = {
  id: DEMO_TENANT_ID,
  name: "waka-internal",
  displayName: "Waka Internal",
  slug: "waka-internal",
};

const defaultWorkspace: WorkspaceInfo = {
  id: "00000000-0000-0000-0000-000000000010",
  name: "Default Studio",
  slug: "default",
};

// ── Context ──

const Ctx = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<TenantInfo>(defaultTenant);
  const [workspace, setWorkspace] = useState<WorkspaceInfo>(defaultWorkspace);
  const [environment, setEnvironment] = useState<Environment>("draft");
  const [role, setRole] = useState<AppRole>("superadmin");

  const value: WorkspaceContextValue = {
    tenant,
    setTenant,
    tenantId: tenant.id,
    workspace,
    setWorkspace,
    environment,
    setEnvironment,
    role,
    setRole,
    isSuperadmin: role === "superadmin",
    isAdmin: role === "superadmin" || role === "tenant_admin",
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
