import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ChevronDown, ChevronUp, Info } from "lucide-react";
import { useWhatsAppTemplates, WhatsAppTemplate } from "@/hooks/useWhatsAppTemplates";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface TemplatePickerProps {
  templateName: string;
  templateLanguage: string;
  templateParameters: string[];
  onUpdate: (key: string, value: unknown) => void;
}

export function TemplatePicker({ templateName, templateLanguage, templateParameters, onUpdate }: TemplatePickerProps) {
  const { tenantId } = useWorkspace();
  const { data: templates = [], isLoading } = useWhatsAppTemplates(tenantId);
  const [showManual, setShowManual] = useState(!templates.length && !!templateName);

  const selected = templates.find((t) => t.name === templateName && t.language === templateLanguage);

  const handleSelect = (tpl: WhatsAppTemplate) => {
    onUpdate("template_name", tpl.name);
    onUpdate("template_language", tpl.language);
    // Reset parameters to match count
    const params = Array.from({ length: tpl.parameter_count }, (_, i) => templateParameters[i] || "");
    onUpdate("template_parameters", params);
  };

  const updateParam = (index: number, value: string) => {
    const params = [...templateParameters];
    params[index] = value;
    onUpdate("template_parameters", params);
  };

  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-primary" />
          <Label className="text-xs font-semibold text-foreground">HSM Template</Label>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-3 w-3 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-[220px] text-xs">
            Required for outbound messages outside the 24h customer care window.
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Catalog picker */}
      {templates.length > 0 && !showManual && (
        <div className="space-y-2">
          <Select
            value={selected ? `${selected.name}::${selected.language}` : ""}
            onValueChange={(v) => {
              const [name, lang] = v.split("::");
              const tpl = templates.find((t) => t.name === name && t.language === lang);
              if (tpl) handleSelect(tpl);
            }}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Choose a template…" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((t) => (
                <SelectItem key={t.id} value={`${t.name}::${t.language}`}>
                  <span className="flex items-center gap-2">
                    <span>{t.name}</span>
                    <Badge variant="outline" className="text-[9px] px-1 py-0">{t.language}</Badge>
                    {t.parameter_count > 0 && (
                      <span className="text-[9px] text-muted-foreground">{t.parameter_count} param(s)</span>
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Preview body */}
          {selected && selected.body_text && (
            <div className="rounded border border-border/50 bg-background px-2.5 py-2 text-[11px] text-muted-foreground whitespace-pre-wrap">
              {selected.body_text}
            </div>
          )}

          {/* Parameter inputs */}
          {selected && selected.parameter_count > 0 && (
            <div className="space-y-1.5">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Parameters</Label>
              {Array.from({ length: selected.parameter_count }, (_, i) => (
                <Input
                  key={i}
                  value={templateParameters[i] || ""}
                  onChange={(e) => updateParam(i, e.target.value)}
                  placeholder={`{{${i + 1}}} — e.g. @contact.name`}
                  className="h-7 text-xs"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manual fallback */}
      {(showManual || templates.length === 0) && (
        <div className="space-y-2">
          {isLoading ? (
            <p className="text-[11px] text-muted-foreground">Loading templates…</p>
          ) : templates.length === 0 ? (
            <p className="text-[10px] text-muted-foreground">
              No templates in catalog. Enter details manually.
            </p>
          ) : null}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Template name</Label>
              <Input
                value={templateName}
                onChange={(e) => onUpdate("template_name", e.target.value)}
                placeholder="hello_world"
                className="h-7 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Language</Label>
              <Input
                value={templateLanguage}
                onChange={(e) => onUpdate("template_language", e.target.value)}
                placeholder="en"
                className="h-7 text-xs"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Parameters (comma separated)</Label>
            <Input
              value={(templateParameters || []).join(", ")}
              onChange={(e) => onUpdate("template_parameters", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              placeholder="@contact.name, @result.code"
              className="h-7 text-xs"
            />
          </div>
        </div>
      )}

      {/* Toggle manual/catalog */}
      {templates.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-[10px] text-muted-foreground h-6"
          onClick={() => setShowManual(!showManual)}
        >
          {showManual ? (
            <><ChevronUp className="h-3 w-3 mr-1" /> Use catalog</>
          ) : (
            <><ChevronDown className="h-3 w-3 mr-1" /> Enter manually</>
          )}
        </Button>
      )}
    </div>
  );
}
