import { useCallback } from "react";
import { Node } from "@xyflow/react";
import { v4 as uuidv4 } from "uuid";

export interface FlowModule {
  id: string;
  label: string;
  color: string;
  collapsed: boolean;
}

const MODULE_COLORS = [
  "hsl(160, 84%, 39%)",   // primary green
  "hsl(220, 80%, 55%)",   // blue
  "hsl(260, 60%, 55%)",   // purple
  "hsl(30, 90%, 55%)",    // orange
  "hsl(340, 70%, 50%)",   // pink
  "hsl(190, 70%, 45%)",   // teal
  "hsl(45, 80%, 50%)",    // amber
  "hsl(0, 72%, 51%)",     // red
];

const MODULE_TEMPLATES = [
  "Entry", "Identification", "KYC", "Offer",
  "Validation", "Retry", "Error Handling", "Handoff", "Closing",
];

export function useFlowModules(
  nodes: Node[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>
) {
  const modules: FlowModule[] = nodes
    .filter((n) => n.type === "moduleGroup")
    .map((n) => ({
      id: n.id,
      label: (n.data.label as string) || "Module",
      color: (n.data.color as string) || MODULE_COLORS[0],
      collapsed: (n.data.collapsed as boolean) || false,
    }));

  const addModule = useCallback(
    (label?: string, viewportCenter?: { x: number; y: number }) => {
      const id = uuidv4();
      const idx = modules.length;
      const color = MODULE_COLORS[idx % MODULE_COLORS.length];
      const name = label || MODULE_TEMPLATES[idx] || `Module ${idx + 1}`;

      // Place at viewport center if available, otherwise stagger from origin
      const pos = viewportCenter
        ? { x: viewportCenter.x - 200, y: viewportCenter.y - 150 }
        : { x: 50 + idx * 40, y: 50 + idx * 220 };

      const moduleNode: Node = {
        id,
        type: "moduleGroup",
        position: pos,
        data: {
          label: name,
          color,
          collapsed: false,
          nodeCount: 0,
        },
        style: { width: 400, height: 300 },
        draggable: true,
      };

      setNodes((nds) => [moduleNode, ...nds]);
      return id;
    },
    [modules.length, setNodes]
  );

  const deleteModule = useCallback(
    (moduleId: string) => {
      setNodes((nds) =>
        nds.map((n) => (n.parentId === moduleId ? { ...n, parentId: undefined, extent: undefined, position: { x: n.position.x + 50, y: n.position.y + 50 } } : n))
          .filter((n) => n.id !== moduleId)
      );
    },
    [setNodes]
  );

  const renameModule = useCallback(
    (moduleId: string, newLabel: string) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === moduleId ? { ...n, data: { ...n.data, label: newLabel } } : n
        )
      );
    },
    [setNodes]
  );

  const toggleCollapse = useCallback(
    (moduleId: string) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === moduleId
            ? { ...n, data: { ...n.data, collapsed: !n.data.collapsed } }
            : n
        )
      );
    },
    [setNodes]
  );

  const assignNodeToModule = useCallback(
    (nodeId: string, moduleId: string | null) => {
      setNodes((nds) => {
        const moduleNode = moduleId ? nds.find((n) => n.id === moduleId) : null;
        return nds.map((n) => {
          if (n.id !== nodeId) return n;
          if (!moduleId) {
            // Unassign: convert relative position back to absolute
            const parent = nds.find((p) => p.id === n.parentId);
            return {
              ...n,
              parentId: undefined,
              extent: undefined,
              position: parent
                ? { x: n.position.x + parent.position.x, y: n.position.y + parent.position.y }
                : n.position,
            };
          }
          // Assign: convert absolute to relative
          return {
            ...n,
            parentId: moduleId,
            extent: "parent" as const,
            position: moduleNode
              ? { x: n.position.x - moduleNode.position.x + 20, y: n.position.y - moduleNode.position.y + 50 }
              : { x: 20, y: 50 },
          };
        });
      });
    },
    [setNodes]
  );

  // Update node counts on module nodes
  const updateModuleCounts = useCallback(() => {
    setNodes((nds) => {
      const counts: Record<string, number> = {};
      for (const n of nds) {
        if (n.parentId && n.type !== "moduleGroup") {
          counts[n.parentId] = (counts[n.parentId] || 0) + 1;
        }
      }
      // Only update if counts actually changed
      let changed = false;
      const updated = nds.map((n) => {
        if (n.type === "moduleGroup") {
          const newCount = counts[n.id] || 0;
          if (n.data.nodeCount !== newCount) {
            changed = true;
            return { ...n, data: { ...n.data, nodeCount: newCount } };
          }
        }
        return n;
      });
      return changed ? updated : nds;
    });
  }, [setNodes]);

  return {
    modules,
    addModule,
    deleteModule,
    renameModule,
    toggleCollapse,
    assignNodeToModule,
    updateModuleCounts,
    MODULE_TEMPLATES,
  };
}
