import { useState, useCallback, useEffect, useRef } from "react";
import { Node, Edge } from "@xyflow/react";

export interface ChatMessage {
  id: string;
  sender: "bot" | "user" | "system";
  text: string;
  quickReplies?: string[];
  timestamp: Date;
}

export function useFlowSimulation(nodes: Node[], edges: Edge[], onHighlightNode?: (id: string) => void) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const findFirstNode = useCallback((): string | null => {
    if (nodes.length === 0) return null;
    const targetIds = new Set(edges.map((e) => e.target));
    const entryNode = nodes.find((n) => !targetIds.has(n.id));
    return entryNode?.id || nodes[0]?.id || null;
  }, [nodes, edges]);

  const getNextNodeId = useCallback(
    (nodeId: string, sourceHandle?: string): string | null => {
      let edge;
      if (sourceHandle) {
        edge = edges.find((e) => e.source === nodeId && e.sourceHandle === sourceHandle);
      }
      if (!edge) {
        edge = edges.find((e) => e.source === nodeId);
      }
      return edge?.target || null;
    },
    [edges]
  );

  const endFlow = useCallback(() => {
    setIsFinished(true);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), sender: "system", text: "— Fin del flujo —", timestamp: new Date() },
    ]);
  }, []);

  const processNode = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) { endFlow(); return; }

      setCurrentNodeId(nodeId);
      onHighlightNode?.(nodeId);
      const data = node.data as Record<string, any>;

      switch (node.type) {
        case "sendMsg": {
          const text = data.text || "(mensaje vacío)";
          const quickReplies = data.quick_replies?.filter((r: string) => r.trim()) || [];
          setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), sender: "bot", text, quickReplies, timestamp: new Date() },
          ]);
          setTimeout(() => {
            const nextId = getNextNodeId(nodeId);
            if (nextId) processNode(nextId);
            else endFlow();
          }, 800);
          break;
        }
        case "waitResponse": {
          const cats = (data.categories || []).filter((c: string) => c.trim());
          setCategories(cats);
          setWaitingForInput(true);
          break;
        }
        case "splitExpression": {
          setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), sender: "system", text: `⚡ Split: ${data.operand || "@input.text"}`, timestamp: new Date() },
          ]);
          setTimeout(() => {
            const nextId = getNextNodeId(nodeId);
            if (nextId) processNode(nextId);
            else endFlow();
          }, 500);
          break;
        }
        case "webhook": {
          setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), sender: "system", text: `🌐 Webhook: ${data.method || "GET"} ${data.url || "(sin URL)"}`, timestamp: new Date() },
          ]);
          setTimeout(() => {
            const nextId = getNextNodeId(nodeId);
            if (nextId) processNode(nextId);
            else endFlow();
          }, 600);
          break;
        }
        default: {
          const nextId = getNextNodeId(nodeId);
          if (nextId) processNode(nextId);
          else endFlow();
        }
      }
    },
    [nodes, getNextNodeId, onHighlightNode, endFlow]
  );

  const start = useCallback(() => {
    setMessages([]);
    setIsFinished(false);
    setWaitingForInput(false);
    setCategories([]);
    const firstId = findFirstNode();
    if (firstId) processNode(firstId);
    else setMessages([{ id: crypto.randomUUID(), sender: "system", text: "No hay nodos en el flujo", timestamp: new Date() }]);
  }, [findFirstNode, processNode]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || !currentNodeId) return;
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), sender: "user", text, timestamp: new Date() },
      ]);
      setWaitingForInput(false);
      setCategories([]);

      const node = nodes.find((n) => n.id === currentNodeId);
      const data = node?.data as Record<string, any>;
      const cats = (data?.categories || []) as string[];
      const matchedCat = cats.find((c: string) => c.toLowerCase() === text.toLowerCase());

      setTimeout(() => {
        const nextId = getNextNodeId(currentNodeId, matchedCat || undefined);
        if (nextId) processNode(nextId);
        else endFlow();
      }, 400);
    },
    [currentNodeId, nodes, getNextNodeId, processNode, endFlow]
  );

  return { messages, waitingForInput, categories, isFinished, start, sendMessage };
}
