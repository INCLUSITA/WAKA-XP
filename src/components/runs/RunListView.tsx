import { useState } from "react";
import { Search, Activity, ServerCog } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RunStatusBadge } from "./RunStatusBadge";
import { ChannelBadge } from "./ChannelBadge";
import { channelFromUrn } from "@/lib/channelUtils";
import { isWindowPolicyError, WindowPolicyBadge } from "@/components/whatsapp/WhatsAppPolicyHints";
import type { FlowRun } from "@/hooks/useFlowRuns";

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
  runs: FlowRun[];
  isLoading: boolean;
  onSelectRun: (id: string) => void;
}

export function RunListView({ runs, isLoading, onSelectRun }: Props) {
  const [search, setSearch] = useState("");

  const filtered = runs.filter(
    (r) =>
      (r.flow_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      r.contact_urn.toLowerCase().includes(search.toLowerCase()) ||
      r.status.includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <ServerCog className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Backend Runs</h1>
            <p className="text-xs text-muted-foreground">
              Live execution history · not simulator
            </p>
          </div>
          <Badge variant="outline" className="gap-1 text-xs text-muted-foreground">
            <Activity className="h-3 w-3" />
            {runs.length} runs
          </Badge>
        </div>
        <div className="mt-3 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by flow, contact or status..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <ServerCog className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No backend runs yet</p>
            <p className="text-xs mt-1">Runs will appear here once flows execute on the backend.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3">Flow</th>
                <th className="px-6 py-3">Channel</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3">Reason</th>
                <th className="px-6 py-3 text-right">Started</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((run) => (
                <tr
                  key={run.id}
                  onClick={() => onSelectRun(run.id)}
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                >
                  <td className="px-6 py-3">
                    <span className="text-sm font-medium text-primary">{run.flow_name}</span>
                  </td>
                  <td className="px-6 py-3">
                    <ChannelBadge channel={channelFromUrn(run.contact_urn)} />
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-sm text-muted-foreground font-mono">
                      {run.contact_urn?.split(":").slice(1).join(":") || "—"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <RunStatusBadge status={run.status} />
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-muted-foreground truncate block max-w-[200px]">
                        {run.terminal_reason || "—"}
                      </span>
                      {isWindowPolicyError(run.terminal_reason) && <WindowPolicyBadge />}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right text-sm text-muted-foreground">
                    {formatRelative(run.started_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
