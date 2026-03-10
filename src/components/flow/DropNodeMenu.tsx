import { useEffect, useRef } from "react";
import {
  MessageSquare, Clock, GitBranch, Globe, Save, UserCog, Mail, Bot,
  Workflow, Headphones, Zap, Coins, Users, UserMinus,
} from "lucide-react";

export interface DropMenuPosition {
  x: number;
  y: number;
  sourceNodeId: string;
  sourceHandleId?: string | null;
}

interface DropNodeMenuProps {
  position: DropMenuPosition;
  onSelect: (type: string) => void;
  onClose: () => void;
}

const sections = [
  {
    label: "Actions",
    items: [
      { type: "sendMsg", label: "Send a message", icon: MessageSquare, color: "hsl(160, 84%, 39%)" },
      { type: "updateContact", label: "Update contact", icon: UserCog, color: "hsl(200, 70%, 50%)" },
      { type: "sendEmail", label: "Send email", icon: Mail, color: "hsl(340, 70%, 50%)" },
      { type: "saveResult", label: "Save result", icon: Save, color: "hsl(45, 80%, 50%)" },
      { type: "webhook", label: "Call webhook", icon: Globe, color: "hsl(30, 90%, 55%)" },
      { type: "callAI", label: "Call AI", icon: Bot, color: "hsl(270, 70%, 55%)" },
      { type: "callZapier", label: "Call Zapier", icon: Zap, color: "hsl(20, 90%, 55%)" },
      { type: "enterFlow", label: "Enter flow", icon: Workflow, color: "hsl(190, 70%, 45%)" },
      { type: "openTicket", label: "Open ticket", icon: Headphones, color: "hsl(15, 80%, 50%)" },
      { type: "sendAirtime", label: "Send airtime", icon: Coins, color: "hsl(50, 80%, 45%)" },
      { type: "addGroup", label: "Add to group", icon: Users, color: "hsl(150, 60%, 40%)" },
      { type: "removeGroup", label: "Remove from group", icon: UserMinus, color: "hsl(25, 85%, 50%)" },
    ],
  },
  {
    label: "Splits",
    items: [
      { type: "splitExpression", label: "Split by expression", icon: GitBranch, color: "hsl(260, 60%, 55%)" },
      { type: "splitContactField", label: "Split by contact field", icon: GitBranch, color: "hsl(260, 60%, 55%)" },
      { type: "splitResult", label: "Split by result", icon: GitBranch, color: "hsl(260, 60%, 55%)" },
      { type: "splitRandom", label: "Split by random", icon: GitBranch, color: "hsl(260, 60%, 55%)" },
      { type: "splitGroup", label: "Split by group", icon: GitBranch, color: "hsl(260, 60%, 55%)" },
    ],
  },
  {
    label: "Wait",
    items: [
      { type: "waitResponse", label: "Wait for response", icon: Clock, color: "hsl(220, 80%, 55%)" },
    ],
  },
];

export function DropNodeMenu({ position, onSelect, onClose }: DropNodeMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as HTMLElement)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Clamp menu position so it doesn't overflow viewport
  const menuWidth = 220;
  const menuHeight = 420;
  const left = Math.min(position.x, window.innerWidth - menuWidth - 16);
  const top = Math.min(position.y, window.innerHeight - menuHeight - 16);

  return (
    <div
      ref={ref}
      className="fixed z-[100] w-[220px] max-h-[420px] overflow-y-auto rounded-lg border border-border bg-card shadow-xl animate-in fade-in zoom-in-95 duration-150"
      style={{ left, top }}
    >
      {sections.map((section, si) => (
        <div key={section.label}>
          {si > 0 && <div className="h-px bg-border mx-2" />}
          <div className="px-3 pt-2 pb-1">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
              {section.label}
            </span>
          </div>
          {section.items.map(({ type, label, icon: Icon, color }) => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] text-foreground hover:bg-muted/80 transition-colors"
            >
              <span
                className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded"
                style={{ background: color }}
              >
                <Icon className="h-3 w-3 text-white" />
              </span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
