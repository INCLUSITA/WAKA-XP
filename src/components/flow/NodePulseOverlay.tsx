import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";

interface ActiveNodeCounts {
  [nodeUuid: string]: number;
}

/**
 * Queries flow_run_steps for recently active nodes and provides pulse data.
 * This is a data hook — the actual pulse rendering happens in the node components.
 */
export function useActiveNodePulse(flowId: string | null) {
  const { tenantId } = useWorkspace();
  const [activeCounts, setActiveCounts] = useState<ActiveNodeCounts>({});

  useEffect(() => {
    if (!flowId || !tenantId) {
      setActiveCounts({});
      return;
    }

    const fetchActive = async () => {
      // Find runs that are currently active or waiting for this flow
      const { data: runs } = await supabase
        .from("flow_runs")
        .select("id")
        .eq("flow_id", flowId)
        .eq("tenant_id", tenantId)
        .in("status", ["active", "waiting"])
        .limit(50);

      if (!runs || runs.length === 0) {
        setActiveCounts({});
        return;
      }

      const runIds = runs.map((r) => r.id);

      // Get the latest step for each active run
      const { data: steps } = await supabase
        .from("flow_run_steps")
        .select("node_uuid")
        .in("run_id", runIds)
        .order("created_at", { ascending: false })
        .limit(100);

      if (!steps) {
        setActiveCounts({});
        return;
      }

      // Count contacts at each node
      const counts: ActiveNodeCounts = {};
      // We only care about the latest step per run — approximate by counting all recent steps
      for (const step of steps) {
        counts[step.node_uuid] = (counts[step.node_uuid] || 0) + 1;
      }
      setActiveCounts(counts);
    };

    fetchActive();

    // Refresh every 10 seconds
    const interval = setInterval(fetchActive, 10_000);

    // Also subscribe to realtime for immediate updates
    const channel = supabase
      .channel(`pulse-${flowId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "flow_run_steps",
        },
        () => {
          fetchActive();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [flowId, tenantId]);

  return activeCounts;
}

/**
 * Small pulse dot to overlay on a node that has active runs.
 */
export function PulseDot({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <div className="absolute -top-1.5 -right-1.5 z-10 flex items-center gap-0.5">
      <motion.div
        className="relative flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
      >
        {/* Pulse ring */}
        <motion.div
          className="absolute rounded-full bg-emerald-400/40"
          style={{ width: 20, height: 20 }}
          animate={{
            scale: [1, 1.8, 1],
            opacity: [0.6, 0, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {/* Core dot */}
        <div className="relative rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30 flex items-center justify-center"
          style={{ width: 16, height: 16 }}
        >
          <span className="text-[8px] font-bold text-white leading-none">
            {count > 99 ? "99+" : count}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
