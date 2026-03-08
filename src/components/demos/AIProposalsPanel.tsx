import { useState } from "react";
import {
  Sparkles,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  FlaskConical,
  MessageSquare,
  Lightbulb,
  Eye,
  Tag,
  Trash2,
  Archive,
  Loader2,
  AlertTriangle,
  Cpu,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// --- Types ---

export type ProposalStatus = "proposed" | "accepted" | "rejected" | "applied";

export interface AIAnalysis {
  summary: string;
  impacts: string[];
  category: string;
  tags: string[];
  confidence: "high" | "medium" | "low";
}

export interface AIProposal {
  id: string;
  prompt: string;
  summary: string;
  status: ProposalStatus;
  createdAt: string;
  category?: string;
  changeTags?: string[];
  aiAnalysis?: AIAnalysis | null;
  aiEngine?: string;
  analyzing?: boolean;
}

// --- Config ---

const PROPOSAL_STATUS_CONFIG: Record<ProposalStatus, { label: string; icon: typeof Clock; color: string; bg: string; description: string }> = {
  proposed:  { label: "Pending review",     icon: Clock,        color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20",     description: "Waka AI analyzed — awaiting your review" },
  accepted:  { label: "Ready to approve",   icon: CheckCircle2, color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20",       description: "Accepted — approve to store in sandbox workflow" },
  rejected:  { label: "Rejected",           icon: XCircle,      color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20",         description: "Dismissed from review" },
  applied:   { label: "Stored in sandbox",  icon: Archive,      color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", description: "Saved in sandbox workflow — visual apply pending" },
};

const SUGGESTION_PROMPTS = [
  "Make the onboarding shorter",
  "Add a financial CTA",
  "Simplify the first screen",
  "Improve mobile layout",
];

const CHANGE_CATEGORIES: Record<string, { label: string; color: string }> = {
  ux:       { label: "UX",       color: "bg-violet-500/20 text-violet-300" },
  content:  { label: "Content",  color: "bg-blue-500/20 text-blue-300" },
  layout:   { label: "Layout",   color: "bg-teal-500/20 text-teal-300" },
  branding: { label: "Branding", color: "bg-pink-500/20 text-pink-300" },
  flow:     { label: "Flow",     color: "bg-amber-500/20 text-amber-300" },
};

const CONFIDENCE_CONFIG: Record<string, { label: string; color: string }> = {
  high:   { label: "High confidence",   color: "text-emerald-400" },
  medium: { label: "Medium confidence",  color: "text-amber-400" },
  low:    { label: "Low confidence",     color: "text-red-400" },
};

// --- AI analysis helper ---

async function analyzeProposal(prompt: string, demoId: string, demoTitle: string): Promise<{ analysis: AIAnalysis; engine: string } | null> {
  try {
    const { data, error } = await supabase.functions.invoke("waka-ai-proposal", {
      body: { prompt, demoId, demoTitle },
    });

    if (error) {
      console.error("Waka AI error:", error);
      toast({ title: "Waka AI unavailable", description: error.message || "Could not analyze proposal.", variant: "destructive" });
      return null;
    }

    return { analysis: data.analysis, engine: data.engine || "waka-ai" };
  } catch (e) {
    console.error("Waka AI call failed:", e);
    toast({ title: "Waka AI error", description: "Failed to reach the AI engine.", variant: "destructive" });
    return null;
  }
}

// --- Component ---

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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const persist = (updated: AIProposal[]) => {
    setProposals(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  // --- Submit with AI analysis ---
  const handleSubmit = async () => {
    const text = promptValue.trim();
    if (!text || submitting) return;

    const id = `prop-${Date.now().toString(36)}`;
    const placeholder: AIProposal = {
      id,
      prompt: text,
      summary: "Analyzing with Waka AI…",
      status: "proposed",
      createdAt: new Date().toISOString(),
      category: "ux",
      changeTags: [],
      aiAnalysis: null,
      aiEngine: undefined,
      analyzing: true,
    };

    const withPlaceholder = [placeholder, ...proposals];
    persist(withPlaceholder);
    setPromptValue("");
    setSubmitting(true);

    const result = await analyzeProposal(text, demoId, demoTitle);

    const updated = withPlaceholder.map((p) => {
      if (p.id !== id) return p;
      if (result) {
        return {
          ...p,
          summary: result.analysis.summary,
          category: result.analysis.category,
          changeTags: result.analysis.tags,
          aiAnalysis: result.analysis,
          aiEngine: result.engine,
          analyzing: false,
        };
      }
      // Fallback — no AI
      return {
        ...p,
        summary: `Proposed change: "${text.length > 80 ? text.slice(0, 80) + "…" : text}"`,
        analyzing: false,
      };
    });

    persist(updated);
    setSubmitting(false);
  };

  const handleApprove = (id: string) => {
    persist(proposals.map((p) => (p.id === id ? { ...p, status: "applied" as ProposalStatus } : p)));
    toast({
      title: "Proposal stored in sandbox",
      description: "Saved in sandbox workflow. Visual application will be available when the AI editing engine is connected.",
    });
  };

  const updateStatus = (id: string, status: ProposalStatus) => {
    if (status === "applied") { handleApprove(id); return; }
    persist(proposals.map((p) => (p.id === id ? { ...p, status } : p)));
    if (status === "accepted") toast({ title: "Proposal accepted", description: "Ready to approve for sandbox workflow." });
    if (status === "rejected") toast({ title: "Proposal rejected", description: "Dismissed from review." });
  };

  const removeProposal = (id: string) => persist(proposals.filter((p) => p.id !== id));

  const proposedCount = proposals.filter((p) => p.status === "proposed").length;
  const acceptedCount = proposals.filter((p) => p.status === "accepted").length;
  const storedCount = proposals.filter((p) => p.status === "applied").length;

  return (
    <div className="w-80 border-l border-white/10 bg-slate-900/95 backdrop-blur-sm flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="h-4 w-4 text-violet-400" />
          <h3 className="text-sm font-bold text-white/90">Waka AI</h3>
          <span className="ml-auto rounded-full bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 text-[9px] font-semibold text-violet-400 uppercase tracking-wider">
            Sandbox only
          </span>
        </div>
        <p className="text-[11px] text-white/35 leading-relaxed">
          AI-powered proposal analysis — review and store changes safely.
        </p>

        {/* Engine badge */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <Cpu className="h-3 w-3 text-violet-400/50" />
          <span className="text-[9px] text-white/25">Engine: Waka AI (Gemini Flash)</span>
        </div>

        {/* Stats bar */}
        {proposals.length > 0 && (
          <div className="flex gap-3 mt-2 flex-wrap">
            {proposedCount > 0 && <span className="text-[10px] text-amber-400/70">{proposedCount} pending</span>}
            {acceptedCount > 0 && <span className="text-[10px] text-blue-400/70">{acceptedCount} ready</span>}
            {storedCount > 0 && <span className="text-[10px] text-emerald-400/70">{storedCount} stored</span>}
          </div>
        )}
      </div>

      {/* Prompt input */}
      <div className="px-3 py-3 border-b border-white/5">
        <div className="flex gap-2">
          <input
            value={promptValue}
            onChange={(e) => setPromptValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Describe a change…"
            disabled={submitting}
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/25 outline-none focus:border-violet-500/50 transition disabled:opacity-50"
          />
          <button
            onClick={handleSubmit}
            disabled={!promptValue.trim() || submitting}
            className="rounded-lg bg-violet-600/80 p-2 text-white transition hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
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
              Describe a change and Waka AI will analyze it and create a safe proposal.
            </p>
          </div>
        ) : (
          proposals.map((p) => {
            const cfg = PROPOSAL_STATUS_CONFIG[p.status];
            const StatusIcon = cfg.icon;
            const isExpanded = expandedId === p.id;
            const catInfo = p.category ? CHANGE_CATEGORIES[p.category] : null;
            const ai = p.aiAnalysis;
            const confInfo = ai?.confidence ? CONFIDENCE_CONFIG[ai.confidence] : null;

            return (
              <div key={p.id} className={`rounded-xl border p-3 transition ${cfg.bg}`}>
                {/* Analyzing spinner */}
                {p.analyzing && (
                  <div className="flex items-center gap-2 mb-2">
                    <Loader2 className="h-3.5 w-3.5 text-violet-400 animate-spin" />
                    <span className="text-[11px] text-violet-300 font-medium">Waka AI is analyzing…</span>
                  </div>
                )}

                {/* Category + Status row */}
                <div className="flex items-center gap-1.5 mb-1.5">
                  {catInfo && (
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${catInfo.color}`}>
                      {catInfo.label}
                    </span>
                  )}
                  {confInfo && (
                    <span className={`text-[9px] ${confInfo.color}`}>
                      {confInfo.label}
                    </span>
                  )}
                  <div className="flex items-center gap-1 ml-auto">
                    <StatusIcon className={`h-3 w-3 ${cfg.color}`} />
                    <span className={`text-[10px] font-semibold ${cfg.color}`}>{cfg.label}</span>
                  </div>
                </div>

                {/* Prompt */}
                <p className="text-xs text-white/70 font-medium leading-relaxed mb-1">"{p.prompt}"</p>

                {/* AI Summary */}
                {!p.analyzing && ai?.summary && (
                  <p className="text-[11px] text-white/50 leading-relaxed mb-1.5">{ai.summary}</p>
                )}

                {/* Status description */}
                {!p.analyzing && (
                  <p className="text-[10px] text-white/25 mb-1.5 italic">{cfg.description}</p>
                )}

                {/* Engine badge */}
                {p.aiEngine && !p.analyzing && (
                  <div className="flex items-center gap-1 mb-1.5">
                    <Cpu className="h-2.5 w-2.5 text-violet-400/40" />
                    <span className="text-[9px] text-white/20">Analyzed by Waka AI</span>
                  </div>
                )}

                {/* Details — expandable */}
                {!p.analyzing && (
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : p.id)}
                    className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/50 transition mb-2"
                  >
                    <Eye className="h-2.5 w-2.5" />
                    {isExpanded ? "Hide details" : "View details"}
                  </button>
                )}

                {isExpanded && (
                  <div className="mb-2 rounded-lg bg-white/[0.03] border border-white/5 p-2 space-y-2">
                    {/* Impacts */}
                    {ai?.impacts && ai.impacts.length > 0 && (
                      <div>
                        <p className="text-[9px] text-white/30 font-semibold uppercase tracking-wider mb-1">Impacts</p>
                        <ul className="space-y-0.5">
                          {ai.impacts.map((impact, i) => (
                            <li key={i} className="text-[10px] text-white/40 leading-relaxed flex gap-1.5">
                              <span className="text-violet-400/50 mt-0.5">•</span>
                              {impact}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Tags */}
                    {p.changeTags && p.changeTags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {p.changeTags.map((t) => (
                          <span key={t} className="flex items-center gap-0.5 rounded-full bg-white/5 px-1.5 py-0.5 text-[9px] text-white/30">
                            <Tag className="h-2 w-2" /> {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Fallback summary */}
                    {!ai && <p className="text-[10px] text-white/40 leading-relaxed">{p.summary}</p>}
                  </div>
                )}

                {/* Actions */}
                {!p.analyzing && (
                  <div className="flex items-center gap-1.5">
                    {p.status === "proposed" && (
                      <>
                        <button
                          onClick={() => updateStatus(p.id, "accepted")}
                          className="flex items-center gap-1 rounded-md bg-blue-500/15 px-2 py-1 text-[10px] font-semibold text-blue-300 hover:bg-blue-500/25 transition"
                        >
                          <CheckCircle2 className="h-3 w-3" /> Accept
                        </button>
                        <button
                          onClick={() => updateStatus(p.id, "rejected")}
                          className="flex items-center gap-1 rounded-md bg-red-500/10 px-2 py-1 text-[10px] font-semibold text-red-400/70 hover:bg-red-500/20 transition"
                        >
                          <XCircle className="h-3 w-3" /> Reject
                        </button>
                      </>
                    )}

                    {p.status === "accepted" && (
                      <button
                        onClick={() => updateStatus(p.id, "applied")}
                        className="flex items-center gap-1 rounded-md bg-emerald-500/15 px-2.5 py-1 text-[10px] font-semibold text-emerald-300 hover:bg-emerald-500/25 transition"
                      >
                        <Archive className="h-3 w-3" /> Store in Sandbox
                      </button>
                    )}

                    {p.status === "applied" && (
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400/60">
                          <Archive className="h-3 w-3" /> Stored in workflow
                        </span>
                        <span className="text-[9px] text-white/20 leading-tight">
                          Visual apply available when AI engine connects
                        </span>
                      </div>
                    )}

                    {p.status !== "proposed" && (
                      <button
                        onClick={() => removeProposal(p.id)}
                        className="ml-auto rounded-md p-1 text-white/15 hover:text-white/40 hover:bg-white/5 transition"
                        title="Dismiss"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-white/5 space-y-1">
        <div className="flex items-center gap-1.5">
          <FlaskConical className="h-3 w-3 text-amber-400/50" />
          <p className="text-[9px] text-white/20 leading-relaxed">
            Proposals analyzed by Waka AI — stored in sandbox only.
          </p>
        </div>
        <div className="flex items-center gap-1.5 pl-[18px]">
          <AlertTriangle className="h-2.5 w-2.5 text-white/10" />
          <p className="text-[9px] text-white/15 leading-relaxed">
            More AI engines (Azure OpenAI, etc.) coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
