import { useState, useCallback, useEffect } from "react";
import { Plus, Trash2, Zap, Hash, Inbox, Smartphone, ToggleLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { toast } from "sonner";

interface TriggerRow {
  id: string;
  keyword: string;
  channel: string;
  flow_id: string | null;
  flow_name: string;
  active: boolean;
}

interface LinkedFlow {
  id: string;
  name: string;
}

interface Props {
  experienceId: string;
}

export function ExperienceTriggersTab({ experienceId }: Props) {
  const { tenantId } = useWorkspace();
  const [triggers, setTriggers] = useState<TriggerRow[]>([]);
  const [linkedFlows, setLinkedFlows] = useState<LinkedFlow[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [newChannel, setNewChannel] = useState("all");
  const [newFlowId, setNewFlowId] = useState("");

  // Load linked flows for the experience
  const fetchFlows = useCallback(async () => {
    if (!tenantId) return;
    const { data } = await supabase
      .from("flows")
      .select("id, name")
      .eq("tenant_id", tenantId)
      .eq("experience_id", experienceId)
      .order("name");
    setLinkedFlows(data || []);
  }, [tenantId, experienceId]);

  useEffect(() => {
    fetchFlows();
  }, [fetchFlows]);

  // Triggers are stored in-memory for now (persisted in flow metadata via trigger_rules)
  // This is a CX-layer that maps keywords to flows in the experience

  const addTrigger = () => {
    if (!newKeyword.trim()) return;
    const flow = linkedFlows.find((f) => f.id === newFlowId);
    const trigger: TriggerRow = {
      id: crypto.randomUUID(),
      keyword: newKeyword.trim().toUpperCase(),
      channel: newChannel,
      flow_id: newFlowId || null,
      flow_name: flow?.name || "—",
      active: true,
    };
    setTriggers((prev) => [...prev, trigger]);
    setNewKeyword("");
    setNewChannel("all");
    setNewFlowId("");
    setShowAdd(false);
    toast.success(`Trigger "${trigger.keyword}" added`);
  };

  const removeTrigger = (id: string) => {
    setTriggers((prev) => prev.filter((t) => t.id !== id));
    toast.success("Trigger removed");
  };

  const toggleTrigger = (id: string) => {
    setTriggers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t))
    );
  };

  const channelLabel = (ch: string) => {
    const map: Record<string, string> = {
      all: "Omnichannel",
      whatsapp: "WABA",
      telegram: "Telegram",
      sms: "SMS",
    };
    return map[ch] || ch;
  };

  const channelColor = (ch: string) => {
    const map: Record<string, string> = {
      all: "bg-primary/10 text-primary",
      whatsapp: "bg-emerald-500/10 text-emerald-600",
      telegram: "bg-sky-500/10 text-sky-600",
      sms: "bg-amber-500/10 text-amber-600",
    };
    return map[ch] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-accent" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Keywords & Triggers</p>
          <Badge variant="secondary" className="text-[10px]">{triggers.length}</Badge>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowAdd(!showAdd)}
          className="text-xs gap-1 border-accent/30 text-accent hover:bg-accent/10"
        >
          <Plus className="h-3 w-3" /> Add Trigger
        </Button>
      </div>

      {showAdd && (
        <Card className="border-accent/20 bg-accent/5 p-4">
          <div className="grid grid-cols-4 gap-3 items-end">
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-medium">Keyword</label>
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="e.g. HOLA"
                className="h-8 text-sm font-mono uppercase"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && addTrigger()}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-medium">Channel</label>
              <Select value={newChannel} onValueChange={setNewChannel}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all"><div className="flex items-center gap-1.5"><Smartphone className="h-3 w-3" /> Omnichannel</div></SelectItem>
                  <SelectItem value="whatsapp">WABA</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-medium">Flow Destination</label>
              <Select value={newFlowId} onValueChange={setNewFlowId}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select flow…" />
                </SelectTrigger>
                <SelectContent>
                  {linkedFlows.length === 0 ? (
                    <SelectItem value="__none" disabled>No linked flows</SelectItem>
                  ) : (
                    linkedFlows.map((f) => (
                      <SelectItem key={f.id} value={f.id} className="text-xs">{f.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={addTrigger} disabled={!newKeyword.trim()} className="h-8">Add</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)} className="h-8">Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-[10px] uppercase tracking-wider w-[25%]">
                <div className="flex items-center gap-1"><Hash className="h-3 w-3" /> Keyword</div>
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider w-[20%]">
                <div className="flex items-center gap-1"><Smartphone className="h-3 w-3" /> Channel</div>
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider w-[30%]">Flow Destination</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider w-[10%] text-center">
                <div className="flex items-center gap-1 justify-center"><ToggleLeft className="h-3 w-3" /> Active</div>
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider w-[15%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {triggers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <Zap className="h-8 w-8 mx-auto text-muted-foreground/20 mb-2" />
                  <p className="text-sm text-muted-foreground">No triggers configured</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    Add keywords to auto-launch flows when users send matching messages
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              triggers.map((t) => (
                <TableRow key={t.id} className={`group transition-colors ${t.active ? "" : "opacity-50"}`}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs tracking-wide">
                      {t.keyword}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-[10px] ${channelColor(t.channel)}`}>
                      {channelLabel(t.channel)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">{t.flow_name}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={t.active}
                      onCheckedChange={() => toggleTrigger(t.id)}
                      className="scale-90"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => removeTrigger(t.id)}
                      className="p-1 rounded hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive/70" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-[10px] text-muted-foreground/50 italic">
        💡 Keywords are case-insensitive. When a user sends a matching keyword on the specified channel, the linked flow will be triggered automatically.
      </p>
    </div>
  );
}
