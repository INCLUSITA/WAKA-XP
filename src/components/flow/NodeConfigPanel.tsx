import { useCallback } from "react";
import { Node } from "@xyflow/react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Trash2 } from "lucide-react";

interface NodeConfigPanelProps {
  node: Node;
  onUpdate: (id: string, data: Record<string, unknown>) => void;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export function NodeConfigPanel({ node, onUpdate, onClose, onDelete }: NodeConfigPanelProps) {
  const data = node.data as Record<string, any>;

  const update = useCallback(
    (key: string, value: unknown) => {
      onUpdate(node.id, { ...data, [key]: value });
    },
    [node.id, data, onUpdate]
  );

  const addQuickReply = () => {
    const replies = [...(data.quick_replies || []), ""];
    update("quick_replies", replies);
  };

  const updateQuickReply = (index: number, value: string) => {
    const replies = [...(data.quick_replies || [])];
    replies[index] = value;
    update("quick_replies", replies);
  };

  const removeQuickReply = (index: number) => {
    const replies = (data.quick_replies || []).filter((_: string, i: number) => i !== index);
    update("quick_replies", replies);
  };

  const addCategory = () => {
    const cats = [...(data.categories || []), ""];
    update("categories", cats);
  };

  const updateCategory = (index: number, value: string) => {
    const cats = [...(data.categories || [])];
    cats[index] = value;
    update("categories", cats);
  };

  const removeCategory = (index: number) => {
    const cats = (data.categories || []).filter((_: string, i: number) => i !== index);
    update("categories", cats);
  };

  return (
    <div className="absolute right-0 top-0 z-50 flex h-full w-80 flex-col border-l border-border bg-card shadow-2xl">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">Configurar Nodo</h3>
        <button onClick={onClose} className="rounded-md p-1 hover:bg-muted">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {node.type === "sendMsg" && (
          <>
            <div className="space-y-2">
              <Label className="text-foreground">Mensaje</Label>
              <Textarea
                value={data.text || ""}
                onChange={(e) => update("text", e.target.value)}
                placeholder="Escribe el mensaje aquí..."
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-foreground">Respuestas Rápidas</Label>
                <Button variant="ghost" size="sm" onClick={addQuickReply}>
                  <Plus className="mr-1 h-3 w-3" /> Añadir
                </Button>
              </div>
              {(data.quick_replies || []).map((r: string, i: number) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={r}
                    onChange={(e) => updateQuickReply(i, e.target.value)}
                    placeholder={`Opción ${i + 1}`}
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeQuickReply(i)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}

        {node.type === "waitResponse" && (
          <>
            <div className="space-y-2">
              <Label className="text-foreground">Etiqueta</Label>
              <Input
                value={data.label || ""}
                onChange={(e) => update("label", e.target.value)}
                placeholder="Nombre del resultado"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-foreground">Categorías</Label>
                <Button variant="ghost" size="sm" onClick={addCategory}>
                  <Plus className="mr-1 h-3 w-3" /> Añadir
                </Button>
              </div>
              {(data.categories || []).map((c: string, i: number) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={c}
                    onChange={(e) => updateCategory(i, e.target.value)}
                    placeholder={`Categoría ${i + 1}`}
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeCategory(i)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}

        {node.type === "splitExpression" && (
          <div className="space-y-2">
            <Label className="text-foreground">Operando</Label>
            <Input
              value={data.operand || ""}
              onChange={(e) => update("operand", e.target.value)}
              placeholder="@input.text"
              className="font-mono text-sm"
            />
          </div>
        )}

        {node.type === "webhook" && (
          <>
            <div className="space-y-2">
              <Label className="text-foreground">URL</Label>
              <Input
                value={data.url || ""}
                onChange={(e) => update("url", e.target.value)}
                placeholder="https://api.example.com/endpoint"
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Método</Label>
              <Select value={data.method || "GET"} onValueChange={(v) => update("method", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Body (JSON)</Label>
              <Textarea
                value={data.body || ""}
                onChange={(e) => update("body", e.target.value)}
                placeholder='{"key": "value"}'
                className="min-h-[80px] font-mono text-sm"
              />
            </div>
          </>
        )}
      </div>

      <div className="border-t border-border p-4">
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => onDelete(node.id)}
        >
          <Trash2 className="mr-2 h-4 w-4" /> Eliminar Nodo
        </Button>
      </div>
    </div>
  );
}
