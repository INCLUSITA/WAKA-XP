import { memo, useState } from "react";
import { NodeProps, NodeResizer } from "@xyflow/react";
import { ChevronDown, ChevronRight, GripVertical, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export const ModuleGroupNode = memo(({ data, selected, id }: NodeProps) => {
  const [editing, setEditing] = useState(false);
  const collapsed = data.collapsed as boolean;
  const label = (data.label as string) || "Module";
  const color = (data.color as string) || "hsl(var(--primary))";

  return (
    <>
      <NodeResizer
        minWidth={280}
        minHeight={collapsed ? 48 : 120}
        isVisible={selected}
        lineClassName="!border-primary/40"
        handleClassName="!h-2.5 !w-2.5 !border-primary !bg-card"
      />
      <div
        className="rounded-xl border-2 transition-all"
        style={{
          borderColor: selected ? color : `${color}44`,
          background: `${color}08`,
          minWidth: 280,
          minHeight: collapsed ? 48 : 120,
          width: "100%",
          height: "100%",
        }}
      >
        {/* Module header */}
        <div
          className="flex items-center gap-1.5 rounded-t-[10px] px-3 py-2"
          style={{ background: `${color}18` }}
        >
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 cursor-grab" />
          <button
            className="p-0.5 hover:bg-background/40 rounded transition-colors"
            onClick={() => {
              (data as any).onToggleCollapse?.(id);
            }}
          >
            {collapsed ? (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>

          {editing ? (
            <Input
              autoFocus
              defaultValue={label}
              className="h-6 w-36 border-none bg-background/60 px-1.5 py-0 text-xs font-semibold focus-visible:ring-1"
              onBlur={(e) => {
                (data as any).onRename?.(id, e.target.value);
                setEditing(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  (data as any).onRename?.(id, (e.target as HTMLInputElement).value);
                  setEditing(false);
                }
              }}
            />
          ) : (
            <span
              className="text-xs font-bold uppercase tracking-wider cursor-pointer"
              style={{ color }}
              onDoubleClick={() => setEditing(true)}
            >
              {label}
            </span>
          )}

          <span className="ml-auto text-[10px] text-muted-foreground font-medium">
            {(data.nodeCount as number) ?? 0} nodes
          </span>

          <button
            className="ml-1 p-0.5 rounded hover:bg-background/40 transition-colors"
            onClick={() => setEditing(true)}
          >
            <Pencil className="h-3 w-3 text-muted-foreground" />
          </button>
          <button
            className="p-0.5 rounded hover:bg-destructive/10 transition-colors"
            onClick={() => (data as any).onDelete?.(id)}
          >
            <Trash2 className="h-3 w-3 text-destructive/70" />
          </button>
        </div>

        {collapsed && (
          <div className="px-3 py-1 text-[10px] text-muted-foreground italic">
            Collapsed — {(data.nodeCount as number) ?? 0} nodes inside
          </div>
        )}
      </div>
    </>
  );
});

ModuleGroupNode.displayName = "ModuleGroupNode";
