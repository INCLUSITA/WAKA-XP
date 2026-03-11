import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Clock, Settings, ExternalLink, Copy, MoreVertical, RotateCcw, Trash2, Activity } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import type { ChannelProviderDef, ConnectionStatus } from "@/lib/channelProviders";
import { STATUS_CONFIG } from "@/lib/channelProviders";
import { getProviderIcon } from "./providerIcons";
import { HealthIndicator } from "./HealthIndicator";
import type { HealthStatus } from "@/hooks/useConnectionHealth";

const statusIcons: Record<ConnectionStatus, React.ReactNode> = {
  connected: <CheckCircle2 className="h-3.5 w-3.5" />,
  not_configured: <Clock className="h-3.5 w-3.5" />,
  coming_soon: <Clock className="h-3.5 w-3.5" />,
  error: <AlertCircle className="h-3.5 w-3.5" />,
};

interface ChannelCardProps {
  provider: ChannelProviderDef;
  status: ConnectionStatus;
  webhookUrl?: string;
  healthStatus?: HealthStatus;
  healthCheckedAt?: string | null;
  healthError?: string | null;
  onConfigure: () => void;
  onDisconnect?: () => void;
  onTestConnection?: () => void;
  testing?: boolean;
}

export function ChannelCard({
  provider, status, webhookUrl,
  healthStatus, healthCheckedAt, healthError,
  onConfigure, onDisconnect, onTestConnection, testing,
}: ChannelCardProps) {
  const sc = STATUS_CONFIG[status];
  const isComing = status === "coming_soon";
  const isConnected = status === "connected";
  const Icon = getProviderIcon(provider.icon);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <Card className={`transition-all ${isComing ? "opacity-60" : "hover:shadow-md"}`}>
      <CardHeader className="flex flex-row items-start gap-4 pb-3">
        <div
          className="flex items-center justify-center rounded-lg p-2.5 shrink-0"
          style={{ backgroundColor: `${provider.color}20`, color: provider.color }}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-base">{provider.label}</CardTitle>
            <Badge variant={sc.variant} className="gap-1 text-[11px]">
              {statusIcons[status]}
              {sc.label}
            </Badge>
            {isConnected && healthStatus && (
              <HealthIndicator
                status={healthStatus}
                checkedAt={healthCheckedAt}
                error={healthError}
              />
            )}
          </div>
          <CardDescription className="mt-1">{provider.description}</CardDescription>
        </div>

        <div className="shrink-0 flex items-center gap-1">
          {/* Primary action */}
          {provider.configurable && !isConnected && !isComing && (
            <Button size="sm" onClick={onConfigure}>
              <Settings className="h-4 w-4 mr-1" />
              Connect
            </Button>
          )}
          {provider.id === "360dialog" && isConnected && (
            <Button size="sm" variant="outline" asChild>
              <a href="/whatsapp">
                <ExternalLink className="h-4 w-4 mr-1" />
                Test
              </a>
            </Button>
          )}

          {/* Kebab menu for connected configurable providers */}
          {isConnected && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onTestConnection && (
                  <DropdownMenuItem onClick={onTestConnection} disabled={testing}>
                    <Activity className="h-4 w-4 mr-2" />
                    {testing ? "Checking…" : "Test Connection"}
                  </DropdownMenuItem>
                )}
                {provider.configurable && (
                  <DropdownMenuItem onClick={onConfigure}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reconfigure
                  </DropdownMenuItem>
                )}
                {onDisconnect && (
                  <DropdownMenuItem onClick={onDisconnect} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Disconnect
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      {/* Webhook URL row */}
      {webhookUrl && isConnected && (
        <CardContent className="pt-0">
          <div className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2 text-xs font-mono">
            <span className="text-muted-foreground shrink-0">Webhook:</span>
            <span className="truncate text-foreground">{webhookUrl}</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 shrink-0"
              onClick={() => copyToClipboard(webhookUrl)}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
