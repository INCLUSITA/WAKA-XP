/**
 * Simple tree-based auto-layout for flow nodes.
 * Traverses the graph top-down following edges, assigning positions
 * in a vertical tree layout. No external dependency required.
 */
import { Node, Edge } from "@xyflow/react";

const NODE_WIDTH = 260;
const NODE_HEIGHT = 120;
const H_GAP = 60;
const V_GAP = 80;

interface LayoutResult {
  nodes: Node[];
}

export function autoLayoutFlow(nodes: Node[], edges: Edge[]): LayoutResult {
  if (nodes.length === 0) return { nodes: [] };

  // Build adjacency: source → target[]
  const children = new Map<string, string[]>();
  const hasParent = new Set<string>();

  edges.forEach((e) => {
    const list = children.get(e.source) || [];
    if (!list.includes(e.target)) list.push(e.target);
    children.set(e.source, list);
    hasParent.add(e.target);
  });

  // Find root nodes (no incoming edges)
  const roots = nodes
    .filter((n) => !hasParent.has(n.id))
    .map((n) => n.id);

  // If no clear roots, use first node
  if (roots.length === 0) roots.push(nodes[0].id);

  // BFS to assign depth (row) and index within each depth
  const visited = new Set<string>();
  const levels = new Map<string, number>(); // nodeId → depth
  const levelOrder = new Map<number, string[]>(); // depth → nodeId[]

  const queue: { id: string; depth: number }[] = roots.map((id) => ({
    id,
    depth: 0,
  }));
  roots.forEach((id) => visited.add(id));

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    levels.set(id, depth);
    const order = levelOrder.get(depth) || [];
    order.push(id);
    levelOrder.set(depth, order);

    const kids = children.get(id) || [];
    kids.forEach((kid) => {
      if (!visited.has(kid)) {
        visited.add(kid);
        queue.push({ id: kid, depth: depth + 1 });
      }
    });
  }

  // Handle orphan nodes (not reachable from roots)
  const maxDepth = Math.max(...Array.from(levels.values()), 0);
  nodes.forEach((n) => {
    if (!visited.has(n.id)) {
      const orphanDepth = maxDepth + 1;
      levels.set(n.id, orphanDepth);
      const order = levelOrder.get(orphanDepth) || [];
      order.push(n.id);
      levelOrder.set(orphanDepth, order);
    }
  });

  // Calculate subtree widths for better centering
  const subtreeWidth = new Map<string, number>();
  
  function getSubtreeWidth(nodeId: string, seen: Set<string>): number {
    if (seen.has(nodeId)) return NODE_WIDTH;
    seen.add(nodeId);
    
    const kids = (children.get(nodeId) || []).filter(k => !seen.has(k));
    if (kids.length === 0) {
      subtreeWidth.set(nodeId, NODE_WIDTH);
      return NODE_WIDTH;
    }
    
    const totalWidth = kids.reduce((sum, kid) => {
      return sum + getSubtreeWidth(kid, new Set(seen));
    }, 0) + (kids.length - 1) * H_GAP;
    
    const width = Math.max(NODE_WIDTH, totalWidth);
    subtreeWidth.set(nodeId, width);
    return width;
  }

  roots.forEach(r => getSubtreeWidth(r, new Set()));

  // Position nodes: center each level horizontally
  const positionMap = new Map<string, { x: number; y: number }>();
  const allDepths = Array.from(levelOrder.keys()).sort((a, b) => a - b);

  // First pass: position roots
  let rootX = 0;
  roots.forEach((rootId, i) => {
    const w = subtreeWidth.get(rootId) || NODE_WIDTH;
    positionMap.set(rootId, { x: rootX + w / 2 - NODE_WIDTH / 2, y: 0 });
    rootX += w + H_GAP * 2;
  });

  // Position children based on parent position
  function positionChildren(parentId: string, seen: Set<string>) {
    if (seen.has(parentId)) return;
    seen.add(parentId);
    
    const kids = (children.get(parentId) || []).filter(k => !positionMap.has(k));
    if (kids.length === 0) return;

    const parentPos = positionMap.get(parentId)!;
    const parentDepth = levels.get(parentId) || 0;
    const childY = (parentDepth + 1) * (NODE_HEIGHT + V_GAP);

    // Calculate total width of children subtrees
    const kidWidths = kids.map(k => subtreeWidth.get(k) || NODE_WIDTH);
    const totalWidth = kidWidths.reduce((a, b) => a + b, 0) + (kids.length - 1) * H_GAP;

    // Center children under parent
    const parentCenterX = parentPos.x + NODE_WIDTH / 2;
    let startX = parentCenterX - totalWidth / 2;

    kids.forEach((kid, i) => {
      const w = kidWidths[i];
      positionMap.set(kid, {
        x: startX + w / 2 - NODE_WIDTH / 2,
        y: childY,
      });
      startX += w + H_GAP;
    });

    kids.forEach(kid => positionChildren(kid, seen));
  }

  roots.forEach(r => positionChildren(r, new Set()));

  // Position any remaining unpositioned nodes (orphans)
  nodes.forEach((n) => {
    if (!positionMap.has(n.id)) {
      const depth = levels.get(n.id) || maxDepth + 1;
      const order = levelOrder.get(depth) || [];
      const idx = order.indexOf(n.id);
      positionMap.set(n.id, {
        x: idx * (NODE_WIDTH + H_GAP),
        y: depth * (NODE_HEIGHT + V_GAP),
      });
    }
  });

  // Apply positions
  const layoutedNodes = nodes.map((n) => {
    const pos = positionMap.get(n.id) || n.position;
    return { ...n, position: pos };
  });

  return { nodes: layoutedNodes };
}
