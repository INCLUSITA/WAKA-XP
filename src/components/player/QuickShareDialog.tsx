/**
 * QuickShareDialog — Lightweight dialog to generate a branded share link
 * directly from the Player without navigating to Demo Shares.
 */

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Copy, ExternalLink, Share2, Check } from "lucide-react";
import { PUBLIC_APP_ORIGIN, PUBLIC_SHARE_ORIGIN } from "@/lib/constants";

interface QuickShareDialogProps {
  open: boolean;
  onClose: () => void;
  flowTitle?: string | null;
  currentUrl?: string;
}

export function QuickShareDialog({ open, onClose, flowTitle, currentUrl }: QuickShareDialogProps) {
  const { tenant, user } = useWorkspace();
  const [title, setTitle] = useState(flowTitle || "WAKA Player Demo");
  const [expiresDays, setExpiresDays] = useState<string>("7");
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Always point to branded public domain (never preview/lovable domains)
  const current = currentUrl ? new URL(currentUrl) : null;
  const activeFlow = current?.searchParams.get("flow");
  const demoUrl = activeFlow
    ? `${PUBLIC_APP_ORIGIN}/player/public?flow=${encodeURIComponent(activeFlow)}`
    : `${PUBLIC_APP_ORIGIN}/player/public`;

  const createShare = useMutation({
    mutationFn: async () => {
      const expiresAt = expiresDays !== "none"
        ? new Date(Date.now() + Number(expiresDays) * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { data, error } = await (supabase as any)
        .from("demo_shares")
        .insert({
          title,
          demo_url: demoUrl,
          demo_type: "iframe",
          expires_at: expiresAt,
          created_by: user?.id || null,
          tenant_id: tenant?.id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      const url = `${PUBLIC_SHARE_ORIGIN}/shared/${data.token}`;
      setGeneratedUrl(url);
      navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link creado y copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    },
    onError: (err: any) => {
      toast.error("Error al crear el link", { description: err.message });
    },
  });

  const handleCopy = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    toast.success("Link copiado");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setGeneratedUrl(null);
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-primary" />
            Compartir demo
          </DialogTitle>
        </DialogHeader>

        {!generatedUrl ? (
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs">Título de la demo</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="WAKA Player Demo"
                className="mt-1"
                autoFocus
              />
            </div>
            <div>
              <Label className="text-xs">Expiración</Label>
              <Select value={expiresDays} onValueChange={setExpiresDays}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 día</SelectItem>
                  <SelectItem value="7">7 días</SelectItem>
                  <SelectItem value="30">30 días</SelectItem>
                  <SelectItem value="none">Sin expiración</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="pt-1">
              <p className="text-[10px] text-muted-foreground mb-2">
                URL: <span className="font-mono">{demoUrl.length > 50 ? `${demoUrl.slice(0, 50)}…` : demoUrl}</span>
              </p>
              <Button
                onClick={() => createShare.mutate()}
                disabled={!title.trim() || createShare.isPending}
                className="w-full"
              >
                {createShare.isPending ? "Generando…" : "Generar link compartible"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1.5">Link listo para compartir</p>
              <div className="flex items-center gap-2">
                <Input
                  value={generatedUrl}
                  readOnly
                  className="text-xs font-mono h-8 bg-background"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <Button variant="outline" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={handleCopy}>
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1"
                onClick={() => window.open(generatedUrl, "_blank")}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Abrir
              </Button>
              <Button size="sm" className="flex-1" onClick={handleClose}>
                Listo
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
