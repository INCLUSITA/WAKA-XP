import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ─── Template resolver (mirrors frontend resolveTemplate) ───
function resolveTemplate(template: string, ctx: RunContext): string {
  if (!template) return template;
  return template.replace(
    /@\(([^)]+)\)|@([a-zA-Z_][a-zA-Z0-9_.]*)/g,
    (_match, expr, simple) => {
      const path = simple || expr?.replace(/^["']|["']$/g, "").trim();
      if (!path) return _match;
      return resolvePath(path, ctx);
    }
  );
}

function resolvePath(path: string, ctx: RunContext): string {
  const parts = path.split(".");
  let current: any = ctx;
  for (const part of parts) {
    if (current == null) return "";
    const arrMatch = part.match(/^(.+)\[(\d+)\]$/);
    if (arrMatch) {
      current = current[arrMatch[1]];
      if (Array.isArray(current)) current = current[parseInt(arrMatch[2])];
      else return "";
      continue;
    }
    current = current[part];
  }
  if (current == null) return "";
  if (typeof current === "object") return JSON.stringify(current);
  return String(current);
}

// ─── Types ───
interface RunContext {
  input: { text: string };
  webhook: { json: any; status: string };
  results: Record<string, { value: string }>;
  contact: Record<string, string>;
  groups: string[];
}

interface FlowNode {
  id: string;
  type: string;
  data: Record<string, any>;
  position: { x: number; y: number };
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
}

function createEmptyContext(contactUrn: string): RunContext {
  return {
    input: { text: "" },
    webhook: { json: {}, status: "" },
    results: {},
    contact: { name: "Contact", urn: contactUrn },
    groups: [],
  };
}

// ─── Node Walker ───
async function walkFlow(
  supabase: any,
  runId: string,
  nodes: FlowNode[],
  edges: FlowEdge[],
  startNodeId: string,
  ctx: RunContext,
  maxSteps = 200
): Promise<{ status: "completed" | "waiting" | "errored"; terminalReason?: string; waitingNodeId?: string }> {
  let currentId: string | null = startNodeId;
  let stepCount = 0;

  while (currentId && stepCount < maxSteps) {
    stepCount++;
    const node = nodes.find((n) => n.id === currentId);
    if (!node) return { status: "completed", terminalReason: "node_not_found" };

    const data = node.data || {};
    const t0 = Date.now();
    let output: Record<string, any> = {};
    let nextHandle: string | undefined;

    switch (node.type) {
      // ── Send Message ──
      case "sendMsg": {
        const text = resolveTemplate(data.text || "", ctx);
        output = { text, quick_replies: data.quick_replies || [] };

        // If there's a resultName, save it
        if (data.resultName) {
          const val = resolveTemplate(data.value || ctx.input.text, ctx);
          ctx.results[data.resultName.toLowerCase()] = { value: val };
          output.saved_result = { name: data.resultName, value: val };
        }
        break;
      }

      // ── Wait for Response → PAUSE ──
      case "waitResponse": {
        await persistStep(supabase, runId, node, { waiting: true }, output, t0);
        return { status: "waiting", waitingNodeId: currentId };
      }

      // ── Split Expression / Contact Field / Result ──
      case "splitExpression":
      case "splitContactField":
      case "splitResult":
      case "splitRandom":
      case "splitGroup": {
        const isGroupSplit = node.type === "splitGroup";
        let operand = "";

        if (isGroupSplit) {
          operand = ctx.groups.join(", ");
        } else {
          operand = resolveTemplate(data.operand || "@input.text", ctx);
        }

        const cases: string[] = (data.cases || []).filter((c: string) => c.trim());
        let matchedCase: string | null = null;

        if (isGroupSplit) {
          for (const caseName of cases) {
            if (ctx.groups.includes(caseName)) {
              matchedCase = caseName;
              break;
            }
          }
        } else {
          const testType = data.testType || "has_any_word";
          const opLower = operand.toLowerCase().trim();
          for (const caseName of cases) {
            const caseVal = caseName.toLowerCase().trim();
            let matched = false;
            switch (testType) {
              case "has_any_word":
                matched = opLower.split(/\s+/).some((w) => w === caseVal);
                break;
              case "has_phrase":
              case "has_only_phrase":
                matched = opLower.includes(caseVal);
                break;
              case "has_text":
                matched = opLower.length > 0;
                break;
              case "has_number":
                matched = /\d+/.test(operand);
                break;
              case "has_number_eq":
                matched = parseFloat(operand) === parseFloat(caseName);
                break;
              case "has_number_gt":
                matched = parseFloat(operand) > parseFloat(caseName);
                break;
              case "has_number_lt":
                matched = parseFloat(operand) < parseFloat(caseName);
                break;
              case "has_pattern":
                try { matched = new RegExp(caseName, "i").test(operand); } catch { matched = false; }
                break;
              default:
                matched = opLower === caseVal || opLower.includes(caseVal);
            }
            if (matched) { matchedCase = caseName; break; }
          }
        }

        const resolvedCategory = matchedCase || "Other";
        nextHandle = resolvedCategory;
        output = { operand, matched: resolvedCategory, cases };
        break;
      }

      // ── Webhook ──
      case "webhook": {
        const url = resolveTemplate(data.url || "", ctx);
        const method = data.method || "GET";
        let body = resolveTemplate(data.body || "", ctx);
        body = body.replace(/:\s*,/g, ": null,").replace(/:\s*}/g, ": null}");
        const headers = data.headers || {};

        const maxRetries = Math.min(parseInt(data.retryCount) || 0, 5);
        const retryDelay = parseInt(data.retryDelay) || 2;
        let lastError: string | null = null;
        let success = false;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            const fetchOpts: RequestInit = { method, headers };
            if (method !== "GET" && method !== "HEAD" && body) fetchOpts.body = body;
            const resp = await fetch(url, fetchOpts);
            const respText = await resp.text();
            let respJson: any = {};
            try { respJson = JSON.parse(respText); } catch { respJson = { raw: respText }; }

            ctx.webhook = { json: respJson, status: resp.ok ? "success" : "failure" };
            if (data.resultName) ctx.results[data.resultName.toLowerCase()] = { value: respText };

            if (resp.ok) {
              output = { url, method, status: resp.status, response: respJson, attempts: attempt + 1 };
              success = true;
              break;
            }
            lastError = `HTTP ${resp.status}`;
          } catch (err: any) {
            lastError = err.message;
            ctx.webhook = { json: { error: err.message }, status: "failure" };
          }

          if (attempt < maxRetries) {
            await new Promise((r) => setTimeout(r, retryDelay * 1000 * (attempt + 1)));
          }
        }

        if (!success) {
          output = { url, method, error: lastError, retries_exhausted: true };
          nextHandle = "Failure";
        }
        break;
      }

      // ── Save Result ──
      case "saveResult": {
        const name = data.resultName || "result";
        const value = resolveTemplate(data.value || ctx.input.text, ctx);
        ctx.results[name.toLowerCase()] = { value };
        output = { name, value };
        break;
      }

      // ── Update Contact ──
      case "updateContact": {
        const field = data.field || "name";
        const value = resolveTemplate(data.value || "", ctx);
        ctx.contact[field] = value;
        output = { field, value };
        break;
      }

      // ── Add/Remove Group ──
      case "addGroup": {
        const g = data.groupName || data.label || "Unknown";
        if (!ctx.groups.includes(g)) ctx.groups.push(g);
        output = { group: g, action: "added" };
        break;
      }
      case "removeGroup": {
        const g = data.groupName || data.label || "Unknown";
        ctx.groups = ctx.groups.filter((x) => x !== g);
        output = { group: g, action: "removed" };
        break;
      }

      // ── Enter Flow (subflow placeholder) ──
      case "enterFlow": {
        output = { subflow: data.flowName || "unknown", note: "subflow_stub" };
        break;
      }

      // ── Default passthrough ──
      default: {
        output = { skipped: true, type: node.type };
        break;
      }
    }

    // Persist step
    await persistStep(supabase, runId, node, { text: ctx.input.text }, output, t0);

    // Resolve next node
    currentId = getNextNodeId(edges, currentId!, nextHandle);
  }

  if (stepCount >= maxSteps) {
    return { status: "errored", terminalReason: "max_steps_exceeded" };
  }
  return { status: "completed", terminalReason: "end_of_flow" };
}

function getNextNodeId(edges: FlowEdge[], nodeId: string, sourceHandle?: string): string | null {
  let edge: FlowEdge | undefined;
  if (sourceHandle) {
    edge = edges.find((e) => e.source === nodeId && e.sourceHandle === sourceHandle);
  }
  if (!edge) {
    edge = edges.find((e) => e.source === nodeId);
  }
  return edge?.target || null;
}

async function persistStep(
  supabase: any,
  runId: string,
  node: FlowNode,
  input: Record<string, any>,
  output: Record<string, any>,
  t0: number
) {
  await supabase.from("flow_run_steps").insert({
    run_id: runId,
    node_uuid: node.id,
    node_type: node.type,
    node_label: node.data?.label || node.data?.text?.substring(0, 50) || null,
    input,
    output,
    elapsed_ms: Date.now() - t0,
  });
}

function findFirstNode(nodes: FlowNode[], edges: FlowEdge[]): string | null {
  const startNode = nodes.find((n) => n.type === "enterFlow" || n.data?.isStart);
  if (startNode) return startNode.id;

  const targetIds = new Set(edges.map((e) => e.target));
  const exec = nodes.filter((n) => n.type !== "moduleGroup");
  const entry = exec.find((n) => !targetIds.has(n.id));
  return entry?.id || exec[0]?.id || null;
}

// ─── Main Handler ───
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { flow_id, contact_urn, tenant_id, resume_run_id, resume_input } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ─── RESUME mode ───
    if (resume_run_id) {
      const { data: run, error: runErr } = await supabase
        .from("flow_runs")
        .select("*")
        .eq("id", resume_run_id)
        .single();

      if (runErr || !run) {
        return new Response(JSON.stringify({ error: "Run not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (run.status !== "waiting") {
        return new Response(JSON.stringify({ error: "Run is not in waiting state", status: run.status }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Fetch the flow
      const { data: flow } = await supabase
        .from("flows")
        .select("nodes, edges")
        .eq("id", run.flow_id)
        .single();

      if (!flow) {
        return new Response(JSON.stringify({ error: "Flow not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const nodes: FlowNode[] = flow.nodes || [];
      const edges: FlowEdge[] = flow.edges || [];

      // Restore context from snapshot
      const ctx: RunContext = {
        ...createEmptyContext(run.contact_urn),
        ...(run.context_snapshot || {}),
      };
      ctx.input.text = resume_input || "";

      // Find the waiting node and determine next
      const waitingNodeId = (run.context_snapshot as any)?._waiting_node_id;
      if (!waitingNodeId) {
        return new Response(JSON.stringify({ error: "No waiting node recorded" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Persist the user response step
      await persistStep(supabase, resume_run_id, { id: waitingNodeId, type: "waitResponse", data: {}, position: { x: 0, y: 0 } }, { text: resume_input }, { resumed: true }, Date.now());

      // Find category match if wait node has categories
      const waitNode = nodes.find((n) => n.id === waitingNodeId);
      const cats = (waitNode?.data?.categories || []) as string[];
      const matchedCat = cats.find((c: string) => c.toLowerCase() === (resume_input || "").toLowerCase());

      const nextId = getNextNodeId(edges, waitingNodeId, matchedCat || undefined);

      // Update run to active
      await supabase.from("flow_runs").update({ status: "active", updated_at: new Date().toISOString() }).eq("id", resume_run_id);

      if (!nextId) {
        await supabase.from("flow_runs").update({
          status: "completed",
          terminal_reason: "end_after_wait",
          ended_at: new Date().toISOString(),
          context_snapshot: ctx,
        }).eq("id", resume_run_id);

        return new Response(JSON.stringify({ ok: true, run_id: resume_run_id, status: "completed" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const result = await walkFlow(supabase, resume_run_id, nodes, edges, nextId, ctx);

      const finalSnapshot = { ...ctx, _waiting_node_id: result.waitingNodeId || null };
      await supabase.from("flow_runs").update({
        status: result.status,
        terminal_reason: result.terminalReason || null,
        ended_at: result.status !== "waiting" ? new Date().toISOString() : null,
        context_snapshot: finalSnapshot,
        updated_at: new Date().toISOString(),
      }).eq("id", resume_run_id);

      return new Response(JSON.stringify({ ok: true, run_id: resume_run_id, status: result.status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── NEW RUN mode ───
    if (!flow_id || !tenant_id) {
      return new Response(JSON.stringify({ error: "flow_id and tenant_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: flow, error: flowErr } = await supabase
      .from("flows")
      .select("nodes, edges, name")
      .eq("id", flow_id)
      .single();

    if (flowErr || !flow) {
      return new Response(JSON.stringify({ error: "Flow not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const nodes: FlowNode[] = flow.nodes || [];
    const edges: FlowEdge[] = flow.edges || [];
    const ctx = createEmptyContext(contact_urn || "unknown");

    // Create the run
    const { data: run, error: insertErr } = await supabase
      .from("flow_runs")
      .insert({
        flow_id,
        tenant_id,
        contact_urn: contact_urn || "unknown",
        status: "active",
        context_snapshot: ctx,
      })
      .select("id")
      .single();

    if (insertErr || !run) {
      return new Response(JSON.stringify({ error: "Failed to create run", detail: insertErr?.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const startId = findFirstNode(nodes, edges);
    if (!startId) {
      await supabase.from("flow_runs").update({
        status: "errored",
        terminal_reason: "no_start_node",
        ended_at: new Date().toISOString(),
      }).eq("id", run.id);

      return new Response(JSON.stringify({ error: "No start node found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await walkFlow(supabase, run.id, nodes, edges, startId, ctx);

    const finalSnapshot = { ...ctx, _waiting_node_id: result.waitingNodeId || null };
    await supabase.from("flow_runs").update({
      status: result.status,
      terminal_reason: result.terminalReason || null,
      ended_at: result.status !== "waiting" ? new Date().toISOString() : null,
      context_snapshot: finalSnapshot,
      updated_at: new Date().toISOString(),
    }).eq("id", run.id);

    console.log(`Flow run ${run.id}: ${result.status} (${result.terminalReason || "paused"})`);

    return new Response(
      JSON.stringify({ ok: true, run_id: run.id, status: result.status, terminal_reason: result.terminalReason }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("run-flow error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
