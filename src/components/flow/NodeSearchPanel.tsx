import { useState, useCallback, useEffect, useRef } from "react";
import { Node } from "@xyflow/react";
import { Search, X, MessageSquare, Clock, GitBranch, Globe, Save, UserCog, Mail, Bot, Workflow, Headphones, Zap, Coins, Users, UserMinus } from "lucide-react";
import { Input } from "@/components/ui/input";

const nodeTypeIcons: Record<string, typeof MessageSquare> = {
  sendMsg: MessageSquare,
  waitResponse: Clock,
  splitExpression: GitBranch,
  splitContactField: GitBranch,
  splitResult: GitBranch,
  splitRandom: GitBranch,
  splitGroup: GitBranch,
  webhook: Globe,
  saveResult: Save,
  updateContact: UserCog,
  sendEmail: Mail,
  callAI: Bot,
  enterFlow: Workflow,
  openTicket: Headphones,
  callZapier: Zap,
  sendAirtime: Coins,
  addGroup: Users,
  removeGroup: UserMinus,
};

const nodeTypeLabels: Record<string, string> = {
  sendMsg: "Send Message",
  waitResponse: "Wait for Response",
  splitExpression: "Split by Expression",
  splitContactField: "Split by Contact Field",
  splitResult: "Split by Result",
  splitRandom: "Split Random",
  splitGroup: "Split by Group",
  webhook: "Webhook",
  saveResult: "Save Result",
  updateContact: "Update Contact",
  sendEmail: "Send Email",
  callAI: "Call AI",
  enterFlow: "Enter Flow",
  openTicket: "Open Ticket",
  callZapier: "Call Zapier",
  sendAirtime: "Send Airtime",
  addGroup: "Add to Group",
  removeGroup: "Remove from Group",
};

const nodeTypeColors: Record<string, string> = {
  sendMsg: "hsl(160, 84%, 39%)",
  waitResponse: "hsl(220, 80%, 55%)",
  splitExpression: "hsl(260, 60%, 55%)",
  splitContactField: "hsl(260, 60%, 55%)",
  splitResult: "hsl(260, 60%, 55%)",
  splitRandom: "hsl(260, 60%, 55%)",
  splitGroup: "hsl(260, 60%, 55%)",
  webhook: "hsl(30, 90%, 55%)",
  saveResult: "hsl(45, 80%, 50%)",
  updateContact: "hsl(200, 70%, 50%)",
  sendEmail: "hsl(340, 70%, 50%)",
  callAI: "hsl(270, 70%, 55%)",
  enterFlow: "hsl(190, 70%, 45%)",
  openTicket: "hsl(15, 80%, 50%)",
  callZapier: "hsl(20, 90%, 55%)",
  sendAirtime: "hsl(50, 80%, 45%)",
  addGroup: "hsl(150, 60%, 40%)",
  removeGroup: "hsl(25, 85%, 50%)",
};

interface NodeSearchPanelProps {
  nodes: Node[];
  onFocusNode: (nodeId: string) => void;
  onClose: () => void;
}

function getNodeLabel(node: Node): string {
  const d = node.data as any;
  if (d.text) return d.text.slice(0, 60);
  if (d.label) return d.label;
  if (d.url) return d.url.slice(0, 50);
  if (d.prompt) return d.prompt.slice(0, 50);
  if (d.groupName) return d.groupName;
  return nodeTypeLabels[node.type || ""] || node.id.slice(0, 12);
}

export function NodeSearchPanel({ nodes, onFocusNode, onClose }: NodeSearchPanelProps) {
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const searchableNodes = nodes.filter((n) => n.type !== "moduleGroup");
  
  const filtered = query.trim()
    ? searchableNodes.filter((n) => {
        const label = getNodeLabel(n).toLowerCase();
        const type = (nodeTypeLabels[n.type || ""] || "").toLowerCase();
        const q = query.toLowerCase();
        return label.includes(q) || type.includes(q) || n.id.includes(q);
      })
    : searchableNodes;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  // Scroll selected into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const item = list.children[selectedIdx] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [selectedIdx]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && filtered[selectedIdx]) {
        e.preventDefault();
        onFocusNode(filtered[selectedIdx].id);
        onClose();
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [filtered, selectedIdx, onFocusNode, onClose]
  );

  return (
    <div className="absolute left-1/2 top-16 z-50 -translate-x-1/2 w-[400px] rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
      {/* Search input */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search nodes by type or content…"
          className="border-none bg-transparent text-sm focus-visible:ring-0 p-0 h-7"
        />
        <button onClick={onClose} className="rounded p-0.5 hover:bg-muted shrink-0">
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Results */}
      <div ref={listRef} className="max-h-[320px] overflow-y-auto p-1">
        {filtered.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            No nodes match "{query}"
          </div>
        ) : (
          filtered.map((node, i) => {
            const Icon = nodeTypeIcons[node.type || ""] || MessageSquare;
            const color = nodeTypeColors[node.type || ""] || "hsl(220, 14%, 70%)";
            const label = getNodeLabel(node);
            const typeLabel = nodeTypeLabels[node.type || ""] || node.type || "";

            return (
              <button
                key={node.id}
                onClick={() => { onFocusNode(node.id); onClose(); }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                  i === selectedIdx ? "bg-primary/10" : "hover:bg-muted/50"
                }`}
              >
                <span
                  className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded"
                  style={{ background: color }}
                >
                  <Icon className="h-3.5 w-3.5 text-white" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{label}</p>
                  <p className="text-[10px] text-muted-foreground">{typeLabel}</p>
                </div>
                <span className="text-[9px] font-mono text-muted-foreground/60 shrink-0">
                  {node.id.slice(0, 8)}
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Footer hint */}
      <div className="border-t border-border px-3 py-1.5 flex items-center gap-3 text-[10px] text-muted-foreground">
        <span><kbd className="rounded border border-border bg-muted px-1 py-px text-[9px]">↑↓</kbd> navigate</span>
        <span><kbd className="rounded border border-border bg-muted px-1 py-px text-[9px]">⏎</kbd> focus</span>
        <span><kbd className="rounded border border-border bg-muted px-1 py-px text-[9px]">Esc</kbd> close</span>
        <span className="ml-auto">{filtered.length} node{filtered.length !== 1 ? "s" : ""}</span>
      </div>
    </div>
  );
}
