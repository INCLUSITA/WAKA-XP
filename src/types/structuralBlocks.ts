// Structural block type system for Sandbox Structural Editing v1
// Aligned with existing XP concepts: Node Effects, Flow Context, Entities

export type StructuralBlockType =
  | "message"
  | "wait_response"
  | "quick_replies"
  | "media"
  | "save_result"
  | "update_context"
  | "update_entity"
  | "split"
  | "webhook";

export interface StructuralBlock {
  id: string;
  type: StructuralBlockType;
  label: string;
  properties: Record<string, any>;
  createdAt: string;
}

export interface BlockTypeConfig {
  type: StructuralBlockType;
  label: string;
  description: string;
  icon: string;
  color: string;     // tailwind text color class
  bgColor: string;   // tailwind bg color class
  borderColor: string;
  defaultProperties: Record<string, any>;
  propertyFields: PropertyField[];
  category: "conversation" | "data" | "logic";
}

export interface PropertyField {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "tags" | "boolean";
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
}

export const BLOCK_TYPE_CONFIGS: Record<StructuralBlockType, BlockTypeConfig> = {
  message: {
    type: "message",
    label: "Send Message",
    description: "Send a text message to the user",
    icon: "💬",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/25",
    category: "conversation",
    defaultProperties: { text: "", channel: "whatsapp", quickReplies: "", attachments: "" },
    propertyFields: [
      { key: "text", label: "Message text", type: "textarea", placeholder: "Type your message…", required: true },
      { key: "channel", label: "Channel", type: "select", options: [
        { value: "whatsapp", label: "WhatsApp" },
        { value: "sms", label: "SMS" },
        { value: "ussd", label: "USSD" },
        { value: "telegram", label: "Telegram" },
      ]},
      { key: "quickReplies", label: "Quick replies (comma separated)", type: "text", placeholder: "Yes, No, Maybe later" },
      { key: "attachments", label: "Attachments (URLs, comma separated)", type: "text", placeholder: "https://example.com/image.jpg" },
    ],
  },
  wait_response: {
    type: "wait_response",
    label: "Wait for Response",
    description: "Pause and wait for user input",
    icon: "⏳",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/25",
    category: "conversation",
    defaultProperties: { timeout: "5m", resultName: "" },
    propertyFields: [
      { key: "resultName", label: "Save response as", type: "text", placeholder: "@result.response" },
      { key: "timeout", label: "Timeout", type: "select", options: [
        { value: "1m", label: "1 minute" },
        { value: "5m", label: "5 minutes" },
        { value: "1h", label: "1 hour" },
        { value: "24h", label: "24 hours" },
      ]},
    ],
  },
  quick_replies: {
    type: "quick_replies",
    label: "Quick Replies",
    description: "Present options for the user to choose",
    icon: "🔘",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/25",
    category: "conversation",
    defaultProperties: { prompt: "", options: "Option 1, Option 2" },
    propertyFields: [
      { key: "prompt", label: "Question / prompt", type: "textarea", placeholder: "What would you like to do?" },
      { key: "options", label: "Options (comma separated)", type: "text", placeholder: "Yes, No, Maybe" },
    ],
  },
  media: {
    type: "media",
    label: "Send Media",
    description: "Send an image, document, or audio",
    icon: "📎",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/25",
    category: "conversation",
    defaultProperties: { mediaType: "image", url: "", caption: "" },
    propertyFields: [
      { key: "mediaType", label: "Media type", type: "select", options: [
        { value: "image", label: "Image" },
        { value: "document", label: "Document" },
        { value: "audio", label: "Audio" },
        { value: "video", label: "Video" },
      ]},
      { key: "url", label: "URL", type: "text", placeholder: "https://..." },
      { key: "caption", label: "Caption", type: "text", placeholder: "Optional caption" },
    ],
  },
  save_result: {
    type: "save_result",
    label: "Save Result",
    description: "Store a value from the conversation",
    icon: "💾",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/25",
    category: "data",
    defaultProperties: { name: "", value: "", category: "flow" },
    propertyFields: [
      { key: "name", label: "Result name", type: "text", placeholder: "@result.name", required: true },
      { key: "value", label: "Value expression", type: "text", placeholder: "@input.text" },
      { key: "category", label: "Category", type: "select", options: [
        { value: "flow", label: "Flow result" },
        { value: "contact", label: "Contact field" },
        { value: "session", label: "Session var" },
      ]},
    ],
  },
  update_context: {
    type: "update_context",
    label: "Update Context",
    description: "Modify a flow context variable",
    icon: "🔄",
    color: "text-teal-400",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/25",
    category: "data",
    defaultProperties: { variable: "", value: "" },
    propertyFields: [
      { key: "variable", label: "Context variable", type: "text", placeholder: "language, status…", required: true },
      { key: "value", label: "New value", type: "text", placeholder: "fr, active…" },
    ],
  },
  update_entity: {
    type: "update_entity",
    label: "Update Entity",
    description: "Update a contact or entity field",
    icon: "👤",
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/25",
    category: "data",
    defaultProperties: { entity: "contact", field: "", value: "" },
    propertyFields: [
      { key: "entity", label: "Entity", type: "select", options: [
        { value: "contact", label: "Contact" },
        { value: "account", label: "Account" },
        { value: "ticket", label: "Ticket" },
      ]},
      { key: "field", label: "Field name", type: "text", placeholder: "phone, name, status…", required: true },
      { key: "value", label: "Value", type: "text", placeholder: "@input.text" },
    ],
  },
  split: {
    type: "split",
    label: "Split / Branch",
    description: "Branch the flow based on a condition",
    icon: "🔀",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/25",
    category: "logic",
    defaultProperties: { condition: "", operand: "equals", value: "" },
    propertyFields: [
      { key: "condition", label: "Variable to check", type: "text", placeholder: "@result.choice", required: true },
      { key: "operand", label: "Condition", type: "select", options: [
        { value: "equals", label: "Equals" },
        { value: "contains", label: "Contains" },
        { value: "starts_with", label: "Starts with" },
        { value: "not_empty", label: "Not empty" },
      ]},
      { key: "value", label: "Compare value", type: "text", placeholder: "yes, 1, active…" },
    ],
  },
  webhook: {
    type: "webhook",
    label: "Webhook / Action",
    description: "Call an external API or trigger an action",
    icon: "🔗",
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/25",
    category: "logic",
    defaultProperties: { url: "", method: "POST", headers: "", body: "", resultName: "" },
    propertyFields: [
      { key: "url", label: "URL", type: "text", placeholder: "https://api.example.com/…", required: true },
      { key: "method", label: "Method", type: "select", options: [
        { value: "GET", label: "GET" },
        { value: "POST", label: "POST" },
        { value: "PUT", label: "PUT" },
        { value: "PATCH", label: "PATCH" },
        { value: "DELETE", label: "DELETE" },
      ]},
      { key: "headers", label: "Headers (JSON)", type: "textarea", placeholder: '{"Authorization": "Bearer token", "Content-Type": "application/json"}' },
      { key: "body", label: "Body", type: "textarea", placeholder: '{"contact": "@contact.uuid", "text": "@input.text"}' },
      { key: "resultName", label: "Save response as", type: "text", placeholder: "@webhook.result" },
    ],
  },
};

export const BLOCK_CATEGORIES = [
  { key: "conversation" as const, label: "Conversation", icon: "💬" },
  { key: "data" as const,         label: "Data & Context", icon: "💾" },
  { key: "logic" as const,        label: "Logic & Actions", icon: "⚡" },
];

export function createBlock(type: StructuralBlockType, overrides?: Partial<StructuralBlock>): StructuralBlock {
  const config = BLOCK_TYPE_CONFIGS[type];
  return {
    id: `blk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    label: config.label,
    properties: { ...config.defaultProperties },
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}
