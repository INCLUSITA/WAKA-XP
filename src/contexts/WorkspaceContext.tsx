import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

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

export interface UserInfo {
  id: string;
  email: string;
  fullName: string | null;
}

export interface WorkspaceContextValue {
  // Auth user
  user: UserInfo | null;

  // Tenant
  tenant: TenantInfo | null;
  setTenant: (t: TenantInfo) => void;
  tenantId: string;

  // Workspace
  workspace: WorkspaceInfo | null;
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

  // Loading
  contextReady: boolean;
}

// ── Context ──

const Ctx = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null);
  const [environment, setEnvironment] = useState<Environment>("draft");
  const [role, setRole] = useState<AppRole>("superadmin");
  const [contextReady, setContextReady] = useState(false);

  // Resolve tenant and workspace from authenticated user
  useEffect(() => {
    const resolveContext = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setContextReady(true);
        return;
      }

      const authUser = session.user;
      setUser({
        id: authUser.id,
        email: authUser.email || "",
        fullName: null,
      });

      // Load profile to get tenant_id
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, tenant_id")
        .eq("id", authUser.id)
        .single();

      if (profile?.full_name) {
        setUser(prev => prev ? { ...prev, fullName: profile.full_name } : prev);
      }

      const tenantId = profile?.tenant_id;
      if (tenantId) {
        // Load tenant info
        const { data: tenantData } = await supabase
          .from("tenants")
          .select("id, name, display_name, slug")
          .eq("id", tenantId)
          .single();

        if (tenantData) {
          setTenant({
            id: tenantData.id,
            name: tenantData.name,
            displayName: tenantData.display_name,
            slug: tenantData.slug,
          });
        }

        // Load default workspace
        const { data: wsData } = await supabase
          .from("workspaces")
          .select("id, name, slug")
          .eq("tenant_id", tenantId)
          .eq("is_default", true)
          .single();

        if (wsData) {
          setWorkspace({
            id: wsData.id,
            name: wsData.name,
            slug: wsData.slug,
          });
        } else {
          // Fallback: first workspace
          const { data: anyWs } = await supabase
            .from("workspaces")
            .select("id, name, slug")
            .eq("tenant_id", tenantId)
            .limit(1)
            .single();

          if (anyWs) {
            setWorkspace({
              id: anyWs.id,
              name: anyWs.name,
              slug: anyWs.slug,
            });
          }
        }
      }

      setContextReady(true);
    };

    resolveContext();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        setTenant(null);
        setWorkspace(null);
        setContextReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value: WorkspaceContextValue = {
    user,
    tenant,
    setTenant,
    tenantId: tenant?.id || "",
    workspace,
    setWorkspace,
    environment,
    setEnvironment,
    role,
    setRole,
    isSuperadmin: role === "superadmin",
    isAdmin: role === "superadmin" || role === "tenant_admin",
    contextReady,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
