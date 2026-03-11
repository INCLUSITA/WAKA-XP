import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export interface FlowRun {
  id: string;
  flow_id: string | null;
  tenant_id: string;
  contact_urn: string;
  status: "waiting" | "active" | "completed" | "expired" | "errored";
  terminal_reason: string | null;
  context_snapshot: Record<string, unknown>;
  started_at: string;
  updated_at: string;
  ended_at: string | null;
  created_at: string;
  flow_name?: string;
}

export interface FlowRunStep {
  id: string;
  run_id: string;
  node_uuid: string;
  node_type: string;
  node_label: string | null;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  elapsed_ms: number | null;
  created_at: string;
}

export function useFlowRuns(limit = 50) {
  const { tenantId } = useWorkspace();

  return useQuery({
    queryKey: ["flow-runs", tenantId, limit],
    enabled: !!tenantId,
    queryFn: async () => {
      // Fetch runs
      const { data: runs, error } = await supabase
        .from("flow_runs")
        .select("*")
        .eq("tenant_id", tenantId!)
        .order("started_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Fetch flow names for the runs that have flow_id
      const flowIds = [...new Set((runs || []).map((r: any) => r.flow_id).filter(Boolean))];
      let flowMap: Record<string, string> = {};

      if (flowIds.length > 0) {
        const { data: flows } = await supabase
          .from("flows")
          .select("id, name")
          .in("id", flowIds);
        flowMap = Object.fromEntries((flows || []).map((f: any) => [f.id, f.name]));
      }

      return (runs || []).map((r: any) => ({
        ...r,
        flow_name: r.flow_id ? flowMap[r.flow_id] || "Unknown Flow" : "—",
      })) as FlowRun[];
    },
  });
}

export function useFlowRunSteps(runId: string | null) {
  return useQuery({
    queryKey: ["flow-run-steps", runId],
    enabled: !!runId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flow_run_steps")
        .select("*")
        .eq("run_id", runId!)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data || []) as FlowRunStep[];
    },
  });
}
