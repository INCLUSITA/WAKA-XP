import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function ExportPage() {
  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-2xl font-bold text-foreground">Export Flows</h1>
      </div>
      <div className="flex-1 p-6">
        <div className="max-w-lg space-y-4">
          <p className="text-sm text-muted-foreground">
            Export your active flow as a TextIt-compatible JSON file (v13 format).
            Go to the editor and use the Export button in the toolbar.
          </p>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export Current Flow
          </Button>
        </div>
      </div>
    </div>
  );
}
