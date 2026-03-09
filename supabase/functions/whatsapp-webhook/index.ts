import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // GET = webhook verification (360dialog may ping it)
  if (req.method === "GET") {
    const url = new URL(req.url);
    const challenge = url.searchParams.get("hub.challenge");
    if (challenge) {
      return new Response(challenge, { status: 200 });
    }
    return new Response("OK", { status: 200 });
  }

  try {
    const body = await req.json();
    console.log("Webhook payload:", JSON.stringify(body).slice(0, 500));

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    // 360dialog sends Cloud API format
    const entries = body?.entry || [];
    for (const entry of entries) {
      const changes = entry?.changes || [];
      for (const change of changes) {
        const value = change?.value || {};

        // Incoming messages
        const messages = value?.messages || [];
        for (const msg of messages) {
          const row = {
            direction: "inbound",
            wa_message_id: msg.id,
            from_phone: msg.from,
            to_phone: value?.metadata?.display_phone_number || "",
            message_type: msg.type,
            body:
              msg.text?.body ||
              msg.button?.text ||
              msg.interactive?.button_reply?.title ||
              JSON.stringify(msg),
            payload: msg,
          };

          const { error } = await sb.from("whatsapp_messages").insert(row);
          if (error) console.error("Insert error:", error);
          else console.log("Saved inbound message from", msg.from);
        }

        // Status updates (delivery receipts)
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
  } catch (err) {
    console.error("Webhook error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
