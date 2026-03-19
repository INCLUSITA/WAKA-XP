import { Suspense, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { BUILTIN_DEMOS } from "@/demos/registry";
import { supabase } from "@/integrations/supabase/client";
import RuntimeJSXRenderer from "@/demos/RuntimeJSXRenderer";
import wakaLogo from "@/assets/waka-logo.png";

const LoadingFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
    <div className="flex items-center gap-3">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      <span>Loading…</span>
    </div>
  </div>
);

export default function ShareDemo({ overrideDemoId }: { overrideDemoId?: string } = {}) {
  const { id: paramId } = useParams<{ id: string }>();
  const id = overrideDemoId || paramId;
  const demo = BUILTIN_DEMOS.find((d) => d.id === id);

  // For uploaded demos (non-builtin), load from DB
  const [uploadedData, setUploadedData] = useState<{ jsx: string; title: string; notes: Record<string, string> } | null>(null);
  const [loading, setLoading] = useState(!demo);

  // Set dynamic document title & OG meta tags
  useEffect(() => {
    const title = demo?.title || uploadedData?.title;
    if (title) {
      const fullTitle = `${title} — WAKA XP`;
      document.title = fullTitle;
      setMeta("og:title", fullTitle);
      setMeta("twitter:title", fullTitle);
    }
    return () => { document.title = "WAKA XP - Experience Platform"; };
  }, [demo?.title, uploadedData?.title]);

  // Log view for tracking
  useEffect(() => {
    if (!id) return;
    (supabase as any)
      .from("demo_share_views")
      .insert({
        demo_id: id,
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
      })
      .then(() => {});
  }, [id]);

  useEffect(() => {
    if (demo || !id) return;
    (supabase as any)
      .from("uploaded_demos")
      .select("title, jsx_source, scenario_notes")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }: any) => {
        if (data) {
          setUploadedData({
            jsx: data.jsx_source,
            title: data.title,
            notes: data.scenario_notes || {},
          });
        }
        setLoading(false);
      });
  }, [id, demo]);

  if (loading) return <LoadingFallback />;

  // Builtin demo
  if (demo) {
    const DemoComponent = demo.component;
    return (
      <div className="flex flex-col min-h-screen bg-slate-900">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-white/10 bg-slate-900/80 backdrop-blur">
          <img src={wakaLogo} alt="WAKA XP" className="h-7 w-7 rounded-lg object-contain" />
          <span className="text-sm font-bold text-white tracking-wide">WAKA XP</span>
          <span className="text-white/20 mx-1">·</span>
          <span className="text-sm text-white/50 truncate">{demo.title}</span>
        </div>
        <div className="flex-1 overflow-auto">
          <Suspense fallback={<LoadingFallback />}>
            <DemoComponent />
          </Suspense>
        </div>
        <div className="flex items-center justify-center gap-2 py-2 border-t border-white/10 bg-slate-900/80">
          <span className="text-[11px] text-white/30">Powered by</span>
          <img src={wakaLogo} alt="" className="h-4 w-4 rounded object-contain opacity-40" />
          <span className="text-[11px] font-semibold text-white/40">WAKA XP</span>
        </div>
      </div>
    );
  }

  // Uploaded demo with notes from DB (read-only)
  if (uploadedData?.jsx) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-900">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-white/10 bg-slate-900/80 backdrop-blur">
          <img src={wakaLogo} alt="WAKA XP" className="h-7 w-7 rounded-lg object-contain" />
          <span className="text-sm font-bold text-white tracking-wide">WAKA XP</span>
          <span className="text-white/20 mx-1">·</span>
          <span className="text-sm text-white/50 truncate">{uploadedData.title}</span>
        </div>
        <div className="flex-1 overflow-auto">
          <RuntimeJSXRenderer
            jsxSource={uploadedData.jsx}
            demoId={id}
            scenarioNotes={uploadedData.notes}
            readOnly
          />
        </div>
        <div className="flex items-center justify-center gap-2 py-2 border-t border-white/10 bg-slate-900/80">
          <span className="text-[11px] text-white/30">Powered by</span>
          <img src={wakaLogo} alt="" className="h-4 w-4 rounded object-contain opacity-40" />
          <span className="text-[11px] font-semibold text-white/40">WAKA XP</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
      <p className="text-lg">Demo not found.</p>
    </div>
  );
}
