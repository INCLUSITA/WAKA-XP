import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Play } from "lucide-react";
import { DEMOS } from "@/demos/registry";

export default function Demos() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-sm text-white/70 transition hover:bg-white/20 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Editor
          </button>
          <div>
            <h1 className="text-xl font-bold">Galería de Demos</h1>
            <p className="text-sm text-white/50">Mockups interactivos de flujos WhatsApp</p>
          </div>
        </div>
      </header>

      {/* Grid */}
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DEMOS.map((demo) => (
            <Link
              key={demo.id}
              to={`/demo/${demo.id}`}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-white/20 hover:bg-white/10 hover:shadow-2xl"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="text-3xl">{demo.icon}</span>
                <div
                  className="h-10 w-1 rounded-full"
                  style={{ backgroundColor: demo.color }}
                />
                <h2 className="text-lg font-bold leading-tight">{demo.title}</h2>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-white/60">
                {demo.description}
              </p>
              <div className="mb-4 flex flex-wrap gap-1.5">
                {demo.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: demo.color }}>
                <Play className="h-4 w-4" />
                Abrir demo
              </div>
            </Link>
          ))}

          {/* Add more card */}
          <div className="flex items-center justify-center rounded-2xl border-2 border-dashed border-white/10 p-6 text-center text-white/30">
            <div>
              <p className="text-3xl mb-2">➕</p>
              <p className="text-sm">Sube un JSX para añadir más demos</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
