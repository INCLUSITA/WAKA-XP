import { Node, Edge } from "@xyflow/react";

export interface ValidationError {
  nodeId: string;
  type: "warning" | "error";
  message: string;
}

// Channel constraints — extensible per channel
export interface ChannelConstraints {
  maxTextLength: number;
  maxQuickReplies: number;
  maxAttachmentSizeMB: number;
  allowedAttachmentTypes: string[];
  maxButtons: number;
}

const CHANNEL_CONSTRAINTS: Record<string, ChannelConstraints> = {
  whatsapp: {
    maxTextLength: 4096,
    maxQuickReplies: 3,
    maxAttachmentSizeMB: 16,
    allowedAttachmentTypes: ["image", "video", "audio", "pdf", "document"],
    maxButtons: 3,
  },
  sms: {
    maxTextLength: 160,
    maxQuickReplies: 0,
    maxAttachmentSizeMB: 0,
    allowedAttachmentTypes: [],
    maxButtons: 0,
  },
  telegram: {
    maxTextLength: 4096,
    maxQuickReplies: 10,
    maxAttachmentSizeMB: 50,
    allowedAttachmentTypes: ["image", "video", "audio", "pdf", "document"],
    maxButtons: 10,
  },
  default: {
    maxTextLength: 4096,
    maxQuickReplies: 10,
    maxAttachmentSizeMB: 25,
    allowedAttachmentTypes: ["image", "video", "audio", "pdf", "document"],
    maxButtons: 10,
  },
};

export function getChannelConstraints(channel?: string): ChannelConstraints {
  return CHANNEL_CONSTRAINTS[channel || "default"] || CHANNEL_CONSTRAINTS.default;
}

export function validateFlow(nodes: Node[], edges: Edge[], channel?: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const connectedAsTarget = new Set(edges.map((e) => e.target));
  const connectedAsSource = new Set(edges.map((e) => e.source));
  const constraints = getChannelConstraints(channel);

  // Check for ambiguous entry point
  const executableNodes = nodes.filter((n) => n.type !== "moduleGroup");
  const rootNodes = executableNodes.filter((n) => !connectedAsTarget.has(n.id));
  if (rootNodes.length > 1) {
    errors.push({
      nodeId: rootNodes[0].id,
      type: "warning",
      message: `${rootNodes.length} nodos raíz detectados — el punto de inicio puede ser ambiguo`,
    });
  }
  if (rootNodes.length === 0 && executableNodes.length > 0) {
    errors.push({
      nodeId: executableNodes[0].id,
      type: "warning",
      message: "No se detectó un punto de entrada claro — todos los nodos tienen conexiones de entrada",
    });
  }

  for (const node of nodes) {
    if (node.type === "moduleGroup") continue;
    const data = node.data as Record<string, any>;
    const isFirst = nodes.indexOf(node) === 0;

    // Nodo sin conexión de entrada (excepto el primero)
    if (!isFirst && !connectedAsTarget.has(node.id)) {
      errors.push({
        nodeId: node.id,
        type: "warning",
        message: "Nodo sin conexión de entrada — no será alcanzable",
      });
    }

    // Nodo sin conexión de salida
    if (!connectedAsSource.has(node.id)) {
      errors.push({
        nodeId: node.id,
        type: "warning",
        message: "Nodo sin conexión de salida — el flujo termina aquí",
      });
    }

    switch (node.type) {
      case "sendMsg": {
        if (!data.text?.trim()) {
          errors.push({
            nodeId: node.id,
            type: "error",
            message: "Mensaje vacío — configura el texto del mensaje",
          });
        }

        // Channel: text length
        if (data.text && data.text.length > constraints.maxTextLength) {
          errors.push({
            nodeId: node.id,
            type: "warning",
            message: `Texto excede ${constraints.maxTextLength} caracteres (${data.text.length}) para el canal ${channel || "default"}`,
          });
        }

        const qr = data.quick_replies?.filter((r: string) => r.trim()) || [];
        const emptyReplies = (data.quick_replies || []).filter((r: string) => !r.trim());
        if (emptyReplies.length > 0) {
          errors.push({
            nodeId: node.id,
            type: "warning",
            message: `${emptyReplies.length} respuesta(s) rápida(s) vacía(s)`,
          });
        }

        // Channel: max quick replies
        if (qr.length > constraints.maxQuickReplies) {
          errors.push({
            nodeId: node.id,
            type: "warning",
            message: `${qr.length} respuestas rápidas exceden el límite de ${constraints.maxQuickReplies} para el canal ${channel || "default"}`,
          });
        }

        // Channel: attachments not supported
        const attachments = data.attachments || [];
        if (attachments.length > 0 && constraints.maxAttachmentSizeMB === 0) {
          errors.push({
            nodeId: node.id,
            type: "warning",
            message: `El canal ${channel || "default"} no soporta adjuntos`,
          });
        }
        break;
      }

      case "waitResponse": {
        if (!data.categories?.length) {
          errors.push({
            nodeId: node.id,
            type: "error",
            message: "Sin categorías definidas para la respuesta",
          });
        }
        const emptyCats = (data.categories || []).filter((c: string) => !c.trim());
        if (emptyCats.length > 0) {
          errors.push({
            nodeId: node.id,
            type: "warning",
            message: `${emptyCats.length} categoría(s) vacía(s)`,
          });
        }
        break;
      }

      case "webhook": {
        if (!data.url?.trim()) {
          errors.push({
            nodeId: node.id,
            type: "error",
            message: "URL del webhook vacía",
          });
        } else {
          try {
            new URL(data.url);
          } catch {
            errors.push({
              nodeId: node.id,
              type: "error",
              message: "URL del webhook inválida",
            });
          }
        }
        if (data.body?.trim()) {
          try {
            JSON.parse(data.body);
          } catch {
            errors.push({
              nodeId: node.id,
              type: "warning",
              message: "El body no es JSON válido",
            });
          }
        }
        break;
      }

      case "splitExpression": {
        if (!data.operand?.trim()) {
          errors.push({
            nodeId: node.id,
            type: "error",
            message: "Operando vacío en la expresión",
          });
        }
        break;
      }
    }
  }

  return errors;
}

// ─── Trigger readiness ───────────────────────────────────────────

export interface TriggerReadiness {
  ready: boolean;
  reason: string;
  entryNodeId?: string;
  entryNodeType?: string;
}

/**
 * Determines whether a flow has a clear, valid entry point
 * and is therefore trigger-ready across any channel.
 */
export function getTriggerReadiness(nodes: Node[], edges: Edge[]): TriggerReadiness {
  const executableNodes = nodes.filter((n) => n.type !== "moduleGroup");

  if (executableNodes.length === 0) {
    return { ready: false, reason: "Flow has no nodes" };
  }

  const connectedAsTarget = new Set(edges.map((e) => e.target));
  const rootNodes = executableNodes.filter((n) => !connectedAsTarget.has(n.id));

  if (rootNodes.length === 0) {
    return { ready: false, reason: "No clear entry point — all nodes have incoming connections" };
  }

  if (rootNodes.length > 1) {
    return { ready: false, reason: `Ambiguous entry — ${rootNodes.length} root nodes detected` };
  }

  const entry = rootNodes[0];
  const data = entry.data as Record<string, any>;

  // Entry node must be a conversational type (sendMsg, waitResponse) or have meaningful config
  const validEntryTypes = ["sendMsg", "waitResponse", "splitExpression", "splitContactField", "splitResult", "splitRandom", "splitGroup", "callAI"];
  if (entry.type && !validEntryTypes.includes(entry.type)) {
    return {
      ready: false,
      reason: `Entry node type "${entry.type}" is not a valid trigger start`,
      entryNodeId: entry.id,
      entryNodeType: entry.type,
    };
  }

  // For sendMsg, check it has text or template configured
  if (entry.type === "sendMsg") {
    const hasText = !!(data.text || "").trim();
    const hasTemplate = data.message_type === "template" && !!(data.template_name || "").trim();
    if (!hasText && !hasTemplate) {
      return {
        ready: false,
        reason: "Entry Send Message has no text or template configured",
        entryNodeId: entry.id,
        entryNodeType: entry.type,
      };
    }
  }

  return {
    ready: true,
    reason: "Flow has a valid entry point",
    entryNodeId: entry.id,
    entryNodeType: entry.type,
  };
}
