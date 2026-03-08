import { useEffect, useRef } from "react";
import type { StructuralBlock } from "@/types/structuralBlocks";
import { BLOCK_TYPE_CONFIGS } from "@/types/structuralBlocks";
import { MessageSquare, Clock, Globe, Save, RefreshCw, User, ArrowRightLeft, Paperclip, CircleDot } from "lucide-react";

interface StructuralBlocksPreviewProps {
  blocks: StructuralBlock[];
}

function BlockBubble({ block, index }: { block: StructuralBlock; index: number }) {
  const p = block.properties;
  const config = BLOCK_TYPE_CONFIGS[block.type];

  // Message → outgoing WhatsApp bubble
  if (block.type === "message") {
    return (
      <div className="flex justify-end animate-in slide-in-from-right-4 fade-in duration-300" style={{ animationDelay: `${index * 80}ms` }}>
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[#005c4b] px-3.5 py-2.5 shadow-lg">
          {p.text ? (
            <p className="text-[13px] text-white leading-relaxed whitespace-pre-wrap">{p.text}</p>
          ) : (
            <p className="text-[13px] text-white/40 italic">Empty message…</p>
          )}
          {p.attachments && (
            <div className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-300/60">
              <Paperclip className="h-3 w-3" />
              <span>Attachment</span>
            </div>
          )}
          {p.quickReplies && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {p.quickReplies.split(",").map((qr: string, i: number) => (
                <span key={i} className="rounded-full border border-[#00a884]/60 px-2.5 py-0.5 text-[11px] text-[#00a884] font-medium">
                  {qr.trim()}
                </span>
              ))}
            </div>
          )}
          <span className="block text-right text-[9px] text-white/30 mt-1">
            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ✓✓
          </span>
        </div>
      </div>
    );
  }

  // Wait for response → incoming placeholder
  if (block.type === "wait_response") {
    return (
      <div className="flex justify-start animate-in slide-in-from-left-4 fade-in duration-300" style={{ animationDelay: `${index * 80}ms` }}>
        <div className="max-w-[75%] rounded-2xl rounded-bl-md bg-[#1f2c33] px-3.5 py-2.5 shadow-lg border border-white/5">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-amber-400/70" />
            <span className="text-[12px] text-amber-400/70 font-medium">Waiting for user response…</span>
          </div>
          {p.hint && <p className="text-[11px] text-white/30 mt-1">{p.hint}</p>}
          {p.resultName && (
            <p className="text-[10px] text-amber-500/40 font-mono mt-1">→ {p.resultName}</p>
          )}
        </div>
      </div>
    );
  }

  // Quick replies
  if (block.type === "quick_replies") {
    return (
      <div className="animate-in fade-in duration-300" style={{ animationDelay: `${index * 80}ms` }}>
        <div className="flex justify-end mb-1.5">
          <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[#005c4b] px-3.5 py-2.5 shadow-lg">
            <p className="text-[13px] text-white leading-relaxed">{p.prompt || "Choose an option:"}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 justify-center">
          {(p.options || "").split(",").filter(Boolean).map((opt: string, i: number) => (
            <button key={i} className="rounded-full border border-[#00a884]/50 bg-[#1f2c33] px-3 py-1.5 text-[12px] text-[#00a884] font-medium hover:bg-[#00a884]/10 transition">
              {opt.trim()}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Media
  if (block.type === "media") {
    return (
      <div className="flex justify-end animate-in slide-in-from-right-4 fade-in duration-300" style={{ animationDelay: `${index * 80}ms` }}>
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[#005c4b] px-3 py-2 shadow-lg">
          {p.url && p.mediaType === "image" ? (
            <img src={p.url} alt={p.caption || "Media"} className="rounded-lg max-h-40 object-cover mb-1" />
          ) : (
            <div className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2.5">
              <Paperclip className="h-4 w-4 text-white/50" />
              <span className="text-[12px] text-white/60">{p.mediaType || "file"}: {p.url || "No file"}</span>
            </div>
          )}
          {p.caption && <p className="text-[12px] text-white/80 mt-1">{p.caption}</p>}
        </div>
      </div>
    );
  }

  // System-style blocks (save_result, update_context, update_entity, split, webhook)
  const systemIcons: Record<string, React.ReactNode> = {
    save_result: <Save className="h-3 w-3" />,
    update_context: <RefreshCw className="h-3 w-3" />,
    update_entity: <User className="h-3 w-3" />,
    split: <ArrowRightLeft className="h-3 w-3" />,
    webhook: <Globe className="h-3 w-3" />,
  };

  const systemLabels: Record<string, string> = {
    save_result: p.name ? `💾 Save: ${p.name} = ${p.value || "…"}` : "💾 Save result",
    update_context: p.variable ? `🔄 Context: ${p.variable} ← ${p.value || "…"}` : "🔄 Update context",
    update_entity: p.field ? `👤 ${p.entity}.${p.field} ← ${p.value || "…"}` : "👤 Update entity",
    split: p.condition ? `🔀 If ${p.condition} ${p.operand} ${p.value}` : "🔀 Branch",
    webhook: p.url ? `🔗 ${p.method || "POST"} ${p.url}` : "🔗 Webhook",
  };

  return (
    <div className="flex justify-center animate-in fade-in duration-300" style={{ animationDelay: `${index * 80}ms` }}>
      <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 backdrop-blur-sm">
        <span className={`${config.color}`}>{systemIcons[block.type]}</span>
        <span className="text-[11px] text-white/40 font-mono">{systemLabels[block.type] || config.label}</span>
      </div>
    </div>
  );
}

export default function StructuralBlocksPreview({ blocks }: StructuralBlocksPreviewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [blocks.length]);

  if (blocks.length === 0) return null;

  return (
    <div className="mx-auto w-full max-w-md mt-4 mb-6">
      {/* WhatsApp-style chat container */}
      <div className="rounded-2xl border border-white/10 bg-[#0b141a] overflow-hidden shadow-2xl">
        {/* Chat header */}
        <div className="flex items-center gap-3 bg-[#202c33] px-4 py-2.5 border-b border-white/5">
          <div className="h-8 w-8 rounded-full bg-[#00a884]/20 flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-[#00a884]" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-white/90">Structure Preview</p>
            <p className="text-[10px] text-white/30">{blocks.length} step{blocks.length !== 1 ? "s" : ""} · Live</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <CircleDot className="h-3 w-3 text-emerald-400 animate-pulse" />
            <span className="text-[9px] text-emerald-400/70 font-medium">LIVE</span>
          </div>
        </div>

        {/* Messages area */}
        <div
          className="px-3 py-3 space-y-2.5 max-h-[50vh] overflow-auto"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        >
          {/* Date separator */}
          <div className="flex justify-center mb-1">
            <span className="rounded-lg bg-[#1f2c33] px-3 py-0.5 text-[10px] text-white/30 font-medium">
              Today
            </span>
          </div>

          {blocks.map((block, i) => (
            <BlockBubble key={block.id} block={block} index={i} />
          ))}

          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
