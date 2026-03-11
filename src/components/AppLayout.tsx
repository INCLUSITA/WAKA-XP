import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { WorkspaceContextBar } from "@/components/WorkspaceContextBar";
import { UserMenu } from "@/components/UserMenu";
import { MissingContextScreen } from "@/components/MissingContextScreen";
import { Loader2 } from "lucide-react";

export default function AppLayout() {
  const { contextStatus } = useWorkspace();

  // Loading state
  if (contextStatus === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Cargando contexto de trabajo…</p>
      </div>
    );
  }

  // Missing context states
  if (contextStatus !== "ready") {
    return <MissingContextScreen />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-11 flex items-center border-b border-border/30 bg-background/80 backdrop-blur-sm shrink-0 px-2 gap-2">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="flex-1 min-w-0">
              <WorkspaceContextBar compact />
            </div>
            <UserMenu />
          </header>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
