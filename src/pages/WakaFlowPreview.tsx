import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Send, Loader2, RotateCcw, ChevronLeft, ChevronRight,
  Eye, Code, Copy, Check, Upload, FolderOpen, X, LayoutGrid,
  GitBranch, Image, Paperclip, History,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import RuntimeJSXRenderer from "@/demos/RuntimeJSXRenderer";
import { useUploadedDemos } from "@/hooks/useUploadedDemos";
import { BUILTIN_DEMOS, type UploadedDemo } from "@/demos/registry";
import AIEngineSelector, { EngineBadge, type EngineSelection, type EngineId } from "@/components/demos/AIEngineSelector";

/* ── Types ──────────────────────────────────────── */
interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  imageUrl?: string;
}

interface ArtifactVersion {
  id: string;
  jsx: string;
  label: string;
  timestamp: string;
  engine?: EngineId;
}

interface Variant {
  id: string;
  name: string;
  versions: ArtifactVersion[];
  versionIndex: number;
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

const makeVariant = (name: string, jsx: string): Variant => ({
  id: `var-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  name,
  versions: [{ id: "v0", jsx, label: "Initial", timestamp: new Date().toISOString() }],
  versionIndex: 0,
});

/* ── Component ──────────────────────────────────── */
export default function WakaFlowPreview() {
  /* ── Variants state ── */
  const [variants, setVariants] = useState<Variant[]>([makeVariant("Main", STARTER_JSX)]);
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);

  const activeVariant = variants[activeVariantIndex];
  const versions = activeVariant.versions;
  const versionIndex = activeVariant.versionIndex;
  const currentJsx = versions[versionIndex]?.jsx || STARTER_JSX;

  /* ── Chat state ── */
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "system",
      content: "Welcome to the Demo Builder. Describe what you want to create, upload a JSX file, attach images for reference, or load an existing demo.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [copied, setCopied] = useState(false);
  const [showDemoPicker, setShowDemoPicker] = useState(false);
  const [showVersionList, setShowVersionList] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<{ name: string; url: string }[]>([]);
  const [engineSelection, setEngineSelection] = useState<EngineSelection>({ engineId: "waka-ai" });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { demos: uploadedDemos } = useUploadedDemos();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── Helpers ── */
  const addMessage = useCallback((role: ChatMessage["role"], content: string, imageUrl?: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `msg-${Date.now()}`, role, content, timestamp: new Date().toISOString(), imageUrl },
    ]);
  }, []);

  const updateVariant = useCallback((updater: (v: Variant) => Variant) => {
    setVariants((prev) => prev.map((v, i) => i === activeVariantIndex ? updater(v) : v));
  }, [activeVariantIndex]);

  const setVersionIdx = useCallback((idx: number) => {
    updateVariant((v) => ({ ...v, versionIndex: idx }));
  }, [updateVariant]);

  const pushVersion = useCallback((jsx: string, label: string, engine?: EngineId) => {
    const newV: ArtifactVersion = { id: `v${Date.now()}`, jsx, label, timestamp: new Date().toISOString(), engine };
    updateVariant((v) => {
      const next = [...v.versions.slice(0, v.versionIndex + 1), newV];
      return { ...v, versions: next, versionIndex: next.length - 1 };
    });
  }, [updateVariant]);

  /* ── Load JSX (file or demo) ── */
  const loadJsx = useCallback((jsx: string, label: string) => {
    pushVersion(jsx, label);
    addMessage("system", `Loaded "${label}" as the active artifact. You can now iterate on it.`);
  }, [addMessage, pushVersion]);

  /* ── File upload (JSX) ── */
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.match(/\.(jsx|tsx|js|ts)$/i)) {
      toast.error("Please upload a .jsx or .tsx file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        loadJsx(content, file.name.replace(/\.(jsx|tsx|js|ts)$/i, ""));
        toast.success(`Loaded ${file.name}`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, [loadJsx]);

  /* ── Image upload ── */
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      // Upload to Supabase storage
      const ext = file.name.split(".").pop() || "png";
      const path = `demo-builder/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
      const { error } = await supabase.storage.from("flow-attachments").upload(path, file);
      if (error) {
        toast.error(`Failed to upload ${file.name}`);
        console.error(error);
        continue;
      }
      const { data: urlData } = supabase.storage.from("flow-attachments").getPublicUrl(path);
      const url = urlData.publicUrl;
      setUploadedImages((prev) => [...prev, { name: file.name, url }]);
      addMessage("system", `Image uploaded: ${file.name}`, url);
      toast.success(`Uploaded ${file.name} — use the URL in your prompt or the AI will reference it.`);
    }
    e.target.value = "";
  }, [addMessage]);

  /* ── Load existing demo ── */
  const handleLoadDemo = useCallback((demo: UploadedDemo) => {
    loadJsx(demo.jsxSource, demo.title);
    setShowDemoPicker(false);
    toast.success(`Loaded demo: ${demo.title}`);
  }, [loadJsx]);

  /* ── Create variant ── */
  const handleCreateVariant = useCallback(() => {
    const name = `Variant ${String.fromCharCode(65 + variants.length)}`;
    const newVar = makeVariant(name, currentJsx);
    setVariants((prev) => [...prev, newVar]);
    setActiveVariantIndex(variants.length);
    addMessage("system", `Created "${name}" from the current artifact. You can now explore a different direction.`);
    toast.success(`Created ${name}`);
  }, [variants.length, currentJsx, addMessage]);

  /* ── Send prompt ── */
  const handleSend = useCallback(async () => {
    const prompt = input.trim();
    if (!prompt || isGenerating) return;

    setInput("");
    addMessage("user", prompt);
    setIsGenerating(true);

    // Include uploaded image URLs in context if any
    const imageContext = uploadedImages.length > 0
      ? `\n\nAvailable uploaded images:\n${uploadedImages.map((img) => `- ${img.name}: ${img.url}`).join("\n")}`
      : "";

    try {
      const { data, error } = await supabase.functions.invoke("waka-ai-apply", {
        body: {
          jsxSource: currentJsx,
          proposals: [{ prompt: prompt + imageContext, summary: prompt.slice(0, 80) }],
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const modifiedJsx = data.modifiedJsx;
      if (!modifiedJsx) throw new Error("No JSX returned");

      pushVersion(modifiedJsx, prompt.slice(0, 50), engineSelection.engineId);
      addMessage("assistant", `Done — applied "${prompt.slice(0, 60)}${prompt.length > 60 ? "…" : ""}". The demo has been updated.`);
    } catch (err: any) {
      console.error("AI apply error:", err);
      const msg = err?.message || "Something went wrong";
      addMessage("assistant", `⚠️ ${msg}`);
      toast.error("Failed to apply changes", { description: msg });
    } finally {
      setIsGenerating(false);
    }
  }, [input, isGenerating, currentJsx, pushVersion, addMessage, uploadedImages, engineSelection]);

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
      {/* Hidden inputs */}
      <input ref={fileInputRef} type="file" accept=".jsx,.tsx,.js,.ts" className="hidden" onChange={handleFileUpload} />
      <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-background/80 backdrop-blur-sm shrink-0 gap-2">
        {/* Left: title + variant tabs */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground tracking-tight shrink-0">Demo Builder</span>
          <Badge variant="outline" className="text-[9px] uppercase tracking-widest font-semibold border-primary/30 text-primary shrink-0">
            Sandbox
          </Badge>

          {/* Variant tabs */}
          <div className="flex items-center gap-0.5 ml-2 bg-secondary/40 rounded-lg p-0.5 shrink-0">
            {variants.map((v, i) => (
              <button
                key={v.id}
                onClick={() => setActiveVariantIndex(i)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition truncate max-w-[100px] ${
                  i === activeVariantIndex
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title={v.name}
              >
                {v.name}
              </button>
            ))}
            <button
              onClick={handleCreateVariant}
              className="p-1 rounded-md text-muted-foreground/50 hover:text-primary hover:bg-primary/10 transition"
              title="Create variant from current"
            >
              <GitBranch className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Center: version nav */}
        <div className="flex items-center gap-1.5 shrink-0">
          {versions.length > 1 && (
            <>
              <button
                onClick={() => setShowVersionList(!showVersionList)}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition"
                title="Version history"
              >
                <History className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setVersionIdx(versionIndex - 1)}
                disabled={!canGoBack}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-20 transition"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
            </>
          )}
          <div className="flex items-center gap-1.5 bg-secondary/60 rounded-lg px-2.5 py-1 min-w-0">
            <span className="text-[10px] text-muted-foreground font-mono shrink-0">
              v{versionIndex + 1}/{versions.length}
            </span>
            <span className="text-[10px] text-foreground/70 truncate max-w-[120px]">
              {versions[versionIndex]?.label}
            </span>
            {versions[versionIndex]?.engine && (
              <EngineBadge engineId={versions[versionIndex].engine!} />
            )}
          </div>
          {versions.length > 1 && (
            <>
              <button
                onClick={() => setVersionIdx(versionIndex + 1)}
                disabled={!canGoForward}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-20 transition"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
              {canGoForward && (
                <button
                  onClick={() => {
                    const restored = versions[versionIndex];
                    pushVersion(restored.jsx, `Restored: ${restored.label}`);
                    toast.success("Version restored");
                  }}
                  className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary hover:bg-primary/20 transition"
                >
                  <RotateCcw className="h-2.5 w-2.5" /> Restore
                </button>
              )}
            </>
          )}
        </div>

        {/* Right: engine selector + view toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <AIEngineSelector selection={engineSelection} onSelect={setEngineSelection} />

          <div className="w-px h-5 bg-border/30" />

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
      </div>

      {/* ── Main split pane ── */}
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
                    {msg.imageUrl && (
                      <img
                        src={msg.imageUrl}
                        alt="uploaded"
                        className="rounded-lg mb-2 max-h-32 object-cover"
                      />
                    )}
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

          {/* Uploaded images strip */}
          {uploadedImages.length > 0 && (
            <div className="px-3 py-1.5 border-t border-border/20 flex items-center gap-2 overflow-x-auto">
              <Image className="h-3 w-3 text-muted-foreground/50 shrink-0" />
              {uploadedImages.map((img, i) => (
                <div key={i} className="relative group shrink-0">
                  <img src={img.url} alt={img.name} className="h-8 w-8 rounded-md object-cover border border-border/50" />
                  <button
                    onClick={() => setUploadedImages((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="h-2 w-2" />
                  </button>
                </div>
              ))}
              <span className="text-[9px] text-muted-foreground/40 shrink-0">
                {uploadedImages.length} asset{uploadedImages.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {/* Source actions bar */}
          <div className="flex items-center gap-1.5 px-3 py-2 border-t border-border/30">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition border border-border/50"
            >
              <Upload className="h-3 w-3" />
              Upload JSX
            </button>
            <button
              onClick={() => imageInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition border border-border/50"
            >
              <Paperclip className="h-3 w-3" />
              Attach Image
            </button>
            <button
              onClick={() => setShowDemoPicker(true)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition border border-border/50"
            >
              <FolderOpen className="h-3 w-3" />
              Load Demo
            </button>
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
                className="pr-12 min-h-[56px] max-h-[140px] resize-none rounded-xl bg-secondary/40 border-border/50 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary/30"
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
        <div className="flex-1 flex flex-col bg-muted/20 overflow-hidden relative">
          {viewMode === "preview" ? (
            <div className="flex-1 overflow-auto">
              <RuntimeJSXRenderer jsxSource={currentJsx} demoId={`demo-builder-${activeVariant.id}`} />
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

          {/* ── Version history dropdown ── */}
          <AnimatePresence>
            {showVersionList && versions.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-0 left-0 right-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border/40 max-h-[280px] overflow-y-auto"
              >
                <div className="flex items-center justify-between px-4 py-2 border-b border-border/30">
                  <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                    <History className="h-3.5 w-3.5 text-primary" />
                    Version History — {activeVariant.name}
                  </span>
                  <button
                    onClick={() => setShowVersionList(false)}
                    className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="p-2 space-y-0.5">
                  {versions.map((ver, i) => (
                    <button
                      key={ver.id}
                      onClick={() => { setVersionIdx(i); setShowVersionList(false); }}
                      className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left transition ${
                        i === versionIndex
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-secondary/60"
                      }`}
                    >
                      <span className={`text-[10px] font-mono font-bold shrink-0 ${i === versionIndex ? "text-primary" : "text-muted-foreground"}`}>
                        v{i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground truncate">{ver.label}</p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                          {new Date(ver.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {ver.engine && (
                            <>
                              <span className="text-muted-foreground/20">·</span>
                              <EngineBadge engineId={ver.engine} />
                            </>
                          )}
                        </p>
                      </div>
                      {i === versionIndex && (
                        <Badge variant="outline" className="text-[8px] border-primary/30 text-primary shrink-0">Current</Badge>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Demo picker overlay ── */}
          <AnimatePresence>
            {showDemoPicker && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 bg-background/95 backdrop-blur-sm flex flex-col"
              >
                <div className="flex items-center justify-between px-5 py-3 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Load existing demo</span>
                  </div>
                  <button
                    onClick={() => setShowDemoPicker(false)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5">
                  {uploadedDemos.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-3">
                        Your Demos
                      </h3>
                      <div className="grid grid-cols-2 gap-2.5">
                        {uploadedDemos.map((demo) => (
                          <button
                            key={demo.id}
                            onClick={() => handleLoadDemo(demo)}
                            className="flex items-start gap-3 rounded-xl border border-border/50 bg-background p-3 text-left hover:border-primary/40 hover:bg-primary/[0.03] transition group"
                          >
                            <span className="text-xl shrink-0">{demo.icon}</span>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition">
                                {demo.title}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                                {demo.description}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <Badge variant="outline" className="text-[8px] capitalize">{demo.status}</Badge>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-3">
                      Built-in Demos
                    </h3>
                    <div className="grid grid-cols-2 gap-2.5">
                      {BUILTIN_DEMOS.map((demo) => (
                        <div
                          key={demo.id}
                          className="flex items-start gap-3 rounded-xl border border-border/30 bg-secondary/20 p-3 text-left opacity-60"
                        >
                          <span className="text-xl shrink-0">{demo.icon}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{demo.title}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{demo.description}</p>
                            <p className="text-[9px] text-muted-foreground/50 mt-1 italic">Built-in · open in Demos page</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {uploadedDemos.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">No uploaded demos yet.</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Upload a JSX file or create demos from the Demos page.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
