import { Suspense, useState, useCallback, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { BUILTIN_DEMOS, DEMO_STATUS_CONFIG } from "@/demos/registry";
import type { DemoStatus, UploadedDemo } from "@/demos/registry";
import { useUploadedDemos } from "@/hooks/useUploadedDemos";
import RuntimeJSXRenderer from "@/demos/RuntimeJSXRenderer";
import { Shield, FlaskConical, ChevronRight, Home, LayoutGrid, Sparkles, PanelRightOpen, PanelRightClose } from "lucide-react";
import AIProposalsPanel from "@/components/demos/AIProposalsPanel";
import SandboxVersionBar from "@/components/demos/SandboxVersionBar";
import type { SandboxVersion } from "@/components/demos/SandboxVersionBar";
import { toast } from "@/hooks/use-toast";

const LoadingFallback = () => (
  <div className="flex min-h-[80vh] items-center justify-center text-white">
    <div className="flex items-center gap-3">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      <span>Cargando demo...</span>
    </div>
  </div>
);

function DemoStatusBar({
  status, title, sourceName, isSandboxDemo, showProposals, onToggleProposals,
}: {
  status: DemoStatus; title: string; sourceName?: string; isSandboxDemo: boolean; showProposals: boolean; onToggleProposals: () => void;
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
          className={`ml-auto flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all shadow-lg ${
            showProposals
              ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white border border-violet-400/40 shadow-violet-500/30"
              : "bg-gradient-to-r from-violet-600/80 to-purple-600/80 text-white border border-violet-500/30 shadow-violet-500/20 hover:from-violet-500 hover:to-purple-500 hover:shadow-violet-500/40 hover:scale-105"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Waka AI
          {showProposals ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}

export default function DemoViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showProposals, setShowProposals] = useState(false);
  const { getDemo, saveDemo } = useUploadedDemos();
  const [uploadedDemo, setUploadedDemo] = useState<UploadedDemo | null>(null);
  const [loadingDemo, setLoadingDemo] = useState(true);

  const builtinDemo = BUILTIN_DEMOS.find((d) => d.id === id);

  useEffect(() => {
    if (builtinDemo || !id) {
      setLoadingDemo(false);
      return;
    }
    getDemo(id).then((d) => {
      setUploadedDemo(d);
      setLoadingDemo(false);
    });
  }, [id, builtinDemo, getDemo]);

  const isSandboxDemo = uploadedDemo ? (uploadedDemo.status === "sandbox" || uploadedDemo.status === "draft") : false;

  const baseJsx = uploadedDemo?.jsxSource || null;

  const [versions, setVersions] = useState<SandboxVersion[]>([]);
  const [versionIndex, setVersionIndex] = useState(0);

  // Init versions when demo loads
  useEffect(() => {
    if (baseJsx && versions.length === 0) {
      setVersions([{ id: "v-original", jsx: baseJsx, timestamp: new Date().toISOString(), label: "Original" }]);
    }
  }, [baseJsx, versions.length]);

  const currentJsx = versions.length > 0 ? versions[versionIndex]?.jsx : baseJsx;

  const handleJsxUpdate = useCallback(async (newJsx: string, label?: string) => {
    const newVersion: SandboxVersion = {
      id: `v-${Date.now().toString(36)}`,
      jsx: newJsx,
      timestamp: new Date().toISOString(),
      label: label || "AI change applied",
    };

    setVersions((prev) => {
      const base = prev.slice(0, versionIndex + 1);
      return [...base, newVersion];
    });
    setVersionIndex((prev) => {
      const base = versions.slice(0, prev + 1);
      return base.length;
    });

    // Persist to database
    if (uploadedDemo) {
      const updated: UploadedDemo = { ...uploadedDemo, jsxSource: newJsx };
      await saveDemo(updated);
      setUploadedDemo(updated);
    }
  }, [uploadedDemo, versionIndex, versions, saveDemo]);

  const handleVersionNavigate = useCallback((index: number) => {
    if (index < 0 || index >= versions.length) return;
    setVersionIndex(index);
  }, [versions.length]);

  const handleVersionRestore = useCallback(async (index: number) => {
    const version = versions[index];
    if (!version) return;
    if (uploadedDemo) {
      const updated: UploadedDemo = { ...uploadedDemo, jsxSource: version.jsx };
      await saveDemo(updated);
      setUploadedDemo(updated);
    }
    toast({ title: "Version restored", description: `Restored: "${version.label}"` });
  }, [versions, uploadedDemo, saveDemo]);

  if (loadingDemo) return <LoadingFallback />;

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

  if (!demoContent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <p className="text-4xl mb-4">🚫</p>
          <p className="text-lg font-bold mb-2">Demo no encontrado</p>
          <button onClick={() => navigate("/demos")} className="rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/20">Volver a la galería</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      <DemoStatusBar status={demoStatus} title={demoTitle} sourceName={demoSourceName} isSandboxDemo={isSandboxDemo} showProposals={showProposals} onToggleProposals={() => setShowProposals((v) => !v)} />
      {isSandboxDemo && versions.length > 1 && (
        <SandboxVersionBar versions={versions} currentIndex={versionIndex} onNavigate={handleVersionNavigate} onRestore={handleVersionRestore} />
      )}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto">{demoContent}</div>
        {isSandboxDemo && showProposals && (
          <AIProposalsPanel demoId={id || ""} demoTitle={demoTitle} currentJsx={currentJsx} onJsxUpdate={handleJsxUpdate} />
        )}
      </div>
    </div>
  );
}
