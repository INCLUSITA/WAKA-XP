import { useState, useCallback, useEffect, useRef } from "react";
import { Node, Edge } from "@xyflow/react";
import { X, RotateCcw, Send, Bot, Paperclip, AlertTriangle, Play, Info, CheckCircle2, Image as ImageIcon, FileText, Film, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFlowSimulation } from "@/hooks/useFlowSimulation";

interface WhatsAppSimulatorProps {
  nodes: Node[];
  edges: Edge[];
  onClose: () => void;
  onHighlightNode?: (nodeId: string) => void;
}

type EntrypointStatus = "clear" | "ambiguous" | "none";

function detectEntrypointStatus(nodes: Node[], edges: Edge[]): { status: EntrypointStatus; candidates: Node[]; reason: string; explanation: string } {
  const executableNodes = nodes.filter((n) => n.type !== "moduleGroup");
  if (executableNodes.length === 0) return { status: "none", candidates: [], reason: "No hay nodos en el flujo", explanation: "Añade al menos un nodo para poder simular." };

  const startNode = executableNodes.find((n) => n.type === "enterFlow" || (n.data as any)?.isStart === true);
  if (startNode) return { status: "clear", candidates: [startNode], reason: `Inicio: ${(startNode.data as any)?.label || startNode.type}`, explanation: "Se detectó un nodo de inicio explícito." };

  const targetIds = new Set(edges.map((e) => e.target));

  const entryModule = nodes.find((n) => n.type === "moduleGroup" && /entry|inicio|start/i.test((n.data as any)?.label || ""));
  if (entryModule) {
    const moduleNodeIds = new Set<string>((entryModule.data as any)?.nodeIds || []);
    const entryNode = executableNodes.find((n) => moduleNodeIds.has(n.id) && !targetIds.has(n.id));
    if (entryNode) return { status: "clear", candidates: [entryNode], reason: `Módulo "${(entryModule.data as any)?.label}"`, explanation: `Se inicia desde el primer nodo del módulo "${(entryModule.data as any)?.label}".` };
  }

  const rootNodes = executableNodes.filter((n) => !targetIds.has(n.id));
  if (rootNodes.length === 1) return { status: "clear", candidates: rootNodes, reason: "Único punto de entrada", explanation: "Solo hay un nodo sin conexiones de entrada — se usa como inicio." };
  if (rootNodes.length > 1) return { status: "ambiguous", candidates: rootNodes, reason: `${rootNodes.length} posibles inicios`, explanation: "Se detectaron varios nodos sin conexiones de entrada. Selecciona por cuál empezar." };
  
  return { status: "ambiguous", candidates: executableNodes.slice(0, 5), reason: "Inicio ambiguo", explanation: "Todos los nodos tienen conexiones de entrada — no hay un punto de inicio claro. Selecciona uno manualmente." };
}

const nodeTypeLabelsShort: Record<string, string> = {
  sendMsg: "Send Msg", waitResponse: "Wait", splitExpression: "Split", webhook: "Webhook",
  saveResult: "Save", updateContact: "Update", sendEmail: "Email", callAI: "AI",
  enterFlow: "Enter Flow", openTicket: "Ticket", callZapier: "Zapier", sendAirtime: "Airtime",
};

function AttachmentBubble({ att }: { att: { url: string; name?: string; mime?: string } }) {
  const mime = att.mime || "";
  const isImage = mime.startsWith("image");
  const isVideo = mime.startsWith("video");
  const isAudio = mime.startsWith("audio");
  const isPdf = mime === "application/pdf" || att.name?.toLowerCase().endsWith(".pdf");
  const fileName = att.name || "archivo";

  if (isImage) {
    return (
      <div className="rounded-lg overflow-hidden border border-border/20">
        <img src={att.url} alt={fileName} className="w-full max-h-40 object-cover" />
        <div className="px-2 py-1 bg-muted/40 flex items-center gap-1.5">
          <ImageIcon className="h-3 w-3 text-primary/60" />
          <span className="text-[10px] text-muted-foreground truncate">{fileName}</span>
        </div>
      </div>
    );
  }

  if (isVideo) {
    return (
      <div className="rounded-lg overflow-hidden border border-border/20 bg-muted/30">
        <video src={att.url} controls className="w-full max-h-48 rounded-t-lg" preload="metadata" />
        <div className="px-2 py-1 bg-muted/40 flex items-center gap-1.5">
          <Film className="h-3 w-3 text-primary/60" />
          <span className="text-[10px] text-muted-foreground truncate">{fileName}</span>
        </div>
      </div>
    );
  }

  if (isAudio) {
    return (
      <div className="rounded-lg border border-border/20 bg-muted/30 px-2.5 py-2 flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
          <Volume2 className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[11px] text-foreground truncate block">{fileName}</span>
          <div className="h-1 rounded-full bg-border/50 mt-1">
            <div className="h-1 rounded-full bg-primary/40 w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  // PDF / Document / generic file
  const icon = isPdf ? FileText : Paperclip;
  const IconComp = icon;
  const label = isPdf ? "PDF" : "Documento";

  return (
    <div className="rounded-lg border border-border/20 bg-muted/30 px-2.5 py-2 flex items-center gap-2">
      <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
        <IconComp className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[11px] text-foreground truncate block">{fileName}</span>
        <span className="text-[9px] text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

export function WhatsAppSimulator({ nodes, edges, onClose, onHighlightNode }: WhatsAppSimulatorProps) {
  const [inputText, setInputText] = useState("");
  const [selectedEntrypoint, setSelectedEntrypoint] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { messages, waitingForInput, categories, isFinished, isProcessing, start, sendMessage, sendAttachment } =
    useFlowSimulation(nodes, edges, onHighlightNode);

  const entryInfo = detectEntrypointStatus(nodes, edges);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages.length, scrollToBottom]);
  
  // Auto-start if clear entrypoint
  useEffect(() => {
    if (entryInfo.status === "clear") start();
  }, []); // eslint-disable-line

  const handleSend = (text: string) => {
    sendMessage(text);
    setInputText("");
  };

  const handleFileAttach = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) sendAttachment(file);
    };
    input.click();
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });

  // Get attachments for current bot message node
  const getNodeAttachments = (nodeId?: string): { url: string; name?: string; mime?: string }[] => {
    if (!nodeId) return [];
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || node.type !== "sendMsg") return [];
    const atts = (node.data as any)?.attachments || [];
    return atts.map((a: any) => typeof a === "string" ? { url: a } : a);
  };

  return (
    <div className="absolute right-0 top-0 z-50 flex h-full w-96 flex-col border-l border-border bg-background shadow-2xl">
      <div className="flex items-center gap-3 bg-node-send px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/20">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-primary-foreground">Simulador WhatsApp</p>
          <p className="text-xs text-primary-foreground/70">
            {isProcessing ? "procesando…" : isFinished ? "Flujo finalizado" : waitingForInput ? "Esperando respuesta…" : "En línea"}
          </p>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => { setSelectedEntrypoint(null); start(); }} className="text-primary-foreground hover:bg-primary-foreground/20" title="Reiniciar simulación">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-primary-foreground hover:bg-primary-foreground/20">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Auto-start explanation banner */}
      {entryInfo.status === "clear" && messages.length > 0 && messages.length <= 3 && (
        <div className="flex items-center gap-2 border-b border-border bg-primary/5 px-3 py-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
          <p className="text-[11px] text-foreground/70">{entryInfo.explanation}</p>
        </div>
      )}

      {/* Entrypoint selector for ambiguous/no-entry flows */}
      {entryInfo.status !== "clear" && messages.length === 0 && (
        <div className="border-b border-border bg-muted/50 px-4 py-3 space-y-2.5">
          <div className="flex items-start gap-2">
            {entryInfo.status === "none" ? (
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-destructive" />
            ) : (
              <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
            )}
            <div>
              <p className="text-xs font-medium text-foreground">{entryInfo.reason}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{entryInfo.explanation}</p>
            </div>
          </div>
          {entryInfo.candidates.length > 0 && (
            <div className="space-y-1">
              {entryInfo.candidates.map((n) => (
                <button
                  key={n.id}
                  onClick={() => { setSelectedEntrypoint(n.id); start(); }}
                  className={`w-full flex items-center gap-2 rounded-md border px-2.5 py-2 text-xs transition-colors hover:bg-card ${
                    selectedEntrypoint === n.id ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground"
                  }`}
                >
                  <Play className="h-3 w-3 shrink-0" />
                  <span className="font-medium">{nodeTypeLabelsShort[n.type || ""] || n.type}</span>
                  <span className="text-muted-foreground truncate flex-1 text-left">
                    {(n.data as any)?.text?.substring(0, 40) || (n.data as any)?.label || n.id.slice(0, 8)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 py-4" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5ddd5' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`, backgroundColor: "hsl(var(--muted))" }}>
        <div className="space-y-2">
          {messages.map((msg) => {
            if (msg.sender === "system") {
              return (
                <div key={msg.id} className="flex justify-center">
                  <span className="rounded-lg bg-muted px-3 py-1 text-[11px] text-muted-foreground shadow-sm max-w-[90%] text-center">{msg.text}</span>
                </div>
              );
            }
            const isBot = msg.sender === "bot";
            return (
              <div key={msg.id} className={`flex ${isBot ? "justify-start" : "justify-end"}`}>
                <div className={`relative max-w-[80%] rounded-xl px-3 py-2 shadow-sm ${isBot ? "rounded-tl-sm bg-card text-foreground" : "rounded-tr-sm bg-node-send text-primary-foreground"}`}>
                  {msg.imageUrl && (
                    <div className="mb-1.5 -mx-1 -mt-0.5 overflow-hidden rounded-md">
                      <img src={msg.imageUrl} alt="Attachment" className="w-full max-h-40 object-cover" />
                    </div>
                  )}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mb-1.5 space-y-1">
                      {msg.attachments.map((att, i) => (
                        <AttachmentBubble key={i} att={att} />
                      ))}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                  {msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1 border-t border-border/30 pt-2">
                      {msg.quickReplies.map((r, i) => (
                        <button key={i} onClick={() => waitingForInput && handleSend(r)} disabled={!waitingForInput} className="rounded-full border border-node-send/30 bg-transparent px-2.5 py-0.5 text-xs font-medium text-node-send transition-colors hover:bg-node-send/10 disabled:opacity-50">{r}</button>
                      ))}
                    </div>
                  )}
                  <p className={`mt-1 text-right text-[10px] ${isBot ? "text-muted-foreground" : "text-primary-foreground/60"}`}>{formatTime(msg.timestamp)}</p>
                </div>
              </div>
            );
          })}
          {waitingForInput && categories.length > 0 && (
            <div className="flex justify-center">
              <div className="flex flex-wrap justify-center gap-1.5 rounded-xl bg-card/90 px-3 py-2 shadow-sm">
                {categories.map((cat, i) => (
                  <button key={i} onClick={() => handleSend(cat)} className="rounded-full border border-node-wait/40 bg-node-wait/10 px-3 py-1 text-xs font-medium text-node-wait transition-colors hover:bg-node-wait/20">{cat}</button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div ref={chatEndRef} />
      </div>

      <div className="border-t border-border bg-card px-3 py-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={handleFileAttach}
            disabled={!waitingForInput}
            title="Adjuntar archivo"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && waitingForInput) handleSend(inputText); }} placeholder={waitingForInput ? "Escribe tu respuesta…" : isProcessing ? "Procesando…" : "Esperando al bot…"} disabled={!waitingForInput} className="flex-1 rounded-full border-border bg-background text-sm" />
          <Button size="icon" onClick={() => handleSend(inputText)} disabled={!waitingForInput || !inputText.trim()} className="h-9 w-9 shrink-0 rounded-full bg-node-send hover:bg-node-send/90">
            <Send className="h-4 w-4 text-primary-foreground" />
          </Button>
        </div>
      </div>
    </div>
  );
}
