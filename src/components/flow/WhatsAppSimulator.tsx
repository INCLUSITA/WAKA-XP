import { useState, useCallback, useEffect, useRef } from "react";
import { Node, Edge } from "@xyflow/react";
import { X, Play, RotateCcw, Send, Bot, User, Globe, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatMessage {
  id: string;
  sender: "bot" | "user" | "system";
  text: string;
  quickReplies?: string[];
  timestamp: Date;
}

interface WhatsAppSimulatorProps {
  nodes: Node[];
  edges: Edge[];
  onClose: () => void;
  onHighlightNode?: (nodeId: string) => void;
}

export function WhatsAppSimulator({ nodes, edges, onClose, onHighlightNode }: WhatsAppSimulatorProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [inputText, setInputText] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  const findFirstNode = useCallback((): string | null => {
    if (nodes.length === 0) return null;
    const targetIds = new Set(edges.map((e) => e.target));
    const entryNode = nodes.find((n) => !targetIds.has(n.id));
    return entryNode?.id || nodes[0]?.id || null;
  }, [nodes, edges]);

  const getNextNodeId = useCallback(
    (nodeId: string, sourceHandle?: string): string | null => {
      let edge;
      if (sourceHandle) {
        edge = edges.find((e) => e.source === nodeId && e.sourceHandle === sourceHandle);
      }
      if (!edge) {
        edge = edges.find((e) => e.source === nodeId);
      }
      return edge?.target || null;
    },
    [edges]
  );

  const processNode = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) {
        setIsFinished(true);
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), sender: "system", text: "— Fin del flujo —", timestamp: new Date() },
        ]);
        return;
      }

      setCurrentNodeId(nodeId);
      onHighlightNode?.(nodeId);
      const data = node.data as Record<string, any>;

      switch (node.type) {
        case "sendMsg": {
          const text = data.text || "(mensaje vacío)";
          const quickReplies = data.quick_replies?.filter((r: string) => r.trim()) || [];
          setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), sender: "bot", text, quickReplies, timestamp: new Date() },
          ]);
          scrollToBottom();

          // Auto-advance after a short delay
          setTimeout(() => {
            const nextId = getNextNodeId(nodeId);
            if (nextId) {
              processNode(nextId);
            } else {
              setIsFinished(true);
              setMessages((prev) => [
                ...prev,
                { id: crypto.randomUUID(), sender: "system", text: "— Fin del flujo —", timestamp: new Date() },
              ]);
            }
          }, 800);
          break;
        }

        case "waitResponse": {
          const cats = (data.categories || []).filter((c: string) => c.trim());
          setCategories(cats);
          setWaitingForInput(true);
          scrollToBottom();
          break;
        }

        case "splitExpression": {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              sender: "system",
              text: `⚡ Split: ${data.operand || "@input.text"}`,
              timestamp: new Date(),
            },
          ]);
          scrollToBottom();
          setTimeout(() => {
            const nextId = getNextNodeId(nodeId);
            if (nextId) processNode(nextId);
            else {
              setIsFinished(true);
              setMessages((prev) => [
                ...prev,
                { id: crypto.randomUUID(), sender: "system", text: "— Fin del flujo —", timestamp: new Date() },
              ]);
            }
          }, 500);
          break;
        }

        case "webhook": {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              sender: "system",
              text: `🌐 Webhook: ${data.method || "GET"} ${data.url || "(sin URL)"}`,
              timestamp: new Date(),
            },
          ]);
          scrollToBottom();
          // Simulate success path
          setTimeout(() => {
            const nextId = getNextNodeId(nodeId);
            if (nextId) processNode(nextId);
            else {
              setIsFinished(true);
              setMessages((prev) => [
                ...prev,
                { id: crypto.randomUUID(), sender: "system", text: "— Fin del flujo —", timestamp: new Date() },
              ]);
            }
          }, 600);
          break;
        }

        default: {
          const nextId = getNextNodeId(nodeId);
          if (nextId) processNode(nextId);
          else setIsFinished(true);
        }
      }
    },
    [nodes, edges, getNextNodeId, onHighlightNode, scrollToBottom]
  );

  const handleStart = useCallback(() => {
    setMessages([]);
    setIsFinished(false);
    setWaitingForInput(false);
    setCategories([]);
    const firstId = findFirstNode();
    if (firstId) {
      processNode(firstId);
    } else {
      setMessages([
        { id: crypto.randomUUID(), sender: "system", text: "No hay nodos en el flujo", timestamp: new Date() },
      ]);
    }
  }, [findFirstNode, processNode]);

  const handleSendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || !currentNodeId) return;

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), sender: "user", text, timestamp: new Date() },
      ]);
      setWaitingForInput(false);
      setCategories([]);
      setInputText("");
      scrollToBottom();

      // Find matching category or default path
      const node = nodes.find((n) => n.id === currentNodeId);
      const data = node?.data as Record<string, any>;
      const cats = (data?.categories || []) as string[];

      const matchedCat = cats.find(
        (c: string) => c.toLowerCase() === text.toLowerCase()
      );

      setTimeout(() => {
        const nextId = getNextNodeId(currentNodeId, matchedCat || undefined);
        if (nextId) {
          processNode(nextId);
        } else {
          setIsFinished(true);
          setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), sender: "system", text: "— Fin del flujo —", timestamp: new Date() },
          ]);
        }
      }, 400);
    },
    [currentNodeId, nodes, getNextNodeId, processNode, scrollToBottom]
  );

  // Auto-start on mount
  useEffect(() => {
    handleStart();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="absolute right-0 top-0 z-50 flex h-full w-96 flex-col border-l border-border bg-background shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 bg-node-send px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/20">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-primary-foreground">Simulador WhatsApp</p>
          <p className="text-xs text-primary-foreground/70">
            {isFinished ? "Flujo finalizado" : waitingForInput ? "Esperando respuesta…" : "En línea"}
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleStart}
            className="text-primary-foreground hover:bg-primary-foreground/20"
            title="Reiniciar"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat area */}
      <div
        className="flex-1 overflow-y-auto px-3 py-4"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5ddd5' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: "hsl(var(--muted))",
        }}
      >
        <div className="space-y-2">
          {messages.map((msg) => {
            if (msg.sender === "system") {
              return (
                <div key={msg.id} className="flex justify-center">
                  <span className="rounded-lg bg-muted px-3 py-1 text-[11px] text-muted-foreground shadow-sm">
                    {msg.text}
                  </span>
                </div>
              );
            }

            const isBot = msg.sender === "bot";
            return (
              <div key={msg.id} className={`flex ${isBot ? "justify-start" : "justify-end"}`}>
                <div
                  className={`relative max-w-[80%] rounded-xl px-3 py-2 shadow-sm ${
                    isBot
                      ? "rounded-tl-sm bg-card text-foreground"
                      : "rounded-tr-sm bg-node-send text-primary-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                  {msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1 border-t border-border/30 pt-2">
                      {msg.quickReplies.map((r, i) => (
                        <button
                          key={i}
                          onClick={() => waitingForInput && handleSendMessage(r)}
                          disabled={!waitingForInput}
                          className="rounded-full border border-node-send/30 bg-transparent px-2.5 py-0.5 text-xs font-medium text-node-send transition-colors hover:bg-node-send/10 disabled:opacity-50"
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className={`mt-1 text-right text-[10px] ${isBot ? "text-muted-foreground" : "text-primary-foreground/60"}`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Category buttons when waiting */}
          {waitingForInput && categories.length > 0 && (
            <div className="flex justify-center">
              <div className="flex flex-wrap justify-center gap-1.5 rounded-xl bg-card/90 px-3 py-2 shadow-sm">
                {categories.map((cat, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(cat)}
                    className="rounded-full border border-node-wait/40 bg-node-wait/10 px-3 py-1 text-xs font-medium text-node-wait transition-colors hover:bg-node-wait/20"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div ref={chatEndRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-border bg-card px-3 py-2">
        <div className="flex items-center gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && waitingForInput) {
                handleSendMessage(inputText);
              }
            }}
            placeholder={waitingForInput ? "Escribe tu respuesta…" : "Esperando al bot…"}
            disabled={!waitingForInput}
            className="flex-1 rounded-full border-border bg-background text-sm"
          />
          <Button
            size="icon"
            onClick={() => handleSendMessage(inputText)}
            disabled={!waitingForInput || !inputText.trim()}
            className="h-9 w-9 shrink-0 rounded-full bg-node-send hover:bg-node-send/90"
          >
            <Send className="h-4 w-4 text-primary-foreground" />
          </Button>
        </div>
      </div>
    </div>
  );
}
