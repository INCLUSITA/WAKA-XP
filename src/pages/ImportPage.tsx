import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export default function ImportPage() {
  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-2xl font-bold text-foreground">Import Flow</h1>
      </div>
      <div className="flex-1 p-6">
        <div className="max-w-lg space-y-4">
          <p className="text-sm text-muted-foreground">
            Import a TextIt/RapidPro JSON flow file. The flow will be loaded into the editor.
            Go to the editor and use the Import button in the toolbar.
          </p>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" /> Import JSON File
          </Button>
        </div>
      </div>
    </div>
  );
}
