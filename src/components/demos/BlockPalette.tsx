import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { BLOCK_TYPE_CONFIGS, BLOCK_CATEGORIES, createBlock } from "@/types/structuralBlocks";
import type { StructuralBlock, StructuralBlockType } from "@/types/structuralBlocks";

interface BlockPaletteProps {
  onInsert: (block: StructuralBlock, atIndex?: number) => void;
  insertIndex?: number;
}

export default function BlockPalette({ onInsert, insertIndex }: BlockPaletteProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const allTypes = Object.values(BLOCK_TYPE_CONFIGS);
  const filtered = search
    ? allTypes.filter((c) =>
        c.label.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())
      )
    : allTypes;

  const handleInsert = (type: StructuralBlockType) => {
    const block = createBlock(type);
    onInsert(block, insertIndex);
    setOpen(false);
    setSearch("");
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="group flex items-center justify-center w-full py-2 rounded-xl border-2 border-dashed border-white/10 text-white/30 hover:border-teal-500/30 hover:text-teal-400 hover:bg-teal-500/5 transition-all"
      >
        <Plus className="h-4 w-4 mr-1.5" />
        <span className="text-xs font-semibold">Add step</span>
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-800/95 backdrop-blur-sm overflow-hidden shadow-2xl">
      {/* Search */}
      <div className="px-3 py-2.5 border-b border-white/5">
        <div className="flex items-center gap-2 rounded-lg bg-white/5 px-2.5 py-1.5">
          <Search className="h-3.5 w-3.5 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search blocks…"
            autoFocus
            className="flex-1 bg-transparent text-xs text-white placeholder-white/25 outline-none"
          />
          <button onClick={() => { setOpen(false); setSearch(""); }} className="text-[10px] text-white/30 hover:text-white/50">
            ESC
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="px-2 py-2 max-h-[320px] overflow-auto space-y-3">
        {BLOCK_CATEGORIES.map((cat) => {
          const items = filtered.filter((c) => c.category === cat.key);
          if (items.length === 0) return null;
          return (
            <div key={cat.key}>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider px-1.5 mb-1.5">
                {cat.icon} {cat.label}
              </p>
              <div className="space-y-0.5">
                {items.map((cfg) => (
                  <button
                    key={cfg.type}
                    onClick={() => handleInsert(cfg.type)}
                    className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition hover:bg-white/5 group`}
                  >
                    <span className="text-lg shrink-0">{cfg.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</p>
                      <p className="text-[10px] text-white/30 truncate">{cfg.description}</p>
                    </div>
                    <Plus className="h-3.5 w-3.5 text-white/15 group-hover:text-white/40 transition shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-xs text-white/20 py-4">No blocks match "{search}"</p>
        )}
      </div>

      {/* AI hint */}
      <div className="px-3 py-2 border-t border-white/5 bg-violet-500/5">
        <p className="text-[10px] text-violet-400/50 text-center">
          🤖 Soon: "add a wait for response here" via Waka AI
        </p>
      </div>
    </div>
  );
}
