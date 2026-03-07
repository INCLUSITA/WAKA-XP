import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      </div>
      <div className="flex-1 p-6">
        <div className="max-w-lg space-y-6">
          <div className="space-y-2">
            <Label>Organization Name</Label>
            <Input defaultValue="WAKA" />
          </div>
          <div className="space-y-2">
            <Label>Default Language</Label>
            <Input defaultValue="fr" />
          </div>
          <div className="space-y-2">
            <Label>TextIt API Token</Label>
            <Input type="password" placeholder="Your TextIt API token" />
          </div>
        </div>
      </div>
    </div>
  );
}
