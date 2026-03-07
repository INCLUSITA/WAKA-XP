import { Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DEMOS } from "@/demos/registry";

export default function DemoViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const demo = DEMOS.find((d) => d.id === id);

  if (!demo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <p className="text-4xl mb-4">🚫</p>
          <p className="text-lg font-bold mb-2">Demo no encontrado</p>
          <button
            onClick={() => navigate("/demos")}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
          >
            Volver a la galería
          </button>
        </div>
      </div>
    );
  }

  const DemoComponent = demo.component;

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <span>Cargando demo...</span>
          </div>
        </div>
      }
    >
      <DemoComponent />
    </Suspense>
  );
}
