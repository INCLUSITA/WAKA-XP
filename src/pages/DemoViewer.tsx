import { Suspense, useState, useCallback, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { BUILTIN_DEMOS, DEMO_STATUS_CONFIG } from "@/demos/registry";
import type { DemoStatus, UploadedDemo } from "@/demos/registry";
import { useUploadedDemos } from "@/hooks/useUploadedDemos";
import RuntimeJSXRenderer from "@/demos/RuntimeJSXRenderer";
import { Shield, FlaskConical, ChevronRight, Home, LayoutGrid, Sparkles, PanelRightOpen, PanelRightClose, Layers } from "lucide-react";
import AIProposalsPanel from "@/components/demos/AIProposalsPanel";
import StructuralEditor from "@/components/demos/StructuralEditor";
import DemoContextMenu from "@/components/demos/DemoContextMenu";
import StructuralBlocksPreview from "@/components/demos/StructuralBlocksPreview";
import SandboxVersionBar from "@/components/demos/SandboxVersionBar";
import type { SandboxVersion } from "@/components/demos/SandboxVersionBar";
import type { StructuralBlock } from "@/types/structuralBlocks";
import { toast } from "@/hooks/use-toast";

type SandboxPanel = "none" | "ai" | "structure";

const LoadingFallback = () => (
  <div className="flex min-h-[80vh] items-center justify-center text-white">
    <div className="flex items-center gap-3">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      <span>Cargando demo...</span>
    </div>
  </div>
);

function DemoStatusBar({
  status, title, sourceName, isSandboxDemo, activePanel, onSetPanel,
}: {
  status: DemoStatus; title: string; sourceName?: string; isSandboxDemo: boolean;
  activePanel: SandboxPanel; onSetPanel: (p: SandboxPanel) => void;
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
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => onSetPanel(activePanel === "structure" ? "none" : "structure")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-bold transition-all shadow-lg ${
              activePanel === "structure"
                ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white border border-teal-400/40 shadow-teal-500/30"
                : "bg-white/5 text-white/50 border border-white/10 hover:bg-teal-500/10 hover:text-teal-400 hover:border-teal-500/30 hover:shadow-teal-500/20"
            }`}
          >
            <Layers className="h-4 w-4" />
            Structure
          </button>

          <button
            onClick={() => onSetPanel(activePanel === "ai" ? "none" : "ai")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all shadow-lg ${
              activePanel === "ai"
                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white border border-violet-400/40 shadow-violet-500/30"
                : "bg-gradient-to-r from-violet-600/80 to-purple-600/80 text-white border border-violet-500/30 shadow-violet-500/20 hover:from-violet-500 hover:to-purple-500 hover:shadow-violet-500/40 hover:scale-105"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Waka AI
            {activePanel === "ai" ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
          </button>
        </div>
      )}
    </div>
  );
}

export default function DemoViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState<SandboxPanel>("none");
  const { getDemo, saveDemo } = useUploadedDemos();
  const [uploadedDemo, setUploadedDemo] = useState<UploadedDemo | null>(null);
  const [loadingDemo, setLoadingDemo] = useState(true);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  // Ref to structural editor's insert handler
  const [pendingContextBlock, setPendingContextBlock] = useState<StructuralBlock | null>(null);
  const [liveBlocks, setLiveBlocks] = useState<StructuralBlock[]>([]);

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

  // Right-click handler for demo area
  const handleDemoContextMenu = useCallback((e: React.MouseEvent) => {
    if (!isSandboxDemo) return;
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, [isSandboxDemo]);

  const handleContextInsert = useCallback((block: StructuralBlock) => {
    setPendingContextBlock(block);
    // Open structure panel if not already open
    setActivePanel("structure");
    setContextMenu(null);
    toast({
      title: `✅ ${block.label} added`,
      description: "Block inserted at the end of the structure.",
    });
  }, []);

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
  } else if (uploadedDemo) {
    demoStatus = uploadedDemo.status;
    demoTitle = uploadedDemo.title;
    demoSourceName = uploadedDemo.sourceName;

    const isPlaceholderJsx = !currentJsx || currentJsx.trim().startsWith("/*");
    
    if (isPlaceholderJsx && uploadedDemo.sourceId) {
      const sourceBuiltin = BUILTIN_DEMOS.find((d) => d.id === uploadedDemo.sourceId);
      if (sourceBuiltin) {
        const DemoComponent = sourceBuiltin.component;
        demoContent = (
          <Suspense fallback={<LoadingFallback />}>
            <DemoComponent />
          </Suspense>
        );
      }
    } else if (currentJsx && !isPlaceholderJsx) {
      demoContent = <RuntimeJSXRenderer jsxSource={currentJsx} />;
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
      <DemoStatusBar
        status={demoStatus}
        title={demoTitle}
        sourceName={demoSourceName}
        isSandboxDemo={isSandboxDemo}
        activePanel={activePanel}
        onSetPanel={setActivePanel}
      />
      {isSandboxDemo && versions.length > 1 && (
        <SandboxVersionBar versions={versions} currentIndex={versionIndex} onNavigate={handleVersionNavigate} onRestore={handleVersionRestore} />
      )}
      <div className="flex flex-1 overflow-hidden">
        {/* Demo content area — right-click to insert */}
        <div
          className="flex-1 overflow-auto"
          onContextMenu={handleDemoContextMenu}
        >
          {demoContent}
        </div>

        {isSandboxDemo && activePanel === "ai" && (
          <AIProposalsPanel demoId={id || ""} demoTitle={demoTitle} currentJsx={currentJsx} onJsxUpdate={handleJsxUpdate} />
        )}
        {isSandboxDemo && activePanel === "structure" && (
          <StructuralEditor
            demoId={id || ""}
            demoTitle={demoTitle}
            pendingBlock={pendingContextBlock}
            onPendingBlockConsumed={() => setPendingContextBlock(null)}
          />
        )}
      </div>

      {/* Context menu overlay */}
      {contextMenu && (
        <DemoContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onInsert={handleContextInsert}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
