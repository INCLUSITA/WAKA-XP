import { useEffect, useRef } from "react";
import type { StructuralBlock } from "@/types/structuralBlocks";
import { BLOCK_TYPE_CONFIGS } from "@/types/structuralBlocks";
import { Clock, Globe, Save, RefreshCw, User, ArrowRightLeft, Paperclip, Webhook, Database, GitBranch } from "lucide-react";

interface StructuralBlocksPreviewProps {
  blocks: StructuralBlock[];
}

/* ─── Individual block renderers ─── */

function MessageBubble({ block, index }: { block: StructuralBlock; index: number }) {
  const p = block.properties;
  const delay = `${index * 80}ms`;
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex justify-end animate-in slide-in-from-right-4 fade-in duration-300" style={{ animationDelay: delay }}>
      <div className="max-w-[82%] rounded-2xl rounded-br-sm bg-[#005c4b] px-3.5 py-2 shadow-lg shadow-black/20">
        {p.text ? (
          <p className="text-[13.5px] text-white leading-[1.5] whitespace-pre-wrap">{p.text}</p>
        ) : (
          <p className="text-[13px] text-white/25 italic">Empty message…</p>
        )}
        {p.attachments && (
          <div className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-black/15 px-2 py-1.5">
            <Paperclip className="h-3 w-3 text-emerald-300/60" />
            <span className="text-[10px] text-emerald-300/60 truncate">{p.attachments}</span>
          </div>
        )}
        {p.quickReplies && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {p.quickReplies.split(",").map((qr: string, i: number) => (
              <span key={i} className="rounded-full border border-[#00a884]/60 px-2.5 py-0.5 text-[11px] text-[#00a884] font-medium cursor-pointer hover:bg-[#00a884]/10 transition">
                {qr.trim()}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-end gap-1 mt-1">
          {p.channel && p.channel !== "whatsapp" && (
            <span className="text-[8px] text-white/20 uppercase tracking-wider">{p.channel}</span>
          )}
          <span className="text-[9px] text-white/25">{time}</span>
          <span className="text-[9px] text-[#53bdeb]">✓✓</span>
        </div>
      </div>
    </div>
  );
}

function WaitResponseBubble({ block, index }: { block: StructuralBlock; index: number }) {
  const p = block.properties;
  const delay = `${index * 80}ms`;

  return (
    <div className="flex justify-start animate-in slide-in-from-left-4 fade-in duration-300" style={{ animationDelay: delay }}>
      <div className="max-w-[75%] rounded-2xl rounded-bl-sm bg-[#202c33] border border-white/5 px-3.5 py-2.5 shadow-lg shadow-black/20">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex gap-0.5">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-400/80 animate-pulse" />
            <div className="h-1.5 w-1.5 rounded-full bg-amber-400/60 animate-pulse" style={{ animationDelay: "150ms" }} />
            <div className="h-1.5 w-1.5 rounded-full bg-amber-400/40 animate-pulse" style={{ animationDelay: "300ms" }} />
          </div>
          <span className="text-[12px] text-amber-400/80 font-semibold">Waiting for reply</span>
        </div>
        {p.hint && (
          <p className="text-[11.5px] text-white/40 leading-snug">{p.hint}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          {p.validationType && p.validationType !== "any" && (
            <span className="rounded-md bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 text-[9px] text-amber-400/70 font-mono">
              {p.validationType}
            </span>
          )}
          {p.timeout && (
            <span className="text-[9px] text-white/20 flex items-center gap-0.5">
              <Clock className="h-2.5 w-2.5" /> {p.timeout}
            </span>
          )}
          {p.resultName && (
            <span className="text-[9px] text-amber-500/40 font-mono ml-auto">→ {p.resultName}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickRepliesBubble({ block, index }: { block: StructuralBlock; index: number }) {
  const p = block.properties;
  const delay = `${index * 80}ms`;
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const options = (p.options || "").split(",").filter(Boolean);

  return (
    <div className="animate-in fade-in duration-300 space-y-1.5" style={{ animationDelay: delay }}>
      {/* Prompt message */}
      {p.prompt && (
        <div className="flex justify-end">
          <div className="max-w-[82%] rounded-2xl rounded-br-sm bg-[#005c4b] px-3.5 py-2 shadow-lg shadow-black/20">
            <p className="text-[13.5px] text-white leading-[1.5]">{p.prompt}</p>
            <span className="block text-right text-[9px] text-white/25 mt-0.5">{time} <span className="text-[#53bdeb]">✓✓</span></span>
          </div>
        </div>
      )}
      {/* Interactive buttons */}
      <div className="flex flex-wrap gap-1.5 justify-center px-4">
        {options.map((opt: string, i: number) => (
          <button
            key={i}
            className="rounded-full border border-[#00a884] bg-[#00a884]/5 px-4 py-1.5 text-[12px] text-[#00a884] font-semibold hover:bg-[#00a884]/15 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            {opt.trim()}
          </button>
        ))}
      </div>
    </div>
  );
}

function MediaBubble({ block, index }: { block: StructuralBlock; index: number }) {
  const p = block.properties;
  const delay = `${index * 80}ms`;
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex justify-end animate-in slide-in-from-right-4 fade-in duration-300" style={{ animationDelay: delay }}>
      <div className="max-w-[82%] rounded-2xl rounded-br-sm bg-[#005c4b] p-1.5 shadow-lg shadow-black/20">
        {p.url && p.mediaType === "image" ? (
          <img src={p.url} alt={p.caption || "media"} className="rounded-xl max-h-40 w-full object-cover" />
        ) : (
          <div className="flex items-center gap-3 bg-black/20 rounded-xl px-3 py-3">
            <div className="rounded-lg bg-white/10 p-2">
              <Paperclip className="h-4 w-4 text-white/50" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-white/60 font-medium capitalize">{p.mediaType || "file"}</p>
              {p.url && <p className="text-[9px] text-white/25 truncate">{p.url}</p>}
            </div>
          </div>
        )}
        {p.caption && (
          <p className="text-[12px] text-white/80 mt-1 px-2 leading-snug">{p.caption}</p>
        )}
        <span className="block text-right text-[9px] text-white/25 px-2 mt-0.5">{time} <span className="text-[#53bdeb]">✓✓</span></span>
      </div>
    </div>
  );
}

/* ─── System / Data / Logic blocks → subtle inline chips ─── */

function SystemChip({ block, index }: { block: StructuralBlock; index: number }) {
  const p = block.properties;
  const delay = `${index * 80}ms`;
  const config = BLOCK_TYPE_CONFIGS[block.type];

  const chipContent: Record<string, { icon: React.ReactNode; label: string; detail?: string; accent: string }> = {
    save_result: {
      icon: <Save className="h-2.5 w-2.5" />,
      label: "Save",
      detail: p.name || p.label,
      accent: "text-emerald-400/60 border-emerald-500/15 bg-emerald-500/5",
    },
    update_context: {
      icon: <RefreshCw className="h-2.5 w-2.5" />,
      label: "Context",
      detail: p.variable ? `${p.variable} = ${p.value || "…"}` : undefined,
      accent: "text-teal-400/60 border-teal-500/15 bg-teal-500/5",
    },
    update_entity: {
      icon: <User className="h-2.5 w-2.5" />,
      label: "Entity",
      detail: p.field ? `${p.entity || "contact"}.${p.field}` : undefined,
      accent: "text-pink-400/60 border-pink-500/15 bg-pink-500/5",
    },
    split: {
      icon: <GitBranch className="h-2.5 w-2.5" />,
      label: "Branch",
      detail: p.condition || p.splitType,
      accent: "text-orange-400/60 border-orange-500/15 bg-orange-500/5",
    },
    webhook: {
      icon: <Globe className="h-2.5 w-2.5" />,
      label: p.method || "POST",
      detail: p.url ? new URL(p.url).hostname : undefined,
      accent: "text-indigo-400/60 border-indigo-500/15 bg-indigo-500/5",
    },
  };

  const chip = chipContent[block.type] || {
    icon: <Database className="h-2.5 w-2.5" />,
    label: config.label,
    detail: undefined as string | undefined,
    accent: "text-white/40 border-white/10 bg-white/5",
  };

  // Try to parse URL hostname safely
  let detail = chip.detail;
  if (block.type === "webhook" && p.url) {
    try { detail = new URL(p.url).hostname; } catch { detail = p.url; }
  }

  return (
    <div className="flex justify-center animate-in fade-in duration-200" style={{ animationDelay: delay }}>
      <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 ${chip.accent} backdrop-blur-sm`}>
        {chip.icon}
        <span className="text-[10px] font-semibold uppercase tracking-wider">{chip.label}</span>
        {detail && (
          <>
            <span className="text-[10px] opacity-30">·</span>
            <span className="text-[10px] font-mono opacity-50 max-w-[120px] truncate">{detail}</span>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Block router ─── */

function BlockBubble({ block, index }: { block: StructuralBlock; index: number }) {
  switch (block.type) {
    case "message":
      return <MessageBubble block={block} index={index} />;
    case "wait_response":
      return <WaitResponseBubble block={block} index={index} />;
    case "quick_replies":
      return <QuickRepliesBubble block={block} index={index} />;
    case "media":
      return <MediaBubble block={block} index={index} />;
    default:
      return <SystemChip block={block} index={index} />;
  }
}

/* ─── Main preview component ─── */

export default function StructuralBlocksPreview({ blocks }: StructuralBlocksPreviewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [blocks.length]);

  if (blocks.length === 0) return null;

  return (
    <div className="w-full">
      {/* Separator — "Extended conversation" */}
      <div className="flex items-center gap-3 px-6 py-3">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />
        <span className="text-[10px] font-bold text-teal-400/40 uppercase tracking-widest whitespace-nowrap">
          ＋ Added steps
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />
      </div>

      {/* Chat bubbles — same padding as a WhatsApp chat body */}
      <div className="px-4 pb-4 space-y-2">
        {blocks.map((block, i) => (
          <BlockBubble key={block.id} block={block} index={i} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
