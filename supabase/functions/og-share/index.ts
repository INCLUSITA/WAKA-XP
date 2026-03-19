import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OG_IMAGE_FALLBACK =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/tRFDWsrio3e04XJjjE5HJqPTyAq2/social-images/social-1772871577571-waka-logo.webp";

const APP_ORIGIN = "https://wakaxp.wakacore.com";

serve(async (req) => {
  const url = new URL(req.url);
  const demoId = url.searchParams.get("id");

  if (!demoId) {
    return new Response("Missing id", { status: 400 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sb = createClient(supabaseUrl, supabaseKey);

  // Try uploaded_demos first
  const { data: demo } = await sb
    .from("uploaded_demos")
    .select("title, description, icon")
    .eq("id", demoId)
    .maybeSingle();

  const title = demo?.title
    ? `${demo.title} — WAKA XP`
    : "WAKA XP — Démo interactive";
  const description = demo?.description || "Démo interactive — WAKA Experience Platform";
  const canonical = `${APP_ORIGIN}/share/${demoId}`;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:image" content="${OG_IMAGE_FALLBACK}" />
  <meta property="og:url" content="${esc(canonical)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${OG_IMAGE_FALLBACK}" />
  <link rel="canonical" href="${esc(canonical)}" />
  <meta http-equiv="refresh" content="0;url=${esc(canonical)}" />
</head>
<body>
  <p>Redirecting to <a href="${esc(canonical)}">${esc(title)}</a>…</p>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=300" },
  });
});

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
