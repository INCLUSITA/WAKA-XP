import { useState, useCallback } from "react";
import { Node } from "@xyflow/react";
import { X, Languages, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { SUPPORTED_LANGUAGES, translateFlowNodes, TranslationProgress } from "@/lib/flowTranslator";

interface TranslatorPanelProps {
  nodes: Node[];
  onTranslated: (nodes: Node[]) => void;
  onClose: () => void;
}

export function TranslatorPanel({ nodes, onTranslated, onClose }: TranslatorPanelProps) {
  const [fromLang, setFromLang] = useState("es");
  const [toLang, setToLang] = useState("en");
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState<TranslationProgress | null>(null);

  const countTranslatableTexts = useCallback(() => {
    let count = 0;
    nodes.forEach((node) => {
      const data = node.data as Record<string, any>;
      if (node.type === "sendMsg") {
        if (data.text?.trim()) count++;
        count += (data.quick_replies || []).filter((r: string) => r.trim()).length;
      } else if (node.type === "waitResponse") {
        if (data.label?.trim()) count++;
        count += (data.categories || []).filter((c: string) => c.trim()).length;
      }
    });
    return count;
  }, [nodes]);

  const handleTranslate = useCallback(async () => {
    if (fromLang === toLang) {
      toast.error("Selecciona idiomas diferentes");
      return;
    }

    setIsTranslating(true);
    setProgress(null);

    try {
      const translated = await translateFlowNodes(nodes, fromLang, toLang, setProgress);
      onTranslated(translated);
      toast.success(
        `Flujo traducido de ${SUPPORTED_LANGUAGES.find((l) => l.code === fromLang)?.label} a ${SUPPORTED_LANGUAGES.find((l) => l.code === toLang)?.label}`
      );
    } catch {
      toast.error("Error al traducir el flujo");
    } finally {
      setIsTranslating(false);
      setProgress(null);
    }
  }, [nodes, fromLang, toLang, onTranslated]);

  const textCount = countTranslatableTexts();
  const progressPercent = progress ? (progress.current / progress.total) * 100 : 0;

  return (
    <div className="absolute left-4 bottom-4 z-50 w-96 rounded-xl border border-border bg-card shadow-2xl">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4 text-node-wait" />
          <h3 className="text-sm font-semibold text-foreground">Traducir Flujo</h3>
        </div>
        <button onClick={onClose} className="rounded-md p-1 hover:bg-muted" disabled={isTranslating}>
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="space-y-4 p-4">
        <p className="text-xs text-muted-foreground">
          Traduce todos los mensajes, respuestas rápidas y categorías sin modificar la estructura, webhooks ni expresiones.
        </p>

        <div className="flex items-center gap-2">
          <div className="flex-1 space-y-1">
            <label className="text-xs font-medium text-muted-foreground">De</label>
            <Select value={fromLang} onValueChange={setFromLang} disabled={isTranslating}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ArrowRight className="mt-5 h-4 w-4 shrink-0 text-muted-foreground" />

          <div className="flex-1 space-y-1">
            <label className="text-xs font-medium text-muted-foreground">A</label>
            <Select value={toLang} onValueChange={setToLang} disabled={isTranslating}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Textos a traducir:</span>
            <span className="font-semibold text-foreground">{textCount}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span>Se preservará:</span>
            <span className="text-foreground">Webhooks, variables, estructura</span>
          </div>
        </div>

        {isTranslating && progress && (
          <div className="space-y-2">
            <Progress value={progressPercent} className="h-2" />
            <p className="truncate text-xs text-muted-foreground">
              {progress.current}/{progress.total}: {progress.currentText}…
            </p>
          </div>
        )}

        <Button
          className="w-full bg-node-wait hover:bg-node-wait/90"
          onClick={handleTranslate}
          disabled={isTranslating || textCount === 0}
        >
          {isTranslating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Traduciendo…
            </>
          ) : (
            <>
              <Languages className="mr-2 h-4 w-4" /> Traducir {textCount} textos
            </>
          )}
        </Button>

        {textCount === 0 && (
          <p className="text-center text-xs text-destructive">
            No hay textos traducibles en el flujo actual
          </p>
        )}
      </div>
    </div>
  );
}
