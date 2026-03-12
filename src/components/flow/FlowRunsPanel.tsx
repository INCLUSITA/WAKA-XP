import { X, Activity, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RunStatusBadge } from "@/components/runs/RunStatusBadge";
import { ChannelBadge } from "@/components/runs/ChannelBadge";
import { channelFromUrn } from "@/lib/channelUtils";
import { useFlowRecentRuns } from "@/hooks/useFlowRunStats";
import { useNavigate } from "react-router-dom";

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface Props {
  flowId: string | null;
  onClose: () => void;
}

export function FlowRunsPanel({ flowId, onClose }: Props) {
  const { data: runs, isLoading } = useFlowRecentRuns(flowId);
  const navigate = useNavigate();

  const errorCount = runs?.filter((r) => r.status === "errored").length ?? 0;

  return (
    <div className="absolute right-0 top-0 h-full w-80 border-l border-border bg-card shadow-xl z-20 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Recent Runs</h3>
          {runs && (
            <Badge variant="secondary" className="text-[10px]">
              {runs.length}
            </Badge>
          )}
          {errorCount > 0 && (
            <Badge variant="destructive" className="text-[10px]">
              {errorCount} failed
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : !runs || runs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center text-muted-foreground">
            <Activity className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm font-medium">No backend runs yet</p>
            <p className="text-xs mt-1">Runs will appear here once this flow executes on the backend.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {runs.map((run) => (
              <button
                key={run.id}
                onClick={() => navigate(`/runs`)}
                className="w-full px-4 py-3 text-left transition-colors hover:bg-muted/50 group"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <ChannelBadge channel={channelFromUrn(run.contact_urn)} />
                    <span className="text-xs font-mono text-muted-foreground truncate max-w-[120px]">
                      {run.contact_urn?.split(":").slice(1).join(":") || "—"}
                    </span>
                  </div>
                  <RunStatusBadge status={run.status as any} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    {formatRelative(run.started_at)}
                  </span>
                  {run.terminal_reason && (
                    <span className="text-[10px] text-destructive truncate max-w-[160px]">
                      {run.terminal_reason}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs gap-1 text-muted-foreground"
          onClick={() => navigate("/runs")}
        >
          <ExternalLink className="h-3 w-3" />
          View all runs
        </Button>
      </div>
    </div>
  );
}
