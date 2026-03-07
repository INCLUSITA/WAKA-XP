import { Node, Edge } from "@xyflow/react";

export interface ValidationError {
  nodeId: string;
  type: "warning" | "error";
  message: string;
}

export function validateFlow(nodes: Node[], edges: Edge[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const connectedAsTarget = new Set(edges.map((e) => e.target));
  const connectedAsSource = new Set(edges.map((e) => e.source));

  for (const node of nodes) {
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
        const emptyReplies = (data.quick_replies || []).filter((r: string) => !r.trim());
        if (emptyReplies.length > 0) {
          errors.push({
            nodeId: node.id,
            type: "warning",
            message: `${emptyReplies.length} respuesta(s) rápida(s) vacía(s)`,
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
