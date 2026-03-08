import { useState, useEffect, useRef } from "react";
import { Node, Edge } from "@xyflow/react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useFlowSimulation, ChatMessage } from "@/hooks/useFlowSimulation";
import {
  ArrowLeft, RotateCcw, Send, Phone, Video as VideoIcon, MoreVertical, Smile,
  Paperclip, Mic, Camera, Image as ImageIcon, CheckCheck, Wifi, Battery, Signal,
  Loader2, Play, Search, FileText, Volume2, Film, File,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Json } from "@/integrations/supabase/types";

interface FlowOption {
  id: string;
  name: string;
  status: string;
  updated_at: string;
  nodes: Json;
  edges: Json;
}

export default function PhoneSimulator() {
  const navigate = useNavigate();
  const { tenantId } = useWorkspace();

  // Flow selection state
  const [flowList, setFlowList] = useState<FlowOption[]>([]);
  const [loadingFlows, setLoadingFlows] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFlow, setSelectedFlow] = useState<FlowOption | null>(null);

  // Simulation state
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [ready, setReady] = useState(false);
  const [inputText, setInputText] = useState("");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("waka-simulator-api-key") || "");
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Load flows from DB
  useEffect(() => {
    (async () => {
      setLoadingFlows(true);
      const { data } = await supabase
        .from("flows")
        .select("id, name, status, updated_at, nodes, edges")
        .eq("tenant_id", tenantId)
        .neq("status", "archived")
        .order("updated_at", { ascending: false });
      setFlowList((data as FlowOption[]) || []);
      setLoadingFlows(false);
    })();
  }, [tenantId]);

  // Check sessionStorage for a flow passed from the builder
  useEffect(() => {
    const stored = sessionStorage.getItem("simulator-flow");
    if (stored) {
      try {
        const { nodes: n, edges: e, name } = JSON.parse(stored);
        setNodes(n);
        setEdges(e);
        setSelectedFlow({ id: "session", name: name || "Flujo importado", status: "draft", updated_at: "", nodes: n, edges: e });
        setReady(true);
      } catch { /* ignore */ }
      sessionStorage.removeItem("simulator-flow");
    }
  }, []);

  const handleSelectFlow = (flow: FlowOption) => {
    setSelectedFlow(flow);
    setNodes(flow.nodes as unknown as Node[]);
    setEdges(flow.edges as unknown as Edge[]);
    setReady(true);
  };

  const handleBackToList = () => {
    setSelectedFlow(null);
    setReady(false);
    setNodes([]);
    setEdges([]);
  };

  const defaultHeaders = apiKey ? { "x-api-key": apiKey } : {};

  const { messages, waitingForInput, categories, isFinished, isProcessing, start, sendMessage, sendAttachment } =
    useFlowSimulation(nodes, edges, undefined, {
      executeWebhooks: true,
      defaultHeaders,
      onWebhookExecuted: (url, status, _response) => {
        console.log(`[Simulator] Webhook ${status}: ${url}`);
      },
    });

  useEffect(() => {
    if (ready && nodes.length > 0) start();
  }, [ready]); // eslint-disable-line

  useEffect(() => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [messages.length]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    sendMessage(text);
    setInputText("");
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    sendAttachment(file);
    setShowAttachMenu(false);
    e.target.value = "";
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });

  const now = new Date();
  const timeStr = now.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });

  const filteredFlows = flowList.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Flow picker screen ──
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="relative mx-auto w-[420px]">
          {/* Back */}
          <button
            onClick={() => navigate("/")}
            className="absolute -left-16 top-8 flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-sm text-white/70 backdrop-blur-sm transition hover:bg-white/20 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </button>

          {/* Phone shell */}
          <div className="overflow-hidden rounded-[3rem] border-[6px] border-slate-700 bg-black shadow-2xl shadow-black/50">
            {/* Notch */}
            <div className="relative flex h-12 items-center justify-between bg-black px-8">
              <span className="text-xs font-semibold text-white">{timeStr}</span>
              <div className="absolute left-1/2 top-1 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-black" />
              <div className="flex items-center gap-1">
                <Signal className="h-3 w-3 text-white" />
                <Wifi className="h-3 w-3 text-white" />
                <Battery className="h-3.5 w-3.5 text-white" />
              </div>
            </div>

            {/* Header */}
            <div className="flex items-center gap-3 bg-[#075E54] px-4 py-3">
              <img src="/favicon.png" alt="WAKA" className="h-10 w-10 rounded-full object-cover" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">WAKA Simulator</p>
                <p className="text-[11px] text-white/70">Selecciona un flujo para probar</p>
              </div>
            </div>

            {/* API Key + Search */}
            <div className="bg-[#F0F0F0] px-4 py-2.5 space-y-2">
              <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm">
                <span className="text-[10px] font-medium text-gray-400 shrink-0">🔑</span>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    localStorage.setItem("waka-simulator-api-key", e.target.value);
                  }}
                  placeholder="x-api-key (waka_...)"
                  className="flex-1 bg-transparent text-xs text-gray-800 outline-none placeholder:text-gray-400"
                />
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar flujo…"
                  className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Flow list */}
            <div className="h-[580px] overflow-y-auto bg-white">
              {loadingFlows ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <Loader2 className="h-6 w-6 animate-spin mb-2" />
                  <span className="text-sm">Cargando flujos…</span>
                </div>
              ) : filteredFlows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <span className="text-sm">No se encontraron flujos</span>
                </div>
              ) : (
                filteredFlows.map((flow) => (
                  <button
                    key={flow.id}
                    onClick={() => handleSelectFlow(flow)}
                    className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3.5 text-left transition hover:bg-gray-50 active:bg-gray-100"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366]/15">
                      <Play className="h-4 w-4 text-[#075E54]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{flow.name}</p>
                      <p className="text-[11px] text-gray-400">
                        {flow.status === "active" ? "🟢 Activo" : "📝 Borrador"}
                        {flow.updated_at && ` · ${new Date(flow.updated_at).toLocaleDateString("es")}`}
                      </p>
                    </div>
                    <ArrowLeft className="h-4 w-4 text-gray-300 rotate-180" />
                  </button>
                ))
              )}
            </div>

            {/* Bottom bar */}
            <div className="flex h-8 items-end justify-center bg-white pb-2">
              <div className="h-1 w-32 rounded-full bg-gray-400" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Chat simulation screen ──
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept="*/*" className="hidden" onChange={handleFileSelected} />
      <input ref={imageInputRef} type="file" accept="image/*,video/*" capture="environment" className="hidden" onChange={handleFileSelected} />

      <div className="relative mx-auto w-[420px]">
        {/* Side buttons */}
        <button
          onClick={handleBackToList}
          className="absolute -left-16 top-8 flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-sm text-white/70 backdrop-blur-sm transition hover:bg-white/20 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Flujos
        </button>
        <button
          onClick={start}
          className="absolute -right-16 top-8 flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-sm text-white/70 backdrop-blur-sm transition hover:bg-white/20 hover:text-white"
        >
          <RotateCcw className="h-4 w-4" /> Reiniciar
        </button>
        <div className="absolute -right-16 top-20 rounded-lg bg-green-500/20 px-3 py-1.5 text-[10px] font-semibold text-green-400 backdrop-blur-sm">
          🔴 LIVE MODE
        </div>

        {/* Phone body */}
        <div className="overflow-hidden rounded-[3rem] border-[6px] border-slate-700 bg-black shadow-2xl shadow-black/50">
          {/* Notch */}
          <div className="relative flex h-12 items-center justify-between bg-black px-8">
            <span className="text-xs font-semibold text-white">{timeStr}</span>
            <div className="absolute left-1/2 top-1 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-black" />
            <div className="flex items-center gap-1">
              <Signal className="h-3 w-3 text-white" />
              <Wifi className="h-3 w-3 text-white" />
              <Battery className="h-3.5 w-3.5 text-white" />
            </div>
          </div>

          {/* WhatsApp header */}
          <div className="flex items-center gap-3 bg-[#075E54] px-3 py-2">
            <button onClick={handleBackToList} className="text-white">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <img src="/favicon.png" alt="WAKA" className="h-10 w-10 rounded-full object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{selectedFlow?.name || "WAKA Bot"}</p>
              <p className="text-[11px] text-white/70">
                {isProcessing ? "procesando…" : isFinished ? "sin conexión" : waitingForInput ? "en línea" : "escribiendo…"}
              </p>
            </div>
            <div className="flex items-center gap-4 text-white/80">
              <VideoIcon className="h-5 w-5" />
              <Phone className="h-5 w-5" />
              <MoreVertical className="h-5 w-5" />
            </div>
          </div>

          {/* Chat area — taller */}
          <div
            className="h-[600px] overflow-y-auto px-3 py-3"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23dcd8c0' fill-opacity='0.08'%3E%3Cpath d='M20 20h15v15H20zm30 0h15v15H50zm30 0h15v15H80zm30 0h15v15h-15zm30 0h15v15h-15zm30 0h15v15h-15zm30 0h15v15h-15zm30 0h15v15h-15z'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundColor: "#ECE5DD",
            }}
          >
            {/* Date chip */}
            <div className="mb-3 flex justify-center">
              <span className="rounded-lg bg-white/80 px-3 py-1 text-[11px] text-gray-500 shadow-sm">HOY</span>
            </div>

            {/* Live mode banner */}
            <div className="mb-3 flex justify-center">
              <span className="rounded-lg bg-red-50 border border-red-200 px-3 py-1 text-[10px] text-red-600 shadow-sm font-medium">
                🔴 Modo Live — Las APIs se ejecutan en tiempo real
              </span>
            </div>

            <div className="space-y-1.5">
              {messages.map((msg) => {
                if (msg.sender === "system") {
                  return (
                    <div key={msg.id} className="flex justify-center py-1">
                      <span className="rounded-lg bg-[#E2F7CB]/80 px-3 py-1 text-[11px] text-gray-600 shadow-sm max-w-[90%] text-center">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                const isBot = msg.sender === "bot";
                return (
                  <div key={msg.id} className={`flex ${isBot ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`relative max-w-[85%] rounded-lg px-2.5 py-1.5 shadow-sm ${
                        isBot
                          ? "rounded-tl-none bg-white text-gray-800"
                          : "rounded-tr-none bg-[#DCF8C6] text-gray-800"
                      }`}
                    >
                      <div
                        className={`absolute top-0 h-3 w-3 ${
                          isBot
                            ? "-left-1.5 border-l-[6px] border-t-[6px] border-l-transparent border-t-white"
                            : "-right-1.5 border-r-[6px] border-t-[6px] border-r-transparent border-t-[#DCF8C6]"
                        }`}
                      />

                      {msg.imageUrl && (
                        <div className="mb-1.5 -mx-1 -mt-0.5 overflow-hidden rounded-md">
                          <img src={msg.imageUrl} alt="Attachment" className="w-full max-h-48 object-cover" />
                        </div>
                      )}

                      <p className="whitespace-pre-wrap text-[13.5px] leading-[1.35]">{msg.text}</p>

                      {msg.quickReplies && msg.quickReplies.length > 0 && (
                        <div className="mt-1.5 space-y-1 border-t border-gray-200 pt-1.5">
                          {msg.quickReplies.map((r, i) => (
                            <button
                              key={i}
                              onClick={() => waitingForInput && handleSend(r)}
                              disabled={!waitingForInput}
                              className="block w-full rounded-md border border-[#25D366]/30 py-1.5 text-center text-xs font-medium text-[#075E54] transition hover:bg-[#25D366]/10 disabled:opacity-40"
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="mt-0.5 flex items-center justify-end gap-0.5">
                        <span className="text-[10px] text-gray-400">{formatTime(msg.timestamp)}</span>
                        {!isBot && <CheckCheck className="h-3 w-3 text-[#53BDEB]" />}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Category pills */}
              {waitingForInput && categories.length > 0 && (
                <div className="flex justify-center py-2">
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {categories.map((cat, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(cat)}
                        className="rounded-full bg-[#075E54] px-4 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-[#064E47]"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Processing indicator */}
              {isProcessing && (
                <div className="flex justify-center py-2">
                  <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 shadow-sm">
                    <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                    <span className="text-[11px] text-blue-600 font-medium">Ejecutando API…</span>
                  </div>
                </div>
              )}

              {/* Typing indicator */}
              {!isFinished && !waitingForInput && !isProcessing && messages.length > 0 && (
                <div className="flex justify-start">
                  <div className="rounded-lg rounded-tl-none bg-white px-4 py-2.5 shadow-sm">
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={chatEndRef} />
          </div>

          {/* Input bar */}
          <div className="relative flex items-center gap-2 bg-[#F0F0F0] px-2 py-2">
            <button className="text-gray-500">
              <Smile className="h-6 w-6" />
            </button>
            <div className="flex flex-1 items-center rounded-full bg-white px-4 py-2 shadow-sm">
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && waitingForInput) handleSend(inputText);
                }}
                placeholder={waitingForInput ? "Mensaje" : isProcessing ? "Procesando…" : "Esperando…"}
                disabled={!waitingForInput}
                className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 disabled:opacity-50"
              />
              <button
                className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                disabled={!waitingForInput}
              >
                <Paperclip className="h-5 w-5" />
              </button>
            </div>

            {/* Attachment menu */}
            {showAttachMenu && waitingForInput && (
              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-4 rounded-2xl bg-white px-6 py-4 shadow-xl border border-gray-200">
                <button onClick={() => imageInputRef.current?.click()} className="flex flex-col items-center gap-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500 shadow-md">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-[10px] text-gray-500">Cámara</span>
                </button>
                <button
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (ev) => {
                      const file = (ev.target as HTMLInputElement).files?.[0];
                      if (file) { sendAttachment(file); setShowAttachMenu(false); }
                    };
                    input.click();
                  }}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-500 shadow-md">
                    <ImageIcon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-[10px] text-gray-500">Galería</span>
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 shadow-md">
                    <Paperclip className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-[10px] text-gray-500">Documento</span>
                </button>
              </div>
            )}

            {inputText.trim() ? (
              <button
                onClick={() => handleSend(inputText)}
                disabled={!waitingForInput}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#075E54] text-white shadow-sm transition hover:bg-[#064E47] disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            ) : (
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#075E54] text-white shadow-sm">
                <Mic className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Bottom bar */}
          <div className="flex h-8 items-end justify-center bg-[#F0F0F0] pb-2">
            <div className="h-1 w-32 rounded-full bg-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
