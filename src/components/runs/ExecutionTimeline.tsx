import { useEffect, useState } from "react";
import { Bot, User, Radio, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useFlowRunSteps, FlowRunStep } from "@/hooks/useFlowRuns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const OUTBOUND_TYPES = new Set(["sendMsg", "send_msg", "sendEmail", "send_email", "callAI", "call_ai"]);
const INBOUND_TYPES = new Set(["waitResponse", "wait_for_response"]);

function getDirection(step: FlowRunStep): "outbound" | "inbound" | "system" {
  if (OUTBOUND_TYPES.has(step.node_type)) return "outbound";
  if (INBOUND_TYPES.has(step.node_type)) return "inbound";
  return "system";
}

function extractMessage(step: FlowRunStep): string {
  const out = step.output as Record<string, unknown>;
  const inp = step.input as Record<string, unknown>;
  if (out?.text) return String(out.text);
  if (out?.message) return String(out.message);
  if (inp?.text) return String(inp.text);
  if (inp?.message) return String(inp.message);
  return step.node_label || step.node_type;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function ChatBubble({ step, isNew }: { step: FlowRunStep; isNew?: boolean }) {
  const dir = getDirection(step);
  const msg = extractMessage(step);

  if (dir === "system") {
    return (
      <motion.div
        initial={isNew ? { opacity: 0, y: 10 } : false}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center my-2"
      >
        <div className="flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1 text-[10px] text-muted-foreground">
          <span className="font-mono font-medium">{step.node_type}</span>
          {step.node_label && <span>• {step.node_label}</span>}
          <span className="opacity-60">{formatTime(step.created_at)}</span>
        </div>
      </motion.div>
    );
  }

  const isOut = dir === "outbound";

  return (
    <motion.div
      initial={isNew ? { opacity: 0, y: 10 } : false}
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
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm",
          isOut
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-card border border-border text-foreground rounded-bl-md"
        )}
      >
        <p className="whitespace-pre-wrap break-words leading-relaxed">{msg}</p>
        <div className={cn("flex items-center gap-1.5 mt-1", isOut ? "justify-end" : "justify-start")}>
          <span className={cn("text-[9px]", isOut ? "text-primary-foreground/60" : "text-muted-foreground")}>
            {formatTime(step.created_at)}
          </span>
          {step.elapsed_ms != null && (
            <span className={cn("text-[9px] flex items-center gap-0.5", isOut ? "text-primary-foreground/50" : "text-muted-foreground/60")}>
              <Clock className="h-2 w-2" />{step.elapsed_ms}ms
            </span>
          )}
          {isNew && (
            <Badge className="text-[8px] bg-white/20 border-0 py-0 px-1 animate-pulse">LIVE</Badge>
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

interface Props {
  runId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactUrn?: string;
}

export function ExecutionTimeline({ runId, open, onOpenChange, contactUrn }: Props) {
  const { data: steps, isLoading } = useFlowRunSteps(runId);
  const [realtimeSteps, setRealtimeSteps] = useState<FlowRunStep[]>([]);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  // Realtime subscription
  useEffect(() => {
    if (!runId || !open) return;
    setRealtimeSteps([]);
    setNewIds(new Set());

    const channel = supabase
      .channel(`timeline-${runId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "flow_run_steps",
        filter: `run_id=eq.${runId}`,
      }, (payload) => {
        const s = payload.new as FlowRunStep;
        setRealtimeSteps((prev) => prev.some((p) => p.id === s.id) ? prev : [...prev, s]);
        setNewIds((prev) => new Set([...prev, s.id]));
        setTimeout(() => setNewIds((prev) => { const n = new Set(prev); n.delete(s.id); return n; }), 3000);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [runId, open]);

  const allSteps = (() => {
    if (!steps) return realtimeSteps;
    const ids = new Set(steps.map((s) => s.id));
    return [...steps, ...realtimeSteps.filter((s) => !ids.has(s.id))];
  })();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[420px] sm:max-w-[420px] p-0 flex flex-col">
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <SheetTitle className="text-sm font-semibold">Execution Timeline</SheetTitle>
            {allSteps.length > 0 && (
              <Badge variant="secondary" className="text-[10px]">{allSteps.length} steps</Badge>
            )}
            <Badge className="text-[9px] bg-primary/15 text-primary border-0 flex items-center gap-1">
              <Radio className="h-2.5 w-2.5 animate-pulse" /> LIVE
            </Badge>
          </div>
          <SheetDescription className="text-xs">
            {contactUrn ? (
              <span className="font-mono">{contactUrn}</span>
            ) : runId ? (
              <span className="font-mono text-muted-foreground">Run {runId.slice(0, 8)}…</span>
            ) : "No run selected"}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4 py-3">
          {isLoading ? (
            <div className="flex flex-col items-center py-16 text-muted-foreground">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm">Loading steps…</p>
            </div>
          ) : allSteps.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-muted-foreground">
              <Bot className="h-10 w-10 opacity-20 mb-3" />
              <p className="text-sm font-medium">No steps yet</p>
              <p className="text-xs mt-1">Steps will appear here in real-time</p>
            </div>
          ) : (
            <AnimatePresence>
              {allSteps.map((step) => (
                <ChatBubble key={step.id} step={step} isNew={newIds.has(step.id)} />
              ))}
            </AnimatePresence>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
