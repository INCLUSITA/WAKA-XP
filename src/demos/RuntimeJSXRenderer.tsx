import React, { useState, useEffect, useRef, useCallback, useMemo, useReducer, useContext, createContext, memo, forwardRef, Fragment } from "react";

/** Detect browser zoom and return inverse scale factor so content stays 1:1 */
function useZoomCompensation() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const update = () => {
      const ratio = window.devicePixelRatio || 1;
      // baseline is the DPR when page first loaded at 100%
      const baseline = Math.round(ratio) || 1;
      setScale(baseline / ratio);
    };
    update();
    const mq = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    // Re-check on any zoom change
    const interval = setInterval(update, 500);
    mq.addEventListener?.("change", update);
    return () => {
      clearInterval(interval);
      mq.removeEventListener?.("change", update);
    };
  }, []);
  return scale;
}
import { transform } from "sucrase";

interface RuntimeJSXRendererProps {
  jsxSource: string;
  demoId?: string;
  scenarioNotes?: Record<string, string>;
  onSaveNotes?: (notes: Record<string, string>) => void;
  readOnly?: boolean;
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

export default function RuntimeJSXRenderer({ jsxSource, demoId = "default", scenarioNotes, onSaveNotes, readOnly = false }: RuntimeJSXRendererProps) {
  const usePersistentState = useMemo(() => createUsePersistentState(demoId), [demoId]);
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Transpile JSX → JS
      // Strip import/export before transpiling to avoid module issues
      let preProcessed = jsxSource;

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

      // Build a module that returns the component
      const moduleCode = `
        ${code}
        return typeof ${componentName} === 'function' ? ${componentName} : null;
      `;

      // Execute with React in scope - provide all common hooks and utilities
      const saveNoteCallback = readOnly ? null : onSaveNotes || null;
      const factory = new Function(
        "React", "useState", "useEffect", "useRef", "useCallback", "useMemo",
        "useReducer", "useContext", "createContext", "memo", "forwardRef", "Fragment",
        "usePersistentState", "__scenarioNotes", "__saveNote",
        moduleCode
      );
      const Comp = factory(
        React, useState, useEffect, useRef, useCallback, useMemo,
        useReducer, useContext, createContext, memo, forwardRef, Fragment,
        usePersistentState, scenarioNotes || {}, saveNoteCallback
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

  return (
    <ErrorBoundary>
      <div className="runtime-jsx-root" style={{
        width: "100%",
        minHeight: "100vh",
        overflow: "auto",
        boxSizing: "border-box",
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
