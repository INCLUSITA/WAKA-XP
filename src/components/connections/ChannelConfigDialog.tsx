import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Eye, EyeOff } from "lucide-react";
import type { ChannelProviderDef } from "@/lib/channelProviders";
import { getProviderIcon } from "@/components/connections/providerIcons";

interface ChannelConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: ChannelProviderDef | null;
  /** Existing config values when editing */
  existingConfig?: Record<string, string>;
  existingName?: string;
  saving: boolean;
  onSave: (provider: ChannelProviderDef, displayName: string, config: Record<string, string>) => void;
}

export function ChannelConfigDialog({
  open,
  onOpenChange,
  provider,
  existingConfig,
  existingName,
  saving,
  onSave,
}: ChannelConfigDialogProps) {
  const [displayName, setDisplayName] = useState("");
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [revealedFields, setRevealedFields] = useState<Set<string>>(new Set());

  // Reset form when provider or existing config changes
  useEffect(() => {
    if (!provider) return;
    setDisplayName(existingName || provider.label);
    const initial: Record<string, string> = {};
    provider.fields.forEach((f) => {
      initial[f.key] = existingConfig?.[f.key] || "";
    });
    setFormValues(initial);
    setRevealedFields(new Set());
  }, [provider, existingConfig, existingName, open]);

  if (!provider) return null;

  const isEdit = !!existingConfig;
  const Icon = getProviderIcon(provider.icon);

  const hasRequiredEmpty = provider.fields
    .filter((f) => f.required)
    .some((f) => !formValues[f.key]?.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasRequiredEmpty) return;
    onSave(provider, displayName, formValues);
  };

  const toggleReveal = (key: string) => {
    setRevealedFields((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div
                className="flex items-center justify-center rounded-md p-1.5"
                style={{ backgroundColor: `${provider.color}20`, color: provider.color }}
              >
                <Icon className="h-5 w-5" />
              </div>
              {isEdit ? "Edit" : "Connect"} {provider.label}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 flex-wrap">
              {provider.description}
              {provider.helpUrl && (
                <a
                  href={provider.helpUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary underline text-xs"
                >
                  Docs <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Display name — always present */}
            <div className="space-y-2">
              <Label htmlFor="cfg-display-name">Connection name</Label>
              <Input
                id="cfg-display-name"
                placeholder={`e.g. ${provider.label}`}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            {/* Dynamic fields from provider schema */}
            {provider.fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={`cfg-${field.key}`} className="flex items-center gap-1.5">
                  {field.label}
                  {field.required && <span className="text-destructive text-xs">*</span>}
                  {!field.required && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0 font-normal">
                      optional
                    </Badge>
                  )}
                </Label>
                <div className="relative">
                  <Input
                    id={`cfg-${field.key}`}
                    type={field.type === "password" && !revealedFields.has(field.key) ? "password" : "text"}
                    placeholder={field.placeholder}
                    value={formValues[field.key] || ""}
                    onChange={(e) =>
                      setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                  />
                  {field.type === "password" && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => toggleReveal(field.key)}
                    >
                      {revealedFields.has(field.key) ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  )}
                </div>
                {field.helpText && (
                  <p className="text-xs text-muted-foreground">{field.helpText}</p>
                )}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || hasRequiredEmpty}>
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Connect"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
