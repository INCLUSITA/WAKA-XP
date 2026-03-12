import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShieldX, Eye, Clock } from "lucide-react";
import wakaLogo from "@/assets/waka-logo.png";

interface DemoShare {
  id: string;
  token: string;
  title: string;
  description: string | null;
  demo_url: string;
  demo_type: string;
  is_active: boolean;
  view_count: number;
  max_views: number | null;
  expires_at: string | null;
}

export default function SharedDemo() {
  const { token } = useParams<{ token: string }>();
  const [demo, setDemo] = useState<DemoShare | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setError("Link inválido");
      setLoading(false);
      return;
    }

    async function loadDemo() {
      try {
        const { data, error: fetchError } = await (supabase as any)
          .from("demo_shares")
          .select("*")
          .eq("token", token)
          .eq("is_active", true)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (!data) {
          setError("Esta demo no existe o ha sido desactivada.");
          setLoading(false);
          return;
        }

        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          setError("Este enlace ha expirado.");
          setLoading(false);
          return;
        }

        if (data.max_views && data.view_count >= data.max_views) {
          setError("Este enlace ha alcanzado el límite de visualizaciones.");
          setLoading(false);
          return;
        }

        setDemo(data as DemoShare);

        // Increment view count
        await (supabase as any).rpc("increment_demo_share_view", { share_token: token });
      } catch (err) {
        console.error("Error loading demo:", err);
        setError("Error al cargar la demo.");
      } finally {
        setLoading(false);
      }
    }

    loadDemo();
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Cargando experiencia…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center">
          <div className="h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <ShieldX className="h-7 w-7 text-red-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold mb-1">Acceso no disponible</h1>
            <p className="text-sm text-white/60">{error}</p>
          </div>
          <p className="text-xs text-white/30 mt-4">WAKA Experience Platform</p>
        </div>
      </div>
    );
  }

  if (!demo) return null;

  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      {/* Minimal branded header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-slate-900/80 backdrop-blur shrink-0">
        <div className="flex items-center gap-3">
          <img src={wakaLogo} alt="WAKA XP" className="h-7 w-7 rounded-lg object-contain" />
          <span className="text-sm font-medium text-white truncate">{demo.title}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-white/40">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {demo.view_count + 1}
          </span>
          {demo.expires_at && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Expira {new Date(demo.expires_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Demo content */}
      <div className="flex-1 overflow-hidden">
        {demo.demo_type === "iframe" ? (
          <iframe
            src={demo.demo_url}
            className="w-full h-full border-0"
            allow="fullscreen; clipboard-write"
            title={demo.title}
          />
        ) : demo.demo_type === "redirect" ? (
          <RedirectHandler url={demo.demo_url} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <a
              href={demo.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Abrir Demo
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function RedirectHandler({ url }: { url: string }) {
  useEffect(() => {
    window.location.href = url;
  }, [url]);

  return (
    <div className="flex items-center justify-center h-full text-white">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Redirigiendo a la demo…</span>
      </div>
    </div>
  );
}
