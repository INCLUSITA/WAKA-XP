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

  try {
    const { chat_id, text, tenant_id } = await req.json();

    if (!text) {
      return new Response(JSON.stringify({ error: "text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get bot token from channel_connections
    const { data: conn, error: connError } = await supabase
      .from("channel_connections")
      .select("config")
      .eq("provider", "telegram")
      .limit(1)
      .single();

    if (connError || !conn) {
      throw new Error("Telegram not configured in channel_connections");
    }

    const botToken = (conn.config as Record<string, string>).bot_token;
    if (!botToken) {
      throw new Error("bot_token not found in config");
    }

    // If no chat_id provided, get the most recent one from telegram_messages
    let targetChatId = chat_id;
    if (!targetChatId) {
      const { data: lastMsg } = await supabase
        .from("telegram_messages")
        .select("chat_id")
        .eq("direction", "inbound")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!lastMsg) {
        throw new Error("No chat_id provided and no inbound messages found. Send a message to the bot first.");
      }
      targetChatId = lastMsg.chat_id;
    }

    // Send via Telegram Bot API
    const tgRes = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: targetChatId,
          text,
          parse_mode: "HTML",
        }),
      }
    );

    const tgData = await tgRes.json();

    if (!tgData.ok) {
      throw new Error(`Telegram API error: ${JSON.stringify(tgData)}`);
    }

    // Persist outbound message
    await supabase.from("telegram_messages").insert({
      chat_id: targetChatId,
      message_text: text,
      direction: "outbound",
      telegram_message_id: tgData.result?.message_id,
    });

    return new Response(
      JSON.stringify({ ok: true, message_id: tgData.result?.message_id, chat_id: targetChatId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Telegram send error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
