import { useState, useCallback, useEffect, useRef } from "react";
import { Node, Edge } from "@xyflow/react";
import { X, RotateCcw, Send, Bot, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFlowSimulation } from "@/hooks/useFlowSimulation";

interface WhatsAppSimulatorProps {
  nodes: Node[];
  edges: Edge[];
  onClose: () => void;
  onHighlightNode?: (nodeId: string) => void;
}

export function WhatsAppSimulator({ nodes, edges, onClose, onHighlightNode }: WhatsAppSimulatorProps) {
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { messages, waitingForInput, categories, isFinished, isProcessing, start, sendMessage, sendAttachment } =
    useFlowSimulation(nodes, edges, onHighlightNode);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages.length, scrollToBottom]);
  useEffect(() => { start(); }, []); // eslint-disable-line

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

  return (
    <div className="absolute right-0 top-0 z-50 flex h-full w-96 flex-col border-l border-border bg-background shadow-2xl">
      <div className="flex items-center gap-3 bg-node-send px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/20">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-primary-foreground">Simulador WhatsApp</p>
          <p className="text-xs text-primary-foreground/70">
            {isProcessing ? "procesando API…" : isFinished ? "Flujo finalizado" : waitingForInput ? "Esperando respuesta…" : "En línea"}
          </p>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={start} className="text-primary-foreground hover:bg-primary-foreground/20" title="Reiniciar">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-primary-foreground hover:bg-primary-foreground/20">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

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
          <Input value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && waitingForInput) handleSend(inputText); }} placeholder={waitingForInput ? "Escribe tu respuesta…" : isProcessing ? "Procesando API…" : "Esperando al bot…"} disabled={!waitingForInput} className="flex-1 rounded-full border-border bg-background text-sm" />
          <Button size="icon" onClick={() => handleSend(inputText)} disabled={!waitingForInput || !inputText.trim()} className="h-9 w-9 shrink-0 rounded-full bg-node-send hover:bg-node-send/90">
            <Send className="h-4 w-4 text-primary-foreground" />
          </Button>
        </div>
      </div>
    </div>
  );
}
