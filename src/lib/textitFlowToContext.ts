/**
 * textitFlowToContext.ts
 * Converts a TextIt v13 JSON flow into a structured AI context string.
 * The AI uses this to understand the conversational flow and guide the user
 * through a fluid, dynamic conversation - NOT node-by-node execution.
 */

interface TextItNode {
  uuid: string;
  actions: Array<{
    uuid: string;
    type: string;
    text?: string;
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    result_name?: string;
    quick_replies?: string[];
    field?: { key: string; name: string };
    value?: string;
    name?: string;
    groups?: Array<{ uuid: string; name: string }>;
    flow?: { uuid: string; name: string };
  }>;
  exits: Array<{ uuid: string; destination_uuid: string | null }>;
  router?: {
    type: string;
    operand?: string;
    categories: Array<{ uuid: string; name: string; exit_uuid: string }>;
    cases: Array<{
      type: string;
      arguments: string[];
      category_uuid: string;
    }>;
    wait?: { type: string };
  };
}

interface TextItFlow {
  uuid: string;
  name: string;
  language: string;
  type: string;
  nodes: TextItNode[];
}

interface FlowContext {
  flowName: string;
  language: string;
  purpose: string;
  steps: string[];
  webhooks: WebhookInfo[];
  decisions: string[];
  dataCollected: string[];
  subflows: string[];
  messages: string[];
}

interface WebhookInfo {
  url: string;
  method: string;
  purpose: string;
  bodyTemplate?: string;
}

/**
 * Parse a TextIt JSON and extract a structured context for the AI.
 */
export function textitFlowToContext(json: any): FlowContext {
  const flow: TextItFlow = json.flows?.[0] || json;
  const nodes = flow.nodes || [];

  const context: FlowContext = {
    flowName: flow.name || "Unknown Flow",
    language: flow.language || "fra",
    purpose: "",
    steps: [],
    webhooks: [],
    decisions: [],
    dataCollected: [],
    subflows: [],
    messages: [],
  };

  // Build node map for traversal
  const nodeMap = new Map<string, TextItNode>();
  nodes.forEach((n) => nodeMap.set(n.uuid, n));

  // Find entry node (first node or one not referenced by any exit)
  const referencedUuids = new Set<string>();
  nodes.forEach((n) => n.exits.forEach((e) => { if (e.destination_uuid) referencedUuids.add(e.destination_uuid); }));
  const entryNode = nodes.find((n) => !referencedUuids.has(n.uuid)) || nodes[0];

  // Walk the graph (BFS) to extract context
  const visited = new Set<string>();
  const queue = entryNode ? [entryNode.uuid] : [];
  let stepNum = 0;

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);

    const node = nodeMap.get(nodeId);
    if (!node) continue;

    // Process actions
    for (const action of node.actions) {
      switch (action.type) {
        case "send_msg": {
          const text = action.text || "";
          // Skip placeholder texts like "set_run_result"
          if (text && text !== "set_run_result" && text.length > 5) {
            stepNum++;
            context.steps.push(`${stepNum}. ENVIAR: "${text.slice(0, 200)}${text.length > 200 ? '...' : ''}"`);
            context.messages.push(text);
            if (action.quick_replies?.length) {
              context.steps.push(`   → Quick replies: [${action.quick_replies.join(", ")}]`);
            }
          }
          break;
        }
        case "call_webhook": {
          stepNum++;
          const url = action.url || "";
          // Clean sensitive data from URL/headers
          const cleanUrl = url.replace(/sk-[a-zA-Z0-9_-]+/g, "[API_KEY]");
          const purpose = inferWebhookPurpose(url, action.body);
          context.webhooks.push({
            url: cleanUrl,
            method: action.method || "POST",
            purpose,
            bodyTemplate: action.body ? cleanBody(action.body) : undefined,
          });
          context.steps.push(`${stepNum}. WEBHOOK: ${action.method || "POST"} ${purpose} (result: ${action.result_name || "webhook"})`);
          break;
        }
        case "set_contact_field": {
          const fieldName = action.field?.name || action.field?.key || "unknown";
          context.dataCollected.push(fieldName);
          context.steps.push(`${stepNum + 0.5}. GUARDAR DATO: ${fieldName} = "${(action.value || "").slice(0, 80)}"`);
          break;
        }
        case "set_run_result": {
          const name = action.name || "result";
          context.dataCollected.push(name);
          break;
        }
        case "enter_flow": {
          const flowName = action.flow?.name || "sub-flow";
          context.subflows.push(flowName);
          stepNum++;
          context.steps.push(`${stepNum}. SUBFLUJO: ${flowName}`);
          break;
        }
        case "add_contact_groups": {
          const groups = action.groups?.map((g) => g.name).join(", ") || "";
          if (groups) context.steps.push(`${stepNum + 0.5}. ASIGNAR GRUPO: ${groups}`);
          break;
        }
      }
    }

    // Process router (decisions)
    if (node.router) {
      const r = node.router;
      if (r.wait?.type === "msg") {
        stepNum++;
        context.steps.push(`${stepNum}. ESPERAR RESPUESTA del usuario`);
      }

      if (r.categories.length > 1 || r.cases.length > 0) {
        const branches = r.categories
          .filter((c) => c.name !== "Other")
          .map((c) => {
            const matchingCase = r.cases.find((cs) => cs.category_uuid === c.uuid);
            if (matchingCase) {
              return `"${c.name}" (${matchingCase.type}: ${matchingCase.arguments.join(", ")})`;
            }
            return `"${c.name}"`;
          });

        if (branches.length > 0) {
          const operand = r.operand || "@input.text";
          context.decisions.push(`Evaluar ${operand}: ${branches.join(" | ")}`);
          context.steps.push(`   → DECISIÓN sobre ${operand}: ${branches.join(" | ")}`);
        }
      }
    }

    // Queue next nodes
    for (const exit of node.exits) {
      if (exit.destination_uuid && !visited.has(exit.destination_uuid)) {
        queue.push(exit.destination_uuid);
      }
    }
  }

  // Infer purpose from flow name and first messages
  context.purpose = inferFlowPurpose(context.flowName, context.messages, context.webhooks);

  return context;
}

/**
 * Convert a FlowContext into a system prompt addition for the AI.
 */
export function flowContextToPrompt(ctx: FlowContext): string {
  const sections: string[] = [];

  sections.push(`## FLUJO DE REFERENCIA: "${ctx.flowName}"`);
  sections.push(`Idioma original: ${ctx.language}`);
  sections.push(`Propósito: ${ctx.purpose}`);
  sections.push("");

  sections.push("### INSTRUCCIONES IMPORTANTES");
  sections.push("- Este flujo es tu GUÍA CONVERSACIONAL. NO ejecutes los pasos de forma rígida.");
  sections.push("- Conduce una conversación NATURAL Y FLUIDA que cubra los mismos objetivos del flujo.");
  sections.push("- Adapta el lenguaje y tono al usuario (si habla francés, responde en francés).");
  sections.push("- Usa los webhooks/APIs indicados para las operaciones reales del backend.");
  sections.push("- Presenta opciones con botones interactivos (suggest_quick_replies).");
  sections.push("- Si el flujo requiere datos del usuario, pídelos de forma conversacional.");
  sections.push("");

  if (ctx.steps.length > 0) {
    sections.push("### SECUENCIA DEL FLUJO (guía, no guión rígido)");
    sections.push(ctx.steps.join("\n"));
    sections.push("");
  }

  if (ctx.webhooks.length > 0) {
    sections.push("### ENDPOINTS/WEBHOOKS A UTILIZAR");
    for (const wh of ctx.webhooks) {
      sections.push(`- **${wh.method} ${wh.purpose}**`);
      sections.push(`  URL: ${wh.url}`);
      if (wh.bodyTemplate) {
        sections.push(`  Body template: ${wh.bodyTemplate.slice(0, 300)}`);
      }
    }
    sections.push("");
  }

  if (ctx.decisions.length > 0) {
    sections.push("### PUNTOS DE DECISIÓN");
    ctx.decisions.forEach((d) => sections.push(`- ${d}`));
    sections.push("");
  }

  if (ctx.dataCollected.length > 0) {
    sections.push("### DATOS A RECOPILAR");
    sections.push(ctx.dataCollected.map((d) => `- ${d}`).join("\n"));
    sections.push("");
  }

  if (ctx.subflows.length > 0) {
    sections.push("### SUBFLUJOS REFERENCIADOS");
    ctx.subflows.forEach((s) => sections.push(`- ${s}`));
    sections.push("");
  }

  return sections.join("\n");
}

// ── Helpers ──

function inferWebhookPurpose(url: string, body?: string): string {
  if (url.includes("openai") || url.includes("gpt")) return "OCR/Vision AI (análisis de imagen de documento)";
  if (url.includes("waka-core-api/clients")) return "WAKA CORE: Crear/buscar cliente";
  if (url.includes("waka-core-api/credits")) return "WAKA CORE: Crear crédito";
  if (url.includes("waka-core-api/media")) return "WAKA CORE: Upload KYC media";
  if (url.includes("waka-core-api/bots/bnpl")) return "WAKA CORE: Catálogo BNPL";
  if (url.includes("waka-core-api/bots")) return "WAKA CORE: Operación bot";
  if (url.includes("textit")) return "TextIt API";
  if (body?.includes("full_name")) return "Registro/onboarding de cliente";
  return `Webhook externo (${new URL(url).hostname})`;
}

function cleanBody(body: string): string {
  // Remove API keys and sensitive data from body templates
  return body
    .replace(/sk-[a-zA-Z0-9_-]+/g, "[API_KEY]")
    .replace(/Bearer\s+[a-zA-Z0-9_.-]+/g, "Bearer [TOKEN]")
    .replace(/x-api-key":\s*"[^"]+"/g, 'x-api-key": "[API_KEY]"');
}

function inferFlowPurpose(name: string, messages: string[], webhooks: WebhookInfo[]): string {
  const nameLower = name.toLowerCase();
  if (nameLower.includes("registro") || nameLower.includes("onboarding") || nameLower.includes("kyc")) {
    return "Registro/Onboarding de cliente con captura de identidad (DNI/CNI) y datos personales";
  }
  if (nameLower.includes("bnpl") || nameLower.includes("telefono") || nameLower.includes("phone")) {
    return "Compra de teléfono con financiamiento BNPL";
  }
  if (nameLower.includes("fibre") || nameLower.includes("fiber") || nameLower.includes("internet")) {
    return "Contratación de servicio de fibra óptica";
  }
  if (nameLower.includes("seguro") || nameLower.includes("assurance") || nameLower.includes("insurance")) {
    return "Contratación de microseguro de salud";
  }
  if (nameLower.includes("pago") || nameLower.includes("payment") || nameLower.includes("paiement")) {
    return "Proceso de pago";
  }
  if (nameLower.includes("momo") || nameLower.includes("mobile money")) {
    return "Apertura de cuenta Mobile Money";
  }

  // Infer from webhooks
  if (webhooks.some((w) => w.url.includes("client"))) return "Gestión de clientes";
  if (webhooks.some((w) => w.url.includes("credit"))) return "Operaciones de crédito";

  return `Flujo conversacional: ${name}`;
}
