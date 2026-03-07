import { useState, useEffect, useCallback, useRef } from "react";
import { Node, Edge } from "@xyflow/react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw, Send, Phone, Video, MoreVertical, Smile, Paperclip, Mic, Check, CheckCheck, Wifi, Battery, Signal } from "lucide-react";
import { useFlowSimulation, ChatMessage } from "@/hooks/useFlowSimulation";

export default function PhoneSimulator() {
  const navigate = useNavigate();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load flow data from sessionStorage (set by FlowEditor)
  useEffect(() => {
    const data = sessionStorage.getItem("simulator-flow");
    if (data) {
      const { nodes: n, edges: e } = JSON.parse(data);
      setNodes(n);
      setEdges(e);
      setLoaded(true);
    }
  }, []);

  const { messages, waitingForInput, categories, isFinished, start, sendMessage } =
    useFlowSimulation(nodes, edges);

  useEffect(() => {
    if (loaded && nodes.length > 0) start();
  }, [loaded]); // eslint-disable-line

  useEffect(() => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [messages.length]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    sendMessage(text);
    setInputText("");
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });

  const now = new Date();
  const timeStr = now.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Phone frame */}
      <div className="relative mx-auto w-[375px]">
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="absolute -left-16 top-8 flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-sm text-white/70 backdrop-blur-sm transition hover:bg-white/20 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </button>

        {/* Restart button */}
        <button
          onClick={start}
          className="absolute -right-16 top-8 flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-sm text-white/70 backdrop-blur-sm transition hover:bg-white/20 hover:text-white"
        >
          <RotateCcw className="h-4 w-4" /> Reiniciar
        </button>

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
            <button onClick={() => navigate("/")} className="text-white">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366]">
              <span className="text-lg">🤖</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Bot WhatsApp</p>
              <p className="text-[11px] text-white/70">
                {isFinished ? "sin conexión" : waitingForInput ? "esperando respuesta" : "escribiendo…"}
              </p>
            </div>
            <div className="flex items-center gap-4 text-white/80">
              <Video className="h-5 w-5" />
              <Phone className="h-5 w-5" />
              <MoreVertical className="h-5 w-5" />
            </div>
          </div>

          {/* Chat area */}
          <div
            className="h-[520px] overflow-y-auto px-3 py-3"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23dcd8c0' fill-opacity='0.08'%3E%3Cpath d='M20 20h15v15H20zm30 0h15v15H50zm30 0h15v15H80zm30 0h15v15h-15zm30 0h15v15h-15zm30 0h15v15h-15zm30 0h15v15h-15zm30 0h15v15h-15z'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundColor: "#ECE5DD",
            }}
          >
            {/* Date chip */}
            <div className="mb-3 flex justify-center">
              <span className="rounded-lg bg-white/80 px-3 py-1 text-[11px] text-gray-500 shadow-sm">
                HOY
              </span>
            </div>

            <div className="space-y-1.5">
              {messages.map((msg) => {
                if (msg.sender === "system") {
                  return (
                    <div key={msg.id} className="flex justify-center py-1">
                      <span className="rounded-lg bg-[#E2F7CB]/80 px-3 py-1 text-[11px] text-gray-600 shadow-sm">
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
                      {/* Tail */}
                      <div
                        className={`absolute top-0 h-3 w-3 ${
                          isBot
                            ? "-left-1.5 border-l-[6px] border-t-[6px] border-l-transparent border-t-white"
                            : "-right-1.5 border-r-[6px] border-t-[6px] border-r-transparent border-t-[#DCF8C6]"
                        }`}
                      />
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

              {/* Typing indicator */}
              {!isFinished && !waitingForInput && messages.length > 0 && (
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
          <div className="flex items-center gap-2 bg-[#F0F0F0] px-2 py-2">
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
                placeholder={waitingForInput ? "Mensaje" : "Esperando…"}
                disabled={!waitingForInput}
                className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 disabled:opacity-50"
              />
              <button className="ml-2 text-gray-400">
                <Paperclip className="h-5 w-5" />
              </button>
            </div>
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

          {/* Bottom bar (home indicator) */}
          <div className="flex h-8 items-end justify-center bg-[#F0F0F0] pb-2">
            <div className="h-1 w-32 rounded-full bg-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
