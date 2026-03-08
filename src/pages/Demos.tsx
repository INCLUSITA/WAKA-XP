import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Play, Upload, Trash2, X, Copy, Shield, FlaskConical, Sparkles, ChevronRight } from "lucide-react";
import {
  BUILTIN_DEMOS, duplicateDemoAsSandbox, generateDemoId, DEMO_STATUS_CONFIG,
} from "@/demos/registry";
import type { UploadedDemo, DemoStatus, DemoEntry } from "@/demos/registry";
import { useUploadedDemos } from "@/hooks/useUploadedDemos";

const DEMO_COLORS = ["#E74C3C", "#8B5CF6", "#F59E0B", "#14B8A6", "#EA580C", "#3B82F6", "#EC4899", "#10B981"];
const DEMO_ICONS = ["🤖", "💬", "📱", "🌍", "🏦", "🛒", "🎯", "🚀", "💡", "🔥"];

function StatusBadge({ status }: { status: DemoStatus }) {
  const cfg = DEMO_STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cfg.bg} ${cfg.color}`}>
      <span className="text-xs">{cfg.icon}</span> {cfg.label}
    </span>
  );
}

function DemoCard({
  demo, status, sourceLabel, onOpen, onDuplicate, onDelete, onPromote,
}: {
  demo: { id: string; title: string; description: string; icon: string; color: string; tags: string[] };
  status: DemoStatus; sourceLabel?: string; onOpen: () => void;
  onDuplicate?: () => void; onDelete?: () => void; onPromote?: () => void;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-white/20 hover:bg-white/10 hover:shadow-2xl">
      <div className="absolute right-3 top-3 flex gap-1.5 opacity-0 transition group-hover:opacity-100">
        {onDuplicate && (
          <button onClick={(e) => { e.preventDefault(); onDuplicate(); }} className="rounded-lg bg-amber-500/20 p-1.5 text-amber-400 transition hover:bg-amber-500/30" title="Duplicar como Sandbox"><Copy className="h-3.5 w-3.5" /></button>
        )}
        {onPromote && status === "sandbox" && (
          <button onClick={(e) => { e.preventDefault(); onPromote(); }} className="rounded-lg bg-blue-500/20 p-1.5 text-blue-400 transition hover:bg-blue-500/30" title="Marcar como Approved"><Shield className="h-3.5 w-3.5" /></button>
        )}
        {onDelete && (
          <button onClick={(e) => { e.preventDefault(); onDelete(); }} className="rounded-lg bg-red-500/20 p-1.5 text-red-400 transition hover:bg-red-500/30" title="Eliminar demo"><Trash2 className="h-3.5 w-3.5" /></button>
        )}
      </div>
      <div className="mb-3 flex items-center gap-3">
        <span className="text-3xl">{demo.icon}</span>
        <div className="h-10 w-1 rounded-full" style={{ backgroundColor: demo.color }} />
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold leading-tight truncate">{demo.title}</h2>
          {sourceLabel && <p className="text-[10px] text-white/35 mt-0.5 truncate">Desde: {sourceLabel}</p>}
        </div>
      </div>
      <div className="mb-3"><StatusBadge status={status} /></div>
      <p className="mb-4 text-sm leading-relaxed text-white/60 line-clamp-3">{demo.description}</p>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {demo.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/50">{tag}</span>
        ))}
      </div>
      <button onClick={onOpen} className="flex items-center gap-2 text-sm font-semibold transition hover:opacity-80" style={{ color: demo.color }}>
        <Play className="h-4 w-4" /> Abrir demo
      </button>
    </div>
  );
}

export default function Demos() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { demos: uploadedDemos, saveDemo, deleteDemo: deleteDbDemo, updateStatus } = useUploadedDemos();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<{ name: string; source: string } | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formIcon, setFormIcon] = useState("🤖");
  const [formColor, setFormColor] = useState(DEMO_COLORS[0]);
  const [formTags, setFormTags] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string; isStable: boolean } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const source = ev.target?.result as string;
      setPendingFile({ name: file.name, source });
      setFormTitle(file.name.replace(/\.(jsx|tsx|js|ts)$/i, "").replace(/[_-]/g, " "));
      setFormDesc("");
      setFormTags("");
      setFormIcon(DEMO_ICONS[Math.floor(Math.random() * DEMO_ICONS.length)]);
      setFormColor(DEMO_COLORS[Math.floor(Math.random() * DEMO_COLORS.length)]);
      setShowUploadModal(true);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleSaveDemo = async () => {
    if (!pendingFile) return;
    const id = generateDemoId(pendingFile.name);
    const demo: UploadedDemo = {
      id, title: formTitle || pendingFile.name, description: formDesc || "Demo subido manualmente",
      icon: formIcon, color: formColor,
      tags: formTags ? formTags.split(",").map((t) => t.trim()).filter(Boolean) : ["Custom"],
      jsxSource: pendingFile.source, uploadedAt: new Date().toISOString(), status: "stable",
    };
    await saveDemo(demo);
    setShowUploadModal(false);
    setPendingFile(null);
  };

  const handleDuplicateBuiltin = async (demo: DemoEntry) => {
    const sandbox = duplicateDemoAsSandbox(demo, `/* Sandbox copy of built-in demo: ${demo.id} */`);
    await saveDemo(sandbox);
  };

  const handleDuplicateUploaded = async (demo: UploadedDemo) => {
    const sandbox = duplicateDemoAsSandbox(demo, demo.jsxSource);
    await saveDemo(sandbox);
  };

  const handlePromote = async (id: string) => {
    await updateStatus(id, "approved");
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteDbDemo(deleteTarget.id);
    setDeleteTarget(null);
  };

  const openDemo = (id: string) => {
    navigate(`/demo/${id}`);
  };

  const stableDemos = uploadedDemos.filter((d) => d.status === "stable" || d.status === "approved");
  const sandboxDemos = uploadedDemos.filter((d) => d.status === "sandbox" || d.status === "draft");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <input ref={fileInputRef} type="file" accept=".jsx,.tsx,.js,.ts" className="hidden" onChange={handleFileSelect} />

      <header className="border-b border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <button onClick={() => navigate("/")} className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-sm text-white/70 transition hover:bg-white/20 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Editor
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Galería de Demos</h1>
            <p className="text-sm text-white/50">Mockups interactivos · Stable → Sandbox workflow</p>
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold transition hover:bg-blue-500">
            <Upload className="h-4 w-4" /> Subir JSX
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-10">
        <section>
          <div className="flex items-center gap-2 mb-5">
            <Shield className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400">Stable Demos</h2>
            <span className="text-xs text-white/30 ml-1">Safe to present</span>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BUILTIN_DEMOS.map((demo) => (
              <DemoCard key={demo.id} demo={demo} status="stable" onOpen={() => navigate(`/demo/${demo.id}`)} onDuplicate={() => handleDuplicateBuiltin(demo)} />
            ))}
            {stableDemos.map((demo) => (
              <DemoCard key={demo.id} demo={demo} status={demo.status} sourceLabel={demo.sourceName} onOpen={() => openDemo(demo.id)} onDuplicate={() => handleDuplicateUploaded(demo)} onDelete={() => setDeleteTarget({ id: demo.id, title: demo.title, isStable: true })} />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-5">
            <FlaskConical className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400">Sandbox Demos</h2>
            <span className="text-xs text-white/30 ml-1">Experimental · safe to test</span>
          </div>
          {sandboxDemos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-8 py-10 text-center">
              <FlaskConical className="mx-auto mb-3 h-8 w-8 text-white/20" />
              <p className="text-sm font-semibold text-white/40 mb-1">No sandbox demos yet</p>
              <p className="text-xs text-white/25">Duplicate a stable demo to create a safe working copy</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sandboxDemos.map((demo) => (
                <DemoCard key={demo.id} demo={demo} status={demo.status} sourceLabel={demo.sourceName} onOpen={() => openDemo(demo.id)} onDuplicate={() => handleDuplicateUploaded(demo)} onDelete={() => setDeleteTarget({ id: demo.id, title: demo.title, isStable: false })} onPromote={() => handlePromote(demo.id)} />
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-5 w-5 text-violet-400/60" />
            <h3 className="text-sm font-bold text-white/50">AI-Assisted Demo Editing</h3>
            <span className="rounded-full bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 text-[10px] font-semibold text-violet-400">Coming soon</span>
          </div>
          <p className="text-xs text-white/30 max-w-lg">
            Conversational editing, AI change proposals, and automatic sandbox generation will be available here.
          </p>
        </section>

        <button onClick={() => fileInputRef.current?.click()} className="flex w-full cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-white/15 p-6 text-center text-white/40 transition-all hover:border-white/30 hover:bg-white/5 hover:text-white/60">
          <div>
            <Upload className="mx-auto mb-2 h-8 w-8" />
            <p className="text-sm font-semibold">Subir archivo JSX</p>
            <p className="mt-1 text-xs text-white/30">.jsx, .tsx, .js, .ts</p>
          </div>
        </button>
      </main>

      {showUploadModal && pendingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-white/10 bg-slate-800 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Nuevo Demo</h3>
              <button onClick={() => setShowUploadModal(false)} className="rounded-lg p-1 hover:bg-white/10"><X className="h-5 w-5 text-white/50" /></button>
            </div>
            <p className="mb-4 text-xs text-white/40 font-mono">{pendingFile.name} · {(pendingFile.source.length / 1024).toFixed(1)} KB</p>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-white/60">Título</label>
                <input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-white/60">Descripción</label>
                <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={2} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500" placeholder="Describe brevemente el demo..." />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-white/60">Tags (separados por coma)</label>
                <input value={formTags} onChange={(e) => setFormTags(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500" placeholder="WhatsApp, Bot, KYC..." />
              </div>
              <div className="flex gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-white/60">Icono</label>
                  <div className="flex flex-wrap gap-1.5">
                    {DEMO_ICONS.map((icon) => (
                      <button key={icon} onClick={() => setFormIcon(icon)} className={`rounded-lg p-1.5 text-lg transition ${formIcon === icon ? "bg-blue-500/30 ring-1 ring-blue-400" : "hover:bg-white/10"}`}>{icon}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-white/60">Color</label>
                  <div className="flex flex-wrap gap-1.5">
                    {DEMO_COLORS.map((color) => (
                      <button key={color} onClick={() => setFormColor(color)} className={`h-7 w-7 rounded-full transition ${formColor === color ? "ring-2 ring-white ring-offset-2 ring-offset-slate-800" : ""}`} style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowUploadModal(false)} className="flex-1 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/5">Cancelar</button>
              <button onClick={handleSaveDemo} className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold transition hover:bg-blue-500">Guardar Demo</button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-slate-800 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteTarget?.isStable ? "⚠️ Eliminar demo stable" : "Eliminar demo"}</AlertDialogTitle>
            <AlertDialogDescription className="text-white/50">
              {deleteTarget?.isStable
                ? `Estás a punto de eliminar "${deleteTarget.title}", que es un demo stable. Esta acción es irreversible. ¿Estás seguro?`
                : `¿Eliminar "${deleteTarget?.title}"? Esta acción no se puede deshacer.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 text-white/60 hover:bg-white/5">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-500">
              {deleteTarget?.isStable ? "Sí, eliminar stable" : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
