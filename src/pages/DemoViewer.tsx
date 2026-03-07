import { Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BUILTIN_DEMOS, getUploadedDemos } from "@/demos/registry";
import RuntimeJSXRenderer from "@/demos/RuntimeJSXRenderer";

export default function DemoViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Check built-in demos first
  const builtinDemo = BUILTIN_DEMOS.find((d) => d.id === id);

  if (builtinDemo) {
    const DemoComponent = builtinDemo.component;
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

  // Check uploaded demos
  const uploadedDemo = getUploadedDemos().find((d) => d.id === id);
  const sessionSource = sessionStorage.getItem(`demo-jsx-${id}`);
  const jsxSource = sessionSource || uploadedDemo?.jsxSource;

  if (jsxSource) {
    return <RuntimeJSXRenderer jsxSource={jsxSource} />;
  }

  // Not found
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
