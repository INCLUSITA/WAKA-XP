import { useState } from "react";
import {
  Sparkles,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  FlaskConical,
  ChevronRight,
  MessageSquare,
  Lightbulb,
} from "lucide-react";

export type ProposalStatus = "proposed" | "accepted" | "rejected";

export interface AIProposal {
  id: string;
  prompt: string;
  summary: string;
  status: ProposalStatus;
  createdAt: string;
}

const PROPOSAL_STATUS_CONFIG: Record<ProposalStatus, { label: string; icon: typeof Clock; color: string; bg: string }> = {
  proposed: { label: "Proposed", icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  accepted: { label: "Accepted", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  rejected: { label: "Rejected", icon: XCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
};

const SUGGESTION_PROMPTS = [
  "Make the onboarding shorter",
  "Add a financial CTA",
  "Simplify the first screen",
];

interface AIProposalsPanelProps {
  demoId: string;
  demoTitle: string;
}

export default function AIProposalsPanel({ demoId, demoTitle }: AIProposalsPanelProps) {
  const storageKey = `ai-proposals-${demoId}`;

  const [proposals, setProposals] = useState<AIProposal[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [promptValue, setPromptValue] = useState("");

  const persist = (updated: AIProposal[]) => {
    setProposals(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const handleSubmit = () => {
    const text = promptValue.trim();
    if (!text) return;
    const newProposal: AIProposal = {
      id: `prop-${Date.now().toString(36)}`,
      prompt: text,
      summary: `AI will analyze: "${text.length > 60 ? text.slice(0, 60) + "…" : text}"`,
      status: "proposed",
      createdAt: new Date().toISOString(),
    };
    persist([newProposal, ...proposals]);
    setPromptValue("");
  };

  const updateStatus = (id: string, status: ProposalStatus) => {
    persist(proposals.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  const removeProposal = (id: string) => {
    persist(proposals.filter((p) => p.id !== id));
  };

  return (
    <div className="w-80 border-l border-white/10 bg-slate-900/95 backdrop-blur-sm flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-violet-400" />
          <h3 className="text-sm font-bold text-white/90">AI Proposals</h3>
          <span className="ml-auto rounded-full bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 text-[9px] font-semibold text-violet-400 uppercase tracking-wider">
            Sandbox only
          </span>
        </div>
        <p className="text-[11px] text-white/35 leading-relaxed">
          Suggest changes safely — proposals are reviewed before any edit.
        </p>
      </div>

      {/* Prompt input */}
      <div className="px-3 py-3 border-b border-white/5">
        <div className="flex gap-2">
          <input
            value={promptValue}
            onChange={(e) => setPromptValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Describe a change…"
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/25 outline-none focus:border-violet-500/50 transition"
          />
          <button
            onClick={handleSubmit}
            disabled={!promptValue.trim()}
            className="rounded-lg bg-violet-600/80 p-2 text-white transition hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Quick suggestions */}
        {proposals.length === 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {SUGGESTION_PROMPTS.map((s) => (
              <button
                key={s}
                onClick={() => setPromptValue(s)}
                className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[10px] text-white/40 hover:text-white/60 hover:border-white/15 transition"
              >
                <Lightbulb className="h-2.5 w-2.5 inline mr-1 -mt-px" />
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Proposals list */}
      <div className="flex-1 overflow-auto px-3 py-2 space-y-2">
        {proposals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-8 w-8 text-white/10 mb-3" />
            <p className="text-xs font-semibold text-white/25 mb-1">No proposals yet</p>
            <p className="text-[10px] text-white/15 max-w-[180px] leading-relaxed">
              Describe a change and AI will create a safe proposal for this sandbox demo.
            </p>
          </div>
        ) : (
          proposals.map((p) => {
            const cfg = PROPOSAL_STATUS_CONFIG[p.status];
            const StatusIcon = cfg.icon;
            return (
              <div
                key={p.id}
                className={`rounded-xl border p-3 transition ${cfg.bg}`}
              >
                {/* Prompt */}
                <p className="text-xs text-white/70 font-medium leading-relaxed mb-1.5">
                  "{p.prompt}"
                </p>

                {/* Summary */}
                <p className="text-[10px] text-white/35 mb-2 leading-relaxed">{p.summary}</p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <StatusIcon className={`h-3 w-3 ${cfg.color}`} />
                    <span className={`text-[10px] font-semibold ${cfg.color}`}>{cfg.label}</span>
                  </div>

                  {p.status === "proposed" && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => updateStatus(p.id, "accepted")}
                        className="rounded-md bg-emerald-500/15 p-1 text-emerald-400 hover:bg-emerald-500/25 transition"
                        title="Accept"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => updateStatus(p.id, "rejected")}
                        className="rounded-md bg-red-500/15 p-1 text-red-400 hover:bg-red-500/25 transition"
                        title="Reject"
                      >
                        <XCircle className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  {p.status !== "proposed" && (
                    <button
                      onClick={() => removeProposal(p.id)}
                      className="text-[10px] text-white/20 hover:text-white/40 transition"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Safe workflow hint */}
      <div className="px-4 py-2.5 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <FlaskConical className="h-3 w-3 text-amber-400/50" />
          <p className="text-[9px] text-white/20 leading-relaxed">
            Proposals target this sandbox only — stable demo is never modified.
          </p>
        </div>
      </div>
    </div>
  );
}
