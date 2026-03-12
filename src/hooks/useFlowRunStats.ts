import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export interface FlowRunStats {
  flow_id: string;
  total: number;
  errored: number;
  last_started_at: string | null;
  last_error_reason: string | null;
}

/**
 * Fetch lightweight run stats (count, errors, last run) for a set of flow IDs.
 * Used on the Flow Dashboard cards.
 */
export function useFlowRunStats(flowIds: string[]) {
  const { tenantId } = useWorkspace();

  return useQuery({
    queryKey: ["flow-run-stats", tenantId, flowIds.sort().join(",")],
    enabled: !!tenantId && flowIds.length > 0,
    staleTime: 30_000,
    queryFn: async () => {
      // Fetch recent runs for these flows (last 100 to keep it light)
      const { data, error } = await supabase
        .from("flow_runs")
        .select("flow_id, status, started_at, terminal_reason")
        .eq("tenant_id", tenantId!)
        .in("flow_id", flowIds)
        .order("started_at", { ascending: false })
        .limit(500);

      if (error) throw error;

      const map: Record<string, FlowRunStats> = {};
      for (const row of data || []) {
        if (!row.flow_id) continue;
        if (!map[row.flow_id]) {
          map[row.flow_id] = {
            flow_id: row.flow_id,
            total: 0,
            errored: 0,
            last_started_at: null,
            last_error_reason: null,
          };
        }
        const s = map[row.flow_id];
        s.total++;
        if (row.status === "errored") {
          s.errored++;
          if (!s.last_error_reason) s.last_error_reason = row.terminal_reason;
        }
        if (!s.last_started_at || row.started_at > s.last_started_at) {
          s.last_started_at = row.started_at;
        }
      }
      return map;
    },
  });
}

/**
 * Fetch recent runs for a single flow (used in the editor panel).
 */
export function useFlowRecentRuns(flowId: string | null, limit = 10) {
  const { tenantId } = useWorkspace();

  return useQuery({
    queryKey: ["flow-recent-runs", tenantId, flowId, limit],
    enabled: !!tenantId && !!flowId,
    staleTime: 15_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flow_runs")
        .select("id, status, contact_urn, started_at, ended_at, terminal_reason")
        .eq("tenant_id", tenantId!)
        .eq("flow_id", flowId!)
        .order("started_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
  });
}
