import { Edge, Node } from "@xyflow/react";
import { ArrowRight, Trash2, X, Link } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EdgeInfoPanelProps {
  edge: Edge;
  nodes: Node[];
  onClose: () => void;
  onDelete: (id: string) => void;
  onSelectNode: (node: Node) => void;
}

const nodeTypeLabels: Record<string, { label: string; color: string }> = {
  sendMsg: { label: "Send Message", color: "hsl(160, 84%, 39%)" },
  waitResponse: { label: "Wait for Response", color: "hsl(220, 80%, 55%)" },
  splitExpression: { label: "Split by Expression", color: "hsl(260, 60%, 55%)" },
  webhook: { label: "Call Webhook", color: "hsl(30, 90%, 55%)" },
};

function getNodeSummary(node: Node | undefined) {
  if (!node) return { label: "Nodo eliminado", color: "hsl(220,14%,75%)", preview: "" };
  const d = node.data as any;
  const info = nodeTypeLabels[node.type || ""] || { label: "Nodo", color: "hsl(220,14%,75%)" };

  let preview = "";
  switch (node.type) {
    case "sendMsg":
      preview = d.text ? (d.text.length > 60 ? d.text.slice(0, 60) + "…" : d.text) : "Sin mensaje";
      break;
    case "waitResponse":
      preview = d.categories?.join(", ") || "Esperando…";
      break;
    case "splitExpression":
      preview = d.operand || "@input.text";
      break;
    case "webhook":
      preview = `${d.method || "GET"} ${d.url || "sin URL"}`;
      break;
  }

  return { ...info, preview };
}

export function EdgeInfoPanel({ edge, nodes, onClose, onDelete, onSelectNode }: EdgeInfoPanelProps) {
  const sourceNode = nodes.find((n) => n.id === edge.source);
  const targetNode = nodes.find((n) => n.id === edge.target);
  const source = getNodeSummary(sourceNode);
  const target = getNodeSummary(targetNode);

  return (
    <div className="absolute bottom-4 left-1/2 z-30 w-[420px] -translate-x-1/2 rounded-xl border border-border bg-card p-4 shadow-2xl">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Conexión</h3>
        </div>
        <button onClick={onClose} className="rounded-md p-1 hover:bg-muted">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* Source */}
        <button
          onClick={() => sourceNode && onSelectNode(sourceNode)}
          className="min-w-0 flex-1 rounded-lg border border-border bg-muted/50 p-3 text-left transition-colors hover:bg-muted hover:border-primary/40 cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: source.color }}
            />
            <span className="text-xs font-semibold text-foreground truncate">{source.label}</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground truncate">{source.preview}</p>
        </button>

        {/* Arrow */}
        <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
          <ArrowRight className="h-5 w-5 text-primary" />
        </div>

        {/* Target */}
        <button
          onClick={() => targetNode && onSelectNode(targetNode)}
          className="min-w-0 flex-1 rounded-lg border border-border bg-muted/50 p-3 text-left transition-colors hover:bg-muted hover:border-primary/40 cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: target.color }}
            />
            <span className="text-xs font-semibold text-foreground truncate">{target.label}</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground truncate">{target.preview}</p>
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[10px] font-mono text-muted-foreground/60">
          {edge.source.slice(0, 8)}… → {edge.target.slice(0, 8)}…
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(edge.id)}
          className="h-7 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="mr-1 h-3 w-3" /> Eliminar conexión
        </Button>
      </div>
    </div>
  );
}
