import { AlertTriangle, XCircle, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ValidationError } from "@/lib/flowValidation";

interface ValidationPanelProps {
  errors: ValidationError[];
  onClose: () => void;
  onFocusNode: (nodeId: string) => void;
}

export function ValidationPanel({ errors, onClose, onFocusNode }: ValidationPanelProps) {
  const errorCount = errors.filter((e) => e.type === "error").length;
  const warningCount = errors.filter((e) => e.type === "warning").length;

  return (
    <div className="absolute bottom-4 left-4 z-50 w-96 rounded-xl border border-border bg-card shadow-2xl">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          {errors.length === 0 ? (
            <CheckCircle2 className="h-4 w-4 text-node-send" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-node-webhook" />
          )}
          <h3 className="text-sm font-semibold text-foreground">
            Validación del Flujo
          </h3>
        </div>
        <button onClick={onClose} className="rounded-md p-1 hover:bg-muted">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {errors.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-node-send" />
          <p className="mt-2 text-sm font-medium text-foreground">¡Flujo válido!</p>
          <p className="text-xs text-muted-foreground">No se encontraron problemas</p>
        </div>
      ) : (
        <>
          <div className="flex gap-3 border-b border-border px-4 py-2 text-xs">
            {errorCount > 0 && (
              <span className="flex items-center gap-1 text-destructive">
                <XCircle className="h-3 w-3" /> {errorCount} error{errorCount > 1 ? "es" : ""}
              </span>
            )}
            {warningCount > 0 && (
              <span className="flex items-center gap-1 text-node-webhook">
                <AlertTriangle className="h-3 w-3" /> {warningCount} advertencia{warningCount > 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto">
            {errors.map((err, i) => (
              <button
                key={i}
                onClick={() => onFocusNode(err.nodeId)}
                className="flex w-full items-start gap-2 border-b border-border/50 px-4 py-2.5 text-left transition-colors hover:bg-muted/50 last:border-0"
              >
                {err.type === "error" ? (
                  <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-node-webhook" />
                )}
                <div>
                  <p className="text-xs text-foreground">{err.message}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {err.nodeId.slice(0, 8)}…
                  </p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {errorCount > 0 && (
        <div className="border-t border-border px-4 py-2">
          <p className="text-xs text-destructive">
            Corrige los errores antes de exportar
          </p>
        </div>
      )}
    </div>
  );
}
