import { useState, useEffect, useCallback } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { toast } from "@/hooks/use-toast";
import {
  CHANNEL_PROVIDERS,
  type ChannelProviderDef,
  type ConnectionStatus,
} from "@/lib/channelProviders";
import { ChannelCard } from "@/components/connections/ChannelCard";
import { ChannelConfigDialog } from "@/components/connections/ChannelConfigDialog";
import { ProviderCatalog } from "@/components/connections/ProviderCatalog";
import { useConnectionHealth, type HealthStatus } from "@/hooks/useConnectionHealth";

interface ConnectionData {
  id?: string;
  status: ConnectionStatus;
  config: Record<string, string>;
  webhook_url?: string;
  display_name?: string;
  health_status?: HealthStatus;
  health_checked_at?: string | null;
  health_error?: string | null;
}

export default function IntegrationsPage() {
  const { tenantId } = useWorkspace();
  const [connections, setConnections] = useState<Record<string, ConnectionData>>({});
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [configProvider, setConfigProvider] = useState<ChannelProviderDef | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { checking, runHealthCheck } = useConnectionHealth();

  // ── Load connections ──────────────────────────────────────────
  useEffect(() => {
    if (!tenantId) return;
    (async () => {
      const { data } = await supabase
        .from("channel_connections")
        .select("*")
        .eq("tenant_id", tenantId);
      if (data) {
        const map: Record<string, ConnectionData> = {};
        data.forEach((row: any) => {
          map[row.provider] = {
            id: row.id,
            status: row.status as ConnectionStatus,
            config: (row.config || {}) as Record<string, string>,
            webhook_url: row.webhook_url ?? undefined,
            display_name: row.display_name,
            health_status: (row.health_status as HealthStatus) || "unknown",
            health_checked_at: row.health_checked_at,
            health_error: row.health_error,
          };
        });
        setConnections(map);
      }
    })();
  }, [tenantId]);

  // ── Auto-seed providers marked autoSeed ───────────────────────
  useEffect(() => {
    if (!tenantId) return;
    CHANNEL_PROVIDERS.filter((p) => p.autoSeed && !connections[p.id]).forEach(async (provider) => {
      const webhookUrl = provider.seedConfig?.webhookPath
        ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${provider.seedConfig.webhookPath}`
        : undefined;
      await supabase.from("channel_connections").upsert(
        {
          tenant_id: tenantId,
          provider: provider.id,
          display_name: provider.seedConfig?.displayName || provider.label,
          status: "connected",
          config: {},
          webhook_url: webhookUrl,
        },
        { onConflict: "tenant_id,provider" }
      );
      setConnections((prev) => ({
        ...prev,
        [provider.id]: { status: "connected", config: {}, webhook_url: webhookUrl, health_status: "unknown" },
      }));
    });
  }, [tenantId, connections]);

  // ── Resolve effective status ──────────────────────────────────
  const getStatus = useCallback(
    (provider: ChannelProviderDef): ConnectionStatus => {
      if (provider.defaultStatus === "coming_soon") return "coming_soon";
      return (connections[provider.id]?.status as ConnectionStatus) || provider.defaultStatus;
    },
    [connections]
  );

  // ── Open config dialog ────────────────────────────────────────
  const openConfig = (provider: ChannelProviderDef) => {
    setConfigProvider(provider);
    setConfigOpen(true);
  };

  // ── Save handler ──────────────────────────────────────────────
  const handleSave = async (
    provider: ChannelProviderDef,
    displayName: string,
    config: Record<string, string>
  ) => {
    if (!tenantId) return;
    setSaving(true);
    try {
      const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${provider.id}-webhook`;
      const { error } = await supabase.from("channel_connections").upsert(
        {
          tenant_id: tenantId,
          provider: provider.id,
          display_name: displayName || provider.label,
          status: "connected",
          config,
          webhook_url: webhookUrl,
        },
        { onConflict: "tenant_id,provider" }
      );
      if (error) throw error;

      setConnections((prev) => ({
        ...prev,
        [provider.id]: {
          status: "connected",
          config,
          webhook_url: webhookUrl,
          display_name: displayName,
          health_status: "unknown",
        },
      }));
      toast({ title: `${provider.label} connected` });
      setConfigOpen(false);
    } catch (e: any) {
      toast({ title: "Error saving connection", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // ── Disconnect handler ────────────────────────────────────────
  const handleDisconnect = async (provider: ChannelProviderDef) => {
    if (!tenantId) return;
    const { error } = await supabase
      .from("channel_connections")
      .delete()
      .eq("tenant_id", tenantId)
      .eq("provider", provider.id);
    if (error) {
      toast({ title: "Error disconnecting", description: error.message, variant: "destructive" });
      return;
    }
    setConnections((prev) => {
      const next = { ...prev };
      delete next[provider.id];
      return next;
    });
    toast({ title: `${provider.label} disconnected` });
  };

  // ── Test connection handler ───────────────────────────────────
  const handleTestConnection = async (provider: ChannelProviderDef) => {
    const conn = connections[provider.id];
    if (!conn?.id) return;
    const result = await runHealthCheck(conn.id);
    if (result) {
      setConnections((prev) => ({
        ...prev,
        [provider.id]: {
          ...prev[provider.id],
          health_status: result.status,
          health_checked_at: result.checkedAt || null,
          health_error: result.error || null,
        },
      }));
    }
  };

  // ── Split: active vs available ────────────────────────────────
  const activeProviders = CHANNEL_PROVIDERS.filter(
    (p) => getStatus(p) === "connected"
  );
  const availableProviders = CHANNEL_PROVIDERS.filter(
    (p) => getStatus(p) !== "connected"
  );
  const connectedIds = new Set(activeProviders.map((p) => p.id));
  const activeCount = activeProviders.length;

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <SidebarTrigger />
        <h1 className="text-lg font-bold text-foreground">Connections</h1>
        <Badge variant="outline" className="ml-1 text-xs">
          {activeCount} active
        </Badge>
        <div className="flex-1" />
        <Button size="sm" onClick={() => setCatalogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Channel
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Explanation banner */}
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Connections</span> is where you configure which channels are available for your flows.
              To see how flows execute on each channel, visit{" "}
              <a href="/runs" className="font-medium text-primary underline underline-offset-2 hover:text-primary/80">
                Runs
              </a>.
            </p>
          </div>

          {/* Active Connections */}
          {activeProviders.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                Active Connections
                <Badge variant="default" className="text-[10px]">{activeCount}</Badge>
              </h2>
              <div className="space-y-3">
                {activeProviders.map((provider) => {
                  const conn = connections[provider.id];
                  return (
                    <ChannelCard
                      key={provider.id}
                      provider={provider}
                      status="connected"
                      webhookUrl={conn?.webhook_url}
                      healthStatus={(conn?.health_status as HealthStatus) || "unknown"}
                      healthCheckedAt={conn?.health_checked_at}
                      healthError={conn?.health_error}
                      onConfigure={() => openConfig(provider)}
                      onDisconnect={
                        provider.configurable ? () => handleDisconnect(provider) : undefined
                      }
                      onTestConnection={() => handleTestConnection(provider)}
                      testing={!!conn?.id && !!checking[conn.id]}
                    />
                  );
                })}
              </div>
            </section>
          )}

          {/* Available Channels */}
          {availableProviders.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground mb-3">
                Available Channels
              </h2>
              <div className="space-y-3">
                {availableProviders.map((provider) => (
                  <ChannelCard
                    key={provider.id}
                    provider={provider}
                    status={getStatus(provider)}
                    onConfigure={() => openConfig(provider)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Provider Catalog */}
      <ProviderCatalog
        open={catalogOpen}
        onOpenChange={setCatalogOpen}
        connectedIds={connectedIds}
        onSelect={openConfig}
      />

      {/* Generic Config Dialog */}
      <ChannelConfigDialog
        open={configOpen}
        onOpenChange={setConfigOpen}
        provider={configProvider}
        existingConfig={
          configProvider && connections[configProvider.id]?.status === "connected"
            ? connections[configProvider.id].config
            : undefined
        }
        existingName={
          configProvider ? connections[configProvider.id]?.display_name : undefined
        }
        saving={saving}
        onSave={handleSave}
      />
    </div>
  );
}
