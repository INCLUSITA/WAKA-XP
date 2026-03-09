import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Loader2, RotateCcw, ChevronLeft, ChevronRight, Plus, Eye, Code, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import RuntimeJSXRenderer from "@/demos/RuntimeJSXRenderer";

/* ── Types ──────────────────────────────────────── */
interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

interface ArtifactVersion {
  id: string;
  jsx: string;
  label: string;
  timestamp: string;
}

/* ── Default starter JSX ────────────────────────── */
const STARTER_JSX = `export default function Demo() {
  const [count, setCount] = useState(0);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      color: "#e2e8f0",
      fontFamily: "system-ui, sans-serif",
      gap: 24,
    }}>
      <div style={{ fontSize: 48 }}>✨</div>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Your Demo</h1>
      <p style={{ color: "#94a3b8", fontSize: 14, maxWidth: 400, textAlign: "center", lineHeight: 1.6 }}>
        Describe what you want to build and the AI will generate it for you.
        Then iterate conversationally to refine it.
      </p>
      <button
        onClick={() => setCount(c => c + 1)}
        style={{
          padding: "10px 28px",
          borderRadius: 8,
          border: "none",
          background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
          color: "#fff",
          fontWeight: 600,
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        Clicked {count} times
      </button>
    </div>
  );
}`;

/* ── Component ──────────────────────────────────── */
export default function WakaFlowPreview() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "system",
      content: "Welcome to the Demo Builder. Describe what you want to create and I'll generate a live demo for you.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [versions, setVersions] = useState<ArtifactVersion[]>([
    { id: "v0", jsx: STARTER_JSX, label: "Starter", timestamp: new Date().toISOString() },
  ]);
  const [versionIndex, setVersionIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentJsx = versions[versionIndex]?.jsx || STARTER_JSX;

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = useCallback((role: ChatMessage["role"], content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `msg-${Date.now()}`, role, content, timestamp: new Date().toISOString() },
    ]);
  }, []);

  const handleSend = useCallback(async () => {
    const prompt = input.trim();
    if (!prompt || isGenerating) return;

    setInput("");
    addMessage("user", prompt);
    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("waka-ai-apply", {
        body: {
          jsxSource: currentJsx,
          proposals: [{ prompt, summary: prompt.slice(0, 80) }],
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const modifiedJsx = data.modifiedJsx;
      if (!modifiedJsx) throw new Error("No JSX returned");

      // Add new version
      const newVersion: ArtifactVersion = {
        id: `v${Date.now()}`,
        jsx: modifiedJsx,
        label: prompt.slice(0, 50),
        timestamp: new Date().toISOString(),
      };

      setVersions((prev) => {
        const next = [...prev.slice(0, versionIndex + 1), newVersion];
        setVersionIndex(next.length - 1);
        return next;
      });

      addMessage("assistant", `Done — applied "${prompt.slice(0, 60)}${prompt.length > 60 ? "…" : ""}". The demo has been updated.`);
    } catch (err: any) {
      console.error("AI apply error:", err);
      const msg = err?.message || "Something went wrong";
      addMessage("assistant", `⚠️ ${msg}`);
      toast.error("Failed to apply changes", { description: msg });
    } finally {
      setIsGenerating(false);
    }
  }, [input, isGenerating, currentJsx, versionIndex, addMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentJsx);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const canGoBack = versionIndex > 0;
  const canGoForward = versionIndex < versions.length - 1;

  return (
    <div className="h-[calc(100vh-2.5rem)] flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-background/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground tracking-tight">Demo Builder</span>
          <Badge variant="outline" className="text-[9px] uppercase tracking-widest font-semibold border-primary/30 text-primary">
            AI
          </Badge>
        </div>

        {/* Version nav */}
        {versions.length > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setVersionIndex((i) => i - 1)}
              disabled={!canGoBack}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-20 transition"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-[11px] text-muted-foreground font-mono min-w-[3ch] text-center">
              v{versionIndex + 1}/{versions.length}
            </span>
            <button
              onClick={() => setVersionIndex((i) => i + 1)}
              disabled={!canGoForward}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-20 transition"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <span className="text-[10px] text-muted-foreground truncate max-w-[140px] ml-1">
              {versions[versionIndex]?.label}
            </span>
            {versionIndex < versions.length - 1 && (
              <button
                onClick={() => {
                  const restored = versions[versionIndex];
                  const newV: ArtifactVersion = {
                    id: `v${Date.now()}`,
                    jsx: restored.jsx,
                    label: `Restored: ${restored.label}`,
                    timestamp: new Date().toISOString(),
                  };
                  setVersions((prev) => [...prev, newV]);
                  setVersionIndex(versions.length);
                  toast.success("Version restored");
                }}
                className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary hover:bg-primary/20 transition ml-1"
              >
                <RotateCcw className="h-2.5 w-2.5" /> Restore
              </button>
            )}
          </div>
        )}

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("preview")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition ${viewMode === "preview" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Eye className="h-3 w-3" /> Preview
          </button>
          <button
            onClick={() => setViewMode("code")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition ${viewMode === "code" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Code className="h-3 w-3" /> Code
          </button>
        </div>
      </div>

      {/* Main split pane */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Chat */}
        <div className="w-[380px] min-w-[320px] flex flex-col border-r border-border/40 bg-background">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : msg.role === "system"
                        ? "bg-secondary/60 text-muted-foreground rounded-bl-md italic"
                        : "bg-secondary text-foreground rounded-bl-md"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isGenerating && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-secondary text-muted-foreground rounded-2xl rounded-bl-md px-3.5 py-2.5 text-[13px] flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Generating…
                </div>
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border/40">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder="Describe what to build or change…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isGenerating}
                className="pr-12 min-h-[56px] max-h-[140px] resize-none rounded-xl bg-secondary/40 border-border/50 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-primary/30"
                rows={2}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || isGenerating}
                className="absolute right-2 bottom-2 h-8 w-8 rounded-lg"
              >
                {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground/50 mt-1.5 px-1">
              Shift+Enter for new line · Enter to send
            </p>
          </div>
        </div>

        {/* Right: Artifact */}
        <div className="flex-1 flex flex-col bg-muted/20 overflow-hidden">
          {viewMode === "preview" ? (
            <div className="flex-1 overflow-auto">
              <RuntimeJSXRenderer
                jsxSource={currentJsx}
                demoId="demo-builder"
              />
            </div>
          ) : (
            <div className="flex-1 overflow-auto relative">
              <button
                onClick={handleCopyCode}
                className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition border border-border/50"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <pre className="p-5 text-[12px] leading-relaxed text-foreground/80 font-mono whitespace-pre-wrap break-words">
                {currentJsx}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
