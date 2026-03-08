import { useEffect, useRef } from "react";
import type { StructuralBlock } from "@/types/structuralBlocks";
import { BLOCK_TYPE_CONFIGS } from "@/types/structuralBlocks";
import { Clock, Globe, Save, RefreshCw, User, ArrowRightLeft, Paperclip } from "lucide-react";

interface StructuralBlocksPreviewProps {
  blocks: StructuralBlock[];
}

function BlockBubble({ block, index }: { block: StructuralBlock; index: number }) {
  const p = block.properties;
  const config = BLOCK_TYPE_CONFIGS[block.type];
  const delay = `${index * 60}ms`;

  if (block.type === "message") {
    return (
      <div className="flex justify-end animate-in slide-in-from-right-3 fade-in duration-200" style={{ animationDelay: delay }}>
        <div className="max-w-[80%] rounded-[18px] rounded-br-[4px] bg-[#005c4b] px-3 py-2 shadow-md">
          {p.text ? (
            <p className="text-[13px] text-white leading-[1.45] whitespace-pre-wrap">{p.text}</p>
          ) : (
            <p className="text-[13px] text-white/30 italic">Empty message…</p>
          )}
          {p.attachments && (
            <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-300/50">
              <Paperclip className="h-2.5 w-2.5" /><span>Attachment</span>
            </div>
          )}
          {p.quickReplies && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {p.quickReplies.split(",").map((qr: string, i: number) => (
                <span key={i} className="rounded-full border border-[#00a884]/50 px-2 py-0.5 text-[10px] text-[#00a884]">
                  {qr.trim()}
                </span>
              ))}
            </div>
          )}
          <span className="block text-right text-[9px] text-white/25 mt-0.5">
            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ✓✓
          </span>
        </div>
      </div>
    );
  }

  if (block.type === "wait_response") {
    return (
      <div className="flex justify-start animate-in slide-in-from-left-3 fade-in duration-200" style={{ animationDelay: delay }}>
        <div className="max-w-[70%] rounded-[18px] rounded-bl-[4px] bg-white px-3 py-2 shadow-md">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-amber-500/70" />
            <span className="text-[12px] text-amber-700/80 font-medium">Waiting for reply…</span>
          </div>
          {p.hint && <p className="text-[11px] text-gray-400 mt-0.5">{p.hint}</p>}
          {p.resultName && <p className="text-[9px] text-amber-600/40 font-mono mt-0.5">→ {p.resultName}</p>}
        </div>
      </div>
    );
  }

  if (block.type === "quick_replies") {
    return (
      <div className="animate-in fade-in duration-200" style={{ animationDelay: delay }}>
        <div className="flex justify-end mb-1">
          <div className="max-w-[80%] rounded-[18px] rounded-br-[4px] bg-[#005c4b] px-3 py-2 shadow-md">
            <p className="text-[13px] text-white leading-[1.45]">{p.prompt || "Choose an option:"}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 justify-center">
          {(p.options || "").split(",").filter(Boolean).map((opt: string, i: number) => (
            <span key={i} className="rounded-full border border-[#00a884] bg-transparent px-2.5 py-1 text-[11px] text-[#00a884] font-medium">
              {opt.trim()}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "media") {
    return (
      <div className="flex justify-end animate-in slide-in-from-right-3 fade-in duration-200" style={{ animationDelay: delay }}>
        <div className="max-w-[80%] rounded-[18px] rounded-br-[4px] bg-[#005c4b] px-2 py-1.5 shadow-md">
          {p.url && p.mediaType === "image" ? (
            <img src={p.url} alt={p.caption || ""} className="rounded-xl max-h-32 object-cover" />
          ) : (
            <div className="flex items-center gap-2 bg-black/15 rounded-lg px-2.5 py-2">
              <Paperclip className="h-3.5 w-3.5 text-white/40" />
              <span className="text-[11px] text-white/50">{p.mediaType || "file"}</span>
            </div>
          )}
          {p.caption && <p className="text-[11px] text-white/70 mt-1 px-1">{p.caption}</p>}
        </div>
      </div>
    );
  }

  // System blocks → minimal inline chip
  const systemLabels: Record<string, string> = {
    save_result: p.name ? `💾 ${p.name}` : "💾 Save",
    update_context: p.variable ? `🔄 ${p.variable}` : "🔄 Context",
    update_entity: p.field ? `👤 ${p.entity}.${p.field}` : "👤 Entity",
    split: p.condition ? `🔀 ${p.condition}` : "🔀 Branch",
    webhook: p.url ? `🔗 ${p.method || "POST"}` : "🔗 Webhook",
  };

  return (
    <div className="flex justify-center animate-in fade-in duration-200" style={{ animationDelay: delay }}>
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-800/60 backdrop-blur-sm border border-white/5 px-2.5 py-0.5 text-[10px] text-white/35 font-mono">
        {systemLabels[block.type] || config.label}
      </span>
    </div>
  );
}

export default function StructuralBlocksPreview({ blocks }: StructuralBlocksPreviewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [blocks.length]);

  if (blocks.length === 0) return null;

  // Render as transparent inline bubbles — no container, just the chat bubbles
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end pb-16">
      <div className="mx-auto w-full max-w-[340px] px-3 space-y-1.5 pointer-events-auto">
        {blocks.map((block, i) => (
          <BlockBubble key={block.id} block={block} index={i} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
