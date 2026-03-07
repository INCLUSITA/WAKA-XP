import { SidebarTrigger } from "@/components/ui/sidebar";
import { Map } from "lucide-react";

export default function JourneysPage() {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <SidebarTrigger />
        <h1 className="text-lg font-bold text-foreground">Journeys</h1>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <Map className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <h2 className="text-xl font-semibold text-foreground">Journeys</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Design and manage end-to-end business experiences. Group flows, demos and interactions into coherent customer journeys.
          </p>
          <p className="text-xs text-muted-foreground/60">Coming soon</p>
        </div>
      </div>
    </div>
  );
}
