export type FlowNodeType = "send_msg" | "wait_for_response" | "split_by_expression" | "call_webhook";

export interface TextItAction {
  uuid: string;
  type: string;
  text?: string;
  attachments?: string[];
  quick_replies?: string[];
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

export interface TextItCategory {
  uuid: string;
  name: string;
  exit_uuid: string;
}

export interface TextItRouter {
  type: string;
  default_category_uuid: string;
  categories: TextItCategory[];
  operand?: string;
  cases?: TextItCase[];
  wait?: { type: string };
}

export interface TextItCase {
  uuid: string;
  type: string;
  arguments: string[];
  category_uuid: string;
}

export interface TextItExit {
  uuid: string;
  destination_uuid: string | null;
}

export interface TextItNode {
  uuid: string;
  actions: TextItAction[];
  exits: TextItExit[];
  router?: TextItRouter;
}

export interface TextItFlow {
  uuid: string;
  name: string;
  language: string;
  type: "messaging";
  nodes: TextItNode[];
  _ui?: Record<string, unknown>;
}

export interface FlowExport {
  version: "13";
  site: string;
  flows: TextItFlow[];
}
