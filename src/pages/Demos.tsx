import { useState, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Play, Upload, Trash2, X } from "lucide-react";
import { BUILTIN_DEMOS, getUploadedDemos, saveUploadedDemo, deleteUploadedDemo, generateDemoId } from "@/demos/registry";
import type { UploadedDemo } from "@/demos/registry";

const DEMO_COLORS = ["#E74C3C", "#8B5CF6", "#F59E0B", "#14B8A6", "#EA580C", "#3B82F6", "#EC4899", "#10B981"];
const DEMO_ICONS = ["🤖", "💬", "📱", "🌍", "🏦", "🛒", "🎯", "🚀", "💡", "🔥"];

export default function Demos() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedDemos, setUploadedDemos] = useState<UploadedDemo[]>(getUploadedDemos());
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<{ name: string; source: string } | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formIcon, setFormIcon] = useState("🤖");
  const [formColor, setFormColor] = useState(DEMO_COLORS[0]);
  const [formTags, setFormTags] = useState("");

  const refreshUploaded = useCallback(() => {
    setUploadedDemos(getUploadedDemos());
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const source = ev.target?.result as string;
      const name = file.name;
      setPendingFile({ name, source });
      setFormTitle(name.replace(/\.(jsx|tsx|js|ts)$/i, "").replace(/[_-]/g, " "));
      setFormDesc("");
      setFormTags("");
      setFormIcon(DEMO_ICONS[Math.floor(Math.random() * DEMO_ICONS.length)]);
      setFormColor(DEMO_COLORS[Math.floor(Math.random() * DEMO_COLORS.length)]);
      setShowUploadModal(true);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleSaveDemo = () => {
    if (!pendingFile) return;
    const id = generateDemoId(pendingFile.name);
    const demo: UploadedDemo = {
      id,
      title: formTitle || pendingFile.name,
      description: formDesc || "Demo subido manualmente",
      icon: formIcon,
      color: formColor,
      tags: formTags ? formTags.split(",").map((t) => t.trim()).filter(Boolean) : ["Custom"],
      jsxSource: pendingFile.source,
      uploadedAt: new Date().toISOString(),
    };
    saveUploadedDemo(demo);
    refreshUploaded();
    setShowUploadModal(false);
    setPendingFile(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Eliminar este demo?")) return;
    deleteUploadedDemo(id);
    refreshUploaded();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".jsx,.tsx,.js,.ts"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Header */}
      <header className="border-b border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-sm text-white/70 transition hover:bg-white/20 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Editor
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Galería de Demos</h1>
            <p className="text-sm text-white/50">Mockups interactivos de flujos WhatsApp</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold transition hover:bg-blue-500"
          >
            <Upload className="h-4 w-4" /> Subir JSX
          </button>
        </div>
      </header>

      {/* Grid */}
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Built-in demos */}
          {BUILTIN_DEMOS.map((demo) => (
            <Link
              key={demo.id}
              to={`/demo/${demo.id}`}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-white/20 hover:bg-white/10 hover:shadow-2xl"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="text-3xl">{demo.icon}</span>
                <div className="h-10 w-1 rounded-full" style={{ backgroundColor: demo.color }} />
                <h2 className="text-lg font-bold leading-tight">{demo.title}</h2>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-white/60">{demo.description}</p>
              <div className="mb-4 flex flex-wrap gap-1.5">
                {demo.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/50">{tag}</span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: demo.color }}>
                <Play className="h-4 w-4" /> Abrir demo
              </div>
            </Link>
          ))}

          {/* Uploaded demos */}
          {uploadedDemos.map((demo) => (
            <div
              key={demo.id}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-white/20 hover:bg-white/10"
            >
              <button
                onClick={() => handleDelete(demo.id)}
                className="absolute right-3 top-3 rounded-lg bg-red-500/20 p-1.5 text-red-400 opacity-0 transition hover:bg-red-500/30 group-hover:opacity-100"
                title="Eliminar demo"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <div className="mb-4 flex items-center gap-3">
                <span className="text-3xl">{demo.icon}</span>
                <div className="h-10 w-1 rounded-full" style={{ backgroundColor: demo.color }} />
                <h2 className="text-lg font-bold leading-tight">{demo.title}</h2>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-white/60">{demo.description}</p>
              <div className="mb-4 flex flex-wrap gap-1.5">
                {demo.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/50">{tag}</span>
                ))}
                <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[11px] font-medium text-blue-400">Subido</span>
              </div>
              <button
                onClick={() => {
                  sessionStorage.setItem(`demo-jsx-${demo.id}`, demo.jsxSource);
                  navigate(`/demo/${demo.id}`);
                }}
                className="flex items-center gap-2 text-sm font-semibold transition hover:opacity-80"
                style={{ color: demo.color }}
              >
                <Play className="h-4 w-4" /> Abrir demo
              </button>
            </div>
          ))}

          {/* Upload card */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-white/15 p-6 text-center text-white/40 transition-all hover:border-white/30 hover:bg-white/5 hover:text-white/60"
          >
            <div>
              <Upload className="mx-auto mb-2 h-8 w-8" />
              <p className="text-sm font-semibold">Subir archivo JSX</p>
              <p className="mt-1 text-xs text-white/30">.jsx, .tsx, .js, .ts</p>
            </div>
          </button>
        </div>
      </main>

      {/* Upload modal */}
      {showUploadModal && pendingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-white/10 bg-slate-800 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Nuevo Demo</h3>
              <button onClick={() => setShowUploadModal(false)} className="rounded-lg p-1 hover:bg-white/10">
                <X className="h-5 w-5 text-white/50" />
              </button>
            </div>

            <p className="mb-4 text-xs text-white/40 font-mono">{pendingFile.name} · {(pendingFile.source.length / 1024).toFixed(1)} KB</p>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-white/60">Título</label>
                <input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-white/60">Descripción</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                  placeholder="Describe brevemente el demo..."
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-white/60">Tags (separados por coma)</label>
                <input
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                  placeholder="WhatsApp, Bot, KYC..."
                />
              </div>
              <div className="flex gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-white/60">Icono</label>
                  <div className="flex flex-wrap gap-1.5">
                    {DEMO_ICONS.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setFormIcon(icon)}
                        className={`rounded-lg p-1.5 text-lg transition ${formIcon === icon ? "bg-blue-500/30 ring-1 ring-blue-400" : "hover:bg-white/10"}`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-white/60">Color</label>
                  <div className="flex flex-wrap gap-1.5">
                    {DEMO_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setFormColor(color)}
                        className={`h-7 w-7 rounded-full transition ${formColor === color ? "ring-2 ring-white ring-offset-2 ring-offset-slate-800" : ""}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveDemo}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold transition hover:bg-blue-500"
              >
                Guardar Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
