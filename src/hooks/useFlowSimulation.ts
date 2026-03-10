import { useState, useCallback, useRef } from "react";
import { Node, Edge } from "@xyflow/react";

export interface ChatMessage {
  id: string;
  sender: "bot" | "user" | "system";
  text: string;
  quickReplies?: string[];
  timestamp: Date;
  imageUrl?: string;
  attachments?: { url: string; name?: string; mime?: string }[];
  /** For split system messages: structured routing info */
  splitInfo?: {
    operand: string;
    resolvedValue: string;
    cases: string[];
    matchedCase: string | null;
    nodeType?: string;
  };
}

export interface SimulationContext {
  input: { text: string; attachments: { url: string; content_type: string }[] };
  webhook: { json: any; status: string };
  results: Record<string, { value: string }>;
  contact: Record<string, string>;
  urns: { whatsapp: string };
  groups: Set<string>;
}

function createEmptyContext(): SimulationContext {
  return {
    input: { text: "", attachments: [] },
    webhook: { json: {}, status: "" },
    results: {},
    contact: { name: "Simulador User" },
    urns: { whatsapp: "+22670000000" },
    groups: new Set(),
  };
}

/**
 * Resolve TextIt-style template expressions like @input.text, @webhook.json.data.id, etc.
 * Supports:
 *  - @input.text / @input.attachments
 *  - @webhook.json.xxx / @webhook.status
 *  - @results.xxx.value
 *  - @contact.xxx
 *  - @(expression) — simple path resolution inside parens
 *  - @(parse_json(webhook.json.output[1].content.0.text).field) — best-effort
 *  - @(attachment_parts(input.attachments.0).url) — returns first attachment URL
 *  - @upper(...), @default(...) — basic support
 *  - @(field(urns.whatsapp, 1, ":")) — basic support
 */
function resolveTemplate(template: string, ctx: SimulationContext): string {
  if (!template) return template;

  return template.replace(/@\(([^)]+)\)|@([a-zA-Z_][a-zA-Z0-9_.]*)/g, (_match, expr, simple) => {
    if (simple) {
      return resolvePath(simple, ctx);
    }
    if (expr) {
      return resolveExpression(expr, ctx);
    }
    return _match;
  });
}

function resolvePath(path: string, ctx: SimulationContext): string {
  const parts = path.split(".");
  let current: any = ctx;
  for (const part of parts) {
    if (current == null) return "";
    // Handle array index
    const arrMatch = part.match(/^(.+)\[(\d+)\]$/);
    if (arrMatch) {
      current = current[arrMatch[1]];
      if (Array.isArray(current)) current = current[parseInt(arrMatch[2])];
      else return "";
      continue;
    }
    current = current[part];
  }
  if (current == null) return "";
  if (typeof current === "object") return JSON.stringify(current);
  return String(current);
}

function resolveExpression(expr: string, ctx: SimulationContext): string {
  // Handle attachment_parts(input.attachments.0).url
  const attachMatch = expr.match(/attachment_parts\(input\.attachments\.(\d+)\)\.url/);
  if (attachMatch) {
    const idx = parseInt(attachMatch[1]);
    return ctx.input.attachments[idx]?.url || "";
  }

  // Handle parse_json(webhook.json.output[1].content.0.text).field
  const parseJsonMatch = expr.match(/parse_json\(([^)]+)\)\.(.+)/);
  if (parseJsonMatch) {
    const jsonStr = resolvePath(parseJsonMatch[1], ctx);
    try {
      const parsed = JSON.parse(jsonStr);
      const field = parseJsonMatch[2];
      return parsed[field] != null ? String(parsed[field]) : "";
    } catch { return ""; }
  }

  // Handle upper(...)
  const upperMatch = expr.match(/^upper\((.+)\)$/);
  if (upperMatch) {
    return resolveExpression(upperMatch[1], ctx).toUpperCase();
  }

  // Handle default(..., ...)
  const defaultMatch = expr.match(/^default\((.+),\s*(.+)\)$/);
  if (defaultMatch) {
    const val = resolveExpression(defaultMatch[1], ctx);
    return val || resolveExpression(defaultMatch[2], ctx);
  }

  // Handle field(urns.whatsapp, 1, ":")
  const fieldMatch = expr.match(/field\(([^,]+),\s*(\d+),\s*"([^"]+)"\)/);
  if (fieldMatch) {
    const val = resolvePath(fieldMatch[1], ctx);
    const parts = val.split(fieldMatch[3]);
    return parts[parseInt(fieldMatch[2])] || "";
  }

  // Try direct path resolution (strip quotes)
  const cleaned = expr.replace(/^["']|["']$/g, "").trim();
  return resolvePath(cleaned, ctx);
}

interface UseFlowSimulationOptions {
  executeWebhooks?: boolean;
  defaultHeaders?: Record<string, string>;
  onWebhookExecuted?: (url: string, status: number, response: any) => void;
}

export function useFlowSimulation(
  nodes: Node[],
  edges: Edge[],
  onHighlightNode?: (id: string) => void,
  options?: UseFlowSimulationOptions,
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [waitingForAttachment, setWaitingForAttachment] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const ctxRef = useRef<SimulationContext>(createEmptyContext());
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const executeWebhooks = options?.executeWebhooks ?? false;

  const findFirstNode = useCallback((): string | null => {
    if (nodes.length === 0) return null;

    // 1. Explicit Start node (enterFlow or any node flagged as start)
    const startNode = nodes.find(
      (n) => n.type === "enterFlow" || (n.data as any)?.isStart === true
    );
    if (startNode) return startNode.id;

    const targetIds = new Set(edges.map((e) => e.target));
    // Filter out module group nodes — they are structural, not executable
    const executableNodes = nodes.filter((n) => n.type !== "moduleGroup");

    // 2. If modules exist, look for an "Entry" module and prefer its first valid node
    const entryModule = nodes.find(
      (n) =>
        n.type === "moduleGroup" &&
        /entry|inicio|start/i.test((n.data as any)?.label || "")
    );
    if (entryModule) {
      const moduleData = entryModule.data as any;
      const moduleNodeIds = new Set<string>(moduleData?.nodeIds || []);
      const entryModuleNode = executableNodes.find(
        (n) => moduleNodeIds.has(n.id) && !targetIds.has(n.id)
      );
      if (entryModuleNode) return entryModuleNode.id;
      // Fallback: first node inside the entry module
      const firstInModule = executableNodes.find((n) => moduleNodeIds.has(n.id));
      if (firstInModule) return firstInModule.id;
    }

    // 3. First executable node with no incoming edges
    const entryNode = executableNodes.find((n) => !targetIds.has(n.id));
    if (entryNode) return entryNode.id;

    // 4. Fallback to first executable node
    return executableNodes[0]?.id || nodes[0]?.id || null;
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
    setIsProcessing(false);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), sender: "system", text: "— Fin del flujo —", timestamp: new Date() },
    ]);
  }, []);

  const processNode = useCallback(
    async (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) { endFlow(); return; }

      setCurrentNodeId(nodeId);
      onHighlightNode?.(nodeId);
      const data = node.data as Record<string, any>;

      switch (node.type) {
        case "sendMsg": {
          const rawText = data.text || "(mensaje vacío)";
          const text = resolveTemplate(rawText, ctxRef.current);
          const quickReplies = data.quick_replies?.filter((r: string) => r.trim()) || [];

          // Normalize attachments for display
          const nodeAttachments: { url: string; name?: string; mime?: string }[] = (data.attachments || []).map((a: any) =>
            typeof a === "string" ? { url: a } : a
          );

          if (rawText.toLowerCase().includes("set_run_result") || data.resultName) {
            const resultName = data.resultName || "result";
            const value = resolveTemplate(data.value || ctxRef.current.input.text, ctxRef.current);
            ctxRef.current.results[resultName.toLowerCase()] = { value };
            setMessages((prev) => [
              ...prev,
              { id: crypto.randomUUID(), sender: "system", text: `💾 Result saved: ${resultName} = ${value.substring(0, 80)}${value.length > 80 ? "…" : ""}`, timestamp: new Date() },
            ]);
          } else {
            setMessages((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                sender: "bot",
                text,
                quickReplies,
                timestamp: new Date(),
                attachments: nodeAttachments.length > 0 ? nodeAttachments : undefined,
              },
            ]);
          }

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
          setIsProcessing(false);
          break;
        }

        case "splitExpression":
        case "splitContactField":
        case "splitResult":
        case "splitRandom":
        case "splitGroup": {
          const operand = resolveTemplate(data.operand || "@input.text", ctxRef.current);
          const cases: string[] = (data.cases || []).filter((c: string) => c.trim());
          const allCategories = [...cases, "Other"];

          // Evaluate: find first case that matches (simple text match for now)
          let matchedCase: string | null = null;
          const testType = data.testType || "has_any_word";
          const operandLower = operand.toLowerCase().trim();

          for (const caseName of cases) {
            const caseVal = caseName.toLowerCase().trim();
            let matched = false;
            switch (testType) {
              case "has_any_word":
                matched = operandLower.split(/\s+/).some((w) => w === caseVal);
                break;
              case "has_all_words":
                matched = caseVal.split(/\s+/).every((w) => operandLower.includes(w));
                break;
              case "has_phrase":
              case "has_only_phrase":
                matched = operandLower.includes(caseVal);
                break;
              case "has_text":
                matched = operandLower.length > 0;
                break;
              case "has_number":
                matched = /\d+/.test(operand);
                break;
              case "has_number_eq":
                matched = parseFloat(operand) === parseFloat(caseName);
                break;
              case "has_number_gt":
                matched = parseFloat(operand) > parseFloat(caseName);
                break;
              case "has_number_lt":
                matched = parseFloat(operand) < parseFloat(caseName);
                break;
              case "has_pattern":
                try { matched = new RegExp(caseName, "i").test(operand); } catch { matched = false; }
                break;
              default:
                // Fallback: case-insensitive equality or contains
                matched = operandLower === caseVal || operandLower.includes(caseVal);
            }
            if (matched) { matchedCase = caseName; break; }
          }

          // If no case matched and operand is non-empty, check for "has_text" style catch-all
          const resolvedCategory = matchedCase || "Other";

          const splitLabel = matchedCase
            ? `⚡ Split → "${matchedCase}" (matched "${operand.substring(0, 40)}")`
            : `⚡ Split → "Other" (no match for "${operand.substring(0, 40)}")`;

          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              sender: "system",
              text: splitLabel,
              timestamp: new Date(),
              splitInfo: {
                operand: data.operand || "@input.text",
                resolvedValue: operand.substring(0, 60),
                cases: allCategories,
                matchedCase: resolvedCategory,
                nodeType: node.type,
              },
            },
          ]);

          setTimeout(() => {
            // Try matched category handle first, then fall back
            const nextId = getNextNodeId(nodeId, resolvedCategory);
            if (nextId) processNode(nextId);
            else endFlow();
          }, 500);
          break;
        }

        case "webhook": {
          const url = resolveTemplate(data.url || "", ctxRef.current);
          const method = data.method || "GET";
          const bodyTemplate = data.body || "";
          let body = resolveTemplate(bodyTemplate, ctxRef.current);
          // Sanitize resolved JSON: fix empty values like "key": , or "key": }
          body = body
            .replace(/:\s*,/g, ': null,')
            .replace(/:\s*}/g, ': null}')
            .replace(/""(\s*[,}])/g, '""$1');
          const headers = data.headers || {};

          // Merge default headers + node headers, then resolve templates
          const mergedHeaders = { ...(optionsRef.current?.defaultHeaders || {}), ...headers };
          const resolvedHeaders: Record<string, string> = {};
          for (const [key, val] of Object.entries(mergedHeaders)) {
            resolvedHeaders[key] = resolveTemplate(String(val), ctxRef.current);
          }

          if (executeWebhooks && url) {
            setIsProcessing(true);
            setMessages((prev) => [
              ...prev,
              { id: crypto.randomUUID(), sender: "system", text: `🌐 ${method} ${url.substring(0, 60)}…`, timestamp: new Date() },
              ...(body ? [{ id: crypto.randomUUID(), sender: "system" as const, text: `📤 Body: ${body.substring(0, 200)}${body.length > 200 ? "…" : ""}`, timestamp: new Date() }] : []),
            ]);

            try {
              const fetchOptions: RequestInit = {
                method,
                headers: resolvedHeaders,
              };
              if (method !== "GET" && method !== "HEAD" && body) {
                fetchOptions.body = body;
              }

              const response = await fetch(url, fetchOptions);
              const responseText = await response.text();
              let responseJson: any = {};
              try { responseJson = JSON.parse(responseText); } catch { responseJson = { raw: responseText }; }

              ctxRef.current.webhook = {
                json: responseJson,
                status: response.ok ? "success" : "failure",
              };

              // Save result_name if configured
              if (data.resultName) {
                ctxRef.current.results[data.resultName.toLowerCase()] = { value: responseText };
              }

              optionsRef.current?.onWebhookExecuted?.(url, response.status, responseJson);

              setMessages((prev) => [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  sender: "system",
                  text: `✅ Webhook ${response.status}: ${JSON.stringify(responseJson).substring(0, 120)}${JSON.stringify(responseJson).length > 120 ? "…" : ""}`,
                  timestamp: new Date(),
                },
              ]);

              setIsProcessing(false);
              setTimeout(() => {
                const nextId = getNextNodeId(nodeId);
                if (nextId) processNode(nextId);
                else endFlow();
              }, 600);
            } catch (err: any) {
              ctxRef.current.webhook = { json: { error: err.message }, status: "failure" };
              setMessages((prev) => [
                ...prev,
                { id: crypto.randomUUID(), sender: "system", text: `❌ Webhook error: ${err.message}`, timestamp: new Date() },
              ]);
              setIsProcessing(false);
              setTimeout(() => {
                const nextId = getNextNodeId(nodeId);
                if (nextId) processNode(nextId);
                else endFlow();
              }, 600);
            }
          } else {
            // Non-executing mode — just show info
            setMessages((prev) => [
              ...prev,
              { id: crypto.randomUUID(), sender: "system", text: `🌐 Webhook: ${method} ${url || "(sin URL)"}`, timestamp: new Date() },
            ]);
            setTimeout(() => {
              const nextId = getNextNodeId(nodeId);
              if (nextId) processNode(nextId);
              else endFlow();
            }, 600);
          }
          break;
        }

        case "saveResult": {
          const resultName = data.resultName || "result";
          const value = resolveTemplate(data.value || ctxRef.current.input.text, ctxRef.current);
          ctxRef.current.results[resultName.toLowerCase()] = { value };
          setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), sender: "system", text: `💾 ${resultName} = ${value.substring(0, 80)}`, timestamp: new Date() },
          ]);
          setTimeout(() => {
            const nextId = getNextNodeId(nodeId);
            if (nextId) processNode(nextId);
            else endFlow();
          }, 400);
          break;
        }

        case "updateContact": {
          const field = data.field || "name";
          const value = resolveTemplate(data.value || "", ctxRef.current);
          ctxRef.current.contact[field] = value;
          setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), sender: "system", text: `👤 Contact: ${field} = ${value}`, timestamp: new Date() },
          ]);
          setTimeout(() => {
            const nextId = getNextNodeId(nodeId);
            if (nextId) processNode(nextId);
            else endFlow();
          }, 400);
          break;
        }

        default: {
          setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), sender: "system", text: `⏩ ${node.type}`, timestamp: new Date() },
          ]);
          setTimeout(() => {
            const nextId = getNextNodeId(nodeId);
            if (nextId) processNode(nextId);
            else endFlow();
          }, 400);
        }
      }
    },
    [nodes, getNextNodeId, onHighlightNode, endFlow, executeWebhooks]
  );

  const start = useCallback(() => {
    setMessages([]);
    setIsFinished(false);
    setWaitingForInput(false);
    setWaitingForAttachment(false);
    setCategories([]);
    setIsProcessing(false);
    ctxRef.current = createEmptyContext();
    const firstId = findFirstNode();
    if (firstId) processNode(firstId);
    else setMessages([{ id: crypto.randomUUID(), sender: "system", text: "No hay nodos en el flujo", timestamp: new Date() }]);
  }, [findFirstNode, processNode]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || !currentNodeId) return;
      ctxRef.current.input.text = text;
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), sender: "user", text, timestamp: new Date() },
      ]);
      setWaitingForInput(false);
      setWaitingForAttachment(false);
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

  const sendAttachment = useCallback(
    (file: File) => {
      if (!currentNodeId) return;
      const objectUrl = URL.createObjectURL(file);
      
      // Store attachment in context
      ctxRef.current.input.attachments = [
        { url: objectUrl, content_type: file.type },
      ];
      ctxRef.current.input.text = objectUrl; // fallback

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: "user",
          text: `📎 ${file.name}`,
          imageUrl: file.type.startsWith("image/") ? objectUrl : undefined,
          timestamp: new Date(),
        },
      ]);

      setWaitingForInput(false);
      setWaitingForAttachment(false);
      setCategories([]);

      setTimeout(() => {
        const nextId = getNextNodeId(currentNodeId);
        if (nextId) processNode(nextId);
        else endFlow();
      }, 400);
    },
    [currentNodeId, getNextNodeId, processNode, endFlow]
  );

  return {
    messages,
    currentNodeId,
    waitingForInput,
    waitingForAttachment,
    categories,
    isFinished,
    isProcessing,
    start,
    sendMessage,
    sendAttachment,
    context: ctxRef.current,
  };
}
