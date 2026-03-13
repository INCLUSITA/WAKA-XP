import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // GET = webhook verification
  if (req.method === "GET") {
    const url = new URL(req.url);
    const challenge = url.searchParams.get("hub.challenge");
    if (challenge) return new Response(challenge, { status: 200 });
    return new Response("OK", { status: 200 });
  }

  try {
    const body = await req.json();
    console.log("Webhook payload:", JSON.stringify(body).slice(0, 500));

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    const entries = body?.entry || [];
    for (const entry of entries) {
      const changes = entry?.changes || [];
      for (const change of changes) {
        const value = change?.value || {};

        // Incoming messages
        const messages = value?.messages || [];
        for (const msg of messages) {
          const fromPhone = msg.from;
          const messageBody =
            msg.text?.body ||
            msg.button?.text ||
            msg.interactive?.button_reply?.title ||
            JSON.stringify(msg);

          const row = {
            direction: "inbound",
            wa_message_id: msg.id,
            from_phone: fromPhone,
            to_phone: value?.metadata?.display_phone_number || "",
            message_type: msg.type,
            body: messageBody,
            payload: msg,
          };

          const { error } = await sb.from("whatsapp_messages").insert(row);
          if (error) console.error("Insert error:", error);
          else console.log("Saved inbound message from", fromPhone);

          const contactUrn = `whatsapp:${fromPhone}`;

          // ─── 1. Try to RESUME a waiting run for this contact ───
          const { data: waitingRuns } = await sb
            .from("flow_runs")
            .select("id, flow_id, tenant_id")
            .eq("contact_urn", contactUrn)
            .eq("status", "waiting")
            .order("updated_at", { ascending: false })
            .limit(1);

          if (waitingRuns && waitingRuns.length > 0) {
            const waitingRun = waitingRuns[0];
            console.log(`Resuming flow run ${waitingRun.id} for ${contactUrn}`);

            try {
              const runFlowUrl = `${supabaseUrl}/functions/v1/run-flow`;
              const resumeResp = await fetch(runFlowUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${supabaseKey}`,
                },
                body: JSON.stringify({
                  resume_run_id: waitingRun.id,
                  resume_input: messageBody,
                }),
              });
              const resumeResult = await resumeResp.json();
              console.log("Resume result:", JSON.stringify(resumeResult));
            } catch (resumeErr: any) {
              console.error("Resume error:", resumeErr.message);
            }
            continue; // Don't also try to trigger a new flow
          }

          // ─── 2. Try to START a new flow by keyword trigger ───
          const normalizedMsg = messageBody.trim().toLowerCase();
          console.log(`No waiting run. Checking triggers for keyword: "${normalizedMsg}"`);

          // Find all active flows with trigger_rules
          const { data: flows } = await sb
            .from("flows")
            .select("id, name, tenant_id, trigger_rules")
            .neq("status", "archived")
            .not("trigger_rules", "eq", "[]");

          if (flows && flows.length > 0) {
            let matchedFlow: { id: string; tenant_id: string; name: string } | null = null;

            for (const flow of flows) {
              const rules = (flow.trigger_rules as any[]) || [];
              for (const rule of rules) {
                if (!rule.active) continue;
                // Check channel scope
                if (rule.channel && rule.channel !== "whatsapp") continue;

                if (rule.type === "keyword" && rule.keywords?.length > 0) {
                  const matched = rule.keywords.some(
                    (kw: string) => kw.trim().toLowerCase() === normalizedMsg
                  );
                  if (matched) {
                    matchedFlow = { id: flow.id, tenant_id: flow.tenant_id, name: flow.name };
                    break;
                  }
                } else if (rule.type === "catch_all") {
                  matchedFlow = { id: flow.id, tenant_id: flow.tenant_id, name: flow.name };
                  break;
                }
              }
              if (matchedFlow) break;
            }

            if (matchedFlow) {
              console.log(`Keyword match! Starting flow "${matchedFlow.name}" (${matchedFlow.id}) for ${contactUrn}`);
              try {
                const runFlowUrl = `${supabaseUrl}/functions/v1/run-flow`;
                const startResp = await fetch(runFlowUrl, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${supabaseKey}`,
                  },
                  body: JSON.stringify({
                    flow_id: matchedFlow.id,
                    tenant_id: matchedFlow.tenant_id,
                    contact_urn: contactUrn,
                    channel: "whatsapp",
                  }),
                });
                const startResult = await startResp.json();
                console.log("Start flow result:", JSON.stringify(startResult));
              } catch (startErr: any) {
                console.error("Start flow error:", startErr.message);
              }
            } else {
              console.log("No trigger matched for this message");
            }
          } else {
            console.log("No flows with trigger_rules found");
          }
        }

        // Status updates
        const statuses = value?.statuses || [];
        for (const st of statuses) {
          console.log("Status update:", st.id, st.status);
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Webhook error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
