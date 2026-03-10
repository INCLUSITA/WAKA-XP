/**
 * Channel Provider Registry
 *
 * Data-driven provider catalog. Adding a new channel = adding an entry here.
 * No bespoke dialog logic required.
 */

export type FieldType = "text" | "password" | "url" | "email";

export interface ProviderField {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
}

export type ConnectionStatus = "connected" | "not_configured" | "coming_soon" | "error";

export interface ChannelProviderDef {
  id: string;
  label: string;
  description: string;
  /** Lucide icon name */
  icon: string;
  /** HSL color string */
  color: string;
  /** Whether this provider can be configured by the user */
  configurable: boolean;
  /** If true, this provider auto-seeds as connected (e.g. 360dialog) */
  autoSeed?: boolean;
  /** Default auto-seed config */
  seedConfig?: {
    displayName: string;
    webhookPath?: string;
  };
  /** Default status when no connection exists */
  defaultStatus: ConnectionStatus;
  /** Config fields shown in the generic dialog */
  fields: ProviderField[];
  /** External help link */
  helpUrl?: string;
  /** Category for grouping */
  category: "messaging" | "voice" | "email" | "sms" | "multi";
  /** Tags for filtering */
  tags?: string[];
}

export const CHANNEL_PROVIDERS: ChannelProviderDef[] = [
  {
    id: "360dialog",
    label: "360dialog · WhatsApp",
    description: "Envío y recepción de mensajes WhatsApp vía 360dialog WABA API.",
    icon: "MessageCircle",
    color: "hsl(142 71% 45%)",
    configurable: false,
    autoSeed: true,
    seedConfig: {
      displayName: "360dialog · WhatsApp",
      webhookPath: "whatsapp-webhook",
    },
    defaultStatus: "connected",
    fields: [],
    helpUrl: "https://docs.360dialog.com",
    category: "messaging",
    tags: ["whatsapp", "waba"],
  },
  {
    id: "telegram",
    label: "Telegram Bot",
    description: "Conecta un bot de Telegram para mensajería bidireccional.",
    icon: "Send",
    color: "hsl(200 80% 50%)",
    configurable: true,
    defaultStatus: "not_configured",
    fields: [
      {
        key: "bot_token",
        label: "Bot Token",
        type: "password",
        placeholder: "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11",
        required: true,
        helpText: "Obtén el token desde @BotFather en Telegram.",
      },
      {
        key: "bot_username",
        label: "Bot Username",
        type: "text",
        placeholder: "@my_waka_bot",
        required: false,
      },
    ],
    helpUrl: "https://core.telegram.org/bots#botfather",
    category: "messaging",
    tags: ["telegram", "bot"],
  },
  {
    id: "azure_cs",
    label: "Azure Communication Services",
    description: "SMS, voz y email a través de Azure Communication Services.",
    icon: "Phone",
    color: "hsl(210 60% 50%)",
    configurable: false,
    defaultStatus: "coming_soon",
    fields: [
      {
        key: "connection_string",
        label: "Connection String",
        type: "password",
        placeholder: "endpoint=https://...;accesskey=...",
        required: true,
      },
      {
        key: "sender_phone",
        label: "Sender Phone Number",
        type: "text",
        placeholder: "+1234567890",
        required: true,
      },
    ],
    category: "multi",
    tags: ["sms", "voice", "email", "azure"],
  },
  {
    id: "vonage",
    label: "Vonage SMS",
    description: "Envío de SMS masivos y transaccionales vía Vonage (Nexmo).",
    icon: "Smartphone",
    color: "hsl(270 60% 55%)",
    configurable: true,
    defaultStatus: "not_configured",
    fields: [
      {
        key: "api_key",
        label: "API Key",
        type: "text",
        placeholder: "a1b2c3d4",
        required: true,
      },
      {
        key: "api_secret",
        label: "API Secret",
        type: "password",
        placeholder: "your-api-secret",
        required: true,
      },
      {
        key: "sender_id",
        label: "Sender ID / From Number",
        type: "text",
        placeholder: "WAKA or +1234567890",
        required: false,
      },
    ],
    helpUrl: "https://developer.vonage.com/getting-started",
    category: "sms",
    tags: ["sms", "nexmo"],
  },
  {
    id: "mailgun",
    label: "Mailgun Email",
    description: "Envío de emails transaccionales y campañas vía Mailgun.",
    icon: "Mail",
    color: "hsl(15 80% 55%)",
    configurable: true,
    defaultStatus: "not_configured",
    fields: [
      {
        key: "api_key",
        label: "API Key",
        type: "password",
        placeholder: "key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        required: true,
      },
      {
        key: "domain",
        label: "Sending Domain",
        type: "text",
        placeholder: "mg.yourdomain.com",
        required: true,
      },
      {
        key: "from_email",
        label: "From Email",
        type: "email",
        placeholder: "noreply@yourdomain.com",
        required: false,
      },
    ],
    helpUrl: "https://documentation.mailgun.com",
    category: "email",
    tags: ["email", "transactional"],
  },
];

/** Get a provider definition by ID */
export function getProviderDef(id: string): ChannelProviderDef | undefined {
  return CHANNEL_PROVIDERS.find((p) => p.id === id);
}

/** Get all configurable providers (for the "Add Channel" catalog) */
export function getConfigurableProviders(): ChannelProviderDef[] {
  return CHANNEL_PROVIDERS.filter((p) => p.configurable || p.defaultStatus === "coming_soon");
}

/** Status display config */
export const STATUS_CONFIG: Record<
  ConnectionStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  connected: { label: "Connected", variant: "default" },
  not_configured: { label: "Not configured", variant: "outline" },
  coming_soon: { label: "Coming soon", variant: "secondary" },
  error: { label: "Error", variant: "destructive" },
};
