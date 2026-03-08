import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Waka AI, an expert at modifying React JSX code for interactive demos.

You will receive:
1. The current JSX source code of a demo component
2. One or more change proposals describing modifications to apply

Your job is to apply ALL the requested changes to the JSX code and return the COMPLETE modified JSX source.

CRITICAL RULES:
- Return ONLY the complete modified JSX code, nothing else
- Do NOT wrap the code in markdown code fences
- Do NOT add any explanatory text before or after the code
- Keep all existing imports, exports, and component structure
- The code must be valid JSX/TSX that can be transpiled by Sucrase
- Preserve the default export function pattern
- If a change cannot be applied, keep the original code for that part
- All styling should use inline styles (no Tailwind, no CSS modules)
- The component runs in a sandboxed environment with React hooks available globally (useState, useEffect, useRef, useCallback, useMemo, useReducer, useContext, createContext, memo, forwardRef, Fragment)
- Do NOT import React or hooks — they are provided by the runtime
- Keep the code working and renderable`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jsxSource, proposals } = await req.json();

    if (!jsxSource || typeof jsxSource !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'jsxSource'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!proposals || !Array.isArray(proposals) || proposals.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing or empty 'proposals' array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const changesDescription = proposals
      .map((p: { prompt: string; summary?: string }, i: number) =>
        `${i + 1}. "${p.prompt}"${p.summary ? ` (Summary: ${p.summary})` : ""}`
      )
      .join("\n");

    const userMessage = `Here is the current JSX source code of the demo:

\`\`\`jsx
${jsxSource}
\`\`\`

Apply these changes:
${changesDescription}

Return the COMPLETE modified JSX source code with all changes applied.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI apply failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    let modifiedJsx = data.choices?.[0]?.message?.content;

    if (!modifiedJsx) {
      return new Response(
        JSON.stringify({ error: "Empty AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean markdown fences if present
    modifiedJsx = modifiedJsx
      .replace(/^```(?:jsx|tsx|javascript|typescript)?\s*\n?/gm, "")
      .replace(/\n?```\s*$/gm, "")
      .trim();

    return new Response(
      JSON.stringify({ modifiedJsx, engine: "waka-ai", appliedCount: proposals.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("waka-ai-apply error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
