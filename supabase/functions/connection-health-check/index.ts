import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { connection_id } = await req.json();
    if (!connection_id) throw new Error("connection_id required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: conn, error } = await supabase
      .from("channel_connections")
      .select("*")
      .eq("id", connection_id)
      .single();
    if (error || !conn) throw new Error("Connection not found");

    let health_status = "unknown";
    let health_error: string | null = null;

    const provider = conn.provider;
    const config = (conn.config || {}) as Record<string, string>;

    if (provider === "360dialog") {
      // Check 360dialog health via API
      const apiKey = Deno.env.get("D360_API_KEY") || config.api_key;
      if (!apiKey) {
        health_status = "warning";
        health_error = "No API key configured";
      } else {
        try {
          const res = await fetch(
            "https://waba.360dialog.io/v1/configs/webhook",
            { headers: { "D360-API-KEY": apiKey } }
          );
          if (res.ok) {
            health_status = "healthy";
          } else {
            health_status = "error";
            health_error = `API returned ${res.status}`;
          }
        } catch (e: any) {
          health_status = "error";
          health_error = e.message?.slice(0, 200);
        }
      }
    } else if (provider === "telegram") {
      const botToken = config.bot_token;
      if (!botToken) {
        health_status = "warning";
        health_error = "No bot token configured";
      } else {
        try {
          const res = await fetch(
            `https://api.telegram.org/bot${botToken}/getMe`
          );
          const data = await res.json();
          if (data.ok) {
            health_status = "healthy";
          } else {
            health_status = "error";
            health_error = data.description?.slice(0, 200) || "Bot check failed";
          }
        } catch (e: any) {
          health_status = "error";
          health_error = e.message?.slice(0, 200);
        }
      }
    } else if (provider === "vonage") {
      const apiKey = config.api_key;
      const apiSecret = config.api_secret;
      if (!apiKey || !apiSecret) {
        health_status = "warning";
        health_error = "Missing API key or secret";
      } else {
        try {
          const res = await fetch(
            `https://rest.nexmo.com/account/get-balance?api_key=${apiKey}&api_secret=${apiSecret}`
          );
          if (res.ok) {
            health_status = "healthy";
          } else {
            health_status = "error";
            health_error = `API returned ${res.status}`;
          }
        } catch (e: any) {
          health_status = "error";
          health_error = e.message?.slice(0, 200);
        }
      }
    } else if (provider === "mailgun") {
      const apiKeyVal = config.api_key;
      const domain = config.domain;
      if (!apiKeyVal || !domain) {
        health_status = "warning";
        health_error = "Missing API key or domain";
      } else {
        try {
          const res = await fetch(
            `https://api.mailgun.net/v3/${domain}/stats/total?event=accepted&duration=1h`,
            { headers: { Authorization: `Basic ${btoa(`api:${apiKeyVal}`)}` } }
          );
          if (res.ok) {
            health_status = "healthy";
          } else {
            health_status = "error";
            health_error = `API returned ${res.status}`;
          }
        } catch (e: any) {
          health_status = "error";
          health_error = e.message?.slice(0, 200);
        }
      }
    }

    // Update the connection record
    await supabase
      .from("channel_connections")
      .update({
        health_status,
        health_error,
        health_checked_at: new Date().toISOString(),
      })
      .eq("id", connection_id);

    return new Response(
      JSON.stringify({ health_status, health_error }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
