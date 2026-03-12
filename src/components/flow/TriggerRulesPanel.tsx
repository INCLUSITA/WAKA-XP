import { useState } from "react";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Radio, Plus, Trash2, Zap, ZapOff, Hash, Inbox, AlertTriangle,
} from "lucide-react";
import {
  TriggerRule,
  createDefaultKeywordRule,
  createDefaultCatchAllRule,
  channelLabel,
  ruleSummary,
} from "@/lib/triggerRules";
import { TriggerReadiness } from "@/lib/flowValidation";

interface TriggerRulesPanelProps {
  rules: TriggerRule[];
  onRulesChange: (rules: TriggerRule[]) => void;
  readiness: TriggerReadiness;
  channel: string;
}

export function TriggerRulesPanel({
  rules,
  onRulesChange,
  readiness,
  channel,
}: TriggerRulesPanelProps) {
  const [newKeyword, setNewKeyword] = useState("");
  const activeCount = rules.filter((r) => r.active).length;

  const addRule = (type: "keyword" | "catch_all") => {
    const rule = type === "keyword"
      ? createDefaultKeywordRule(channel)
      : createDefaultCatchAllRule(channel);
    onRulesChange([...rules, rule]);
  };

  const removeRule = (id: string) => {
    onRulesChange(rules.filter((r) => r.id !== id));
  };

  const toggleRule = (id: string) => {
    onRulesChange(
      rules.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  const updateRuleChannel = (id: string, ch: string | null) => {
    onRulesChange(
      rules.map((r) => (r.id === id ? { ...r, channel: ch } : r))
    );
  };

  const addKeywordToRule = (id: string, keyword: string) => {
    if (!keyword.trim()) return;
    onRulesChange(
      rules.map((r) =>
        r.id === id
          ? { ...r, keywords: [...r.keywords, keyword.trim()] }
          : r
      )
    );
    setNewKeyword("");
  };

  const removeKeyword = (ruleId: string, kwIndex: number) => {
    onRulesChange(
      rules.map((r) =>
        r.id === ruleId
          ? { ...r, keywords: r.keywords.filter((_, i) => i !== kwIndex) }
          : r
      )
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors cursor-pointer ${
            activeCount > 0
              ? "bg-accent/10 text-accent border border-accent/20 hover:bg-accent/15"
              : "bg-muted/50 text-muted-foreground border border-border hover:bg-muted"
          }`}
        >
          <Radio className="h-3 w-3" />
          {activeCount > 0 ? `${activeCount} trigger${activeCount > 1 ? "s" : ""}` : "No triggers"}
        </button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-80 p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-muted/20">
          <div className="flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-semibold">Trigger Rules</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-1.5 text-[10px]"
              onClick={() => addRule("keyword")}
            >
              <Hash className="h-3 w-3 mr-0.5" />
              Keyword
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-1.5 text-[10px]"
              onClick={() => addRule("catch_all")}
            >
              <Inbox className="h-3 w-3 mr-0.5" />
              Catch-all
            </Button>
          </div>
        </div>

        {/* Readiness warning */}
        {!readiness.ready && (
          <div className="flex items-start gap-2 px-3 py-2 border-b border-border/50 bg-destructive/5">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
            <p className="text-[10px] text-destructive leading-relaxed">
              Flow is not launch-ready. Triggers won't fire until the flow has a valid entry point.
            </p>
          </div>
        )}

        {/* Rules list */}
        {rules.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <ZapOff className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No trigger rules defined.</p>
            <p className="text-[10px] text-muted-foreground/70 mt-1">
              Add a <strong>Keyword</strong> or <strong>Catch-all</strong> rule to auto-launch this flow on inbound messages.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50 max-h-64 overflow-y-auto">
            {rules.map((rule) => (
              <TriggerRuleRow
                key={rule.id}
                rule={rule}
                onToggle={() => toggleRule(rule.id)}
                onRemove={() => removeRule(rule.id)}
                onChannelChange={(ch) => updateRuleChannel(rule.id, ch)}
                onAddKeyword={(kw) => addKeywordToRule(rule.id, kw)}
                onRemoveKeyword={(i) => removeKeyword(rule.id, i)}
                newKeyword={newKeyword}
                onNewKeywordChange={setNewKeyword}
              />
            ))}
          </div>
        )}

        {/* Footer summary */}
        {rules.length > 0 && (
          <div className="px-3 py-2 border-t border-border/50 bg-muted/10">
            <p className="text-[10px] text-muted-foreground">
              {activeCount} active rule{activeCount !== 1 ? "s" : ""} · {readiness.ready ? "Flow is launch-ready ✓" : "Flow not launch-ready ✗"}
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

/* ─── Individual rule row ─── */

function TriggerRuleRow({
  rule,
  onToggle,
  onRemove,
  onChannelChange,
  onAddKeyword,
  onRemoveKeyword,
  newKeyword,
  onNewKeywordChange,
}: {
  rule: TriggerRule;
  onToggle: () => void;
  onRemove: () => void;
  onChannelChange: (ch: string | null) => void;
  onAddKeyword: (kw: string) => void;
  onRemoveKeyword: (i: number) => void;
  newKeyword: string;
  onNewKeywordChange: (v: string) => void;
}) {
  const Icon = rule.type === "keyword" ? Hash : Inbox;

  return (
    <div className={`px-3 py-2.5 ${rule.active ? "" : "opacity-50"}`}>
      {/* Row header */}
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="h-3.5 w-3.5 text-accent shrink-0" />
        <span className="text-[11px] font-semibold flex-1">
          {rule.type === "keyword" ? "Keyword" : "Catch-all"}
        </span>
        <Select
          value={rule.channel || "__all__"}
          onValueChange={(v) => onChannelChange(v === "__all__" ? null : v)}
        >
          <SelectTrigger className="h-5 w-20 text-[9px] border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All</SelectItem>
            <SelectItem value="whatsapp">WA</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
            <SelectItem value="telegram">TG</SelectItem>
          </SelectContent>
        </Select>
        <Switch
          checked={rule.active}
          onCheckedChange={onToggle}
          className="scale-75"
        />
        <button
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive transition-colors p-0.5"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* Keyword content */}
      {rule.type === "keyword" && (
        <div className="pl-5.5 space-y-1.5">
          {rule.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {rule.keywords.map((kw, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="text-[10px] py-0 px-1.5 gap-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                  onClick={() => onRemoveKeyword(i)}
                >
                  {kw}
                  <span className="text-[8px]">×</span>
                </Badge>
              ))}
            </div>
          )}
          <div className="flex gap-1">
            <Input
              value={newKeyword}
              onChange={(e) => onNewKeywordChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onAddKeyword(newKeyword);
                }
              }}
              placeholder="Add keyword…"
              className="h-6 text-[10px] flex-1"
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => onAddKeyword(newKeyword)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Catch-all description */}
      {rule.type === "catch_all" && (
        <p className="pl-5.5 text-[10px] text-muted-foreground leading-snug">
          Matches any inbound message on {channelLabel(rule.channel)}.
        </p>
      )}
    </div>
  );
}
