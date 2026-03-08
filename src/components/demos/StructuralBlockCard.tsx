import { useState } from "react";
import { ChevronDown, ChevronUp, GripVertical, Trash2, Pencil, Check, X } from "lucide-react";
import { BLOCK_TYPE_CONFIGS } from "@/types/structuralBlocks";
import type { StructuralBlock, PropertyField } from "@/types/structuralBlocks";
import MediaUploader from "./MediaUploader";

interface StructuralBlockCardProps {
  block: StructuralBlock;
  index: number;
  total: number;
  onUpdate: (block: StructuralBlock) => void;
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}

function PropertyInput({
  field, value, onChange, allProps, onChangeProps,
}: {
  field: PropertyField; value: any; onChange: (v: any) => void;
  allProps?: Record<string, any>; onChangeProps?: (props: Record<string, any>) => void;
}) {
  // Special: media block URL field → use MediaUploader
  if (field.key === "url" && allProps?.mediaType !== undefined && onChangeProps) {
    return (
      <MediaUploader
        value={{
          url: allProps.url || "",
          fileName: allProps.fileName,
          source: allProps.mediaSource || "upload",
        }}
        mediaType={allProps.mediaType || "image"}
        onChange={(val) => {
          onChangeProps({
            ...allProps,
            url: val.url,
            fileName: val.fileName,
            mediaSource: val.source,
          });
        }}
      />
    );
  }

  if (field.type === "textarea") {
    return (
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        rows={2}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white placeholder-white/20 outline-none focus:border-teal-500/40 resize-none transition"
      />
    );
  }
  if (field.type === "select") {
    return (
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white outline-none focus:border-teal-500/40 transition appearance-none"
      >
        {field.options?.map((o) => (
          <option key={o.value} value={o.value} className="bg-slate-800">{o.label}</option>
        ))}
      </select>
    );
  }
  return (
    <input
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white placeholder-white/20 outline-none focus:border-teal-500/40 transition"
    />
  );
}

export default function StructuralBlockCard({
  block, index, total, onUpdate, onRemove, onMoveUp, onMoveDown,
}: StructuralBlockCardProps) {
  const [editing, setEditing] = useState(false);
  const [editProps, setEditProps] = useState<Record<string, any>>({});
  const config = BLOCK_TYPE_CONFIGS[block.type];

  const startEdit = () => {
    setEditProps({ ...block.properties });
    setEditing(true);
  };

  const saveEdit = () => {
    onUpdate({ ...block, properties: editProps });
    setEditing(false);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditProps({});
  };

  // Preview text for the card
  const previewText = (() => {
    const p = block.properties;
    switch (block.type) {
      case "message": return p.text || "Empty message";
      case "wait_response": return p.resultName ? `→ ${p.resultName}` : "Wait for user input";
      case "quick_replies": return p.prompt || p.options || "Quick replies";
      case "media": return `${p.mediaType || "media"}: ${p.caption || p.url || "No media"}`;
      case "save_result": return p.name ? `${p.name} = ${p.value || "…"}` : "Save result";
      case "update_context": return p.variable ? `${p.variable} ← ${p.value || "…"}` : "Update context";
      case "update_entity": return p.field ? `${p.entity}.${p.field} ← ${p.value || "…"}` : "Update entity";
      case "split": return p.condition ? `if ${p.condition} ${p.operand} ${p.value}` : "Branch condition";
      case "webhook": return p.url ? `${p.method} ${p.url}` : "Webhook action";
      default: return block.label;
    }
  })();

  return (
    <div className={`group rounded-xl border ${config.borderColor} ${config.bgColor} transition-all hover:shadow-lg`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <GripVertical className="h-3.5 w-3.5 text-white/15 shrink-0 cursor-grab" />
        <span className="text-base shrink-0">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-bold ${config.color}`}>{config.label}</span>
            <span className="text-[10px] text-white/20">#{index + 1}</span>
          </div>
          {!editing && (
            <p className="text-[11px] text-white/45 truncate leading-relaxed mt-0.5">{previewText}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
          {index > 0 && (
            <button onClick={() => onMoveUp(block.id)} className="rounded p-1 hover:bg-white/10 transition">
              <ChevronUp className="h-3 w-3 text-white/40" />
            </button>
          )}
          {index < total - 1 && (
            <button onClick={() => onMoveDown(block.id)} className="rounded p-1 hover:bg-white/10 transition">
              <ChevronDown className="h-3 w-3 text-white/40" />
            </button>
          )}
          {!editing ? (
            <button onClick={startEdit} className="rounded p-1 hover:bg-white/10 transition">
              <Pencil className="h-3 w-3 text-white/40" />
            </button>
          ) : (
            <>
              <button onClick={saveEdit} className="rounded p-1 hover:bg-emerald-500/20 transition">
                <Check className="h-3 w-3 text-emerald-400" />
              </button>
              <button onClick={cancelEdit} className="rounded p-1 hover:bg-red-500/20 transition">
                <X className="h-3 w-3 text-red-400" />
              </button>
            </>
          )}
          <button onClick={() => onRemove(block.id)} className="rounded p-1 hover:bg-red-500/20 transition">
            <Trash2 className="h-3 w-3 text-red-400/60" />
          </button>
        </div>
      </div>

      {/* Editing form */}
      {editing && (
        <div className="px-3 pb-3 space-y-2 border-t border-white/5 pt-2.5">
          {config.propertyFields.map((field) => (
            <div key={field.key}>
              <label className="text-[10px] font-semibold text-white/40 mb-0.5 block">
                {field.label}
                {field.required && <span className="text-red-400 ml-0.5">*</span>}
              </label>
              <PropertyInput
                field={field}
                value={editProps[field.key]}
                onChange={(v) => setEditProps({ ...editProps, [field.key]: v })}
                allProps={block.type === "media" ? editProps : undefined}
                onChangeProps={block.type === "media" ? setEditProps : undefined}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
