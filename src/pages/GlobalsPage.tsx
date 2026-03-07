import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface Global {
  key: string;
  value: string;
}

export default function GlobalsPage() {
  const [globals, setGlobals] = useState<Global[]>([
    { key: "org_name", value: "WAKA" },
    { key: "support_phone", value: "+22670000000" },
    { key: "default_language", value: "fr" },
  ]);

  const addGlobal = () => setGlobals([...globals, { key: "", value: "" }]);
  const updateGlobal = (i: number, field: "key" | "value", val: string) => {
    const updated = [...globals];
    updated[i][field] = val;
    setGlobals(updated);
  };
  const removeGlobal = (i: number) => setGlobals(globals.filter((_, idx) => idx !== i));

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Global Variables</h1>
        <Button onClick={addGlobal} size="sm"><Plus className="mr-1 h-4 w-4" /> Add Global</Button>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl space-y-3">
          {globals.map((g, i) => (
            <div key={i} className="flex items-center gap-3">
              <Input value={g.key} onChange={(e) => updateGlobal(i, "key", e.target.value)} placeholder="Key" className="w-1/3 font-mono text-sm" />
              <Input value={g.value} onChange={(e) => updateGlobal(i, "value", e.target.value)} placeholder="Value" className="flex-1 font-mono text-sm" />
              <Button variant="ghost" size="icon" onClick={() => removeGlobal(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
