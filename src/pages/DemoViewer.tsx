import { Suspense, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { BUILTIN_DEMOS, getUploadedDemos, saveUploadedDemo, DEMO_STATUS_CONFIG } from "@/demos/registry";
import type { DemoStatus, UploadedDemo } from "@/demos/registry";
import RuntimeJSXRenderer from "@/demos/RuntimeJSXRenderer";
import { Shield, FlaskConical, ChevronRight, Home, LayoutGrid, Sparkles, PanelRightOpen, PanelRightClose } from "lucide-react";
import AIProposalsPanel from "@/components/demos/AIProposalsPanel";

const LoadingFallback = () => (
  <div className="flex min-h-[80vh] items-center justify-center text-white">
    <div className="flex items-center gap-3">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      <span>Cargando demo...</span>
    </div>
  </div>
);

function DemoStatusBar({
  status,
  title,
  sourceName,
  isSandboxDemo,
  showProposals,
  onToggleProposals,
}: {
  status: DemoStatus;
  title: string;
  sourceName?: string;
  isSandboxDemo: boolean;
  showProposals: boolean;
  onToggleProposals: () => void;
}) {
  const cfg = DEMO_STATUS_CONFIG[status];
  const isSandbox = status === "sandbox" || status === "draft";
  return (
    <div className={`flex items-center gap-2 px-4 py-2 text-xs border-b ${isSandbox ? "bg-amber-950/30 border-amber-500/20" : "bg-emerald-950/20 border-emerald-500/15"}`}>
      <Link to="/" className="text-white/40 hover:text-white/70 transition"><Home className="h-3.5 w-3.5" /></Link>
      <ChevronRight className="h-3 w-3 text-white/20" />
      <Link to="/demos" className="text-white/40 hover:text-white/70 transition flex items-center gap-1">
        <LayoutGrid className="h-3 w-3" /><span>Demos</span>
      </Link>
      <ChevronRight className="h-3 w-3 text-white/20" />
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
      {isSandboxDemo && (
        <button
          onClick={onToggleProposals}
          className={`ml-auto flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
            showProposals
              ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
              : "bg-white/5 text-white/40 border border-white/10 hover:bg-violet-500/10 hover:text-violet-300 hover:border-violet-500/20"
          }`}
        >
          <Sparkles className="h-3 w-3" />
          Waka AI
          {showProposals ? <PanelRightClose className="h-3 w-3" /> : <PanelRightOpen className="h-3 w-3" />}
        </button>
      )}
    </div>
  );
}

export default function DemoViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showProposals, setShowProposals] = useState(false);
  const [liveJsx, setLiveJsx] = useState<string | null>(null);

  const builtinDemo = BUILTIN_DEMOS.find((d) => d.id === id);
  const uploadedDemo = !builtinDemo ? getUploadedDemos().find((d) => d.id === id) : undefined;

  const isSandboxDemo = uploadedDemo ? (uploadedDemo.status === "sandbox" || uploadedDemo.status === "draft") : false;

  // Get the JSX source for this demo
  const getBaseJsx = (): string | null => {
    if (uploadedDemo?.jsxSource) return uploadedDemo.jsxSource;
    const sessionSource = sessionStorage.getItem(`demo-jsx-${id}`);
    if (sessionSource) return sessionSource;
    return null;
  };

  const baseJsx = getBaseJsx();
  const currentJsx = liveJsx || baseJsx;

  // Handle JSX update from AI apply
  const handleJsxUpdate = useCallback((newJsx: string) => {
    setLiveJsx(newJsx);

    // Persist to localStorage if it's an uploaded demo
    if (uploadedDemo) {
      const updated: UploadedDemo = { ...uploadedDemo, jsxSource: newJsx };
      saveUploadedDemo(updated);
    }

    // Also persist to sessionStorage for session-only demos
    if (id) {
      sessionStorage.setItem(`demo-jsx-${id}`, newJsx);
    }
  }, [uploadedDemo, id]);

  // Resolve what to render
  let demoContent: React.ReactNode = null;
  let demoStatus: DemoStatus = "stable";
  let demoTitle = id || "Demo";
  let demoSourceName: string | undefined;

  if (builtinDemo) {
    const DemoComponent = builtinDemo.component;
    demoStatus = "stable";
    demoTitle = builtinDemo.title;
    demoContent = (
      <Suspense fallback={<LoadingFallback />}>
        <DemoComponent />
      </Suspense>
    );
  } else if (currentJsx && uploadedDemo) {
    // Prefer live/updated JSX for sandbox demos
    demoStatus = uploadedDemo.status;
    demoTitle = uploadedDemo.title;
    demoSourceName = uploadedDemo.sourceName;
    demoContent = <RuntimeJSXRenderer jsxSource={currentJsx} />;
  } else if (uploadedDemo?.sourceId) {
    const sourceBuiltin = BUILTIN_DEMOS.find((d) => d.id === uploadedDemo.sourceId);
    demoStatus = uploadedDemo.status;
    demoTitle = uploadedDemo.title;
    demoSourceName = uploadedDemo.sourceName;
    if (sourceBuiltin) {
      const DemoComponent = sourceBuiltin.component;
      demoContent = (
        <Suspense fallback={<LoadingFallback />}>
          <DemoComponent />
        </Suspense>
      );
    }
  }

  if (!demoContent && uploadedDemo) {
    const sessionSource = sessionStorage.getItem(`demo-jsx-${id}`);
    const jsxSource = sessionSource || uploadedDemo.jsxSource;
    if (jsxSource) {
      demoStatus = uploadedDemo.status;
      demoTitle = uploadedDemo.title;
      demoSourceName = uploadedDemo.sourceName;
      demoContent = <RuntimeJSXRenderer jsxSource={jsxSource} />;
    }
  }

  if (!demoContent && !builtinDemo && !uploadedDemo) {
    const sessionSource = sessionStorage.getItem(`demo-jsx-${id}`);
    if (sessionSource) {
      demoContent = <RuntimeJSXRenderer jsxSource={sessionSource} />;
    }
  }

  if (!demoContent) {
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

  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      <DemoStatusBar
        status={demoStatus}
        title={demoTitle}
        sourceName={demoSourceName}
        isSandboxDemo={isSandboxDemo}
        showProposals={showProposals}
        onToggleProposals={() => setShowProposals((v) => !v)}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto">{demoContent}</div>
        {isSandboxDemo && showProposals && (
          <AIProposalsPanel
            demoId={id || ""}
            demoTitle={demoTitle}
            currentJsx={currentJsx}
            onJsxUpdate={handleJsxUpdate}
          />
        )}
      </div>
    </div>
  );
}
