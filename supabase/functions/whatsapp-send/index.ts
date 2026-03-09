import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const D360_BASE = "https://waba-v2.360dialog.io";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("D360_API_KEY");
    console.log("D360_API_KEY length:", apiKey?.length, "first 8 chars:", apiKey?.slice(0, 8));
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "D360_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { phone, message_type, text, buttons } = body;

    if (!phone || !message_type) {
      return new Response(
        JSON.stringify({ error: "phone and message_type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize phone: strip spaces, dashes, plus
    const cleanPhone = phone.replace(/[\s\-\+]/g, "");

    let waPayload: Record<string, unknown>;

    if (message_type === "text") {
      waPayload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanPhone,
        type: "text",
        text: { body: text || "Hello from WAKA XP" },
      };
    } else if (message_type === "interactive_buttons") {
      const actionButtons = (buttons || []).slice(0, 3).map((b: string, i: number) => ({
        type: "reply",
        reply: { id: `btn_${i}`, title: b.slice(0, 20) },
      }));
      waPayload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanPhone,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: text || "Please choose:" },
          action: { buttons: actionButtons },
        },
      };
    } else {
      return new Response(
        JSON.stringify({ error: `Unsupported message_type: ${message_type}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const d360Res = await fetch(`${D360_BASE}/messages`, {
      method: "POST",
      headers: {
        "D360-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(waPayload),
    });

    const d360Body = await d360Res.json();

    return new Response(
      JSON.stringify({
        success: d360Res.ok,
        status: d360Res.status,
        data: d360Body,
      }),
      {
        status: d360Res.ok ? 200 : 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
