import { MessageSquare, Clock, GitBranch, Globe, Download, Upload, Trash2, FileDown, ShieldCheck, Play, Languages, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

interface FlowToolbarProps {
  flowName: string;
  onFlowNameChange: (name: string) => void;
  onAddNode: (type: string) => void;
  onExport: () => void;
  onImport: () => void;
  onClear: () => void;
  onLoadSample?: () => void;
  onValidate?: () => void;
  onSimulate?: () => void;
  onTranslate?: () => void;
  onPhoneSimulator?: () => void;
}

const nodeTypes = [
  { type: "sendMsg", label: "Mensaje", icon: MessageSquare, color: "bg-node-send" },
  { type: "waitResponse", label: "Esperar", icon: Clock, color: "bg-node-wait" },
  { type: "splitExpression", label: "Dividir", icon: GitBranch, color: "bg-node-split" },
  { type: "webhook", label: "Webhook", icon: Globe, color: "bg-node-webhook" },
];

export function FlowToolbar({
  flowName,
  onFlowNameChange,
  onAddNode,
  onExport,
  onImport,
  onClear,
  onLoadSample,
  onValidate,
  onSimulate,
  onTranslate,
  onPhoneSimulator,
}: FlowToolbarProps) {
  return (
    <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-2">
      <Input
        value={flowName}
        onChange={(e) => onFlowNameChange(e.target.value)}
        className="w-64 border-none bg-transparent text-lg font-bold text-foreground focus-visible:ring-0"
        placeholder="Nombre del flujo"
      />

      <Separator orientation="vertical" className="mx-2 h-8" />

      <div className="flex gap-1">
        {nodeTypes.map(({ type, label, icon: Icon, color }) => (
          <button
            key={type}
            onClick={() => onAddNode(type)}
            className="group flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title={`Añadir nodo: ${label}`}
          >
            <span className={`inline-flex h-5 w-5 items-center justify-center rounded ${color}`}>
              <Icon className="h-3 w-3 text-primary-foreground" />
            </span>
            <span className="hidden lg:inline">{label}</span>
          </button>
        ))}
      </div>

      <div className="ml-auto flex gap-1">
        {onSimulate && (
          <Button variant="outline" size="sm" onClick={onSimulate} className="border-node-send/40 text-node-send hover:bg-node-send/10">
            <Play className="mr-1 h-3.5 w-3.5" /> Simular
          </Button>
        )}
        {onTranslate && (
          <Button variant="outline" size="sm" onClick={onTranslate} className="border-node-wait/40 text-node-wait hover:bg-node-wait/10">
            <Languages className="mr-1 h-3.5 w-3.5" /> Traducir
          </Button>
        )}
        {onValidate && (
          <Button variant="outline" size="sm" onClick={onValidate}>
            <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Validar
          </Button>
        )}
        {onLoadSample && (
          <Button variant="outline" size="sm" onClick={onLoadSample}>
            <FileDown className="mr-1 h-3.5 w-3.5" /> Ejemplo
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onImport}>
          <Upload className="mr-1 h-3.5 w-3.5" /> Importar
        </Button>
        <Button variant="default" size="sm" onClick={onExport}>
          <Download className="mr-1 h-3.5 w-3.5" /> Exportar JSON
        </Button>
        <Button variant="ghost" size="sm" onClick={onClear}>
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
