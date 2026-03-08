import { useState, useCallback } from "react";
import { Layers, Plus, Sparkles, Download, ChevronDown } from "lucide-react";
import type { StructuralBlock } from "@/types/structuralBlocks";
import StructuralBlockCard from "./StructuralBlockCard";
import BlockPalette from "./BlockPalette";

interface StructuralEditorProps {
  demoId: string;
  demoTitle: string;
}

export default function StructuralEditor({ demoId, demoTitle }: StructuralEditorProps) {
  const storageKey = `structural-blocks-${demoId}`;

  const [blocks, setBlocks] = useState<StructuralBlock[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [insertAtIndex, setInsertAtIndex] = useState<number | null>(null);

  const persist = useCallback((updated: StructuralBlock[]) => {
    setBlocks(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  }, [storageKey]);

  const handleInsert = useCallback((block: StructuralBlock, atIndex?: number) => {
    const newBlocks = [...blocks];
    const idx = atIndex !== undefined ? atIndex : blocks.length;
    newBlocks.splice(idx, 0, block);
    persist(newBlocks);
    setInsertAtIndex(null);
  }, [blocks, persist]);

  const handleUpdate = useCallback((updated: StructuralBlock) => {
    persist(blocks.map((b) => (b.id === updated.id ? updated : b)));
  }, [blocks, persist]);

  const handleRemove = useCallback((id: string) => {
    persist(blocks.filter((b) => b.id !== id));
  }, [blocks, persist]);

  const handleMoveUp = useCallback((id: string) => {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx <= 0) return;
    const newBlocks = [...blocks];
    [newBlocks[idx - 1], newBlocks[idx]] = [newBlocks[idx], newBlocks[idx - 1]];
    persist(newBlocks);
  }, [blocks, persist]);

  const handleMoveDown = useCallback((id: string) => {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx < 0 || idx >= blocks.length - 1) return;
    const newBlocks = [...blocks];
    [newBlocks[idx], newBlocks[idx + 1]] = [newBlocks[idx + 1], newBlocks[idx]];
    persist(newBlocks);
  }, [blocks, persist]);

  return (
    <div className="w-80 border-l border-white/10 bg-slate-900/95 backdrop-blur-sm flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <Layers className="h-4 w-4 text-teal-400" />
          <h3 className="text-sm font-bold text-white/90">Structure</h3>
          <span className="ml-auto rounded-full bg-teal-500/15 border border-teal-500/30 px-2 py-0.5 text-[9px] font-semibold text-teal-400 uppercase tracking-wider">
            v1
          </span>
        </div>
        <p className="text-[11px] text-white/35 leading-relaxed">
          Add conversational steps and flow blocks to your sandbox.
        </p>

        {/* Block count & export hint */}
        {blocks.length > 0 && (
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] text-teal-400/70">{blocks.length} block{blocks.length !== 1 ? "s" : ""}</span>
            <button className="text-[10px] text-white/20 hover:text-white/40 flex items-center gap-1 transition ml-auto">
              <Download className="h-2.5 w-2.5" /> Export
            </button>
          </div>
        )}
      </div>

      {/* Blocks list */}
      <div className="flex-1 overflow-auto px-3 py-3 space-y-1.5">
        {blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="rounded-2xl bg-teal-500/10 p-4 mb-4">
              <Layers className="h-8 w-8 text-teal-400/40" />
            </div>
            <p className="text-xs font-semibold text-white/30 mb-1">No steps yet</p>
            <p className="text-[10px] text-white/15 max-w-[200px] leading-relaxed mb-4">
              Start building your conversation flow by adding steps below.
            </p>
            <BlockPalette onInsert={handleInsert} />
          </div>
        ) : (
          <>
            {blocks.map((block, index) => (
              <div key={block.id}>
                {/* Insert point between blocks */}
                {insertAtIndex === index ? (
                  <div className="mb-1.5">
                    <BlockPalette onInsert={handleInsert} insertIndex={index} />
                  </div>
                ) : (
                  <button
                    onClick={() => setInsertAtIndex(index)}
                    className="w-full flex items-center justify-center py-0.5 opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <div className="flex items-center gap-1 text-white/15 hover:text-teal-400/50">
                      <div className="h-px w-6 bg-current" />
                      <Plus className="h-2.5 w-2.5" />
                      <div className="h-px w-6 bg-current" />
                    </div>
                  </button>
                )}

                {/* Connector line */}
                {index > 0 && insertAtIndex !== index && (
                  <div className="flex justify-center -my-0.5">
                    <div className="w-px h-2 bg-white/10" />
                  </div>
                )}

                <StructuralBlockCard
                  block={block}
                  index={index}
                  total={blocks.length}
                  onUpdate={handleUpdate}
                  onRemove={handleRemove}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                />
              </div>
            ))}

            {/* Bottom insert */}
            <div className="pt-2">
              {insertAtIndex === blocks.length ? (
                <BlockPalette onInsert={handleInsert} insertIndex={blocks.length} />
              ) : (
                <BlockPalette onInsert={handleInsert} insertIndex={blocks.length} />
              )}
            </div>
          </>
        )}
      </div>

      {/* AI future hint */}
      <div className="px-3 py-2.5 border-t border-white/5 bg-violet-500/5">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-violet-400/40" />
          <p className="text-[10px] text-violet-400/40">
            Soon: "add a question after this step" via Waka AI
          </p>
        </div>
      </div>
    </div>
  );
}
