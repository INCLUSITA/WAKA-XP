import { useState } from "react";
import { useFlowRuns } from "@/hooks/useFlowRuns";
import { RunListView } from "@/components/runs/RunListView";
import { RunDetailView } from "@/components/runs/RunDetailView";

export default function RunsPage() {
  const { data: runs, isLoading } = useFlowRuns();
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const selectedRun = runs?.find((r) => r.id === selectedRunId) ?? null;

  if (selectedRun) {
    return <RunDetailView run={selectedRun} onBack={() => setSelectedRunId(null)} />;
  }

  return <RunListView runs={runs ?? []} isLoading={isLoading} onSelectRun={setSelectedRunId} />;
}
