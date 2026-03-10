import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileJson, AlertTriangle, CheckCircle2, ArrowRight, X } from "lucide-react";
import { toast } from "sonner";

interface FlowPreview {
  name: string;
  language: string;
  nodeCount: number;
  types: Record<string, number>;
  raw: any;
}

function analyzeFlow(json: any): FlowPreview | null {
  const flow = json?.flows?.[0];
  if (!flow || !Array.isArray(flow.nodes)) return null;

  const types: Record<string, number> = {};
  for (const n of flow.nodes) {
    if (n.router?.wait?.type === "msg") {
      types["wait_for_response"] = (types["wait_for_response"] || 0) + 1;
    } else if (n.router) {
      types["split"] = (types["split"] || 0) + 1;
    } else if (n.actions?.[0]?.type === "send_msg") {
      types["send_msg"] = (types["send_msg"] || 0) + 1;
    } else if (n.actions?.[0]?.type === "call_webhook") {
      types["webhook"] = (types["webhook"] || 0) + 1;
    } else {
      const t = n.actions?.[0]?.type || "unknown";
      types[t] = (types[t] || 0) + 1;
    }
  }

  return {
    name: flow.name || "Sin nombre",
    language: flow.language || "—",
    nodeCount: flow.nodes.length,
    types,
    raw: json,
  };
}

export default function ImportPage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<FlowPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const processFile = useCallback((file: File) => {
    setError(null);
    setPreview(null);

    if (!file.name.endsWith(".json")) {
      setError("Solo se aceptan archivos .json");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const json = JSON.parse(text);

        if (!json.flows || !Array.isArray(json.flows) || json.flows.length === 0) {
          setError("El archivo no contiene flujos válidos. Asegúrate de que sea un export de TextIt/RapidPro (formato v13).");
          return;
        }

        const result = analyzeFlow(json);
        if (!result) {
          setError("No se pudo analizar el flujo. Verifica el formato del archivo.");
          return;
        }

        setPreview(result);
      } catch (e: any) {
        setError(`Error al parsear el JSON: ${e.message}`);
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleOpenInEditor = () => {
    if (!preview) return;
    // Store in sessionStorage so the editor can pick it up
    sessionStorage.setItem("waka_import_flow", JSON.stringify(preview.raw));
    navigate("/editor?import=true");
    toast.success(`Abriendo "${preview.name}" en el editor`);
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-2xl font-bold text-foreground">Import JSON</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Importa flujos desde archivos JSON compatibles con TextIt / RapidPro (formato v13)
        </p>
      </div>

      <div className="flex-1 p-6 max-w-2xl mx-auto w-full space-y-6">
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
            dragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          }`}
        >
          <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">
            Arrastra tu archivo JSON aquí o haz clic para seleccionar
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Formato TextIt / RapidPro v13
          </p>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processFile(file);
            e.target.value = "";
          }}
        />

        {/* Error */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex items-start gap-3 pt-4">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Error al importar</p>
                <p className="text-xs text-muted-foreground mt-1">{error}</p>
              </div>
              <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setError(null)}>
                <X className="h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Preview */}
        {preview && (
          <Card className="border-primary/30">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <CardTitle className="text-base">Flujo válido detectado</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Nombre</p>
                  <p className="font-medium">{preview.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Idioma</p>
                  <p className="font-medium">{preview.language}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Nodos</p>
                  <p className="font-medium">{preview.nodeCount}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {Object.entries(preview.types).map(([type, count]) => (
                  <Badge key={type} variant="secondary" className="text-[10px]">
                    <FileJson className="h-2.5 w-2.5 mr-1" />
                    {type}: {count}
                  </Badge>
                ))}
              </div>

              <Button onClick={handleOpenInEditor} className="w-full">
                <ArrowRight className="mr-2 h-4 w-4" />
                Abrir en el Editor
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
