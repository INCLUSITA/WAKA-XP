import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Play, Sparkles, BrainCircuit, Send,
  Loader2, RotateCcw, Radio, Bot, User, Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ── Types ── */

interface StepRow {
  id: string;
  run_id: string;
  node_uuid: string;
  node_label: string | null;
  node_type: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  created_at: string;
  elapsed_ms: number | null;
}

interface FlowOption {
  id: string;
  name: string;
}

/* ── Constants ── */

const OUTBOUND = new Set(["sendMsg", "send_msg", "sendEmail", "send_email", "callAI", "call_ai"]);
const INBOUND = new Set(["waitResponse", "wait_for_response"]);

function stepDirection(s: StepRow) {
  if (OUTBOUND.has(s.node_type)) return "outbound";
  if (INBOUND.has(s.node_type)) return "inbound";
  return "system";
}

function extractText(s: StepRow): string {
  const o = s.output as Record<string, unknown>;
  const i = s.input as Record<string, unknown>;
  return String(o?.text || o?.message || i?.text || i?.message || s.node_label || s.node_type);
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

/* ══════════════════════════════════════════════════════ */

export default function PhoneSimulator() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { tenantId } = useWorkspace();
  const flowIdParam = searchParams.get("flow_id");

  /* State */
  const [flowList, setFlowList] = useState<FlowOption[]>([]);
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(flowIdParam);
  const [testRunId, setTestRunId] = useState<string | null>(null);
  const [steps, setSteps] = useState<StepRow[]>([]);
  const [isStarting, setIsStarting] = useState(false);

  /* Setup fields */
  const [contactName, setContactName] = useState("Test User");
  const [contactPhone, setContactPhone] = useState("+22670000000");
  const [customFieldsJson, setCustomFieldsJson] = useState('{\n  "is_vip": true,\n  "balance": 150\n}');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  /* Load flows */
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
        if (flowIdParam) setSelectedFlowId(flowIdParam);
      });
  }, [tenantId, flowIdParam]);

  /* Realtime steps subscription */
  useEffect(() => {
    if (!testRunId) return;
    setSteps([]);

    // Fetch existing
    supabase
      .from("flow_run_steps")
      .select("*")
      .eq("run_id", testRunId)
      .order("created_at", { ascending: true })
      .then(({ data }) => setSteps((data as StepRow[]) || []));

    const ch = supabase
      .channel(`sim-dual-${testRunId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "flow_run_steps",
        filter: `run_id=eq.${testRunId}`,
      }, (payload) => {
        const s = payload.new as StepRow;
        setSteps((prev) => (prev.some((p) => p.id === s.id) ? prev : [...prev, s]));
      })
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [testRunId]);

  /* Auto-scroll chat */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [steps]);

  /* Validate JSON */
  const validateJson = (raw: string) => {
    try {
      JSON.parse(raw);
      setJsonError(null);
      return true;
    } catch (e: any) {
      setJsonError(e.message);
      return false;
    }
  };

  /* Start simulation */
  const startSimulation = useCallback(async () => {
    if (!selectedFlowId || !tenantId) {
      toast.error("Select a flow first");
      return;
    }
    if (!validateJson(customFieldsJson)) {
      toast.error("Fix JSON syntax before launching");
      return;
    }

    setIsStarting(true);
    try {
      const customFields = JSON.parse(customFieldsJson);
      const urn = `test:sim-${Date.now()}`;

      const { data, error } = await supabase.functions.invoke("run-flow", {
        body: {
          flow_id: selectedFlowId,
          tenant_id: tenantId,
          contact_urn: urn,
          is_test: true,
          metadata: {
            initialContext: {
              "contact.name": contactName,
              "contact.phone": contactPhone,
              ...Object.fromEntries(
                Object.entries(customFields).map(([k, v]) => [`fields.${k}`, v])
              ),
            },
          },
        },
      });

      if (error) throw error;
      const runId = data?.run_id || data?.id;
      if (runId) {
        setTestRunId(runId);
        toast.success("Simulation started");
      } else {
        toast.error("No run_id returned from backend");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to start simulation");
    } finally {
      setIsStarting(false);
    }
  }, [selectedFlowId, tenantId, contactName, contactPhone, customFieldsJson]);

  const resetSimulation = () => {
    setTestRunId(null);
    setSteps([]);
  };

  /* Derived data */
  const inferenceSteps = steps.filter((s) => (s.output as Record<string, unknown>)?.decision_log != null);

  return (
    <div className="flex h-full flex-col bg-background">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <BrainCircuit className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-bold text-foreground">Simulator</h1>
        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">DUAL VIEW</Badge>

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
        <div className="ml-auto flex gap-2">
          {testRunId && (
            <Button variant="outline" size="sm" onClick={resetSimulation} className="gap-1 text-xs">
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </Button>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ══ Setup Panel (left) ══ */}
        {!testRunId && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-[360px] border-r border-border flex-shrink-0 overflow-y-auto p-5 space-y-4"
          >
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-muted-foreground" />
              Reality Setup
            </h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Define the initial state of the contact before the flow starts. These values will be injected into the execution context.
            </p>

            <Separator />

            {/* Flow selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Flow</label>
              <Select value={selectedFlowId || ""} onValueChange={setSelectedFlowId}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select a flow…" />
                </SelectTrigger>
                <SelectContent>
                  {flowList.map((f) => (
                    <SelectItem key={f.id} value={f.id} className="text-xs">{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Contact fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-muted-foreground">Name</label>
                <Input value={contactName} onChange={(e) => setContactName(e.target.value)} className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-muted-foreground">Phone</label>
                <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="h-8 text-xs font-mono" />
              </div>
            </div>

            {/* Custom fields JSON */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-muted-foreground">Custom Fields (JSON)</label>
              <Textarea
                value={customFieldsJson}
                onChange={(e) => {
                  setCustomFieldsJson(e.target.value);
                  validateJson(e.target.value);
                }}
                className={cn(
                  "h-32 text-[11px] font-mono resize-none",
                  jsonError && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {jsonError && (
                <p className="text-[10px] text-destructive">{jsonError}</p>
              )}
            </div>

            <Separator />

            <Button className="w-full gap-2" onClick={startSimulation} disabled={!selectedFlowId || isStarting}>
              {isStarting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Launch Simulation
            </Button>
          </motion.div>
        )}

        {/* ══ Column A: Chat Timeline ══ */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-border">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
            <Send className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">Chat Timeline</span>
            {steps.length > 0 && (
              <Badge variant="secondary" className="text-[9px] ml-auto">{steps.length} steps</Badge>
            )}
          </div>
          <ScrollArea className="flex-1 px-4 py-3">
            {!testRunId ? (
              <EmptyState icon={<Bot className="h-12 w-12 opacity-15" />} title="No active simulation" subtitle="Configure and launch from the setup panel" />
            ) : steps.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mb-3 text-primary" />
                <p className="text-sm">Executing flow…</p>
              </div>
            ) : (
              <AnimatePresence>
                {steps.map((step) => (
                  <ChatBubble key={step.id} step={step} />
                ))}
              </AnimatePresence>
            )}
            <div ref={chatEndRef} />
          </ScrollArea>
        </div>

        {/* ══ Column B: AI Inference Debugger ══ */}
        <div className="w-[400px] flex-shrink-0 flex flex-col overflow-hidden bg-card">
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
            {steps.length === 0 ? (
              <EmptyState icon={<Sparkles className="h-10 w-10 opacity-15" />} title="Waiting for inferences…" subtitle="AI decision logs will stream here in real-time" />
            ) : inferenceSteps.length === 0 ? (
              <div className="space-y-2">
                {/* Show all steps as system log even without decision_log */}
                {steps.map((s) => (
                  <SystemLogEntry key={s.id} step={s} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {steps.map((s) => {
                  const dl = (s.output as Record<string, unknown>)?.decision_log as Record<string, unknown> | undefined;
                  return dl ? <InferenceCard key={s.id} step={s} log={dl} /> : <SystemLogEntry key={s.id} step={s} />;
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
      {icon}
      <p className="text-sm font-medium mt-3">{title}</p>
      <p className="text-[10px] mt-1">{subtitle}</p>
    </div>
  );
}

function ChatBubble({ step }: { step: StepRow }) {
  const dir = stepDirection(step);
  const msg = extractText(step);

  if (dir === "system") {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center my-2">
        <div className="flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1 text-[10px] text-muted-foreground">
          <span className="font-mono font-medium">{step.node_type}</span>
          {step.node_label && <span>• {step.node_label}</span>}
          <span className="opacity-60">{fmtTime(step.created_at)}</span>
        </div>
      </motion.div>
    );
  }

  const isOut = dir === "outbound";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-2 my-1.5", isOut ? "justify-end" : "justify-start")}
    >
      {!isOut && (
        <div className="flex-shrink-0 mt-auto">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted border border-border">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>
      )}
      <div className={cn(
        "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm",
        isOut ? "bg-primary text-primary-foreground rounded-br-md" : "bg-card border border-border text-foreground rounded-bl-md"
      )}>
        <p className="whitespace-pre-wrap break-words leading-relaxed">{msg}</p>
        <div className={cn("flex items-center gap-1.5 mt-1", isOut ? "justify-end" : "justify-start")}>
          <span className={cn("text-[9px]", isOut ? "text-primary-foreground/60" : "text-muted-foreground")}>
            {fmtTime(step.created_at)}
          </span>
          {step.elapsed_ms != null && (
            <span className={cn("text-[9px] flex items-center gap-0.5", isOut ? "text-primary-foreground/50" : "text-muted-foreground/60")}>
              <Clock className="h-2 w-2" />{step.elapsed_ms}ms
            </span>
          )}
        </div>
      </div>
      {isOut && (
        <div className="flex-shrink-0 mt-auto">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 border border-primary/20">
            <Bot className="h-3.5 w-3.5 text-primary" />
          </div>
        </div>
      )}
    </motion.div>
  );
}

function SystemLogEntry({ step }: { step: StepRow }) {
  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-border bg-muted/20 p-2.5 text-[10px] font-mono"
    >
      <div className="flex justify-between text-muted-foreground mb-1">
        <span>{step.node_type}</span>
        <span>{fmtTime(step.created_at)}</span>
      </div>
      {step.node_label && <p className="text-[11px] text-foreground font-sans font-medium">{step.node_label}</p>}
      {step.elapsed_ms != null && <span className="text-muted-foreground">{step.elapsed_ms}ms</span>}
    </motion.div>
  );
}

function InferenceCard({ step, log }: { step: StepRow; log: Record<string, unknown> }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-accent/30 bg-accent/5 p-3 space-y-2"
    >
      <div className="flex justify-between text-[10px] font-mono">
        <span className="text-accent-foreground font-semibold flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> NODE: {step.node_label || step.node_uuid.slice(0, 8)}
        </span>
        {log.confidence != null && (
          <span className="text-primary font-bold">
            CONFIDENCE: {Math.round(Number(log.confidence) * 100)}%
          </span>
        )}
      </div>

      {log.confidence != null && (
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.round(Number(log.confidence) * 100)}%` }} />
        </div>
      )}

      {log.reasoning && (
        <p className="text-[11px] text-muted-foreground italic leading-relaxed">
          "{String(log.reasoning)}"
        </p>
      )}

      {(log.decision || log.chosen_exit || log.intent) && (
        <div className="pt-2 border-t border-border space-y-1">
          {log.intent && (
            <p className="text-[10px] text-foreground"><span className="text-muted-foreground">Intent:</span> {String(log.intent)}</p>
          )}
          <p className="text-[10px] font-bold text-primary">
            DECISION: Branch "{String(log.decision || log.chosen_exit || "—")}"
          </p>
        </div>
      )}
    </motion.div>
  );
}
