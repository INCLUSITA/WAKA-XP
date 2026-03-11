import { ArrowLeft, CheckCircle, XCircle, Clock, ServerCog, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RunStatusBadge } from "./RunStatusBadge";
import { ChannelBadge } from "./ChannelBadge";
import { channelFromUrn } from "@/lib/channelUtils";
import { useFlowRunSteps } from "@/hooks/useFlowRuns";
import type { FlowRun, FlowRunStep } from "@/hooks/useFlowRuns";
import { cn } from "@/lib/utils";
import { isWindowPolicyError, WindowPolicyBadge, isTemplatePolicyError, TemplateBadge } from "@/components/whatsapp/WhatsAppPolicyHints";

function formatTimestamp(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

function durationLabel(start: string, end: string | null) {
  if (!end) return "in progress";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
}

const nodeTypeColors: Record<string, string> = {
  send_msg: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  wait_for_response: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  split_by_expression: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  call_webhook: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  call_ai: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  update_contact: "bg-pink-500/10 text-pink-600 border-pink-500/20",
};

function StepCard({ step, index }: { step: FlowRunStep; index: number }) {
  const colorClass = nodeTypeColors[step.node_type] ?? "bg-muted text-muted-foreground border-border";
  const hasOutput = Object.keys(step.output).length > 0;
  const outputStr = hasOutput ? JSON.stringify(step.output) : "";
  const windowIssue = step.node_type === "send_msg" && isWindowPolicyError(outputStr);

  return (
    <div className="flex gap-3">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div className={cn("flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold", colorClass)}>
          {index + 1}
        </div>
        <div className="flex-1 w-px bg-border" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-foreground">{step.node_label || step.node_uuid.slice(0, 8)}</span>
          <Badge variant="outline" className={cn("text-[10px] font-mono", colorClass)}>
            {step.node_type}
          </Badge>
          {windowIssue && <WindowPolicyBadge />}
          {step.elapsed_ms != null && (
            <span className="text-[10px] text-muted-foreground ml-auto">{step.elapsed_ms}ms</span>
          )}
        </div>

        {hasOutput && (
          <pre className="mt-1.5 rounded-md border border-border bg-muted/30 p-2 text-[11px] font-mono text-muted-foreground overflow-x-auto max-h-32 whitespace-pre-wrap">
            {JSON.stringify(step.output, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

interface Props {
  run: FlowRun;
  onBack: () => void;
}

export function RunDetailView({ run, onBack }: Props) {
  const { data: steps, isLoading: stepsLoading } = useFlowRunSteps(run.id);
  const isTerminal = ["completed", "expired", "errored"].includes(run.status);
  const hasContext = Object.keys(run.context_snapshot ?? {}).length > 0;

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <ServerCog className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">Run Detail</h2>
            <Badge variant="outline" className="text-[10px] text-muted-foreground">
              Backend
            </Badge>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="font-medium text-primary">{run.flow_name}</span>
            <ChevronRight className="h-3 w-3" />
            <ChannelBadge channel={channelFromUrn(run.contact_urn)} size="md" />
            <ChevronRight className="h-3 w-3" />
            <span className="font-mono">{run.contact_urn?.split(":").slice(1).join(":") || "no contact"}</span>
          </div>
        </div>
        <RunStatusBadge status={run.status} />
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Summary card */}
        <div className={cn(
          "flex items-start gap-4 rounded-lg border p-4",
          isTerminal && run.status === "completed" && "border-green-200 bg-green-50 dark:border-green-500/20 dark:bg-green-500/5",
          isTerminal && run.status === "errored" && "border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/5",
          isTerminal && run.status === "expired" && "border-orange-200 bg-orange-50 dark:border-orange-500/20 dark:bg-orange-500/5",
          !isTerminal && "border-border bg-muted/20",
        )}>
          <div className="flex-1 space-y-2">
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
              <div>
                <span className="text-muted-foreground">Channel</span>
                <div className="mt-0.5">
                  <ChannelBadge channel={channelFromUrn(run.contact_urn)} size="md" />
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Duration</span>
                <p className="font-medium text-foreground text-xs">{durationLabel(run.started_at, run.ended_at)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Started</span>
                <p className="font-mono text-foreground text-xs">{formatTimestamp(run.started_at)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Ended</span>
                <p className="font-mono text-foreground text-xs">{formatTimestamp(run.ended_at)}</p>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Terminal reason</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="font-medium text-foreground text-xs">{run.terminal_reason || "—"}</p>
                  {isWindowPolicyError(run.terminal_reason) && <WindowPolicyBadge />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step trace */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            Step Trace
            {steps && (
              <Badge variant="secondary" className="text-[10px]">{steps.length} steps</Badge>
            )}
          </h3>

          {stepsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : !steps || steps.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
              <p className="text-sm">No steps recorded for this run.</p>
            </div>
          ) : (
            <div className="space-y-0">
              {steps.map((step, i) => (
                <StepCard key={step.id} step={step} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* Context snapshot */}
        {hasContext && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Context Snapshot</h3>
            <pre className="rounded-lg border border-border bg-muted/30 p-4 text-xs font-mono text-muted-foreground overflow-x-auto max-h-48 whitespace-pre-wrap">
              {JSON.stringify(run.context_snapshot, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
