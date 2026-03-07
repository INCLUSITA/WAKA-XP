import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export default function ValidatePage() {
  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-2xl font-bold text-foreground">Validate Flow</h1>
      </div>
      <div className="flex-1 p-6">
        <div className="max-w-lg space-y-4">
          <p className="text-sm text-muted-foreground">
            Validate your current flow for errors and warnings before exporting.
            Go to the editor and use the Validate button in the toolbar.
          </p>
          <Button variant="outline">
            <ShieldCheck className="mr-2 h-4 w-4" /> Validate Current Flow
          </Button>
        </div>
      </div>
    </div>
  );
}
