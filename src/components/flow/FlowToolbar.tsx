import {
  MessageSquare, Clock, GitBranch, Globe, Download, Upload, Trash2, FileDown,
  ShieldCheck, Play, Languages, ChevronDown, History,
  Save, UserCog, Mail, Bot, Workflow, Headphones, Zap, Coins, Sparkles, Link2, Rocket
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SaveStatusIndicator } from "./SaveStatusIndicator";
import { SaveStatus } from "@/hooks/useFlowPersistence";

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
  onVersions?: () => void;
  saveStatus?: SaveStatus;
  experienceName?: string | null;
  onOpenExperience?: () => void;
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
  { type: "openTicket", label: "Open a ticket", icon: Headphones, color: "hsl(15, 80%, 50%)" },
  { type: "sendAirtime", label: "Send airtime", icon: Coins, color: "hsl(50, 80%, 45%)" },
];

const splitNodes = [
  { type: "splitExpression", label: "Split by expression", icon: GitBranch, color: "hsl(260, 60%, 55%)" },
  { type: "splitContactField", label: "Split by contact field", icon: GitBranch, color: "hsl(260, 60%, 55%)" },
  { type: "splitResult", label: "Split by result", icon: GitBranch, color: "hsl(260, 60%, 55%)" },
  { type: "splitRandom", label: "Split by random", icon: GitBranch, color: "hsl(260, 60%, 55%)" },
  { type: "splitGroup", label: "Split by group", icon: GitBranch, color: "hsl(260, 60%, 55%)" },
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
  onVersions,
  saveStatus,
  experienceName,
  onOpenExperience,
}: FlowToolbarProps) {
  return (
    <div className="flex items-center gap-2 border-b border-border bg-card px-2 py-2">
      <SidebarTrigger className="mr-1" />

      <Input
        value={flowName}
        onChange={(e) => onFlowNameChange(e.target.value)}
        className="w-52 border-none bg-transparent text-base font-bold text-foreground focus-visible:ring-0"
        placeholder="Flow name"
      />

      {saveStatus && <SaveStatusIndicator status={saveStatus} />}

      {/* Experience link indicator */}
      {experienceName && (
        <button
          onClick={onOpenExperience}
          className="flex items-center gap-1 rounded-md bg-accent/10 px-2 py-1 text-[10px] font-medium text-accent hover:bg-accent/20 transition-colors"
          title="Open linked Experience"
        >
          <Link2 className="h-3 w-3" />
          {experienceName}
        </button>
      )}

      <Separator orientation="vertical" className="mx-1 h-8" />

      {/* Add Node Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
            <span>+ Add Node</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider">Actions</DropdownMenuLabel>
          {actionNodes.map(({ type, label, icon: Icon, color }) => (
            <DropdownMenuItem key={type} onClick={() => onAddNode(type)} className="cursor-pointer gap-2 py-1.5">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded" style={{ background: color }}>
                <Icon className="h-3 w-3 text-white" />
              </span>
              <span className="text-sm">{label}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider">Splits</DropdownMenuLabel>
          {splitNodes.map(({ type, label, icon: Icon, color }) => (
            <DropdownMenuItem key={type} onClick={() => onAddNode(type)} className="cursor-pointer gap-2 py-1.5">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded" style={{ background: color }}>
                <Icon className="h-3 w-3 text-white" />
              </span>
              <span className="text-sm">{label}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider">Wait</DropdownMenuLabel>
          {waitNodes.map(({ type, label, icon: Icon, color }) => (
            <DropdownMenuItem key={type} onClick={() => onAddNode(type)} className="cursor-pointer gap-2 py-1.5">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded" style={{ background: color }}>
                <Icon className="h-3 w-3 text-white" />
              </span>
              <span className="text-sm">{label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Badge variant="outline" className="text-[8px] border-primary/30 text-primary ml-2">Classic Builder</Badge>

      {/* Right side — editor-only actions */}
      <div className="ml-auto flex gap-1">
        <Button variant="outline" size="sm" onClick={() => window.location.href = "/studio"} className="border-accent/30 text-accent hover:bg-accent/5 text-xs">
          <Sparkles className="mr-1 h-3.5 w-3.5" /> XP Studio
        </Button>
        {onSimulate && (
          <Button variant="outline" size="sm" onClick={onSimulate} className="border-node-send/40 text-node-send hover:bg-node-send/10">
            <Play className="mr-1 h-3.5 w-3.5" /> Simulate
          </Button>
        )}
        {onTranslate && (
          <Button variant="outline" size="sm" onClick={onTranslate} className="border-node-wait/40 text-node-wait hover:bg-node-wait/10">
            <Languages className="mr-1 h-3.5 w-3.5" /> Translate
          </Button>
        )}
        {onValidate && (
          <Button variant="outline" size="sm" onClick={onValidate}>
            <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Validate
          </Button>
        )}
        {onVersions && (
          <Button variant="outline" size="sm" onClick={onVersions} className="border-amber-500/40 text-amber-600 hover:bg-amber-500/10">
            <History className="mr-1 h-3.5 w-3.5" /> Versions
          </Button>
        )}
        {onLoadSample && (
          <Button variant="outline" size="sm" onClick={onLoadSample}>
            <FileDown className="mr-1 h-3.5 w-3.5" /> Sample
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onImport}>
          <Upload className="mr-1 h-3.5 w-3.5" /> Import
        </Button>
        <Button variant="default" size="sm" onClick={onExport}>
          <Download className="mr-1 h-3.5 w-3.5" /> Export
        </Button>
        <Button variant="ghost" size="sm" onClick={onClear}>
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
