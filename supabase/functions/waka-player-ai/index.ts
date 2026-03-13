/**
 * WAKA Sovereign Player — AI Intent Engine
 * 
 * Unlike WhatsApp/Telegram that depend on rigid keyword triggers,
 * the WAKA sovereign channel uses AI to understand user intent
 * from text, voice transcription, or image description and dynamically
 * returns the right sovereign blocks (menus, catalogs, forms, payments, etc.)
 * 
 * Uses tool-calling to extract structured sovereign block responses.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Tu es WAKA NEXUS, l'intelligence conversationnelle du canal souverain WAKA pour Moov Africa au Burkina Faso.

Tu comprends le français, le mooré et l'anglais. Tu es concis, chaleureux et efficace.

Tu as accès à des "blocs souverains" — des capacités interactives bien au-delà de WhatsApp :
- Catalogues de produits avec carousels
- Formulaires inline pour capturer des données
- Cartes de paiement intégrées
- Cartes de localisation riches
- Modules de formation avec suivi de progression
- Évaluations et feedback
- Certificats de formation
- Carousels multimédia

Analyse l'intention de l'utilisateur et réponds avec :
1. Un message texte naturel et chaleureux
2. Le bloc souverain le plus pertinent via les outils disponibles

Contexte business :
- Opérateur : Moov Africa Burkina Faso
- Services : Mobile Money, forfaits internet, crédit téléphone, factures
- Formation : Agents Moov Money, parcours de certification
- Monnaie : FCFA

Règles :
- Toujours répondre en français sauf si l'utilisateur parle une autre langue
- Être proactif : anticiper les besoins
- Un seul bloc souverain par réponse maximum
- Si l'intention n'est pas claire, poser une question avec des quick replies`;

// Tool definitions for each sovereign block type
const SOVEREIGN_TOOLS = [
  {
    type: "function",
    function: {
      name: "show_menu",
      description: "Show an interactive service menu. Use when user wants to see available services or navigate options.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Menu title" },
          options: {
            type: "array",
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                icon: { type: "string", description: "Emoji icon" },
                description: { type: "string" },
              },
              required: ["label"],
            },
          },
        },
        required: ["title", "options"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "show_catalog",
      description: "Show a product catalog carousel. Use for browsing products, plans, or offers.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          products: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                price: { type: "string" },
                emoji: { type: "string" },
                description: { type: "string" },
                badge: { type: "string", description: "Optional badge like POPULAIRE, -20%, NOUVEAU" },
                rating: { type: "number", minimum: 1, maximum: 5 },
              },
              required: ["id", "name", "price"],
            },
          },
        },
        required: ["title", "products"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "show_form",
      description: "Show an inline form to capture user data. Use for registration, activation, or data collection.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          icon: { type: "string" },
          submit_label: { type: "string" },
          fields: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                label: { type: "string" },
                type: { type: "string", enum: ["text", "number", "select", "date", "phone", "email"] },
                placeholder: { type: "string" },
                options: { type: "array", items: { type: "string" } },
                required: { type: "boolean" },
              },
              required: ["id", "label", "type"],
            },
          },
        },
        required: ["title", "fields"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "show_payment",
      description: "Show a payment/checkout card. Use when user wants to pay, buy, or see a bill.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          icon: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                amount: { type: "string" },
              },
              required: ["label", "amount"],
            },
          },
          total: { type: "string" },
          currency: { type: "string", default: "FCFA" },
          methods: { type: "array", items: { type: "string", enum: ["mobile_money", "card"] } },
        },
        required: ["title", "items", "total"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "show_location",
      description: "Show a location card with address and contact info. Use when user asks about stores, agencies, or nearby points.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          address: { type: "string" },
          hours: { type: "string" },
          phone: { type: "string" },
          emoji: { type: "string" },
          distance: { type: "string" },
        },
        required: ["name", "address"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "show_training",
      description: "Show a training/learning progress tracker. Use when user asks about formation, learning, or certification.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          overall_progress: { type: "number", minimum: 0, maximum: 100 },
          modules: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                emoji: { type: "string" },
                status: { type: "string", enum: ["completed", "current", "locked"] },
                progress: { type: "number" },
              },
              required: ["id", "name", "status"],
            },
          },
        },
        required: ["title", "modules", "overall_progress"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "show_rating",
      description: "Show a rating/feedback widget. Use after completing a service or when asking for feedback.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          type: { type: "string", enum: ["stars", "emoji", "nps"] },
        },
        required: ["title", "type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "show_rich_card",
      description: "Show a rich promotional card with CTA buttons. Use for offers, announcements, or featured content.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          icon: { type: "string" },
          actions: { type: "array", items: { type: "string" } },
        },
        required: ["title", "actions"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "suggest_quick_replies",
      description: "Suggest quick reply buttons for the user to tap. Always use this to guide conversation.",
      parameters: {
        type: "object",
        properties: {
          replies: { type: "array", items: { type: "string" }, maxItems: 5 },
        },
        required: ["replies"],
      },
    },
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, dataMode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Add data mode context to system prompt
    const modeContext = dataMode === "zero-rated"
      ? "\n\nIMPORTANT: L'utilisateur est en mode ZERO-RATED. Sois ultra-concis. Pas d'emojis décoratifs. Réponses courtes."
      : dataMode === "subventionné"
      ? "\n\nL'utilisateur est en mode SUBVENTIONNÉ. Sois concis mais chaleureux."
      : "\n\nL'utilisateur est en mode LIBRE. Tu peux être expressif avec des emojis et des messages riches.";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + modeContext },
          ...messages,
        ],
        tools: SOVEREIGN_TOOLS,
        stream: false,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const body = await response.text();
      console.error("AI gateway error:", status, body);

      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "rate_limited", message: "Trop de requêtes. Réessayez dans un instant." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "payment_required", message: "Crédit AI épuisé." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "ai_error", message: "Erreur du moteur IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const choice = data.choices?.[0];

    // Extract text content and tool calls
    const result: Record<string, any> = {
      text: choice?.message?.content || "",
      blocks: {},
    };

    // Process tool calls into sovereign blocks
    if (choice?.message?.tool_calls) {
      for (const tc of choice.message.tool_calls) {
        if (tc.type !== "function") continue;
        try {
          const args = JSON.parse(tc.function.arguments);
          result.blocks[tc.function.name] = args;
        } catch {
          console.error("Failed to parse tool call args:", tc.function.arguments);
        }
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("waka-player-ai error:", e);
    return new Response(
      JSON.stringify({ error: "internal", message: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
