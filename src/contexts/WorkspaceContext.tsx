import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

// ── Types ──

export type AppRole = "superadmin" | "tenant_admin" | "editor" | "viewer";
export type Environment = "draft" | "sandbox" | "production";

export type ContextStatus =
  | "loading"
  | "no_profile"
  | "no_tenant"
  | "no_workspace"
  | "ready";

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
  user: UserInfo | null;
  tenant: TenantInfo | null;
  setTenant: (t: TenantInfo) => void;
  tenantId: string;
  workspace: WorkspaceInfo | null;
  setWorkspace: (w: WorkspaceInfo) => void;
  environment: Environment;
  setEnvironment: (e: Environment) => void;
  role: AppRole;
  setRole: (r: AppRole) => void;
  isSuperadmin: boolean;
  isAdmin: boolean;
  contextReady: boolean;
  contextStatus: ContextStatus;
  reloadContext: () => Promise<void>;
}

// ── Context ──

const Ctx = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null);
  const [environment, setEnvironment] = useState<Environment>("draft");
  const [role, setRole] = useState<AppRole>("superadmin");
  const [contextStatus, setContextStatus] = useState<ContextStatus>("loading");

  const resolveContext = async () => {
    setContextStatus("loading");

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setUser(null);
      setTenant(null);
      setWorkspace(null);
      setContextStatus("ready"); // not authed – AuthGuard handles redirect
      return;
    }

    const authUser = session.user;
    setUser({
      id: authUser.id,
      email: authUser.email || "",
      fullName: null,
    });

    // 1. Load profile
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("full_name, tenant_id")
      .eq("id", authUser.id)
      .single();

    if (profileErr || !profile) {
      setContextStatus("no_profile");
      return;
    }

    if (profile.full_name) {
      setUser(prev => prev ? { ...prev, fullName: profile.full_name } : prev);
    }

    // 2. Check tenant assignment
    const tenantId = profile.tenant_id;
    if (!tenantId) {
      setContextStatus("no_tenant");
      return;
    }

    // 3. Load tenant
    const { data: tenantData } = await supabase
      .from("tenants")
      .select("id, name, display_name, slug")
      .eq("id", tenantId)
      .single();

    if (!tenantData) {
      setContextStatus("no_tenant");
      return;
    }

    setTenant({
      id: tenantData.id,
      name: tenantData.name,
      displayName: tenantData.display_name,
      slug: tenantData.slug,
    });

    // 4. Load workspace
    const { data: wsData } = await supabase
      .from("workspaces")
      .select("id, name, slug")
      .eq("tenant_id", tenantId)
      .eq("is_default", true)
      .single();

    if (wsData) {
      setWorkspace({ id: wsData.id, name: wsData.name, slug: wsData.slug });
    } else {
      const { data: anyWs } = await supabase
        .from("workspaces")
        .select("id, name, slug")
        .eq("tenant_id", tenantId)
        .limit(1)
        .single();

      if (anyWs) {
        setWorkspace({ id: anyWs.id, name: anyWs.name, slug: anyWs.slug });
      } else {
        setContextStatus("no_workspace");
        return;
      }
    }

    setContextStatus("ready");
  };

  useEffect(() => {
    resolveContext();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        setTenant(null);
        setWorkspace(null);
        setContextStatus("ready");
      } else {
        // Re-resolve on sign-in
        resolveContext();
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
    contextReady: contextStatus === "ready",
    contextStatus,
    reloadContext: resolveContext,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
