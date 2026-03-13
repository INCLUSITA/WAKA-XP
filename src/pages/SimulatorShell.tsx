import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ExecutionTimeline } from "@/components/runs/ExecutionTimeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft, Play, Sparkles, BrainCircuit, Clock, Send,
  Loader2, RotateCcw, Settings2, ChevronRight, Radio, Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Json } from "@/integrations/supabase/types";
import { toast } from "sonner";

interface InferenceLog {
  id: string;
  run_id: string;
  node_uuid: string;
  node_label: string | null;
  node_type: string;
  output: Record<string, unknown>;
  created_at: string;
  elapsed_ms: number | null;
}

interface FlowOption {
  id: string;
  name: string;
}

interface MockVariable {
  key: string;
  value: string;
}

export default function SimulatorShell() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { tenantId } = useWorkspace();
  const flowIdParam = searchParams.get("flow_id");

  // State
  const [flowList, setFlowList] = useState<FlowOption[]>([]);
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(flowIdParam);
  const [testRunId, setTestRunId] = useState<string | null>(null);
  const [inferenceLogs, setInferenceLogs] = useState<InferenceLog[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [contactUrn, setContactUrn] = useState(`test:simulator-${Date.now()}`);
  const [showTimeline, setShowTimeline] = useState(false);

  // Mock context variables
  const [mockVars, setMockVars] = useState<MockVariable[]>([
    { key: "contact.name", value: "Test User" },
    { key: "contact.language", value: "fr" },
  ]);
  const [showConfig, setShowConfig] = useState(!flowIdParam);

  // Load available flows
  useEffect(() => {
    if (!tenantId) return;
    supabase
      .from("flows")
      .select("id, name")
      .eq("tenant_id", tenantId)
      .neq("status", "archived")
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        setFlowList((data as FlowOption[]) || []);
        if (flowIdParam && !selectedFlowId) setSelectedFlowId(flowIdParam);
      });
  }, [tenantId, flowIdParam]);

  // Subscribe to flow_run_steps for inference logs (steps with decision_log)
  useEffect(() => {
    if (!testRunId) return;
    setInferenceLogs([]);

    const channel = supabase
      .channel(`sim-inference-${testRunId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "flow_run_steps",
        filter: `run_id=eq.${testRunId}`,
      }, (payload) => {
        const step = payload.new as InferenceLog;
        setInferenceLogs((prev) => {
          if (prev.some((l) => l.id === step.id)) return prev;
          return [...prev, step];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [testRunId]);

  const startTest = useCallback(async () => {
    if (!selectedFlowId || !tenantId) {
      toast.error("Select a flow first");
      return;
    }
    setIsStarting(true);
    try {
      const initialContext = Object.fromEntries(mockVars.map((v) => [v.key, v.value]));
      const urn = `test:sim-${Date.now()}`;
      setContactUrn(urn);

      const { data, error } = await supabase.functions.invoke("run-flow", {
        body: {
          flow_id: selectedFlowId,
          tenant_id: tenantId,
          contact_urn: urn,
          is_test: true,
          metadata: { initialContext },
        },
      });

      if (error) throw error;
      const runId = data?.run_id || data?.id;
      if (runId) {
        setTestRunId(runId);
        setShowConfig(false);
        toast.success("Test run started");
      } else {
        toast.error("No run_id returned");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to start test");
    } finally {
      setIsStarting(false);
    }
  }, [selectedFlowId, tenantId, mockVars]);

  const resetSimulator = () => {
    setTestRunId(null);
    setInferenceLogs([]);
    setShowConfig(true);
  };

  const addMockVar = () => setMockVars((prev) => [...prev, { key: "", value: "" }]);
  const removeMockVar = (idx: number) => setMockVars((prev) => prev.filter((_, i) => i !== idx));
  const updateMockVar = (idx: number, field: "key" | "value", val: string) =>
    setMockVars((prev) => prev.map((v, i) => (i === idx ? { ...v, [field]: val } : v)));

  const inferenceSteps = inferenceLogs.filter((l) => {
    const out = l.output as Record<string, unknown>;
    return out?.decision_log != null;
  });

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">Simulator Shell</h1>
          <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">PRO</Badge>
        </div>

        {selectedFlowId && (
          <Badge variant="secondary" className="text-xs ml-2">
            {flowList.find((f) => f.id === selectedFlowId)?.name || "Flow"}
          </Badge>
        )}

        {testRunId && (
          <Badge className="text-[9px] bg-primary/15 text-primary border-0 flex items-center gap-1 ml-2">
            <Radio className="h-2.5 w-2.5 animate-pulse" /> LIVE
          </Badge>
        )}

        <div className="ml-auto flex items-center gap-2">
          {testRunId && (
            <>
              <Button variant="outline" size="sm" onClick={() => setShowTimeline(true)} className="gap-1 text-xs">
                <Clock className="h-3.5 w-3.5" /> Timeline
              </Button>
              <Button variant="outline" size="sm" onClick={resetSimulator} className="gap-1 text-xs">
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowConfig((v) => !v)}
            className={cn("gap-1 text-xs", showConfig && "bg-muted")}
          >
            <Settings2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Body: dual panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Config panel (collapsible left) */}
        <AnimatePresence>
          {showConfig && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-r border-border overflow-hidden flex-shrink-0"
            >
              <ScrollArea className="h-full p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-muted-foreground" />
                  Pre-Configuration
                </h3>

                {/* Flow selector */}
                <div className="space-y-2 mb-4">
                  <label className="text-xs font-medium text-muted-foreground">Flow</label>
                  <Select value={selectedFlowId || ""} onValueChange={setSelectedFlowId}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select a flow" />
                    </SelectTrigger>
                    <SelectContent>
                      {flowList.map((f) => (
                        <SelectItem key={f.id} value={f.id} className="text-xs">
                          {f.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="my-3" />

                {/* Mock context variables */}
                <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-accent-foreground" />
                  Mock Context
                </h4>
                <p className="text-[10px] text-muted-foreground mb-3">
                  Define variables to inject into the simulation context.
                </p>

                <div className="space-y-2">
                  {mockVars.map((v, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <Input
                        value={v.key}
                        onChange={(e) => updateMockVar(idx, "key", e.target.value)}
                        placeholder="key"
                        className="h-7 text-[11px] font-mono flex-1"
                      />
                      <Input
                        value={v.value}
                        onChange={(e) => updateMockVar(idx, "value", e.target.value)}
                        placeholder="value"
                        className="h-7 text-[11px] flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMockVar(idx)}
                        className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addMockVar} className="w-full h-7 text-[10px]">
                    + Add Variable
                  </Button>
                </div>

                <Separator className="my-4" />

                <Button
                  className="w-full gap-2"
                  onClick={startTest}
                  disabled={!selectedFlowId || isStarting}
                >
                  {isStarting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  Start Test Run
                </Button>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content: split view */}
        <div className="flex flex-1 overflow-hidden">
          {/* Side A: Execution steps (live) */}
          <div className="flex-1 border-r border-border overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
              <Send className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">Live Execution</span>
              {testRunId && (
                <Badge variant="secondary" className="text-[9px] ml-auto font-mono">
                  {testRunId.slice(0, 8)}…
                </Badge>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {!testRunId ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <BrainCircuit className="h-12 w-12 opacity-15 mb-4" />
                  <p className="text-sm font-medium">No active test run</p>
                  <p className="text-xs mt-1">Configure and start a test from the left panel</p>
                </div>
              ) : (
                <LiveStepsView runId={testRunId} />
              )}
            </div>
          </div>

          {/* Side B: AI Inference Debugger */}
          <div className="w-[380px] flex-shrink-0 overflow-hidden flex flex-col bg-muted/10">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-accent/5">
              <Sparkles className="h-3.5 w-3.5 text-accent-foreground" />
              <span className="text-xs font-semibold text-accent-foreground">AI Inference Debugger</span>
              {inferenceSteps.length > 0 && (
                <Badge variant="outline" className="text-[9px] border-accent/30 text-accent-foreground ml-auto">
                  {inferenceSteps.length} decisions
                </Badge>
              )}
            </div>
            <ScrollArea className="flex-1 p-3">
              {inferenceLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <Sparkles className="h-10 w-10 opacity-15 mb-3" />
                  <p className="text-xs font-medium">Waiting for AI inferences…</p>
                  <p className="text-[10px] mt-1">Decision logs will appear here in real-time</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {inferenceLogs.map((log) => (
                    <InferenceCard key={log.id} log={log} />
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Execution Timeline Sheet */}
      <ExecutionTimeline
        runId={testRunId}
        open={showTimeline}
        onOpenChange={setShowTimeline}
        contactUrn={contactUrn}
      />
    </div>
  );
}

/* ── Sub-components ── */

function LiveStepsView({ runId }: { runId: string }) {
  const [steps, setSteps] = useState<InferenceLog[]>([]);

  useEffect(() => {
    // Fetch existing
    supabase
      .from("flow_run_steps")
      .select("*")
      .eq("run_id", runId)
      .order("created_at", { ascending: true })
      .then(({ data }) => setSteps((data as InferenceLog[]) || []));

    // Realtime
    const ch = supabase
      .channel(`sim-steps-${runId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "flow_run_steps",
        filter: `run_id=eq.${runId}`,
      }, (payload) => {
        const s = payload.new as InferenceLog;
        setSteps((prev) => (prev.some((p) => p.id === s.id) ? prev : [...prev, s]));
      })
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [runId]);

  if (steps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mb-3 text-primary" />
        <p className="text-sm">Executing flow…</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <AnimatePresence>
        {steps.map((step, i) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-3"
          >
            <div className="flex flex-col items-center">
              <div className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold",
                step.node_type.includes("send") || step.node_type.includes("Msg")
                  ? "bg-primary/10 text-primary border-primary/20"
                  : step.node_type.includes("wait") || step.node_type.includes("Wait")
                  ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                  : step.node_type.includes("split") || step.node_type.includes("Split")
                  ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                  : "bg-muted text-muted-foreground border-border"
              )}>
                {i + 1}
              </div>
              {i < steps.length - 1 && <div className="flex-1 w-px bg-border min-h-[16px]" />}
            </div>
            <div className="flex-1 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-foreground">
                  {step.node_label || step.node_type}
                </span>
                <Badge variant="outline" className="text-[9px] font-mono">
                  {step.node_type}
                </Badge>
                {step.elapsed_ms != null && (
                  <span className="text-[9px] text-muted-foreground ml-auto">{step.elapsed_ms}ms</span>
                )}
              </div>
              {Object.keys(step.output).length > 0 && (
                <pre className="mt-1 rounded-md border border-border bg-muted/30 p-1.5 text-[10px] font-mono text-muted-foreground overflow-x-auto max-h-20 whitespace-pre-wrap">
                  {JSON.stringify(step.output, null, 2)}
                </pre>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function InferenceCard({ log }: { log: InferenceLog }) {
  const out = log.output as Record<string, unknown>;
  const decision = out.decision_log as Record<string, unknown> | undefined;
  const time = new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-accent/20 bg-card p-3 space-y-2"
    >
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground font-mono">{time}</span>
        <ChevronRight className="h-2.5 w-2.5 text-muted-foreground" />
        <span className="text-[11px] font-medium text-foreground">
          {log.node_label || log.node_uuid.slice(0, 8)}
        </span>
        <Badge variant="outline" className="text-[9px] font-mono ml-auto">{log.node_type}</Badge>
      </div>

      {decision ? (
        <div className="rounded-lg bg-accent/5 border border-accent/15 p-2.5 space-y-1.5">
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-accent-foreground" />
            <span className="text-[10px] font-semibold text-accent-foreground">AI Decision</span>
          </div>
          {decision.intent && (
            <p className="text-[11px] text-foreground">
              <span className="font-medium text-muted-foreground">Intent:</span> {String(decision.intent)}
            </p>
          )}
          {decision.confidence != null && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">Confidence</span>
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.round(Number(decision.confidence) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-foreground">
                {Math.round(Number(decision.confidence) * 100)}%
              </span>
            </div>
          )}
          {decision.reasoning && (
            <p className="text-[10px] text-muted-foreground italic leading-relaxed">
              "{String(decision.reasoning)}"
            </p>
          )}
          {decision.chosen_exit && (
            <Badge variant="outline" className="text-[9px] border-primary/30 text-primary">
              → {String(decision.chosen_exit)}
            </Badge>
          )}
        </div>
      ) : (
        <pre className="rounded-md bg-muted/30 p-1.5 text-[10px] font-mono text-muted-foreground overflow-x-auto max-h-16 whitespace-pre-wrap">
          {JSON.stringify(out, null, 2)}
        </pre>
      )}
    </motion.div>
  );
}
