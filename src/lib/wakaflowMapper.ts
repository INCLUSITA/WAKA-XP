/**
 * WakaFlow → TextIt Mapper
 *
 * Converts a WakaFlow model (step-based journey definition) into
 * a TextIt-compatible flow JSON. Steps that don't map cleanly
 * produce warnings instead of being silently dropped.
 */
import { v4 as uuidv4 } from "uuid";
import type { TextItNode, TextItAction, TextItExit, TextItRouter, TextItCategory, FlowExport } from "@/types/flow";

export interface WakaFlowStep {
  id: string;
  label: string;
  type: "message" | "input" | "decision" | "action" | string;
  summary: string;
}

export interface WakaFlowModel {
  journey: string;
  version: string;
  steps: WakaFlowStep[];
}

export interface MapperWarning {
  stepId: string;
  stepLabel: string;
  level: "info" | "warning";
  message: string;
}

export interface MapperResult {
  export: FlowExport;
  mapped: number;
  total: number;
  warnings: MapperWarning[];
  status: "clean" | "mapped_with_warnings" | "partial";
}

const SUPPORTED_TYPES = new Set(["message", "input", "action"]);

function mapStep(
  step: WakaFlowStep,
  nextStepId: string | null,
  warnings: MapperWarning[],
): TextItNode {
  const actions: TextItAction[] = [];
  const exits: TextItExit[] = [];
  let router: TextItRouter | undefined;

  switch (step.type) {
    case "message": {
      actions.push({
        uuid: uuidv4(),
        type: "send_msg",
        text: step.summary,
        quick_replies: [],
      });
      exits.push({ uuid: uuidv4(), destination_uuid: nextStepId });
      break;
    }

    case "input": {
      const defaultCatUuid = uuidv4();
      const defaultExitUuid = uuidv4();
      exits.push({ uuid: defaultExitUuid, destination_uuid: nextStepId });
      router = {
        type: "switch",
        default_category_uuid: defaultCatUuid,
        categories: [{ uuid: defaultCatUuid, name: "All Responses", exit_uuid: defaultExitUuid }],
        operand: "@input.text",
        cases: [],
        wait: { type: "msg" },
      };
      warnings.push({
        stepId: step.id,
        stepLabel: step.label,
        level: "info",
        message: "Input mapped as open wait — add validation rules in the Builder if needed.",
      });
      break;
    }

    case "action": {
      actions.push({
        uuid: uuidv4(),
        type: "call_webhook",
        url: "",
        method: "POST",
        headers: {},
        body: "",
        result_name: step.id,
      });
      const successCat = uuidv4();
      const failCat = uuidv4();
      const successExit = uuidv4();
      const failExit = uuidv4();
      exits.push(
        { uuid: successExit, destination_uuid: nextStepId },
        { uuid: failExit, destination_uuid: null },
      );
      router = {
        type: "switch",
        default_category_uuid: failCat,
        categories: [
          { uuid: successCat, name: "Success", exit_uuid: successExit },
          { uuid: failCat, name: "Failure", exit_uuid: failExit },
        ],
        operand: "@run.webhook.status",
        cases: [{ uuid: uuidv4(), type: "has_only_text", arguments: ["success"], category_uuid: successCat }],
      };
      warnings.push({
        stepId: step.id,
        stepLabel: step.label,
        level: "warning",
        message: "Action mapped as webhook stub — configure URL and payload in the Builder.",
      });
      break;
    }

    case "decision": {
      // Decision nodes don't map cleanly — create a pass-through with a warning
      exits.push({ uuid: uuidv4(), destination_uuid: nextStepId });
      warnings.push({
        stepId: step.id,
        stepLabel: step.label,
        level: "warning",
        message: "Decision steps are not yet auto-mapped — wire conditions manually in the Builder.",
      });
      break;
    }

    default: {
      exits.push({ uuid: uuidv4(), destination_uuid: nextStepId });
      warnings.push({
        stepId: step.id,
        stepLabel: step.label,
        level: "warning",
        message: `Unsupported step type "${step.type}" — kept as pass-through node.`,
      });
    }
  }

  return { uuid: step.id, actions, exits, router };
}

export function mapWakaFlowToTextIt(model: WakaFlowModel): MapperResult {
  const warnings: MapperWarning[] = [];

  const textitNodes = model.steps.map((step, i) => {
    const nextId = i < model.steps.length - 1 ? model.steps[i + 1].id : null;
    return mapStep(step, nextId, warnings);
  });

  const mappedClean = model.steps.filter((s) => SUPPORTED_TYPES.has(s.type)).length;
  const status: MapperResult["status"] =
    warnings.length === 0
      ? "clean"
      : mappedClean === model.steps.length
        ? "mapped_with_warnings"
        : "partial";

  return {
    export: {
      version: "13",
      site: "https://textit.com",
      flows: [
        {
          uuid: uuidv4(),
          name: model.journey,
          language: "spa",
          type: "messaging",
          nodes: textitNodes,
        },
      ],
    },
    mapped: mappedClean,
    total: model.steps.length,
    warnings,
    status,
  };
}
