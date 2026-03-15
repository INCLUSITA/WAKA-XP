/**
 * generate-player-flow — Edge function to create player flows from various sources.
 * Supports: JSON TextIt, YAML agent definition, Text instructions + AI, Image assets.
 * Outputs: conversation_snapshot + scenario_config → saved to player_saved_flows.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { name, description, engineId, tenantId, sourceData, mode, existingFlowId } = await req.json();

    if (!name || !tenantId) {
      return new Response(JSON.stringify({ error: "name and tenantId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let conversationSnapshot: any[] = [];
    let scenarioConfig: Record<string, any> = {};

    if (mode === "import") {
      // Direct import — parse JSON/YAML and create a basic scenario config
      const result = parseSourceDirectly(sourceData);
      conversationSnapshot = result.conversation;
      scenarioConfig = result.config;
    } else {
      // AI-powered generation
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const result = await generateWithAI(LOVABLE_API_KEY, sourceData, name, description);
      conversationSnapshot = result.conversation;
      scenarioConfig = result.config;
    }

    // Save to player_saved_flows
    const authHeader = req.headers.get("authorization");
    let createdBy: string | null = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      createdBy = user?.id || null;
    }

    const { data, error } = await supabase.from("player_saved_flows").insert({
      tenant_id: tenantId,
      name,
      description: description || "",
      status: "sandbox",
      data_mode: "libre",
      conversation_snapshot: conversationSnapshot,
      scenario_config: scenarioConfig,
      message_count: conversationSnapshot.length,
      created_by: createdBy,
    }).select("id").single();

    if (error) {
      console.error("DB insert error:", error);
      return new Response(JSON.stringify({ error: "Failed to save flow" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ flowId: data.id, messageCount: conversationSnapshot.length }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("generate-player-flow error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

/* ── Direct Import (no AI) ── */
function parseSourceDirectly(sourceData: any): { conversation: any[]; config: Record<string, any> } {
  const config: Record<string, any> = {};
  const conversation: any[] = [];
  const now = new Date().toISOString();

  // Welcome message
  conversation.push({
    id: "sys-1",
    text: "⚡ WAKA NEXUS · Canal souverain — Flujo importado",
    direction: "outbound",
    timestamp: now,
    isSystemEvent: true,
  });

  if (sourceData.json) {
    try {
      const parsed = JSON.parse(sourceData.json);
      config.sourceType = "textit_json";
      config.flowDefinition = parsed;

      // Extract flow names and basic info
      const flows = parsed.flows || [];
      const flowNames = flows.map((f: any) => f.name).join(", ");
      const nodeCount = flows.reduce((acc: number, f: any) => acc + (f.nodes?.length || 0), 0);

      conversation.push({
        id: "import-1",
        text: `📋 Flujo TextIt importado\n\n**Flujos:** ${flowNames || "N/A"}\n**Nodos:** ${nodeCount}\n\nEl contexto del flujo está listo para interacción con IA.`,
        direction: "outbound",
        timestamp: now,
        source: "WAKA NEXUS · Import",
        quickReplies: ["▶️ Comenzar simulación", "📊 Ver estructura", "🏠 Menu principal"],
      });
    } catch {
      config.sourceType = "raw_json";
      config.rawContent = sourceData.json;
    }
  }

  if (sourceData.yaml) {
    config.sourceType = config.sourceType ? "mixed" : "yaml_agent";
    config.yamlDefinition = sourceData.yaml;

    // Extract basic YAML info
    const lines = sourceData.yaml.split("\n").slice(0, 5).join("\n");

    conversation.push({
      id: "import-yaml-1",
      text: `📄 Agente YAML importado\n\n\`\`\`yaml\n${lines}\n...\n\`\`\`\n\nDefinición del agente cargada. Listo para interacción.`,
      direction: "outbound",
      timestamp: now,
      source: "WAKA NEXUS · Import",
      quickReplies: ["▶️ Probar agente", "📋 Ver endpoints", "🏠 Menu principal"],
    });
  }

  return { conversation, config };
}

interface GeneratedPayload {
  conversation: any[];
  config: Record<string, any>;
}

function redactSensitiveTokens(text: string): string {
  const patterns: RegExp[] = [
    /waka_live_[A-Za-z0-9]+/g,
    /x-api-key\s*[:=]\s*[A-Za-z0-9._-]+/gi,
    /\b(?:sk|pk)_[A-Za-z0-9_-]{20,}\b/g,
    /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi,
  ];

  return patterns.reduce((value, pattern) => value.replace(pattern, "[REDACTED]"), text);
}

function sanitizeGeneratedPayload(payload: GeneratedPayload): GeneratedPayload {
  const conversation = (payload.conversation || []).map((message: any) => ({
    ...message,
    text: typeof message?.text === "string" ? redactSensitiveTokens(message.text) : message?.text,
    source: typeof message?.source === "string" ? redactSensitiveTokens(message.source) : message?.source,
    quickReplies: Array.isArray(message?.quickReplies)
      ? message.quickReplies.map((reply: any) => typeof reply === "string" ? redactSensitiveTokens(reply) : reply)
      : message?.quickReplies,
  }));

  const config = {
    ...(payload.config || {}),
    systemPrompt: typeof payload.config?.systemPrompt === "string"
      ? redactSensitiveTokens(payload.config.systemPrompt)
      : payload.config?.systemPrompt,
  };

  return { conversation, config };
}

/* ── AI-powered generation ── */
async function generateWithAI(
  apiKey: string,
  sourceData: any,
  flowName: string,
  flowDescription: string,
): Promise<{ conversation: any[]; config: Record<string, any> }> {

  // Build context from all sources
  let contextParts: string[] = [];

  if (sourceData.instructions) {
    contextParts.push(`## Instrucciones del usuario\n${sourceData.instructions}`);
  }
  if (sourceData.existingConfig && sourceData.mergeMode) {
    const existing = sourceData.existingConfig;
    contextParts.push(`## Configuración existente del flujo (MERGE MODE)\nEste flujo ya existe. Las nuevas instrucciones deben MEJORAR y COMBINAR con lo existente, no reemplazarlo.\n\n**System Prompt actual:**\n${existing.systemPrompt || "(vacío)"}\n\n**Intents actuales:** ${(existing.intents || []).join(", ") || "(ninguno)"}\n\n**Endpoints actuales:** ${JSON.stringify(existing.endpoints || [])}\n\n**Persona actual:** ${JSON.stringify(existing.persona || {})}`);
  }
  if (sourceData.json) {
    const truncated = sourceData.json.length > 8000
      ? sourceData.json.substring(0, 8000) + "\n... (truncado)"
      : sourceData.json;
    contextParts.push(`## Definición JSON TextIt/RapidPro\n\`\`\`json\n${truncated}\n\`\`\``);
  }
  if (sourceData.yaml) {
    const truncated = sourceData.yaml.length > 6000
      ? sourceData.yaml.substring(0, 6000) + "\n... (truncado)"
      : sourceData.yaml;
    contextParts.push(`## Definición YAML del agente\n\`\`\`yaml\n${truncated}\n\`\`\``);
  }
  if (sourceData.assets?.length > 0) {
    contextParts.push(`## Assets visuales subidos\n${sourceData.assets.map((a: any) => `- ${a.name} (${a.type})`).join("\n")}\nUsa estos assets como referencia para personalizar la experiencia visual.`);
  }

  const systemPrompt = `Eres un generador de flujos conversacionales para WAKA XP, una plataforma de experiencias conversacionales omnicanal para Moov Africa en Burkina Faso.

Tu tarea es generar DOS cosas basándote en las fuentes proporcionadas:

1. **conversation_snapshot**: Un array de mensajes que forman una conversación demo completa (5-15 mensajes). Cada mensaje tiene:
   - id: string único (ej: "msg-1", "msg-2")
   - text: contenido del mensaje (soporta markdown)
   - direction: "inbound" (usuario) o "outbound" (bot)
   - timestamp: ISO string
   - source: "WAKA NEXUS · IA" para outbound
   - quickReplies: array de strings (botones rápidos, para outbound)
   - isSystemEvent: true para mensajes de sistema
   - menu: array de {label, icon, description} para menús
   - Otros bloques soberanos si aplica

2. **scenario_config**: Un objeto con:
   - systemPrompt: string — instrucciones para el motor de IA al continuar la conversación
   - endpoints: array de {name, url, method, description} si el YAML/JSON define APIs
   - intents: array de strings — intenciones principales del flujo
   - persona: {name, tone, language} — personalidad del agente
   - tags: array de strings — etiquetas del flujo

El primer mensaje siempre debe ser un system event con "⚡ WAKA NEXUS · Canal souverain".
El segundo mensaje debe ser el mensaje de bienvenida del bot.
Incluye 2-3 intercambios de ejemplo realistas.
Usa emojis apropiados y francés como idioma principal.

RESPONDE EXCLUSIVAMENTE con un JSON válido con esta estructura:
{
  "conversation": [...mensajes...],
  "config": { systemPrompt, endpoints, intents, persona, tags }
}`;

  const userPrompt = `Nombre del flujo: "${flowName}"
Descripción: "${flowDescription || "Sin descripción"}"

${contextParts.join("\n\n")}

Genera el flujo conversacional completo en formato JSON.`;

  // Build messages - include image assets if present
  const userContent: any[] = [{ type: "text", text: userPrompt }];

  if (sourceData.assets?.length > 0) {
    for (const asset of sourceData.assets.slice(0, 3)) {
      if (asset.dataUrl?.startsWith("data:image/")) {
        userContent.push({
          type: "image_url",
          image_url: { url: asset.dataUrl },
        });
      }
    }
  }

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent.length > 1 ? userContent : userPrompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    if (response.status === 429) throw new Error("Rate limit exceeded. Intenta de nuevo en unos segundos.");
    if (response.status === 402) throw new Error("Créditos agotados. Agrega fondos en Settings → Workspace → Usage.");
    const text = await response.text();
    console.error("AI gateway error:", response.status, text);
    throw new Error("Error del motor IA");
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  // Parse JSON from AI response
  try {
    // Try to extract JSON from markdown code blocks or raw
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
    const parsed = JSON.parse(jsonMatch[1]!.trim());

    const conversation = parsed.conversation || [];
    const config = parsed.config || {};

    // Ensure timestamps are strings
    const now = Date.now();
    conversation.forEach((msg: any, i: number) => {
      if (!msg.timestamp) msg.timestamp = new Date(now - (conversation.length - i) * 5000).toISOString();
      if (!msg.id) msg.id = `gen-${i + 1}`;
    });

    return { conversation, config };
  } catch (parseErr) {
    console.error("Failed to parse AI output:", parseErr, "Content:", content.substring(0, 500));

    // Fallback: create a basic flow from the raw AI text
    const now = new Date().toISOString();
    return {
      conversation: [
        { id: "sys-1", text: "⚡ WAKA NEXUS · Canal souverain — IA activada", direction: "outbound", timestamp: now, isSystemEvent: true },
        { id: "gen-1", text: content.substring(0, 1000) || "Flujo generado. Comenzar interacción.", direction: "outbound", timestamp: now, source: "WAKA NEXUS · IA", quickReplies: ["▶️ Comenzar", "🏠 Menu"] },
      ],
      config: { systemPrompt: content, intents: [], tags: [] },
    };
  }
}
