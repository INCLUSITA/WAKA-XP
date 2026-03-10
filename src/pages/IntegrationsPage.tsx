import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { toast } from "@/hooks/use-toast";
import {
  MessageCircle, Send, Phone, Settings, CheckCircle2, AlertCircle, Clock, ExternalLink, Copy
} from "lucide-react";

type ConnectionStatus = "connected" | "not_configured" | "coming_soon" | "error";

interface ChannelProvider {
  id: string;
  provider: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  defaultStatus: ConnectionStatus;
  configurable: boolean;
}

const PROVIDERS: ChannelProvider[] = [
  {
    id: "360dialog",
    provider: "360dialog",
    label: "360dialog · WhatsApp",
    description: "Envío y recepción de mensajes WhatsApp vía 360dialog WABA API.",
    icon: <MessageCircle className="h-6 w-6" />,
    color: "hsl(142 71% 45%)",
    defaultStatus: "connected",
    configurable: false,
  },
  {
    id: "telegram",
    provider: "telegram",
    label: "Telegram Bot",
    description: "Conecta un bot de Telegram para mensajería bidireccional.",
    icon: <Send className="h-6 w-6" />,
    color: "hsl(200 80% 50%)",
    defaultStatus: "not_configured",
    configurable: true,
  },
  {
    id: "azure_cs",
    provider: "azure_cs",
    label: "Azure Communication Services",
    description: "SMS, voz y email a través de Azure Communication Services.",
    icon: <Phone className="h-6 w-6" />,
    color: "hsl(210 60% 50%)",
    defaultStatus: "coming_soon",
    configurable: false,
  },
];

const statusConfig: Record<ConnectionStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  connected: { label: "Connected", variant: "default", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  not_configured: { label: "Not configured", variant: "outline", icon: <Clock className="h-3.5 w-3.5" /> },
  coming_soon: { label: "Coming soon", variant: "secondary", icon: <Clock className="h-3.5 w-3.5" /> },
  error: { label: "Error", variant: "destructive", icon: <AlertCircle className="h-3.5 w-3.5" /> },
};

export default function IntegrationsPage() {
  const { tenantId } = useWorkspace();
  const [connections, setConnections] = useState<Record<string, { status: ConnectionStatus; config: Record<string, string>; webhook_url?: string }>>({});
  const [telegramOpen, setTelegramOpen] = useState(false);
  const [telegramForm, setTelegramForm] = useState({ name: "", bot_token: "", bot_username: "" });
  const [saving, setSaving] = useState(false);

  // Load existing connections
  useEffect(() => {
    if (!tenantId) return;
    (async () => {
      const { data } = await supabase
        .from("channel_connections")
        .select("*")
        .eq("tenant_id", tenantId);
      if (data) {
        const map: typeof connections = {};
        data.forEach((row: any) => {
          map[row.provider] = {
            status: row.status as ConnectionStatus,
            config: (row.config || {}) as Record<string, string>,
            webhook_url: row.webhook_url ?? undefined,
          };
        });
        setConnections(map);
      }
    })();
  }, [tenantId]);

  // Seed 360dialog as connected if not present
  useEffect(() => {
    if (!tenantId) return;
    if (connections["360dialog"]) return;
    // Auto-seed 360dialog
    (async () => {
      await supabase.from("channel_connections").upsert({
        tenant_id: tenantId,
        provider: "360dialog",
        display_name: "360dialog · WhatsApp",
        status: "connected",
        config: {},
        webhook_url: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-webhook`,
      }, { onConflict: "tenant_id,provider" });
      setConnections(prev => ({
        ...prev,
        "360dialog": {
          status: "connected",
          config: {},
          webhook_url: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-webhook`,
        },
      }));
    })();
  }, [tenantId, connections]);

  const getStatus = (provider: ChannelProvider): ConnectionStatus => {
    if (provider.defaultStatus === "coming_soon") return "coming_soon";
    return connections[provider.provider]?.status as ConnectionStatus || provider.defaultStatus;
  };

  const handleTelegramSave = async () => {
    if (!tenantId) return;
    if (!telegramForm.bot_token.trim()) {
      toast({ title: "Bot token requerido", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telegram-webhook`;
      const { error } = await supabase.from("channel_connections").upsert({
        tenant_id: tenantId,
        provider: "telegram",
        display_name: telegramForm.name || "Telegram Bot",
        status: "connected",
        config: {
          bot_token: telegramForm.bot_token.trim(),
          bot_username: telegramForm.bot_username.trim(),
        },
        webhook_url: webhookUrl,
      }, { onConflict: "tenant_id,provider" });

      if (error) throw error;

      setConnections(prev => ({
        ...prev,
        telegram: {
          status: "connected",
          config: { bot_token: telegramForm.bot_token.trim(), bot_username: telegramForm.bot_username.trim() },
          webhook_url: webhookUrl,
        },
      }));
      toast({ title: "Telegram conectado" });
      setTelegramOpen(false);
    } catch (e: any) {
      toast({ title: "Error al guardar", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const openTelegramConfig = () => {
    const existing = connections["telegram"];
    if (existing?.config) {
      setTelegramForm({
        name: existing.config.display_name || "",
        bot_token: existing.config.bot_token || "",
        bot_username: existing.config.bot_username || "",
      });
    } else {
      setTelegramForm({ name: "", bot_token: "", bot_username: "" });
    }
    setTelegramOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado al portapapeles" });
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <SidebarTrigger />
        <h1 className="text-lg font-bold text-foreground">Connections</h1>
        <Badge variant="outline" className="ml-2 text-xs">{PROVIDERS.length} channels</Badge>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <p className="text-sm text-muted-foreground mb-6">
            Configura y gestiona los canales de comunicación conectados a tu workspace.
          </p>

          {PROVIDERS.map((provider) => {
            const status = getStatus(provider);
            const sc = statusConfig[status];
            const conn = connections[provider.provider];
            const isComing = status === "coming_soon";

            return (
              <Card
                key={provider.id}
                className={`transition-all ${isComing ? "opacity-60" : "hover:shadow-md"}`}
              >
                <CardHeader className="flex flex-row items-start gap-4 pb-3">
                  <div
                    className="flex items-center justify-center rounded-lg p-2.5 shrink-0"
                    style={{ backgroundColor: `${provider.color}20`, color: provider.color }}
                  >
                    {provider.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base">{provider.label}</CardTitle>
                      <Badge variant={sc.variant} className="gap-1 text-[11px]">
                        {sc.icon}
                        {sc.label}
                      </Badge>
                    </div>
                    <CardDescription className="mt-1">{provider.description}</CardDescription>
                  </div>
                  <div className="shrink-0">
                    {provider.configurable && (
                      <Button
                        size="sm"
                        variant={status === "connected" ? "outline" : "default"}
                        onClick={openTelegramConfig}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        {status === "connected" ? "Configure" : "Connect"}
                      </Button>
                    )}
                    {provider.id === "360dialog" && status === "connected" && (
                      <Button size="sm" variant="outline" asChild>
                        <a href="/whatsapp">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Test
                        </a>
                      </Button>
                    )}
                  </div>
                </CardHeader>

                {/* Show webhook info for connected providers */}
                {conn?.webhook_url && status === "connected" && (
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2 text-xs font-mono">
                      <span className="text-muted-foreground shrink-0">Webhook:</span>
                      <span className="truncate text-foreground">{conn.webhook_url}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 shrink-0"
                        onClick={() => copyToClipboard(conn.webhook_url!)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Telegram Config Dialog */}
      <Dialog open={telegramOpen} onOpenChange={setTelegramOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" style={{ color: "hsl(200 80% 50%)" }} />
              Telegram Bot Connection
            </DialogTitle>
            <DialogDescription>
              Ingresa los datos de tu bot de Telegram. Puedes obtener el token desde{" "}
              <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-primary underline">
                @BotFather
              </a>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="tg-name">Connection name</Label>
              <Input
                id="tg-name"
                placeholder="e.g. WAKA Support Bot"
                value={telegramForm.name}
                onChange={(e) => setTelegramForm(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tg-token">Bot token <span className="text-destructive">*</span></Label>
              <Input
                id="tg-token"
                type="password"
                placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                value={telegramForm.bot_token}
                onChange={(e) => setTelegramForm(p => ({ ...p, bot_token: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tg-user">Bot username <span className="text-muted-foreground text-xs">(opcional)</span></Label>
              <Input
                id="tg-user"
                placeholder="@my_waka_bot"
                value={telegramForm.bot_username}
                onChange={(e) => setTelegramForm(p => ({ ...p, bot_username: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTelegramOpen(false)}>Cancelar</Button>
            <Button onClick={handleTelegramSave} disabled={saving}>
              {saving ? "Guardando…" : "Connect & Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
