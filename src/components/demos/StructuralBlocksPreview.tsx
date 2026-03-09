import { useEffect, useRef } from "react";
import type { StructuralBlock } from "@/types/structuralBlocks";
import { BLOCK_TYPE_CONFIGS } from "@/types/structuralBlocks";
import { Clock, Globe, Save, RefreshCw, User, Paperclip, Database, GitBranch } from "lucide-react";

interface StructuralBlocksPreviewProps {
  blocks: StructuralBlock[];
}

/* ─── Individual block renderers ─── */

function MessageBubble({ block, index }: { block: StructuralBlock; index: number }) {
  const p = block.properties;
  const delay = `${index * 60}ms`;
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex justify-end animate-in slide-in-from-right-2 fade-in duration-200" style={{ animationDelay: delay }}>
      <div className="max-w-[82%] rounded-2xl rounded-br-sm bg-[#005c4b] px-3.5 py-2 shadow-md shadow-black/15">
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
  const delay = `${index * 60}ms`;

  return (
    <div className="animate-in fade-in duration-250" style={{ animationDelay: delay }}>
      {/* Typing indicator — left-aligned like a user response */}
      <div className="flex justify-start">
        <div className="rounded-2xl rounded-bl-sm bg-[#202c33] px-3.5 py-2 shadow-md shadow-black/15">
          <div className="flex items-center gap-1.5">
            <div className="flex gap-[3px]">
              <div className="h-[5px] w-[5px] rounded-full bg-white/30 animate-bounce" style={{ animationDuration: "1s" }} />
              <div className="h-[5px] w-[5px] rounded-full bg-white/25 animate-bounce" style={{ animationDuration: "1s", animationDelay: "150ms" }} />
              <div className="h-[5px] w-[5px] rounded-full bg-white/20 animate-bounce" style={{ animationDuration: "1s", animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      </div>
      {/* Hint text & metadata — compact, below the typing dots */}
      {(p.hint || p.validationType || p.timeout || p.resultName) && (
        <div className="flex items-center gap-2 mt-1 ml-2">
          {p.hint && (
            <span className="text-[10px] text-white/25 italic">{p.hint}</span>
          )}
          {p.validationType && p.validationType !== "any" && (
            <span className="rounded bg-amber-500/8 border border-amber-500/15 px-1.5 py-0.5 text-[8px] text-amber-400/50 font-mono">
              {p.validationType}
            </span>
          )}
          {p.timeout && (
            <span className="text-[8px] text-white/15 flex items-center gap-0.5">
              <Clock className="h-2 w-2" /> {p.timeout}
            </span>
          )}
          {p.resultName && (
            <span className="text-[8px] text-amber-500/30 font-mono ml-auto mr-2">→ {p.resultName}</span>
          )}
        </div>
      )}
    </div>
  );
}

function QuickRepliesBubble({ block, index }: { block: StructuralBlock; index: number }) {
  const p = block.properties;
  const delay = `${index * 60}ms`;
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const options = (p.options || "").split(",").filter(Boolean);

  return (
    <div className="animate-in fade-in duration-200 space-y-1" style={{ animationDelay: delay }}>
      {p.prompt && (
        <div className="flex justify-end">
          <div className="max-w-[82%] rounded-2xl rounded-br-sm bg-[#005c4b] px-3.5 py-2 shadow-md shadow-black/15">
            <p className="text-[13.5px] text-white leading-[1.5]">{p.prompt}</p>
            <span className="block text-right text-[9px] text-white/25 mt-0.5">{time} <span className="text-[#53bdeb]">✓✓</span></span>
          </div>
        </div>
      )}
      {options.length > 0 && (
        <div className="flex flex-wrap gap-1.5 justify-center px-3">
          {options.map((opt: string, i: number) => (
            <button
              key={i}
              className="rounded-full border border-[#00a884] bg-[#00a884]/5 px-4 py-1.5 text-[12px] text-[#00a884] font-semibold hover:bg-[#00a884]/15 active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              {opt.trim()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MediaBubble({ block, index }: { block: StructuralBlock; index: number }) {
  const p = block.properties;
  const delay = `${index * 60}ms`;
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex justify-end animate-in slide-in-from-right-2 fade-in duration-200" style={{ animationDelay: delay }}>
      <div className="max-w-[82%] rounded-2xl rounded-br-sm bg-[#005c4b] p-1.5 shadow-md shadow-black/15">
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

/* ─── System / Data / Logic blocks → subtle inline markers ─── */

function SystemChip({ block, index }: { block: StructuralBlock; index: number }) {
  const p = block.properties;
  const delay = `${index * 60}ms`;
  const config = BLOCK_TYPE_CONFIGS[block.type];

  const chipContent: Record<string, { icon: React.ReactNode; label: string; detail?: string; accent: string }> = {
    save_result: {
      icon: <Save className="h-2 w-2" />,
      label: "Save",
      detail: p.name || p.label,
      accent: "text-emerald-400/40 border-emerald-500/10",
    },
    update_context: {
      icon: <RefreshCw className="h-2 w-2" />,
      label: "Context",
      detail: p.variable ? `${p.variable} = ${p.value || "…"}` : undefined,
      accent: "text-teal-400/40 border-teal-500/10",
    },
    update_entity: {
      icon: <User className="h-2 w-2" />,
      label: "Entity",
      detail: p.field ? `${p.entity || "contact"}.${p.field}` : undefined,
      accent: "text-pink-400/40 border-pink-500/10",
    },
    split: {
      icon: <GitBranch className="h-2 w-2" />,
      label: "Branch",
      detail: p.condition || p.splitType,
      accent: "text-orange-400/40 border-orange-500/10",
    },
    webhook: {
      icon: <Globe className="h-2 w-2" />,
      label: p.method || "POST",
      detail: undefined,
      accent: "text-indigo-400/40 border-indigo-500/10",
    },
  };

  const chip = chipContent[block.type] || {
    icon: <Database className="h-2 w-2" />,
    label: config.label,
    detail: undefined as string | undefined,
    accent: "text-white/30 border-white/8",
  };

  let detail = chip.detail;
  if (block.type === "webhook" && p.url) {
    try { detail = new URL(p.url).hostname; } catch { detail = p.url; }
  }

  return (
    <div className="flex justify-center animate-in fade-in duration-150" style={{ animationDelay: delay }}>
      <div className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${chip.accent}`}>
        {chip.icon}
        <span className="text-[9px] font-medium uppercase tracking-wider opacity-70">{chip.label}</span>
        {detail && (
          <>
            <span className="text-[9px] opacity-20">·</span>
            <span className="text-[9px] font-mono opacity-40 max-w-[100px] truncate">{detail}</span>
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
    <div className="px-[14px] pb-2 space-y-[6px]">
      {blocks.map((block, i) => (
        <BlockBubble key={block.id} block={block} index={i} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
