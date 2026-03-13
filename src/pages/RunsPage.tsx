import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useFlowRuns } from "@/hooks/useFlowRuns";
import { RunListView } from "@/components/runs/RunListView";
import { RunDetailView } from "@/components/runs/RunDetailView";
import { ExecutionTimeline } from "@/components/runs/ExecutionTimeline";

export default function RunsPage() {
  const { data: runs, isLoading } = useFlowRuns();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [timelineRunId, setTimelineRunId] = useState<string | null>(null);

  // Deep linking: /runs?id=UUID
  useEffect(() => {
    const id = searchParams.get("id");
    if (id && !selectedRunId) {
      setSelectedRunId(id);
    }
  }, [searchParams]);

  const handleSelectRun = (id: string) => {
    setSelectedRunId(id);
    setSearchParams({ id }, { replace: true });
  };

  const handleBack = () => {
    setSelectedRunId(null);
    setSearchParams({}, { replace: true });
  };

  const selectedRun = runs?.find((r) => r.id === selectedRunId) ?? null;

  return (
    <>
      {selectedRun ? (
        <RunDetailView
          run={selectedRun}
          onBack={handleBack}
          onOpenTimeline={() => setTimelineRunId(selectedRun.id)}
        />
      ) : (
        <RunListView
          runs={runs ?? []}
          isLoading={isLoading}
          onSelectRun={handleSelectRun}
        />
      )}
      <ExecutionTimeline
        runId={timelineRunId}
        open={!!timelineRunId}
        onOpenChange={(open) => { if (!open) setTimelineRunId(null); }}
        contactUrn={runs?.find((r) => r.id === timelineRunId)?.contact_urn}
      />
    </>
  );
}
