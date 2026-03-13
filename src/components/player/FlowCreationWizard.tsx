/**
 * FlowCreationWizard — Multi-source flow creation for the Player gallery.
 * Sources: JSON TextIt, YAML Agent, Text+AI instructions, Image/Logo assets.
 * Includes AI Engine selector (WAKA AI, Azure, BYOM).
 */

import { useState, useCallback, useRef } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileJson, FileText, MessageSquare, Image, Upload, Cpu, Cloud, Server,
  Lock, Check, Sparkles, X, Loader2, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/* ── AI Engine types ── */
export type EngineId = "waka-ai" | "azure-openai" | "byom";

interface AIEngine {
  id: EngineId;
  name: string;
  subtitle: string;
  description: string;
  icon: typeof Cpu;
  available: boolean;
}

const ENGINES: AIEngine[] = [
  { id: "waka-ai", name: "WAKA AI", subtitle: "Default", description: "Motor IA nativo · Infraestructura WAKA", icon: Cpu, available: true },
  { id: "azure-openai", name: "Azure OpenAI", subtitle: "Demo", description: "GPT-4o via Azure · Requiere claves", icon: Cloud, available: false },
  { id: "byom", name: "BYOM", subtitle: "Demo", description: "Bring Your Own Model · Requiere config", icon: Server, available: false },
];

/* ── Uploaded asset ── */
interface UploadedAsset {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

/* ── Props ── */
interface FlowCreationWizardProps {
  open: boolean;
  onClose: () => void;
  onCreated: (flowId: string) => void;
  tenantId: string;
}

export function FlowCreationWizard({ open, onClose, onCreated, tenantId }: FlowCreationWizardProps) {
  const [tab, setTab] = useState("text");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [engineId, setEngineId] = useState<EngineId>("waka-ai");
  const [isGenerating, setIsGenerating] = useState(false);

  // Source data
  const [textInstructions, setTextInstructions] = useState("");
  const [jsonContent, setJsonContent] = useState("");
  const [jsonFileName, setJsonFileName] = useState("");
  const [yamlContent, setYamlContent] = useState("");
  const [yamlFileName, setYamlFileName] = useState("");
  const [assets, setAssets] = useState<UploadedAsset[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const yamlInputRef = useRef<HTMLInputElement>(null);
  const assetInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setName(""); setDescription(""); setTextInstructions("");
    setJsonContent(""); setJsonFileName("");
    setYamlContent(""); setYamlFileName("");
    setAssets([]); setTab("text"); setEngineId("waka-ai");
  };

  const handleClose = () => { reset(); onClose(); };

  /* ── File handlers ── */
  const handleJsonUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        JSON.parse(text); // validate
        setJsonContent(text);
        setJsonFileName(file.name);
        if (!name) setName(file.name.replace(/\.json$/i, ""));
        toast.success(`JSON cargado: ${file.name}`);
      } catch {
        toast.error("JSON inválido");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, [name]);

  const handleYamlUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      setYamlContent(text);
      setYamlFileName(file.name);
      if (!name) setName(file.name.replace(/\.(ya?ml)$/i, ""));
      toast.success(`YAML cargado: ${file.name}`);
    };
    reader.readAsText(file);
    e.target.value = "";
  }, [name]);

  const handleAssetUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} excede 5MB`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setAssets((prev) => [...prev, {
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl: reader.result as string,
        }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }, []);

  const removeAsset = (idx: number) => setAssets((prev) => prev.filter((_, i) => i !== idx));

  /* ── Generate flow via AI ── */
  const handleGenerate = useCallback(async () => {
    if (!name.trim()) { toast.error("Nombre del flujo requerido"); return; }

    // Build source payload
    const sourceData: Record<string, any> = {};
    if (textInstructions.trim()) sourceData.instructions = textInstructions.trim();
    if (jsonContent) sourceData.json = jsonContent;
    if (yamlContent) sourceData.yaml = yamlContent;
    if (assets.length > 0) sourceData.assets = assets.map((a) => ({ name: a.name, type: a.type, dataUrl: a.dataUrl }));

    if (!sourceData.instructions && !sourceData.json && !sourceData.yaml) {
      toast.error("Proporciona al menos una fuente: texto, JSON o YAML");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-player-flow", {
        body: {
          name: name.trim(),
          description: description.trim(),
          engineId,
          tenantId,
          sourceData,
        },
      });

      if (error) throw error;
      if (!data?.flowId) throw new Error("No flowId returned");

      toast.success(`Flujo "${name}" generado con IA`);
      handleClose();
      onCreated(data.flowId);
    } catch (err: any) {
      console.error("Generate flow error:", err);
      toast.error(err.message || "Error al generar el flujo");
    } finally {
      setIsGenerating(false);
    }
  }, [name, description, engineId, tenantId, textInstructions, jsonContent, yamlContent, assets, onCreated]);

  /* ── Direct import (JSON/YAML without AI) ── */
  const handleDirectImport = useCallback(async () => {
    if (!name.trim()) { toast.error("Nombre del flujo requerido"); return; }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-player-flow", {
        body: {
          name: name.trim(),
          description: description.trim(),
          engineId,
          tenantId,
          sourceData: {
            ...(jsonContent ? { json: jsonContent } : {}),
            ...(yamlContent ? { yaml: yamlContent } : {}),
          },
          mode: "import", // Skip AI generation, just parse and save
        },
      });

      if (error) throw error;
      if (!data?.flowId) throw new Error("No flowId returned");

      toast.success(`Flujo "${name}" importado`);
      handleClose();
      onCreated(data.flowId);
    } catch (err: any) {
      console.error("Import flow error:", err);
      toast.error(err.message || "Error al importar el flujo");
    } finally {
      setIsGenerating(false);
    }
  }, [name, description, engineId, tenantId, jsonContent, yamlContent, onCreated]);

  const hasSource = !!(textInstructions.trim() || jsonContent || yamlContent);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-[640px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            Crear flujo del Player
          </DialogTitle>
        </DialogHeader>

        {/* Name + Description */}
        <div className="space-y-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del flujo *"
            className="text-sm"
          />
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción (opcional)"
            className="text-sm"
          />
        </div>

        {/* AI Engine Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mr-1">Motor IA:</span>
          {ENGINES.map((engine) => {
            const isSelected = engine.id === engineId;
            const Icon = engine.icon;
            return (
              <button
                key={engine.id}
                onClick={() => engine.available && setEngineId(engine.id)}
                disabled={!engine.available}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition border",
                  isSelected
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : engine.available
                      ? "border-border/50 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                      : "border-border/20 text-muted-foreground/40 cursor-not-allowed"
                )}
              >
                <Icon className="h-3 w-3" />
                {engine.name}
                {!engine.available && <Lock className="h-2.5 w-2.5" />}
                {isSelected && <Check className="h-2.5 w-2.5" />}
              </button>
            );
          })}
        </div>

        {/* Source Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="flex-1 min-h-0 flex flex-col">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="text" className="text-[11px] gap-1">
              <MessageSquare className="h-3 w-3" /> Texto + IA
            </TabsTrigger>
            <TabsTrigger value="json" className="text-[11px] gap-1">
              <FileJson className="h-3 w-3" /> JSON
              {jsonContent && <Check className="h-2.5 w-2.5 text-emerald-500" />}
            </TabsTrigger>
            <TabsTrigger value="yaml" className="text-[11px] gap-1">
              <FileText className="h-3 w-3" /> YAML
              {yamlContent && <Check className="h-2.5 w-2.5 text-emerald-500" />}
            </TabsTrigger>
            <TabsTrigger value="assets" className="text-[11px] gap-1">
              <Image className="h-3 w-3" /> Assets
              {assets.length > 0 && <Badge variant="secondary" className="text-[8px] h-4 min-w-[16px]">{assets.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-2">
            {/* TEXT + AI */}
            <TabsContent value="text" className="mt-0">
              <div className="space-y-2">
                <p className="text-[11px] text-muted-foreground">
                  Describe el flujo conversacional que quieres crear. La IA generará la conversación demo y la configuración del escenario.
                </p>
                <Textarea
                  value={textInstructions}
                  onChange={(e) => setTextInstructions(e.target.value)}
                  placeholder="Ej: Crea un flujo de onboarding para clientes de Moov Africa que incluya verificación de identidad, apertura de cuenta MoMo y presentación de productos BNPL. El tono debe ser cálido y profesional en francés..."
                  className="text-sm min-h-[160px] resize-none"
                />
                <p className="text-[9px] text-muted-foreground/60">
                  💡 Puedes combinar instrucciones de texto con un JSON/YAML y assets para dar más contexto a la IA
                </p>
              </div>
            </TabsContent>

            {/* JSON */}
            <TabsContent value="json" className="mt-0">
              <div className="space-y-3">
                <p className="text-[11px] text-muted-foreground">
                  Sube un archivo JSON de TextIt/RapidPro. La IA lo usará como base para generar la conversación del Player.
                </p>
                <input ref={fileInputRef} type="file" accept=".json" onChange={handleJsonUpload} className="hidden" />
                <Button
                  variant="outline"
                  className="w-full h-20 border-dashed gap-2 text-xs"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  {jsonFileName ? (
                    <span className="flex items-center gap-1.5">
                      <FileJson className="h-3.5 w-3.5 text-primary" />
                      {jsonFileName}
                      <Check className="h-3 w-3 text-emerald-500" />
                    </span>
                  ) : (
                    "Arrastra o haz clic para subir JSON"
                  )}
                </Button>
                {jsonContent && (
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-[9px]">
                      {Math.round(jsonContent.length / 1024)} KB
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => { setJsonContent(""); setJsonFileName(""); }}>
                      <X className="h-3 w-3 mr-1" /> Quitar
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* YAML */}
            <TabsContent value="yaml" className="mt-0">
              <div className="space-y-3">
                <p className="text-[11px] text-muted-foreground">
                  Sube un archivo YAML con la definición del agente (endpoints, intenciones, respuestas). La IA lo interpretará para construir el flujo.
                </p>
                <input ref={yamlInputRef} type="file" accept=".yml,.yaml" onChange={handleYamlUpload} className="hidden" />
                <Button
                  variant="outline"
                  className="w-full h-20 border-dashed gap-2 text-xs"
                  onClick={() => yamlInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  {yamlFileName ? (
                    <span className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-primary" />
                      {yamlFileName}
                      <Check className="h-3 w-3 text-emerald-500" />
                    </span>
                  ) : (
                    "Arrastra o haz clic para subir YAML"
                  )}
                </Button>
                {yamlContent && (
                  <>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-[9px]">
                        {Math.round(yamlContent.length / 1024)} KB
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => { setYamlContent(""); setYamlFileName(""); }}>
                        <X className="h-3 w-3 mr-1" /> Quitar
                      </Button>
                    </div>
                    <Textarea
                      value={yamlContent}
                      onChange={(e) => setYamlContent(e.target.value)}
                      className="text-[10px] font-mono min-h-[120px] resize-none bg-muted/30"
                      placeholder="YAML preview..."
                    />
                  </>
                )}
              </div>
            </TabsContent>

            {/* ASSETS */}
            <TabsContent value="assets" className="mt-0">
              <div className="space-y-3">
                <p className="text-[11px] text-muted-foreground">
                  Sube imágenes, logos o capturas que la IA usará como contexto visual para personalizar el flujo.
                </p>
                <input ref={assetInputRef} type="file" accept="image/*" multiple onChange={handleAssetUpload} className="hidden" />
                <Button
                  variant="outline"
                  className="w-full h-16 border-dashed gap-2 text-xs"
                  onClick={() => assetInputRef.current?.click()}
                >
                  <Image className="h-4 w-4" />
                  Subir imágenes (máx 5MB c/u)
                </Button>
                {assets.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {assets.map((asset, i) => (
                      <div key={i} className="relative group rounded-lg border border-border/50 overflow-hidden">
                        <img src={asset.dataUrl} alt={asset.name} className="w-full h-20 object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-white hover:text-destructive"
                            onClick={() => removeAsset(i)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-[8px] text-muted-foreground truncate px-1 py-0.5">{asset.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Engine warning for non-available engines */}
        {engineId !== "waka-ai" && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <p className="text-[10px] text-amber-600">
              {engineId === "azure-openai"
                ? "Azure OpenAI requiere claves API. Configúralas en Settings para activar este motor."
                : "BYOM requiere configuración de endpoint y modelo. Disponible próximamente."}
            </p>
          </div>
        )}

        <DialogFooter className="flex-row gap-2">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={isGenerating}>
            Cancelar
          </Button>

          {/* Direct import button for JSON/YAML */}
          {(jsonContent || yamlContent) && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDirectImport}
              disabled={isGenerating || !name.trim()}
              className="gap-1.5 text-xs"
            >
              <Upload className="h-3 w-3" />
              Importar directo
            </Button>
          )}

          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating || !name.trim() || !hasSource || engineId !== "waka-ai"}
            className="gap-1.5 text-xs"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3" />
                Generar con IA
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
