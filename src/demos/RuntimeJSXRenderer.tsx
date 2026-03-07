import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { transform } from "sucrase";

interface RuntimeJSXRendererProps {
  jsxSource: string;
}

export default function RuntimeJSXRenderer({ jsxSource }: RuntimeJSXRendererProps) {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Transpile JSX → JS
      // Strip import/export before transpiling to avoid module issues
      let preProcessed = jsxSource;
      preProcessed = preProcessed.replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, "");
      preProcessed = preProcessed.replace(/^import\s+['"].*?['"];?\s*$/gm, "");

      // Capture the default export component name BEFORE stripping
      let componentName = "App";
      const exportMatch = preProcessed.match(/export\s+default\s+function\s+([A-Za-z_]\w*)/);
      if (exportMatch) {
        componentName = exportMatch[1];
      }

      preProcessed = preProcessed.replace(/^export\s+default\s+/gm, "");
      preProcessed = preProcessed.replace(/^export\s+/gm, "");

      const result = transform(preProcessed, {
        transforms: ["jsx", "typescript"],
        jsxRuntime: "classic",
        jsxPragma: "React.createElement",
        jsxFragmentPragma: "React.Fragment",
      });

      let code = result.code;

      // Build a module that returns the component
      const moduleCode = `
        ${code}
        return typeof ${componentName} === 'function' ? ${componentName} : null;
      `;

      // Execute with React in scope
      const factory = new Function("React", "useState", "useEffect", "useRef", "useCallback", "useMemo", moduleCode);
      const Comp = factory(React, useState, useEffect, useRef, useCallback, useMemo);

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
  }, [jsxSource]);

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

  return <Component />;
}
