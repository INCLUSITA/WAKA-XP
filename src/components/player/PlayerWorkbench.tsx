/**
 * PlayerWorkbench — Persistent side panel for iterating on player flows.
 * Replaces the previous toolbox with a full AI-powered workbench:
 * - Instructions/prompt editor (persisted in scenario_config)
 * - File uploads (JSON, YAML, images, logos, documents)
 * - AI Engine selector (WAKA AI, Azure, BYOM)
 * - Merge additional sources into the current flow
 * - Flow lifecycle controls (save, status, new conversation)
 */

import { useState, useCallback, useRef } from "react";
import {
  Send, Upload, FileJson, FileText, Image as ImageIcon, RotateCcw,
  Save, Sparkles, Loader2, FolderOpen, Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import AIEngineSelector, { type EngineSelection } from "@/components/demos/AIEngineSelector";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PlayerWorkbenchProps {
  /** Current flow ID being edited */
  flowId: string | null;
  flowTitle: string | null;
  /** Current scenario_config from the active flow */
  scenarioConfig: Record<string, any>;
  /** Current messages count */
  messageCount: number;
  /** Tenant context */
  tenantId: string;
  /** Callbacks */
  onInstructionsSent: (result: { conversation: any[]; config: Record<string, any> }) => void;
  onNewConversation: () => void;
  onSave: () => void;
  onOpenFlows: () => void;
}

interface UploadedAsset {
  name: string;
  type: string;
  size: number;
  content?: string; // text content for JSON/YAML
  dataUrl?: string; // for images
}

export function PlayerWorkbench({
  flowId, flowTitle, scenarioConfig, messageCount, tenantId,
  onInstructionsSent, onNewConversation, onSave, onOpenFlows,
}: PlayerWorkbenchProps) {
  const [instructions, setInstructions] = useState(scenarioConfig?.systemPrompt || "");
  const [assets, setAssets] = useState<UploadedAsset[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [engine, setEngine] = useState<EngineSelection>({ engineId: "waka-ai" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const asset: UploadedAsset = {
        name: file.name,
        type: file.type || "unknown",
        size: file.size,
      };

      if (file.name.endsWith(".json") || file.name.endsWith(".yaml") || file.name.endsWith(".yml") || file.name.endsWith(".txt")) {
        asset.content = await file.text();
      } else if (file.type.startsWith("image/")) {
        asset.dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      setAssets((prev) => [...prev, asset]);
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const removeAsset = useCallback((index: number) => {
    setAssets((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!instructions.trim() && assets.length === 0) {
      toast.error("Escribe instrucciones o sube archivos para continuar");
      return;
    }

    setIsProcessing(true);

    try {
      // Build source data combining instructions + uploaded assets
      const sourceData: Record<string, any> = {};

      if (instructions.trim()) {
        sourceData.instructions = instructions.trim();
      }

      // Extract JSON/YAML from uploaded files
      for (const asset of assets) {
        if (asset.content) {
          if (asset.name.endsWith(".json")) {
            sourceData.json = asset.content;
          } else if (asset.name.endsWith(".yaml") || asset.name.endsWith(".yml")) {
            sourceData.yaml = asset.content;
          } else {
            // Plain text — append to instructions
            sourceData.instructions = (sourceData.instructions || "") + "\n\n--- " + asset.name + " ---\n" + asset.content;
          }
        }
        if (asset.dataUrl) {
          if (!sourceData.assets) sourceData.assets = [];
          sourceData.assets.push({ name: asset.name, type: asset.type, dataUrl: asset.dataUrl });
        }
      }

      // Include existing scenario config for merge context
      if (flowId && scenarioConfig) {
        sourceData.existingConfig = scenarioConfig;
        sourceData.mergeMode = true;
      }

      const { data, error } = await supabase.functions.invoke("generate-player-flow", {
        body: {
          name: flowTitle || "Flujo iterado",
          description: instructions.substring(0, 200),
          engineId: engine.engineId,
          tenantId,
          sourceData,
          mode: "generate",
          existingFlowId: flowId,
        },
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      toast.success("Flujo actualizado con las nuevas instrucciones");

      // Notify parent to reload the flow
      if (data?.flowId) {
        // Load the full generated flow to get conversation + config
        const { data: flowData } = await supabase
          .from("player_saved_flows")
          .select("conversation_snapshot, scenario_config")
          .eq("id", data.flowId)
          .single();

        if (flowData) {
          onInstructionsSent({
            conversation: flowData.conversation_snapshot as any[] || [],
            config: flowData.scenario_config as Record<string, any> || {},
          });
        }
      }
    } catch (err: any) {
      console.error("Workbench submit error:", err);
      toast.error(err.message || "Error al procesar instrucciones");
    } finally {
      setIsProcessing(false);
    }
  }, [instructions, assets, engine, flowId, flowTitle, scenarioConfig, tenantId, onInstructionsSent]);

  const getAssetIcon = (asset: UploadedAsset) => {
    if (asset.name.endsWith(".json")) return <FileJson className="h-3 w-3 text-amber-500" />;
    if (asset.name.endsWith(".yaml") || asset.name.endsWith(".yml")) return <FileText className="h-3 w-3 text-blue-500" />;
    if (asset.type.startsWith("image/")) return <ImageIcon className="h-3 w-3 text-emerald-500" />;
    return <FileText className="h-3 w-3 text-muted-foreground" />;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Workbench
          </h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Iteración IA · {messageCount} msgs
          </p>
        </div>
        <AIEngineSelector selection={engine} onSelect={setEngine} />
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* ── Instructions ── */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Pencil className="h-3 w-3" />
              Instrucciones / Prompt
            </label>
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Describe cómo quieres que funcione el flujo, qué debe decir el agente, las reglas de negocio, el tono, etc."
              className="min-h-[120px] text-xs resize-y"
              disabled={isProcessing}
            />
          </div>

          {/* ── File Uploads ── */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Upload className="h-3 w-3" />
              Archivos y Assets
            </label>
            <p className="text-[10px] text-muted-foreground">
              JSON TextIt, YAML agente, imágenes, logos, documentos
            </p>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".json,.yaml,.yml,.txt,.png,.jpg,.jpeg,.gif,.svg,.webp,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-16 border-dashed border-2 text-xs gap-2 flex-col"
              disabled={isProcessing}
            >
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Arrastra o haz clic para subir</span>
            </Button>

            {/* Uploaded files list */}
            {assets.length > 0 && (
              <div className="space-y-1">
                {assets.map((asset, i) => (
                  <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-md px-2.5 py-1.5 group">
                    {getAssetIcon(asset)}
                    <span className="text-[11px] text-foreground truncate flex-1">{asset.name}</span>
                    <span className="text-[9px] text-muted-foreground">{(asset.size / 1024).toFixed(0)}KB</span>
                    <button
                      onClick={() => removeAsset(i)}
                      className="text-destructive/50 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Submit ── */}
          <Button
            onClick={handleSubmit}
            disabled={isProcessing || (!instructions.trim() && assets.length === 0)}
            className="w-full gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando con IA...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Aplicar instrucciones
              </>
            )}
          </Button>

          <Separator />

          {/* ── Quick Actions ── */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Acciones
            </label>
            <div className="space-y-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={onSave}
                disabled={messageCount <= 2}
                className="w-full justify-start h-8 text-[11px] gap-2"
              >
                <Save className="h-3.5 w-3.5" />
                Guardar flujo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenFlows}
                className="w-full justify-start h-8 text-[11px] gap-2"
              >
                <FolderOpen className="h-3.5 w-3.5" />
                Ver flujos guardados
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onNewConversation}
                className="w-full justify-start h-8 text-[11px] gap-2"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Nueva conversación
              </Button>
            </div>
          </div>


          {/* ── Current Config Preview ── */}
          {scenarioConfig?.systemPrompt && (
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Prompt activo
              </label>
              <div className="bg-muted/50 rounded-lg p-2.5">
                <p className="text-[10px] text-muted-foreground line-clamp-4 whitespace-pre-wrap">
                  {scenarioConfig.systemPrompt}
                </p>
              </div>
              {scenarioConfig.intents?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {scenarioConfig.intents.map((intent: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-[8px]">{intent}</Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
