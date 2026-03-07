import { Node, Edge } from "@xyflow/react";
import { v4 as uuidv4 } from "uuid";
import type { FlowExport, TextItNode, TextItAction, TextItExit, TextItRouter, TextItCategory, TextItCase } from "@/types/flow";

function buildTextItNode(node: Node, edges: Edge[]): TextItNode {
  const data = node.data as Record<string, any>;
  const nodeUuid = node.id;
  const outEdges = edges.filter((e) => e.source === nodeUuid);

  const actions: TextItAction[] = [];
  const exits: TextItExit[] = [];
  let router: TextItRouter | undefined;

  switch (node.type) {
    case "sendMsg": {
      actions.push({
        uuid: uuidv4(),
        type: "send_msg",
        text: data.text || "",
        quick_replies: data.quick_replies || [],
      });
      const exitUuid = uuidv4();
      exits.push({
        uuid: exitUuid,
        destination_uuid: outEdges[0]?.target || null,
      });
      break;
    }

    case "waitResponse": {
      const categories: TextItCategory[] = [];
      const cases: TextItCase[] = [];

      const userCategories = (data.categories || []) as string[];
      userCategories.forEach((catName: string) => {
        const exitUuid = uuidv4();
        const catUuid = uuidv4();
        categories.push({ uuid: catUuid, name: catName, exit_uuid: exitUuid });
        cases.push({
          uuid: uuidv4(),
          type: "has_any_word",
          arguments: [catName.toLowerCase()],
          category_uuid: catUuid,
        });
        exits.push({
          uuid: exitUuid,
          destination_uuid: outEdges.find((e) => e.sourceHandle === catName)?.target || outEdges[0]?.target || null,
        });
      });

      // Other/default category
      const defaultExitUuid = uuidv4();
      const defaultCatUuid = uuidv4();
      categories.push({ uuid: defaultCatUuid, name: "Other", exit_uuid: defaultExitUuid });
      exits.push({
        uuid: defaultExitUuid,
        destination_uuid: outEdges[outEdges.length - 1]?.target || null,
      });

      router = {
        type: "switch",
        default_category_uuid: defaultCatUuid,
        categories,
        operand: "@input.text",
        cases,
        wait: { type: "msg" },
      };
      break;
    }

    case "splitExpression": {
      const defaultExitUuid = uuidv4();
      const defaultCatUuid = uuidv4();
      exits.push({
        uuid: defaultExitUuid,
        destination_uuid: outEdges[0]?.target || null,
      });

      router = {
        type: "switch",
        default_category_uuid: defaultCatUuid,
        categories: [{ uuid: defaultCatUuid, name: "Other", exit_uuid: defaultExitUuid }],
        operand: data.operand || "@input.text",
        cases: [],
      };
      break;
    }

    case "webhook": {
      actions.push({
        uuid: uuidv4(),
        type: "call_webhook",
        url: data.url || "",
        method: data.method || "GET",
        headers: data.headers || {},
        body: data.body || "",
        result_name: data.resultName || data.result_name || "",
      });

      const successExitUuid = uuidv4();
      const failExitUuid = uuidv4();
      const successCatUuid = uuidv4();
      const failCatUuid = uuidv4();

      exits.push(
        { uuid: successExitUuid, destination_uuid: outEdges[0]?.target || null },
        { uuid: failExitUuid, destination_uuid: null }
      );

      router = {
        type: "switch",
        default_category_uuid: failCatUuid,
        categories: [
          { uuid: successCatUuid, name: "Success", exit_uuid: successExitUuid },
          { uuid: failCatUuid, name: "Failure", exit_uuid: failExitUuid },
        ],
        operand: "@run.webhook.status",
        cases: [
          { uuid: uuidv4(), type: "has_only_text", arguments: ["success"], category_uuid: successCatUuid },
        ],
      };
      break;
    }

    default: {
      const exitUuid = uuidv4();
      exits.push({ uuid: exitUuid, destination_uuid: outEdges[0]?.target || null });
    }
  }

  return { uuid: nodeUuid, actions, exits, router };
}

export function exportToTextIt(nodes: Node[], edges: Edge[], flowName: string): FlowExport {
  const flowUuid = uuidv4();

  const textitNodes = nodes.map((n) => buildTextItNode(n, edges));

  return {
    version: "13",
    site: "https://textit.com",
    flows: [
      {
        uuid: flowUuid,
        name: flowName || "Mi Flujo",
        language: "spa",
        type: "messaging",
        nodes: textitNodes,
      },
    ],
  };
}

export function downloadJson(data: unknown, filename: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
