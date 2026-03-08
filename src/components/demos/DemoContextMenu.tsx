import { useState, useEffect, useCallback } from "react";
import { createBlock, BLOCK_TYPE_CONFIGS, BLOCK_CATEGORIES } from "@/types/structuralBlocks";
import type { StructuralBlock, StructuralBlockType } from "@/types/structuralBlocks";
import { Plus } from "lucide-react";

interface DemoContextMenuProps {
  x: number;
  y: number;
  onInsert: (block: StructuralBlock) => void;
  onClose: () => void;
}

export default function DemoContextMenu({ x, y, onInsert, onClose }: DemoContextMenuProps) {
  const [search, setSearch] = useState("");

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Close on outside click
  useEffect(() => {
    const handleClick = () => onClose();
    // Delay to avoid the same click that opened the menu
    const timer = setTimeout(() => {
      window.addEventListener("click", handleClick);
    }, 100);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", handleClick);
    };
  }, [onClose]);

  const allTypes = Object.values(BLOCK_TYPE_CONFIGS);
  const filtered = search
    ? allTypes.filter((c) =>
        c.label.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())
      )
    : allTypes;

  const handleSelect = (type: StructuralBlockType) => {
    onInsert(createBlock(type));
    onClose();
  };

  // Position: ensure it doesn't overflow viewport
  const style: React.CSSProperties = {
    position: "fixed",
    left: Math.min(x, window.innerWidth - 260),
    top: Math.min(y, window.innerHeight - 400),
    zIndex: 100,
  };

  return (
    <div style={style} className="w-60 rounded-xl border border-white/15 bg-slate-800/98 backdrop-blur-md shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="px-3 py-2 border-b border-white/5 bg-teal-500/5">
        <p className="text-[10px] font-bold text-teal-400 uppercase tracking-wider mb-1">
          ＋ Insert step here
        </p>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search blocks…"
          autoFocus
          className="w-full rounded-md bg-white/5 border border-white/10 px-2 py-1 text-xs text-white placeholder-white/25 outline-none focus:border-teal-500/40"
        />
      </div>

      {/* Block list */}
      <div className="max-h-[300px] overflow-auto py-1">
        {BLOCK_CATEGORIES.map((cat) => {
          const items = filtered.filter((c) => c.category === cat.key);
          if (items.length === 0) return null;
          return (
            <div key={cat.key}>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-wider px-3 pt-2 pb-0.5">
                {cat.icon} {cat.label}
              </p>
              {items.map((cfg) => (
                <button
                  key={cfg.type}
                  onClick={() => handleSelect(cfg.type)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-white/5 transition"
                >
                  <span className="text-sm">{cfg.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-semibold ${cfg.color}`}>{cfg.label}</p>
                  </div>
                  <Plus className="h-3 w-3 text-white/15" />
                </button>
              ))}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-[11px] text-white/20 py-4">No blocks found</p>
        )}
      </div>
    </div>
  );
}
