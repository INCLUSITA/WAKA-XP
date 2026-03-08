import { Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BUILTIN_DEMOS, getUploadedDemos, DEMO_STATUS_CONFIG } from "@/demos/registry";
import type { DemoStatus } from "@/demos/registry";
import RuntimeJSXRenderer from "@/demos/RuntimeJSXRenderer";
import { ArrowLeft, Shield, FlaskConical } from "lucide-react";

function DemoStatusBar({ status, title, sourceName }: { status: DemoStatus; title: string; sourceName?: string }) {
  const cfg = DEMO_STATUS_CONFIG[status];
  const isSandbox = status === "sandbox" || status === "draft";
  return (
    <div className={`flex items-center gap-3 px-4 py-2 text-xs border-b ${isSandbox ? "bg-amber-950/30 border-amber-500/20" : "bg-emerald-950/20 border-emerald-500/15"}`}>
      {isSandbox ? <FlaskConical className="h-3.5 w-3.5 text-amber-400" /> : <Shield className="h-3.5 w-3.5 text-emerald-400" />}
      <span className={`font-semibold ${cfg.color}`}>{cfg.icon} {cfg.label}</span>
      <span className="text-white/40">·</span>
      <span className="text-white/50 truncate">{title}</span>
      {sourceName && (
        <>
          <span className="text-white/30">·</span>
          <span className="text-white/30 truncate">Desde: {sourceName}</span>
        </>
      )}
    </div>
  );
}

export default function DemoViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Check built-in demos first
  const builtinDemo = BUILTIN_DEMOS.find((d) => d.id === id);

  if (builtinDemo) {
    const DemoComponent = builtinDemo.component;
    return (
      <div className="flex flex-col min-h-screen bg-slate-900">
        <DemoStatusBar status="stable" title={builtinDemo.title} />
        <div className="flex-1">
          <Suspense
            fallback={
              <div className="flex min-h-[80vh] items-center justify-center text-white">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>Cargando demo...</span>
                </div>
              </div>
            }
          >
            <DemoComponent />
          </Suspense>
        </div>
      </div>
    );
  }

  // Check uploaded demos
  const uploadedDemo = getUploadedDemos().find((d) => d.id === id);

  // If uploaded demo is a copy of a builtin, render the builtin component
  if (uploadedDemo?.sourceId) {
    const sourceBuiltin = BUILTIN_DEMOS.find((d) => d.id === uploadedDemo.sourceId);
    if (sourceBuiltin) {
      const DemoComponent = sourceBuiltin.component;
      return (
        <div className="flex flex-col min-h-screen bg-slate-900">
          <DemoStatusBar
            status={uploadedDemo.status}
            title={uploadedDemo.title}
            sourceName={uploadedDemo.sourceName}
          />
          <div className="flex-1">
            <Suspense
              fallback={
                <div className="flex min-h-[80vh] items-center justify-center text-white">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Cargando demo...</span>
                  </div>
                </div>
              }
            >
              <DemoComponent />
            </Suspense>
          </div>
        </div>
      );
    }
  }

  const sessionSource = sessionStorage.getItem(`demo-jsx-${id}`);
  const jsxSource = sessionSource || uploadedDemo?.jsxSource;

  if (jsxSource) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-900">
        <DemoStatusBar
          status={uploadedDemo?.status || "stable"}
          title={uploadedDemo?.title || id || "Demo"}
          sourceName={uploadedDemo?.sourceName}
        />
        <div className="flex-1">
          <RuntimeJSXRenderer jsxSource={jsxSource} />
        </div>
      </div>
    );
  }

  // Not found
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
      <div className="text-center">
        <p className="text-4xl mb-4">🚫</p>
        <p className="text-lg font-bold mb-2">Demo no encontrado</p>
        <button onClick={() => navigate("/demos")} className="rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/20">
          Volver a la galería
        </button>
      </div>
    </div>
  );
}
