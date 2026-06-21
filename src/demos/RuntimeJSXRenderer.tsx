import React, { useState, useEffect, useRef, useCallback, useMemo, useReducer, useContext, createContext, memo, forwardRef, Fragment } from "react";

/**
 * Detect browser zoom and return inverse scale factor so content stays 1:1.
 * Captures the initial devicePixelRatio at mount as the "native" baseline,
 * then any change means the user zoomed.
 */
function useZoomCompensation() {
  const baselineRef = useRef(window.devicePixelRatio || 1);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const baseline = baselineRef.current;
    const update = () => {
      const current = window.devicePixelRatio || 1;
      const s = baseline / current;
      setScale(prev => Math.abs(prev - s) > 0.001 ? s : prev);
    };
    // Poll for zoom changes (most reliable cross-browser)
    const interval = setInterval(update, 300);
    window.addEventListener("resize", update);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", update);
    };
  }, []);
  return scale;
}
import { transform } from "sucrase";
import * as LucideIcons from "lucide-react";

interface RuntimeJSXRendererProps {
  jsxSource: string;
  demoId?: string;
  scenarioNotes?: Record<string, string>;
  onSaveNotes?: (notes: Record<string, string>) => void;
  readOnly?: boolean;
  fitToWidth?: boolean;
}

// A localStorage-backed useState that persists data across sessions
function createUsePersistentState(demoId: string) {
  return function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const storageKey = `demo-data-${demoId}-${key}`;
    const [value, setValue] = useState<T>(() => {
      try {
        const stored = localStorage.getItem(storageKey);
        return stored ? JSON.parse(stored) : defaultValue;
      } catch {
        return defaultValue;
      }
    });

    useEffect(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(value));
      } catch { /* ignore */ }
    }, [value, storageKey]);

    return [value, setValue];
  };
}

export default function RuntimeJSXRenderer({ jsxSource, demoId = "default", scenarioNotes, onSaveNotes, readOnly = false, fitToWidth = false }: RuntimeJSXRendererProps) {
  const usePersistentState = useMemo(() => createUsePersistentState(demoId), [demoId]);
  const zoomScale = useZoomCompensation();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [fitScale, setFitScale] = useState(1);
  useEffect(() => {
    if (!fitToWidth) { setFitScale(1); return; }
    const el = wrapRef.current;
    if (!el) return;
    const BASE = 1280;
    const compute = () => {
      const w = el.clientWidth || window.innerWidth;
      const s = Math.min(1, w / BASE);
      setFitScale(prev => Math.abs(prev - s) > 0.005 ? s : prev);
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    window.addEventListener("resize", compute);
    return () => { ro.disconnect(); window.removeEventListener("resize", compute); };
  }, [fitToWidth]);
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Transpile JSX → JS
      // Strip import/export before transpiling to avoid module issues
      let preProcessed = jsxSource;

      // Capture lucide-react imports BEFORE stripping, so we only inject what
      // the demo actually uses (avoids redeclaration collisions like 'Icon').
      const lucideImported = new Set<string>();
      const lucideImportRegex = /import\s*(?:type\s+)?\{([^}]+)\}\s*from\s+['"]lucide-react['"]/g;
      let lim: RegExpExecArray | null;
      while ((lim = lucideImportRegex.exec(preProcessed)) !== null) {
        lim[1].split(",").forEach(raw => {
          const name = raw.trim().split(/\s+as\s+/i).pop()?.trim();
          if (name && /^[A-Z][A-Za-z0-9_]*$/.test(name)) lucideImported.add(name);
        });
      }

      // Strip ES module syntax (line-anchored to avoid matching CSS @import inside strings)
      // 1. Type imports: import type ... from "..."
      preProcessed = preProcessed.replace(/^import\s+type\s[\s\S]*?from\s+['"][^'"]*['"]\s*;?/gm, "");
      // 2. Multi-line imports: import { \n ... \n } from "..."
      preProcessed = preProcessed.replace(/^import\s*\{[\s\S]*?\}\s*from\s+['"][^'"]*['"]\s*;?/gm, "");
      // 3. Single-line: import X from "...", import * as X from "..."
      preProcessed = preProcessed.replace(/^import\s+[\w*][\s\S]*?from\s+['"][^'"]*['"]\s*;?/gm, "");
      // 4. Side-effect imports: import "..."
      preProcessed = preProcessed.replace(/^import\s+['"][^'"]*['"]\s*;?/gm, "");

      // Capture default export component name BEFORE stripping exports
      let componentName = "App";
      const exportFnMatch = preProcessed.match(/export\s+default\s+function\s+([A-Za-z_]\w*)/);
      const exportRefMatch = preProcessed.match(/export\s+default\s+([A-Za-z_]\w*)\s*;?/);
      if (exportFnMatch) componentName = exportFnMatch[1];
      else if (exportRefMatch) componentName = exportRefMatch[1];

      // Strip exports
      preProcessed = preProcessed.replace(/^\s*export\s+default\s+/gm, "");
      preProcessed = preProcessed.replace(/^\s*export\s+\{[^}]*\}\s*;?\s*$/gm, "");
      preProcessed = preProcessed.replace(/^\s*export\s+/gm, "");

      // Try transpile: first with TypeScript support, fallback to JSX-only
      // (some plain JS patterns confuse Sucrase's TS parser, e.g. complex object literals)
      let code: string;
      try {
        code = transform(preProcessed, {
          transforms: ["jsx", "typescript"],
          jsxRuntime: "classic",
          jsxPragma: "React.createElement",
          jsxFragmentPragma: "React.Fragment",
        }).code;
      } catch {
        code = transform(preProcessed, {
          transforms: ["jsx"],
          jsxRuntime: "classic",
          jsxPragma: "React.createElement",
          jsxFragmentPragma: "React.Fragment",
        }).code;
      }

      // Build a module that returns the component.
      // Only inject lucide icons that (a) match icon naming, (b) are NOT already
      // declared in the user code (avoids "Identifier 'Icon' has already been declared").
      // Inject only icons that the demo explicitly imported AND that exist in
      // lucide-react. This avoids any chance of redeclaration with user code.
      const availableLucide = new Set(Object.keys(LucideIcons));
      const lucideNames = Array.from(lucideImported).filter(n => availableLucide.has(n));
      const lucideDecl = lucideNames.length > 0
        ? `const { ${lucideNames.join(", ")} } = __lucide;`
        : "";
      const moduleCode = `
        ${lucideDecl}
        ${code}
        return typeof ${componentName} === 'function' ? ${componentName} : null;
      `;

      // Execute with React in scope - provide all common hooks and utilities
      const saveNoteCallback = readOnly ? null : onSaveNotes || null;
      const factory = new Function(
        "React", "useState", "useEffect", "useRef", "useCallback", "useMemo",
        "useReducer", "useContext", "createContext", "memo", "forwardRef", "Fragment",
        "usePersistentState", "__scenarioNotes", "__saveNote", "__lucide",
        moduleCode
      );
      const Comp = factory(
        React, useState, useEffect, useRef, useCallback, useMemo,
        useReducer, useContext, createContext, memo, forwardRef, Fragment,
        usePersistentState, scenarioNotes || {}, saveNoteCallback, LucideIcons
      );

      if (Comp) {
        setComponent(() => Comp);
        setError(null);
      } else {
        setError("No se encontró un componente exportado por defecto.");
      }
    } catch (err: any) {
      console.error("JSX Runtime Error:", err);
      setError(err.message || "Error al compilar el JSX");
    }
  }, [jsxSource, scenarioNotes, onSaveNotes, readOnly]);

  if (error) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a",
        color: "#f87171",
        padding: 40,
      }}>
        <div style={{ maxWidth: 600, textAlign: "center" }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>⚠️</p>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: "#fff" }}>
            Error al ejecutar el demo
          </h2>
          <pre style={{
            background: "#1e293b",
            borderRadius: 12,
            padding: 20,
            fontSize: 13,
            textAlign: "left",
            overflowX: "auto",
            whiteSpace: "pre-wrap",
            border: "1px solid #334155",
          }}>
            {error}
          </pre>
        </div>
      </div>
    );
  }

  if (!Component) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a",
        color: "#94a3b8",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 20, height: 20,
            border: "2px solid #475569",
            borderTopColor: "#fff",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }} />
          <span>Compilando demo...</span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  if (fitToWidth) {
    return (
      <ErrorBoundary>
        <div ref={wrapRef} style={{ width: "100%", overflow: "hidden" }}>
          <div
            className="runtime-jsx-root"
            style={{
              width: 1280,
              minHeight: `${100 / fitScale}vh`,
              transform: `scale(${fitScale})`,
              transformOrigin: "top left",
              // Reserve the scaled height so the page doesn't have a huge empty area
              marginBottom: fitScale < 1 ? `calc(${fitScale - 1} * 100vh)` : 0,
            }}
          >
            <Component />
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="runtime-jsx-root" style={{
        width: `${100 / zoomScale}%`,
        minWidth: 1280,
        minHeight: `${100 / zoomScale}vh`,
        overflow: "auto",
        boxSizing: "border-box",
        transform: `scale(${zoomScale})`,
        transformOrigin: "top left",
      }}>
        <Component />
      </div>
    </ErrorBoundary>
  );
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(err: Error) { return { error: err.message }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#0f172a", color:"#f87171", padding:40 }}>
          <div style={{ maxWidth:600, textAlign:"center" }}>
            <p style={{ fontSize:48, marginBottom:16 }}>💥</p>
            <h2 style={{ fontSize:20, fontWeight:700, marginBottom:12, color:"#fff" }}>Error de ejecución en el demo</h2>
            <pre style={{ background:"#1e293b", borderRadius:12, padding:20, fontSize:13, textAlign:"left", overflowX:"auto", whiteSpace:"pre-wrap", border:"1px solid #334155" }}>{this.state.error}</pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
