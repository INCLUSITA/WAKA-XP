/**
 * Dialog to name and save the current player conversation as a flow.
 */

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";
import type { FlowStatus } from "@/hooks/useSavedPlayerFlows";

interface SaveFlowDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, description: string, status: FlowStatus) => Promise<void>;
  isSaving?: boolean;
}

export function SaveFlowDialog({ open, onClose, onSave, isSaving }: SaveFlowDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<FlowStatus>("sandbox");

  const handleSave = async () => {
    if (!name.trim()) return;
    await onSave(name.trim(), description.trim(), status);
    setName("");
    setDescription("");
    setStatus("sandbox");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-4 w-4 text-primary" />
            Guardar flujo de conversación
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div>
            <Label className="text-xs">Nombre *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Onboarding MoMo completo"
              className="mt-1"
              autoFocus
            />
          </div>
          <div>
            <Label className="text-xs">Descripción</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descripción del escenario..."
              className="mt-1 h-16 resize-none"
            />
          </div>
          <div>
            <Label className="text-xs">Estado inicial</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as FlowStatus)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sandbox">🧪 Sandbox</SelectItem>
                <SelectItem value="stable">🔒 Stable</SelectItem>
                <SelectItem value="production">🚀 Production</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!name.trim() || isSaving}>
            {isSaving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
