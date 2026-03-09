import { Suspense } from "react";
import { useParams } from "react-router-dom";
import { BUILTIN_DEMOS } from "@/demos/registry";
import wakaLogo from "@/assets/waka-logo.png";

const LoadingFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
    <div className="flex items-center gap-3">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      <span>Loading…</span>
    </div>
  </div>
);

export default function ShareDemo() {
  const { id } = useParams<{ id: string }>();
  const demo = BUILTIN_DEMOS.find((d) => d.id === id);

  if (!demo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
        <p className="text-lg">Demo not found.</p>
      </div>
    );
  }

  const DemoComponent = demo.component;

  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      {/* Minimal header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/10 bg-slate-900/80 backdrop-blur">
        <img src={wakaLogo} alt="WAKA XP" className="h-7 w-7 rounded-lg object-contain" />
        <span className="text-sm font-bold text-white tracking-wide">WAKA XP</span>
        <span className="text-white/20 mx-1">·</span>
        <span className="text-sm text-white/50 truncate">{demo.title}</span>
      </div>

      {/* Demo full area */}
      <div className="flex-1 overflow-auto">
        <Suspense fallback={<LoadingFallback />}>
          <DemoComponent />
        </Suspense>
      </div>

      {/* Minimal footer */}
      <div className="flex items-center justify-center gap-2 py-2 border-t border-white/10 bg-slate-900/80">
        <span className="text-[11px] text-white/30">Powered by</span>
        <img src={wakaLogo} alt="" className="h-4 w-4 rounded object-contain opacity-40" />
        <span className="text-[11px] font-semibold text-white/40">WAKA XP</span>
      </div>
    </div>
  );
}
