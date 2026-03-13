/**
 * WAKA Sovereign Player — AI Intent Engine v2
 * 
 * Integrates 14 WAKA CORE API tools for real backend operations:
 * BNPL phones, fiber, insurance, MoMo, payments, client management.
 * 
 * Architecture:
 * 1. AI receives user message + conversation history
 * 2. AI decides which tool(s) to call via tool-calling
 * 3. Edge function executes real API calls to WAKA CORE
 * 4. AI formats response with sovereign blocks for rich UI
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const WAKA_CORE_BASE = "https://atcyynxxrbkydsilvrol.supabase.co/functions/v1/waka-core-api";

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

Tu as aussi accès à 14 outils WAKA CORE pour des opérations réelles :
- Catalogue de téléphones BNPL (Buy Now Pay Later)
- Plans fibre optique
- Assurance santé (microseguro)
- Comptes Mobile Money (MoMo)
- Gestion clients et KYC
- Simulations et créations de crédits
- Paiements

RÈGLES CRITIQUES:
1. DÉCOUVERTE PRODUITS: Avant de mentionner un produit, appeler get_product_rules
2. CATALOGUE BNPL: Appeler get_bnpl_catalog pour montrer les téléphones disponibles
3. MONNAIE XOF: Tous les montants en francs CFA, arrondis à l'entier
4. JAMAIS inventer d'IDs, prix, ou produits — utiliser les données API
5. EXPRESSIONS LOCALES (max 1 par message): "Laafi bala?" (mooré), "I ni sogoma" (dioula)

FLUX:
- Téléphone BNPL: get_bnpl_catalog → simulate_credit → consentement device_lock → create_credit
- Fibre: acquire_service(fibre_optique) → update_client_location → acquire_service(accept=true)
- Assurance comptant: acquire_service(microseguro_salud)
- Assurance financée: simulate_credit(seguro_salud) → create_credit
- MoMo: open_momo_account
- Paiement: pay_by_client ou register_payment

Analyse l'intention de l'utilisateur et réponds avec :
1. Un message texte naturel et chaleureux
2. Le bloc souverain le plus pertinent via les outils disponibles
3. Si tu appelles un outil WAKA CORE, utilise aussi un bloc souverain pour afficher les résultats

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

// ── Sovereign Block Tools (UI rendering) ──
const SOVEREIGN_TOOLS = [
  {
    type: "function",
    function: {
      name: "show_menu",
      description: "Show an interactive service menu.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          options: {
            type: "array",
            items: {
              type: "object",
              properties: { label: { type: "string" }, icon: { type: "string" }, description: { type: "string" } },
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
      description: "Show a product catalog carousel. Use for browsing products, plans, phones, or offers.",
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
                badge: { type: "string" },
                rating: { type: "number" },
                specs: { type: "object", description: "Technical specs like storage, camera, screen" },
                image_url: { type: "string" },
                category: { type: "string", enum: ["phone", "fiber", "insurance", "momo", "general"] },
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
      description: "Show an inline form to capture user data.",
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
                id: { type: "string" }, label: { type: "string" },
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
      description: "Show a payment/checkout card.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" }, icon: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: { label: { type: "string" }, amount: { type: "string" } },
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
      description: "Show a location card with address and contact info.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" }, address: { type: "string" }, hours: { type: "string" },
          phone: { type: "string" }, emoji: { type: "string" }, distance: { type: "string" },
        },
        required: ["name", "address"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "show_training",
      description: "Show a training/learning progress tracker.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          overall_progress: { type: "number" },
          modules: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" }, name: { type: "string" }, emoji: { type: "string" },
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
      description: "Show a rating/feedback widget.",
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
      description: "Show a rich promotional card with CTA buttons.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" }, description: { type: "string" },
          icon: { type: "string" }, actions: { type: "array", items: { type: "string" } },
        },
        required: ["title", "actions"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "suggest_quick_replies",
      description: "Suggest quick reply buttons. Always use to guide conversation.",
      parameters: {
        type: "object",
        properties: {
          replies: { type: "array", items: { type: "string" }, maxItems: 5 },
        },
        required: ["replies"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "show_credit_simulation",
      description: "Show a credit simulation result card with amortization details.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          product_name: { type: "string" },
          amount: { type: "string" },
          term: { type: "string" },
          frequency: { type: "string" },
          monthly_payment: { type: "string" },
          total_cost: { type: "string" },
          interest_rate: { type: "string" },
          icon: { type: "string" },
          actions: { type: "array", items: { type: "string" } },
        },
        required: ["title", "amount", "monthly_payment"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "show_client_status",
      description: "Show a client status/balance summary card.",
      parameters: {
        type: "object",
        properties: {
          client_name: { type: "string" },
          voice_id: { type: "string" },
          phone: { type: "string" },
          active_credits: { type: "integer" },
          total_balance: { type: "string" },
          next_payment_date: { type: "string" },
          next_payment_amount: { type: "string" },
          icon: { type: "string" },
        },
        required: ["client_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "show_momo_card",
      description: "Show a Mobile Money account card (opening confirmation or status).",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          account_number: { type: "string" },
          account_type: { type: "string", enum: ["standard", "merchant"] },
          status: { type: "string" },
          message: { type: "string" },
          icon: { type: "string" },
          actions: { type: "array", items: { type: "string" } },
        },
        required: ["title"],
      },
    },
  },
];

// ── WAKA CORE API Tools (real backend operations) ──
const WAKA_CORE_TOOLS = [
  {
    type: "function",
    function: {
      name: "get_product_rules",
      description: "OBLIGATOIRE: Découvrir les produits actifs et leurs contraintes. Appeler SANS paramètres pour voir tous les produits. Avec credit_type pour les règles spécifiques.",
      parameters: {
        type: "object",
        properties: {
          credit_type: { type: "string", description: "Optionnel: phone_bnpl, seguro_salud, etc." },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_bnpl_catalog",
      description: "Catalogue des téléphones BNPL avec prix en XOF et stock en temps réel. OBLIGATOIRE avant de proposer des téléphones.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "create_client",
      description: "Rechercher ou créer un client. Seuls phone et full_name requis.",
      parameters: {
        type: "object",
        properties: {
          phone: { type: "string" },
          full_name: { type: "string" },
          document_number: { type: "string" },
        },
        required: ["phone"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_client",
      description: "Modifier les données d'un client existant.",
      parameters: {
        type: "object",
        properties: {
          client_id: { type: "string" },
          full_name: { type: "string" },
          phone: { type: "string" },
          email: { type: "string" },
          address: { type: "string" },
          document_number: { type: "string" },
        },
        required: ["client_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "lookup_entity",
      description: "Recherche universelle par téléphone, CNI, voice_id, nom ou credit_id.",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "simulate_credit",
      description: "Simuler un crédit (BNPL ou assurance financée). UNIQUEMENT pour paiement en plusieurs fois.",
      parameters: {
        type: "object",
        properties: {
          client_id: { type: "string" },
          credit_type: { type: "string", enum: ["phone_bnpl", "bnpl", "seguro_salud"] },
          product_id: { type: "string" },
          amount: { type: "number" },
          term_months: { type: "integer" },
          term_days: { type: "integer" },
          payment_frequency: { type: "string", enum: ["daily", "weekly", "biweekly", "monthly"] },
        },
        required: ["client_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_credit",
      description: "Créer un crédit formel. UNE SEULE FOIS. device_lock=true OBLIGATOIRE pour BNPL.",
      parameters: {
        type: "object",
        properties: {
          client_id: { type: "string" },
          credit_type: { type: "string", enum: ["phone_bnpl", "bnpl", "seguro_salud"] },
          amount: { type: "number" },
          term_months: { type: "integer" },
          term_days: { type: "integer" },
          payment_frequency: { type: "string", enum: ["daily", "weekly", "biweekly", "monthly"] },
          product_id: { type: "string" },
          device_lock: { type: "boolean" },
        },
        required: ["client_id", "credit_type", "amount"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "pay_by_client",
      description: "Paiement simplifié auto-détection du crédit.",
      parameters: {
        type: "object",
        properties: {
          client_id: { type: "string" },
          amount: { type: "number" },
        },
        required: ["client_id", "amount"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "register_payment",
      description: "Paiement à un crédit spécifique (si plusieurs crédits actifs).",
      parameters: {
        type: "object",
        properties: {
          credit_id: { type: "string" },
          amount: { type: "number" },
        },
        required: ["credit_id", "amount"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "acquire_service",
      description: "Acquérir un service COMPTANT (fibre, assurance). Crée un DEAL, PAS un crédit.",
      parameters: {
        type: "object",
        properties: {
          client_id: { type: "string" },
          product_catalog_key: { type: "string", description: "fibre_optique ou microseguro_salud" },
          product_variant_sku: { type: "string" },
          accept: { type: "boolean" },
          channel: { type: "string", enum: ["whatsapp", "voice", "app", "web"], default: "app" },
        },
        required: ["client_id", "product_catalog_key"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_client_location",
      description: "Capturer les coordonnées GPS du client (requis pour fibre).",
      parameters: {
        type: "object",
        properties: {
          client_id: { type: "string" },
          lat: { type: "number" },
          lng: { type: "number" },
          raw_text: { type: "string" },
        },
        required: ["client_id", "lat", "lng"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "open_momo_account",
      description: "Ouvrir un compte Mobile Money. Types: standard (particulier) ou merchant (commerçant).",
      parameters: {
        type: "object",
        properties: {
          client_id: { type: "string" },
          account_type: { type: "string", enum: ["standard", "merchant"], default: "standard" },
          channel: { type: "string", default: "app" },
        },
        required: ["client_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "quick_status",
      description: "Résumé rapide du solde et paiements d'un client.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
          client_id: { type: "string" },
        },
      },
    },
  },
];

// ── API endpoint mapping ──
const TOOL_ENDPOINTS: Record<string, { method: string; path: string }> = {
  get_product_rules: { method: "GET", path: "/bots/product-rules" },
  get_bnpl_catalog: { method: "GET", path: "/bots/bnpl-catalog" },
  create_client: { method: "POST", path: "/bots/client-onboarding" },
  update_client: { method: "POST", path: "/bots/client-update" },
  lookup_entity: { method: "POST", path: "/bots/entity-lookup" },
  simulate_credit: { method: "POST", path: "/bots/create-credit-template" },
  create_credit: { method: "POST", path: "/credits" },
  pay_by_client: { method: "POST", path: "/bots/pay-by-client" },
  register_payment: { method: "POST", path: "/bots/register-payment" },
  acquire_service: { method: "POST", path: "/bots/acquire-service" },
  update_client_location: { method: "POST", path: "/bots/client-location" },
  open_momo_account: { method: "POST", path: "/bots/open-momo-account" },
  quick_status: { method: "POST", path: "/bots/quick-status" },
};

// Set of tool names that are sovereign UI blocks (not API calls)
const SOVEREIGN_BLOCK_NAMES = new Set([
  "show_menu", "show_catalog", "show_form", "show_payment", "show_location",
  "show_training", "show_rating", "show_rich_card", "suggest_quick_replies",
  "show_credit_simulation", "show_client_status", "show_momo_card",
]);

async function executeWakaCoreCall(
  toolName: string,
  args: Record<string, unknown>,
  apiKey: string
): Promise<Record<string, unknown>> {
  const endpoint = TOOL_ENDPOINTS[toolName];
  if (!endpoint) {
    return { error: `Unknown tool: ${toolName}` };
  }

  try {
    let url = `${WAKA_CORE_BASE}${endpoint.path}`;
    const headers: Record<string, string> = {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    };

    let response: Response;
    if (endpoint.method === "GET") {
      // Add query params for GET requests
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(args)) {
        if (v !== undefined && v !== null && v !== "") {
          params.set(k, String(v));
        }
      }
      const qs = params.toString();
      if (qs) url += `?${qs}`;
      response = await fetch(url, { method: "GET", headers });
    } else {
      response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(args),
      });
    }

    const data = await response.json();
    console.log(`WAKA CORE [${toolName}] ${response.status}:`, JSON.stringify(data).slice(0, 500));
    return data;
  } catch (e) {
    console.error(`WAKA CORE call failed [${toolName}]:`, e);
    return { error: `API call failed: ${e instanceof Error ? e.message : "Unknown error"}` };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, dataMode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const WAKA_API_KEY = Deno.env.get("WAKA_CORE_API_KEY");
    if (!WAKA_API_KEY) throw new Error("WAKA_CORE_API_KEY is not configured");

    const modeContext = dataMode === "zero-rated"
      ? "\n\nIMPORTANT: L'utilisateur est en mode ZERO-RATED. Sois ultra-concis. Pas d'emojis décoratifs. Réponses courtes."
      : dataMode === "subventionné"
      ? "\n\nL'utilisateur est en mode SUBVENTIONNÉ. Sois concis mais chaleureux."
      : "\n\nL'utilisateur est en mode LIBRE. Tu peux être expressif avec des emojis et des messages riches.";

    const hasImages = messages.some((m: any) =>
      Array.isArray(m.content) && m.content.some((p: any) => p.type === "image_url")
    );
    const model = hasImages ? "google/gemini-2.5-flash" : "google/gemini-3-flash-preview";

    const allTools = [...SOVEREIGN_TOOLS, ...WAKA_CORE_TOOLS];

    // First AI call — may produce tool calls
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT + modeContext },
          ...messages,
        ],
        tools: allTools,
        stream: false,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const body = await response.text();
      console.error("AI gateway error:", status, body);
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "rate_limited", message: "Trop de requêtes. Réessayez." }),
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
    let choice = data.choices?.[0];

    const result: Record<string, any> = { text: "", blocks: {} };

    // Check if AI wants to call WAKA CORE tools
    const toolCalls = choice?.message?.tool_calls || [];
    const coreToolCalls = toolCalls.filter(
      (tc: any) => tc.type === "function" && !SOVEREIGN_BLOCK_NAMES.has(tc.function.name)
    );
    const uiToolCalls = toolCalls.filter(
      (tc: any) => tc.type === "function" && SOVEREIGN_BLOCK_NAMES.has(tc.function.name)
    );

    // If there are WAKA CORE tool calls, execute them and do a second AI call
    if (coreToolCalls.length > 0) {
      // Build tool results
      const toolResults: Array<{ role: string; tool_call_id: string; content: string }> = [];

      for (const tc of coreToolCalls) {
        let args: Record<string, unknown> = {};
        try { args = JSON.parse(tc.function.arguments); } catch { /* empty */ }

        const apiResult = await executeWakaCoreCall(tc.function.name, args, WAKA_API_KEY);
        toolResults.push({
          role: "tool",
          tool_call_id: tc.id,
          content: JSON.stringify(apiResult),
        });
      }

      // Also handle any UI tool calls from the first pass
      for (const tc of uiToolCalls) {
        try {
          const args = JSON.parse(tc.function.arguments);
          result.blocks[tc.function.name] = args;
        } catch { /* skip */ }
        // Provide a dummy tool result so the API doesn't error
        toolResults.push({
          role: "tool",
          tool_call_id: tc.id,
          content: JSON.stringify({ ok: true }),
        });
      }

      // Second AI call with tool results — AI will now format the response
      const secondResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT + modeContext },
            ...messages,
            choice.message, // include the assistant message with tool calls
            ...toolResults,
          ],
          tools: allTools,
          stream: false,
        }),
      });

      if (secondResponse.ok) {
        const secondData = await secondResponse.json();
        choice = secondData.choices?.[0];
      }
    }

    // Extract final text
    result.text = choice?.message?.content || "";

    // Process tool calls from final response (UI blocks)
    const finalToolCalls = choice?.message?.tool_calls || [];
    for (const tc of finalToolCalls) {
      if (tc.type !== "function") continue;
      if (!SOVEREIGN_BLOCK_NAMES.has(tc.function.name)) continue;
      try {
        const args = JSON.parse(tc.function.arguments);
        result.blocks[tc.function.name] = args;
      } catch {
        console.error("Failed to parse tool call args:", tc.function.arguments);
      }
    }

    // Also keep any UI blocks from the first pass that weren't overwritten
    // (already in result.blocks from above)

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
