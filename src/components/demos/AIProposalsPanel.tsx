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
  Play,
  RotateCcw,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import LLMSelector from "./LLMSelector";

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
  visuallyApplied?: boolean;
}

// --- Config ---

const PROPOSAL_STATUS_CONFIG: Record<ProposalStatus, { label: string; icon: typeof Clock; color: string; bg: string; description: string }> = {
  proposed:  { label: "Pending review",     icon: Clock,        color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20",     description: "Waka AI analyzed — awaiting your review" },
  accepted:  { label: "Ready to apply",     icon: CheckCircle2, color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20",       description: "Accepted — apply to visually update sandbox" },
  rejected:  { label: "Rejected",           icon: XCircle,      color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20",         description: "Dismissed from review" },
  applied:   { label: "Applied to sandbox", icon: Archive,      color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", description: "Visually applied to sandbox demo" },
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
  high:   { label: "High",   color: "text-emerald-400" },
  medium: { label: "Medium", color: "text-amber-400" },
  low:    { label: "Low",    color: "text-red-400" },
};

// --- AI helpers ---

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

async function applyProposals(
  jsxSource: string,
  proposals: { prompt: string; summary?: string }[]
): Promise<{ modifiedJsx: string; appliedCount: number } | null> {
  try {
    const { data, error } = await supabase.functions.invoke("waka-ai-apply", {
      body: { jsxSource, proposals },
    });
    if (error) {
      console.error("Waka AI apply error:", error);
      toast({ title: "Apply failed", description: error.message || "Could not apply changes.", variant: "destructive" });
      return null;
    }
    return { modifiedJsx: data.modifiedJsx, appliedCount: data.appliedCount };
  } catch (e) {
    console.error("Waka AI apply call failed:", e);
    toast({ title: "Apply error", description: "Failed to reach the AI engine.", variant: "destructive" });
    return null;
  }
}

// --- Component ---

interface AIProposalsPanelProps {
  demoId: string;
  demoTitle: string;
  currentJsx?: string | null;
  onJsxUpdate?: (newJsx: string, label?: string) => void;
}

export default function AIProposalsPanel({ demoId, demoTitle, currentJsx, onJsxUpdate }: AIProposalsPanelProps) {
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
  const [applying, setApplying] = useState<string | null>(null);
  const [applyingAll, setApplyingAll] = useState(false);
  const [selectedLLM, setSelectedLLM] = useState("waka-ai-gemini");

  const canApply = !!currentJsx && !!onJsxUpdate;

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
      return {
        ...p,
        summary: `Proposed change: "${text.length > 80 ? text.slice(0, 80) + "…" : text}"`,
        analyzing: false,
      };
    });

    persist(updated);
    setSubmitting(false);
  };

  // --- Apply single proposal ---
  const handleApplyOne = async (id: string) => {
    if (!canApply) {
      toast({ title: "Cannot apply", description: "This demo type does not support visual apply yet.", variant: "destructive" });
      return;
    }

    const proposal = proposals.find((p) => p.id === id);
    if (!proposal) return;

    setApplying(id);

    const result = await applyProposals(currentJsx!, [
      { prompt: proposal.prompt, summary: proposal.aiAnalysis?.summary || proposal.summary },
    ]);

    if (result) {
      onJsxUpdate!(result.modifiedJsx, `Applied: ${proposal.prompt.slice(0, 60)}`);
      persist(proposals.map((p) =>
        p.id === id ? { ...p, status: "applied" as ProposalStatus, visuallyApplied: true } : p
      ));
      toast({ title: "✅ Applied to sandbox", description: `"${proposal.prompt.slice(0, 50)}…" — demo updated visually.` });
    }

    setApplying(null);
  };

  // --- Apply all accepted/stored ---
  const handleApplyAll = async () => {
    if (!canApply) {
      toast({ title: "Cannot apply", description: "This demo type does not support visual apply yet.", variant: "destructive" });
      return;
    }

    const toApply = proposals.filter((p) =>
      (p.status === "accepted" || (p.status === "applied" && !p.visuallyApplied))
    );
    if (toApply.length === 0) {
      toast({ title: "Nothing to apply", description: "No accepted proposals pending visual apply." });
      return;
    }

    setApplyingAll(true);

    const result = await applyProposals(
      currentJsx!,
      toApply.map((p) => ({ prompt: p.prompt, summary: p.aiAnalysis?.summary || p.summary }))
    );

    if (result) {
      onJsxUpdate!(result.modifiedJsx);
      const appliedIds = new Set(toApply.map((p) => p.id));
      persist(proposals.map((p) =>
        appliedIds.has(p.id) ? { ...p, status: "applied" as ProposalStatus, visuallyApplied: true } : p
      ));
      toast({ title: "✅ All changes applied", description: `${result.appliedCount} proposal(s) applied to sandbox demo.` });
    }

    setApplyingAll(false);
  };

  // --- Re-apply from history ---
  const handleReApply = async (id: string) => {
    if (!canApply) return;
    const proposal = proposals.find((p) => p.id === id);
    if (!proposal) return;

    setApplying(id);

    const result = await applyProposals(currentJsx!, [
      { prompt: proposal.prompt, summary: proposal.aiAnalysis?.summary || proposal.summary },
    ]);

    if (result) {
      onJsxUpdate!(result.modifiedJsx);
      toast({ title: "✅ Re-applied to sandbox", description: `"${proposal.prompt.slice(0, 50)}…" — applied again.` });
    }

    setApplying(null);
  };

  const updateStatus = (id: string, status: ProposalStatus) => {
    persist(proposals.map((p) => (p.id === id ? { ...p, status } : p)));
    if (status === "accepted") toast({ title: "Proposal accepted", description: "Ready to apply to sandbox." });
    if (status === "rejected") toast({ title: "Proposal rejected", description: "Dismissed from review." });
  };

  const removeProposal = (id: string) => persist(proposals.filter((p) => p.id !== id));

  const proposedCount = proposals.filter((p) => p.status === "proposed").length;
  const acceptedCount = proposals.filter((p) => p.status === "accepted").length;
  const appliedCount = proposals.filter((p) => p.status === "applied").length;
  const applyableCount = proposals.filter((p) => p.status === "accepted").length;

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
          AI-powered proposal analysis & visual apply.
        </p>

        {/* Engine selector */}
        <div className="mt-1.5">
          <LLMSelector selectedId={selectedLLM} onSelect={setSelectedLLM} />
        </div>

        {/* Stats bar */}
        {proposals.length > 0 && (
          <div className="flex gap-3 mt-2 flex-wrap">
            {proposedCount > 0 && <span className="text-[10px] text-amber-400/70">{proposedCount} pending</span>}
            {acceptedCount > 0 && <span className="text-[10px] text-blue-400/70">{acceptedCount} ready</span>}
            {appliedCount > 0 && <span className="text-[10px] text-emerald-400/70">{appliedCount} applied</span>}
          </div>
        )}

        {/* Apply All button */}
        {applyableCount > 0 && canApply && (
          <button
            onClick={handleApplyAll}
            disabled={applyingAll}
            className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600/80 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition"
          >
            {applyingAll ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Applying {applyableCount} change(s)…</>
            ) : (
              <><Play className="h-3.5 w-3.5" /> Apply all accepted ({applyableCount})</>
            )}
          </button>
        )}

        {/* No JSX warning */}
        {!canApply && proposals.length > 0 && (
          <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5">
            <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0" />
            <span className="text-[10px] text-amber-300/80 leading-tight">
              Visual apply not available for built-in demos. Duplicate as sandbox with JSX to enable.
            </span>
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

        {proposals.length === 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {SUGGESTION_PROMPTS.map((s) => (
              <button
                key={s}
                onClick={() => setPromptValue(s)}
                className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[10px] text-white/40 hover:text-white/60 hover:border-white/15 transition"
              >
                <Lightbulb className="h-2.5 w-2.5 inline mr-1 -mt-px" />{s}
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
            const isApplyingThis = applying === p.id;

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
                  {confInfo && <span className={`text-[9px] ${confInfo.color}`}>{confInfo.label}</span>}
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

                {/* Applied badge */}
                {p.visuallyApplied && (
                  <div className="flex items-center gap-1 mb-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    <span className="text-[10px] text-emerald-400 font-semibold">Visually applied to sandbox</span>
                  </div>
                )}

                {/* Status description */}
                {!p.analyzing && !p.visuallyApplied && (
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
                    {ai?.impacts && ai.impacts.length > 0 && (
                      <div>
                        <p className="text-[9px] text-white/30 font-semibold uppercase tracking-wider mb-1">Impacts</p>
                        <ul className="space-y-0.5">
                          {ai.impacts.map((impact, i) => (
                            <li key={i} className="text-[10px] text-white/40 leading-relaxed flex gap-1.5">
                              <span className="text-violet-400/50 mt-0.5">•</span>{impact}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {p.changeTags && p.changeTags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {p.changeTags.map((t) => (
                          <span key={t} className="flex items-center gap-0.5 rounded-full bg-white/5 px-1.5 py-0.5 text-[9px] text-white/30">
                            <Tag className="h-2 w-2" /> {t}
                          </span>
                        ))}
                      </div>
                    )}
                    {!ai && <p className="text-[10px] text-white/40 leading-relaxed">{p.summary}</p>}
                  </div>
                )}

                {/* Actions */}
                {!p.analyzing && (
                  <div className="flex items-center gap-1.5 flex-wrap">
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

                    {p.status === "accepted" && canApply && (
                      <button
                        onClick={() => handleApplyOne(p.id)}
                        disabled={isApplyingThis}
                        className="flex items-center gap-1 rounded-md bg-emerald-500/15 px-2.5 py-1 text-[10px] font-semibold text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-50 transition"
                      >
                        {isApplyingThis ? (
                          <><Loader2 className="h-3 w-3 animate-spin" /> Applying…</>
                        ) : (
                          <><Play className="h-3 w-3" /> Apply to Sandbox</>
                        )}
                      </button>
                    )}

                    {p.status === "accepted" && !canApply && (
                      <button disabled className="flex items-center gap-1 rounded-md bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-white/30 cursor-not-allowed">
                        <AlertTriangle className="h-3 w-3" /> Apply unavailable
                      </button>
                    )}

                    {/* Applied — re-apply option */}
                    {p.status === "applied" && canApply && (
                      <button
                        onClick={() => handleReApply(p.id)}
                        disabled={isApplyingThis}
                        className="flex items-center gap-1 rounded-md bg-violet-500/10 px-2 py-1 text-[10px] font-semibold text-violet-300/70 hover:bg-violet-500/20 disabled:opacity-50 transition"
                        title="Re-apply this change on the current sandbox"
                      >
                        {isApplyingThis ? (
                          <><Loader2 className="h-3 w-3 animate-spin" /> Re-applying…</>
                        ) : (
                          <><RotateCcw className="h-3 w-3" /> Re-apply</>
                        )}
                      </button>
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
            Proposals analyzed & applied by Waka AI — sandbox only.
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
