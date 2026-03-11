import {
  MessageSquare, Clock, GitBranch, Globe, Download, Upload, Trash2, FileDown,
  ShieldCheck, Play, Languages, ChevronDown, History, Search,
  Save, UserCog, Mail, Bot, Workflow, Headphones, Zap, Coins, Sparkles, Link2, Rocket,
  Layers, LayoutGrid, Database, Plus, Box, Radio, Hexagon, BrainCircuit, Users, UserMinus,
} from "lucide-react";
import { Node, Edge } from "@xyflow/react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getTriggerReadiness } from "@/lib/flowValidation";
import { TriggerReadinessBadge } from "./TriggerReadinessBadge";
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

export type EditorViewMode = "canvas" | "structure";

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
  onPromoteToCandidate?: () => void;
  saveStatus?: SaveStatus;
  experienceName?: string | null;
  onOpenExperience?: () => void;
  viewMode: EditorViewMode;
  onViewModeChange: (mode: EditorViewMode) => void;
  onToggleContext: () => void;
  showContext: boolean;
  onAddModule: (label?: string) => void;
  moduleTemplates: string[];
  channel: string;
  onChannelChange: (ch: string) => void;
  nodes?: Node[];
  edges?: Edge[];
  onSearch?: () => void;
  onFocusNode?: (nodeId: string) => void;
  pinnedStartNodeId?: string | null;
  onPinStartNode?: (nodeId: string | null) => void;
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
  { type: "addGroup", label: "Add to a group", icon: Users, color: "hsl(150, 60%, 40%)" },
  { type: "removeGroup", label: "Remove from a group", icon: UserMinus, color: "hsl(25, 85%, 50%)" },
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
  onPromoteToCandidate,
  saveStatus,
  experienceName,
  onOpenExperience,
  viewMode,
  onViewModeChange,
  onToggleContext,
  showContext,
  onAddModule,
  moduleTemplates,
  channel,
  onChannelChange,
  nodes = [],
  edges = [],
  onSearch,
  onFocusNode,
}: FlowToolbarProps) {
  const navigate = useNavigate();
  const triggerReadiness = getTriggerReadiness(nodes, edges);
  return (
    <div className="flex items-center gap-1.5 border-b border-border bg-card px-2 py-1.5">
      <SidebarTrigger className="mr-0.5" />

      {/* Flow identity */}
      <Input
        value={flowName}
        onChange={(e) => onFlowNameChange(e.target.value)}
        className="w-48 border-none bg-transparent text-sm font-bold text-foreground focus-visible:ring-0"
        placeholder="Flow name"
      />

      {saveStatus && <SaveStatusIndicator status={saveStatus} />}
      <TriggerReadinessBadge readiness={triggerReadiness} nodes={nodes} onFocusNode={onFocusNode} />

      {/* Experience link */}
      {experienceName && (
        <button
          onClick={onOpenExperience}
          className="flex items-center gap-1 rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent hover:bg-accent/20 transition-colors"
          title="Open linked Experience"
        >
          <Link2 className="h-3 w-3" />
          {experienceName}
        </button>
      )}

      {/* XP badge — identity signal */}
      <div className="flex items-center gap-1 rounded-md border border-xp-context/20 bg-xp-context/5 px-1.5 py-0.5 ml-0.5">
        <Hexagon className="h-3 w-3 text-xp-context" />
        <span className="text-[9px] font-bold text-xp-context uppercase tracking-widest">XP</span>
      </div>

      <Separator orientation="vertical" className="mx-1 h-7" />

      {/* ── XP Layer controls ── */}
      <div className="flex items-center gap-1 rounded-lg border border-xp-structure/15 bg-xp-surface/50 p-0.5">
        {/* View mode toggle */}
        <button
          onClick={() => onViewModeChange("canvas")}
          className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-all ${
            viewMode === "canvas"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <LayoutGrid className="h-3 w-3" />
          Canvas
        </button>
        <button
          onClick={() => onViewModeChange("structure")}
          className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-all ${
            viewMode === "structure"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="h-3 w-3 text-xp-structure" />
          Structure
        </button>

        <div className="w-px h-4 bg-border/50 mx-0.5" />

        {/* Context toggle — XP contextual layer */}
        <button
          onClick={onToggleContext}
          className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-all ${
            showContext
              ? "bg-xp-context/10 text-xp-context shadow-sm"
              : "text-muted-foreground hover:text-xp-context"
          }`}
        >
          <BrainCircuit className="h-3 w-3" />
          Context
        </button>
      </div>

      {/* Channel selector */}
      <div className="flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/5 p-0.5">
        <Radio className="h-3 w-3 text-primary ml-1" />
        {["whatsapp", "sms", "telegram"].map((ch) => (
          <button
            key={ch}
            onClick={() => onChannelChange(ch)}
            className={`rounded-md px-2 py-1 text-[10px] font-medium transition-all ${
              channel === ch
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-card/50"
            }`}
          >
            {ch === "whatsapp" ? "WA" : ch === "sms" ? "SMS" : "TG"}
          </button>
        ))}
        <span className="text-[9px] text-muted-foreground mr-1 hidden lg:inline">channel</span>
      </div>

      <Separator orientation="vertical" className="mx-1 h-7" />

      {/* ── Execution layer: nodes & modules (canvas only) ── */}
      {viewMode === "canvas" && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 rounded-lg bg-xp-execution px-2.5 py-1 text-[11px] font-semibold text-primary-foreground transition-colors hover:opacity-90">
                <span>+ Node</span>
                <ChevronDown className="h-3 w-3" />
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

          {/* Add Module */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 rounded-lg border border-xp-structure/30 bg-xp-structure/5 px-2 py-1 text-[11px] font-medium text-xp-structure transition-colors hover:bg-xp-structure/10">
                <Box className="h-3 w-3" />
                + Module
                <ChevronDown className="h-2.5 w-2.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider">Templates</DropdownMenuLabel>
              {moduleTemplates.map((t) => (
                <DropdownMenuItem key={t} onClick={() => onAddModule(t)} className="cursor-pointer text-sm">
                  <Plus className="mr-2 h-3 w-3" /> {t}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onAddModule()} className="cursor-pointer text-sm">
                <Plus className="mr-2 h-3 w-3" /> Custom Module
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}

      {/* Right side actions */}
      <div className="ml-auto flex gap-1">
        {onSearch && (
          <Button variant="outline" size="sm" onClick={onSearch} className="h-7 text-[11px] gap-1">
            <Search className="h-3 w-3" />
            <kbd className="hidden sm:inline rounded border border-border bg-muted px-1 py-px text-[8px] font-mono text-muted-foreground">⌘K</kbd>
          </Button>
        )}
        {onPromoteToCandidate && (
          <Button variant="outline" size="sm" onClick={onPromoteToCandidate} className="border-amber-500/30 text-amber-600 hover:bg-amber-500/5 text-[11px] h-7">
            <Rocket className="mr-1 h-3 w-3" /> Promote
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => navigate("/studio")} className="border-accent/30 text-accent hover:bg-accent/5 text-[11px] h-7">
          <Sparkles className="mr-1 h-3 w-3" /> Studio
        </Button>
        {onSimulate && (
          <Button variant="outline" size="sm" onClick={onSimulate} className="border-node-send/40 text-node-send hover:bg-node-send/10 h-7 text-[11px]">
            <Play className="mr-1 h-3 w-3" />
          </Button>
        )}
        {onTranslate && (
          <Button variant="outline" size="sm" onClick={onTranslate} className="border-node-wait/40 text-node-wait hover:bg-node-wait/10 h-7 text-[11px]">
            <Languages className="mr-1 h-3 w-3" />
          </Button>
        )}
        {onValidate && (
          <Button variant="outline" size="sm" onClick={onValidate} className="h-7 text-[11px]">
            <ShieldCheck className="mr-1 h-3 w-3" />
          </Button>
        )}
        {onVersions && (
          <Button variant="outline" size="sm" onClick={onVersions} className="border-amber-500/40 text-amber-600 hover:bg-amber-500/10 h-7 text-[11px]">
            <History className="mr-1 h-3 w-3" />
          </Button>
        )}
        {onLoadSample && (
          <Button variant="outline" size="sm" onClick={onLoadSample} className="h-7 text-[11px]">
            <FileDown className="mr-1 h-3 w-3" />
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onImport} className="h-7 text-[11px]">
          <Upload className="mr-1 h-3 w-3" />
        </Button>
        <Button variant="default" size="sm" onClick={onExport} className="h-7 text-[11px]">
          <Download className="mr-1 h-3 w-3" /> Export
        </Button>
        <Button variant="ghost" size="sm" onClick={onClear} className="h-7">
          <Trash2 className="h-3 w-3 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
