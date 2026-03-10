import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Plus, Clock } from "lucide-react";
import { useState } from "react";
import type { ChannelProviderDef, ConnectionStatus } from "@/lib/channelProviders";
import { CHANNEL_PROVIDERS } from "@/lib/channelProviders";
import { getProviderIcon } from "./providerIcons";

interface ProviderCatalogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** IDs of already-connected providers */
  connectedIds: Set<string>;
  onSelect: (provider: ChannelProviderDef) => void;
}

export function ProviderCatalog({ open, onOpenChange, connectedIds, onSelect }: ProviderCatalogProps) {
  const [search, setSearch] = useState("");

  const available = CHANNEL_PROVIDERS.filter((p) => {
    if (connectedIds.has(p.id) && p.defaultStatus !== "coming_soon") return false;
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      p.label.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags?.some((t) => t.includes(q)) ||
      p.category.includes(q)
    );
  });

  const categories = [...new Set(available.map((p) => p.category))];

  const handleSelect = (provider: ChannelProviderDef) => {
    onOpenChange(false);
    onSelect(provider);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Channel
          </DialogTitle>
          <DialogDescription>
            Select a channel provider to connect to your workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search channels…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-auto space-y-4 py-2">
          {categories.map((cat) => {
            const items = available.filter((p) => p.category === cat);
            if (items.length === 0) return null;
            return (
              <div key={cat}>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
                  {cat}
                </p>
                <div className="space-y-2">
                  {items.map((provider) => {
                    const Icon = getProviderIcon(provider.icon);
                    const isComing = provider.defaultStatus === "coming_soon";
                    const alreadyConnected = connectedIds.has(provider.id);

                    return (
                      <Card
                        key={provider.id}
                        className={`cursor-pointer transition-all ${
                          isComing ? "opacity-60" : "hover:shadow-md hover:border-primary/30"
                        }`}
                        onClick={() => !isComing && !alreadyConnected && handleSelect(provider)}
                      >
                        <CardHeader className="flex flex-row items-center gap-3 py-3 px-4">
                          <div
                            className="flex items-center justify-center rounded-md p-2 shrink-0"
                            style={{ backgroundColor: `${provider.color}20`, color: provider.color }}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm">{provider.label}</CardTitle>
                            <CardDescription className="text-xs mt-0.5 line-clamp-1">
                              {provider.description}
                            </CardDescription>
                          </div>
                          {isComing ? (
                            <Badge variant="secondary" className="gap-1 text-[10px] shrink-0">
                              <Clock className="h-3 w-3" />
                              Coming soon
                            </Badge>
                          ) : alreadyConnected ? (
                            <Badge variant="outline" className="text-[10px] shrink-0">
                              Connected
                            </Badge>
                          ) : (
                            <Button size="sm" variant="outline" className="shrink-0 h-7 text-xs">
                              Connect
                            </Button>
                          )}
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {available.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No channels match your search.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
