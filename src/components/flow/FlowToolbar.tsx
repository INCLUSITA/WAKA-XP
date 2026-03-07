import {
  MessageSquare, Clock, GitBranch, Globe, Download, Upload, Trash2, FileDown,
  ShieldCheck, Play, Languages, Smartphone, LayoutGrid, ChevronDown,
  Save, UserCog, Mail, Bot, Workflow, Headphones, Zap, Coins
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  onDemos?: () => void;
  onWebhooks?: () => void;
}

const actionNodes = [
  { type: "sendMsg", label: "Send a message", icon: MessageSquare, color: "hsl(160, 84%, 39%)" },
  { type: "updateContact", label: "Update the contact", icon: UserCog, color: "hsl(200, 70%, 50%)" },
  { type: "sendEmail", label: "Send an email", icon: Mail, color: "hsl(340, 70%, 50%)" },
  { type: "saveResult", label: "Save a result for this flow", icon: Save, color: "hsl(45, 80%, 50%)" },
  { type: "webhook", label: "Call a webhook", icon: Globe, color: "hsl(30, 90%, 55%)" },
  { type: "callAI", label: "Call AI service", icon: Bot, color: "hsl(270, 70%, 55%)" },
  { type: "callZapier", label: "Call Zapier", icon: Zap, color: "hsl(20, 90%, 55%)" },
  { type: "enterFlow", label: "Enter another flow", icon: Workflow, color: "hsl(190, 70%, 45%)" },
  { type: "openTicket", label: "Open a ticket with a human agent", icon: Headphones, color: "hsl(15, 80%, 50%)" },
  { type: "sendAirtime", label: "Send the contact airtime", icon: Coins, color: "hsl(50, 80%, 45%)" },
];

const splitNodes = [
  { type: "splitExpression", label: "Split by a custom expression", icon: GitBranch, color: "hsl(260, 60%, 55%)" },
  { type: "splitContactField", label: "Split by a contact field", icon: GitBranch, color: "hsl(260, 60%, 55%)" },
  { type: "splitResult", label: "Split by a result in the flow", icon: GitBranch, color: "hsl(260, 60%, 55%)" },
  { type: "splitRandom", label: "Split by random chance", icon: GitBranch, color: "hsl(260, 60%, 55%)" },
  { type: "splitGroup", label: "Split by group membership", icon: GitBranch, color: "hsl(260, 60%, 55%)" },
];

const waitNodes = [
  { type: "waitResponse", label: "Wait for response", icon: Clock, color: "hsl(220, 80%, 55%)" },
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
  onDemos,
  onWebhooks,
}: FlowToolbarProps) {
  return (
    <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-2">
      <Input
        value={flowName}
        onChange={(e) => onFlowNameChange(e.target.value)}
        className="w-64 border-none bg-transparent text-lg font-bold text-foreground focus-visible:ring-0"
        placeholder="Flow name"
      />

      <Separator orientation="vertical" className="mx-2 h-8" />

      {/* Add Node Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
            <span>+ Add Node</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72">
          <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">Actions</DropdownMenuLabel>
          {actionNodes.map(({ type, label, icon: Icon, color }) => (
            <DropdownMenuItem key={type} onClick={() => onAddNode(type)} className="cursor-pointer gap-2.5 py-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded" style={{ background: color }}>
                <Icon className="h-3 w-3 text-white" />
              </span>
              <span className="text-sm">{label}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">Splits</DropdownMenuLabel>
          {splitNodes.map(({ type, label, icon: Icon, color }) => (
            <DropdownMenuItem key={type} onClick={() => onAddNode(type)} className="cursor-pointer gap-2.5 py-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded" style={{ background: color }}>
                <Icon className="h-3 w-3 text-white" />
              </span>
              <span className="text-sm">{label}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">Wait</DropdownMenuLabel>
          {waitNodes.map(({ type, label, icon: Icon, color }) => (
            <DropdownMenuItem key={type} onClick={() => onAddNode(type)} className="cursor-pointer gap-2.5 py-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded" style={{ background: color }}>
                <Icon className="h-3 w-3 text-white" />
              </span>
              <span className="text-sm">{label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="ml-auto flex gap-1">
        {onSimulate && (
          <Button variant="outline" size="sm" onClick={onSimulate} className="border-node-send/40 text-node-send hover:bg-node-send/10">
            <Play className="mr-1 h-3.5 w-3.5" /> Simular
          </Button>
        )}
        {onPhoneSimulator && (
          <Button variant="outline" size="sm" onClick={onPhoneSimulator} className="border-node-send/40 text-node-send hover:bg-node-send/10">
            <Smartphone className="mr-1 h-3.5 w-3.5" /> Teléfono
          </Button>
        )}
        {onDemos && (
          <Button variant="outline" size="sm" onClick={onDemos} className="border-purple-400/40 text-purple-500 hover:bg-purple-500/10">
            <LayoutGrid className="mr-1 h-3.5 w-3.5" /> Demos
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
