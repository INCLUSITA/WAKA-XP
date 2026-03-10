import { useCallback, useRef, useState } from "react";
import { Node } from "@xyflow/react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Trash2, Upload, Link, Image, FileText, Music, Video, File, Loader2, AlertTriangle, Library, CheckCircle2, XCircle } from "lucide-react";
import { NodeEffectsEditor, NodeEffect, AvailableEntity } from "./NodeEffectsEditor";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getChannelConstraints } from "@/lib/flowValidation";
import { ExpressionInput } from "./ExpressionInput";

interface NodeConfigPanelProps {
  node: Node;
  onUpdate: (id: string, data: Record<string, unknown>) => void;
  onClose: () => void;
  onDelete: (id: string) => void;
  channel?: string;
  availableEntities?: AvailableEntity[];
}

const nodeTypeLabels: Record<string, string> = {
  sendMsg: "Send Message",
  waitResponse: "Wait for Response",
  splitExpression: "Split by Expression",
  splitContactField: "Split by Contact Field",
  splitResult: "Split by Result",
  splitRandom: "Split by Random",
  splitGroup: "Split by Group",
  webhook: "Call Webhook",
  saveResult: "Save Flow Result",
  updateContact: "Update Contact",
  sendEmail: "Send Email",
  callAI: "Call AI Service",
  enterFlow: "Enter Another Flow",
  openTicket: "Open Ticket",
  callZapier: "Call Zapier",
  sendAirtime: "Send Airtime",
  addGroup: "Add to Group",
  removeGroup: "Remove from Group",
};

interface Attachment {
  type: "url" | "upload";
  url: string;
  name?: string;
  mime?: string;
}

const ACCEPT_TYPES = "image/*,application/pdf,audio/*,video/*,.doc,.docx,.xls,.xlsx,.ppt,.pptx";

const mimeIcon = (mime?: string) => {
  if (!mime) return <File className="h-3.5 w-3.5 text-muted-foreground" />;
  if (mime.startsWith("image")) return <Image className="h-3.5 w-3.5 text-blue-500" />;
  if (mime.startsWith("audio")) return <Music className="h-3.5 w-3.5 text-purple-500" />;
  if (mime.startsWith("video")) return <Video className="h-3.5 w-3.5 text-red-500" />;
  if (mime.includes("pdf")) return <FileText className="h-3.5 w-3.5 text-orange-500" />;
  return <File className="h-3.5 w-3.5 text-muted-foreground" />;
};

function getCategoryFromMime(mime?: string): string {
  if (!mime) return "document";
  if (mime.startsWith("image")) return "image";
  if (mime.startsWith("audio")) return "audio";
  if (mime.startsWith("video")) return "video";
  if (mime.includes("pdf")) return "pdf";
  return "document";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AttachmentsEditor({ attachments, onChange, channel }: { attachments: (string | Attachment)[]; onChange: (v: Attachment[]) => void; channel?: string }) {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const constraints = getChannelConstraints(channel);

  const items: Attachment[] = attachments.map((a) =>
    typeof a === "string" ? { type: "url" as const, url: a, name: a } : a
  );

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const category = getCategoryFromMime(file.type);

    // Pre-check: channel supports attachments at all
    if (constraints.maxAttachmentSizeMB === 0) {
      toast.error(`El canal ${channel || "SMS"} no soporta adjuntos`);
      return;
    }

    // Pre-check: file size
    if (file.size > constraints.maxAttachmentSizeMB * 1024 * 1024) {
      toast.error(`Archivo demasiado grande`, {
        description: `${formatFileSize(file.size)} excede el límite de ${constraints.maxAttachmentSizeMB}MB para ${channel || "default"}`,
      });
      return;
    }

    // Pre-check: attachment type
    if (constraints.allowedAttachmentTypes.length > 0 && !constraints.allowedAttachmentTypes.includes(category)) {
      toast.error(`Tipo no soportado`, {
        description: `"${category}" no está permitido en el canal ${channel || "default"}`,
      });
      return;
    }

    setUploading(true);
    try {
      const path = `attachments/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("flow-attachments").upload(path, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("flow-attachments").getPublicUrl(path);
      onChange([...items, { type: "upload", url: urlData.publicUrl, name: file.name, mime: file.type }]);
      toast.success(`Archivo subido`, { description: file.name });
    } catch (err: any) {
      console.error("Upload failed", err);
      toast.error("Error al subir archivo", {
        description: err?.message || "Verifica tu conexión e intenta de nuevo",
      });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const addUrl = () => {
    if (!urlDraft.trim()) return;
    try { new URL(urlDraft.trim()); } catch {
      toast.error("URL inválida", { description: "Ingresa una URL completa (https://...)" });
      return;
    }
    const ext = urlDraft.split(".").pop()?.toLowerCase() || "";
    const mimeMap: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", webp: "image/webp", mp4: "video/mp4", mp3: "audio/mpeg", wav: "audio/wav", pdf: "application/pdf", doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };
    const guessedMime = mimeMap[ext] || undefined;
    const name = urlDraft.split("/").pop() || urlDraft.trim();

    // Check type compatibility
    if (guessedMime) {
      const cat = getCategoryFromMime(guessedMime);
      if (constraints.allowedAttachmentTypes.length > 0 && !constraints.allowedAttachmentTypes.includes(cat)) {
        toast.warning(`"${cat}" puede no ser soportado en ${channel || "default"}`);
      }
    }

    onChange([...items, { type: "url", url: urlDraft.trim(), name, mime: guessedMime }]);
    setUrlDraft("");
    setShowUrlInput(false);
  };

  const remove = (idx: number) => {
    const removed = items[idx];
    onChange(items.filter((_, i) => i !== idx));
    toast(`Adjunto eliminado`, { description: removed.name || "archivo" });
  };

  const noAttachmentSupport = constraints.maxAttachmentSizeMB === 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-foreground">Attachments</Label>
        {items.length > 0 && (
          <span className="text-[10px] text-muted-foreground">{items.length} archivo(s)</span>
        )}
      </div>

      {/* Channel warning: no attachment support */}
      {noAttachmentSupport && (
        <div className="flex items-center gap-1.5 rounded-md border border-destructive/20 bg-destructive/5 px-2.5 py-2 text-[11px] text-destructive">
          <XCircle className="h-3.5 w-3.5 shrink-0" />
          <span>El canal <strong>{channel || "SMS"}</strong> no soporta adjuntos</span>
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && !noAttachmentSupport && (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 py-4 text-center">
          <Upload className="mx-auto h-5 w-5 text-muted-foreground/40" />
          <p className="mt-1.5 text-xs text-muted-foreground">Sin adjuntos</p>
          <p className="text-[10px] text-muted-foreground/60">Sube archivos o pega URLs</p>
        </div>
      )}

      {/* Attachment list */}
      {items.length > 0 && (
        <div className="space-y-1">
          {items.map((att, i) => {
            const isUpload = att.type === "upload";
            return (
              <div key={i} className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs group transition-colors ${
                isUpload
                  ? "border-primary/20 bg-primary/5"
                  : "border-border bg-muted/40"
              }`}>
                {mimeIcon(att.mime)}
                <div className="flex-1 min-w-0">
                  <span className="block truncate text-foreground text-[12px]">{att.name || att.url}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="rounded bg-muted px-1 py-px text-[9px] font-medium text-muted-foreground uppercase">
                      {getCategoryFromMime(att.mime)}
                    </span>
                    <span className={`inline-flex items-center gap-0.5 rounded px-1 py-px text-[9px] font-medium ${
                      isUpload
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {isUpload ? <CheckCircle2 className="h-2 w-2" /> : <Link className="h-2 w-2" />}
                      {isUpload ? "Subido" : "URL"}
                    </span>
                  </div>
                </div>
                <button onClick={() => remove(i)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity" title="Eliminar">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* URL input */}
      {showUrlInput && (
        <div className="flex gap-1.5">
          <Input
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addUrl()}
            placeholder="https://example.com/file.pdf"
            className="text-xs"
            autoFocus
          />
          <Button variant="outline" size="sm" onClick={addUrl} disabled={!urlDraft.trim()}>
            Add
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { setShowUrlInput(false); setUrlDraft(""); }}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Action buttons */}
      {!noAttachmentSupport && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {uploading ? "Subiendo…" : "Subir archivo"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={() => setShowUrlInput(true)}
            disabled={showUrlInput}
          >
            <Link className="h-3.5 w-3.5" />
            Pegar URL
          </Button>
        </div>
      )}

      {/* Media Library placeholder */}
      {!noAttachmentSupport && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full gap-1.5 text-muted-foreground border border-dashed border-border/50 hover:border-border"
          disabled
          title="Próximamente"
        >
          <Library className="h-3.5 w-3.5" />
          Media Library
          <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase">Soon</span>
        </Button>
      )}

      {/* Channel limits hint */}
      {!noAttachmentSupport && (
        <p className="text-[10px] text-muted-foreground">
          Máx. {constraints.maxAttachmentSizeMB}MB · {constraints.allowedAttachmentTypes.join(", ")}
        </p>
      )}

      <input ref={fileRef} type="file" accept={ACCEPT_TYPES} className="hidden" onChange={handleUpload} />
    </div>
  );
}
export function NodeConfigPanel({ node, onUpdate, onClose, onDelete, channel, availableEntities = [] }: NodeConfigPanelProps) {
  const data = node.data as Record<string, any>;

  const update = useCallback(
    (key: string, value: unknown) => {
      onUpdate(node.id, { ...data, [key]: value });
    },
    [node.id, data, onUpdate]
  );

  const addToList = (key: string) => {
    const list = [...(data[key] || []), ""];
    update(key, list);
  };

  const updateListItem = (key: string, index: number, value: string) => {
    const list = [...(data[key] || [])];
    list[index] = value;
    update(key, list);
  };

  const removeListItem = (key: string, index: number) => {
    const list = (data[key] || []).filter((_: string, i: number) => i !== index);
    update(key, list);
  };

  const addHeader = () => {
    const headers = { ...(data.headers || {}), "": "" };
    update("headers", headers);
  };

  const updateHeader = (oldKey: string, newKey: string, value: string) => {
    const headers = { ...(data.headers || {}) };
    if (oldKey !== newKey) delete headers[oldKey];
    headers[newKey] = value;
    update("headers", headers);
  };

  const removeHeader = (key: string) => {
    const headers = { ...(data.headers || {}) };
    delete headers[key];
    update("headers", headers);
  };

  const renderListEditor = (key: string, label: string, placeholder: string) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-foreground">{label}</Label>
        <Button variant="ghost" size="sm" onClick={() => addToList(key)}>
          <Plus className="mr-1 h-3 w-3" /> Add
        </Button>
      </div>
      {(data[key] || []).map((item: string, i: number) => (
        <div key={i} className="flex gap-2">
          <Input
            value={item}
            onChange={(e) => updateListItem(key, i, e.target.value)}
            placeholder={`${placeholder} ${i + 1}`}
          />
          <Button variant="ghost" size="icon" onClick={() => removeListItem(key, i)}>
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="absolute right-0 top-0 z-50 flex h-full w-96 flex-col border-l border-border bg-card shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {nodeTypeLabels[node.type || ""] || "Configure Node"}
          </h3>
          <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{node.id.slice(0, 12)}…</p>
        </div>
        <button onClick={onClose} className="rounded-md p-1 hover:bg-muted">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">

        {/* ─── SEND MESSAGE ─── */}
        {node.type === "sendMsg" && (() => {
          const constraints = getChannelConstraints(channel);
          const textLen = (data.text || "").length;
          const qrCount = (data.quick_replies || []).filter((r: string) => r.trim()).length;
          const warnings: string[] = [];
          if (textLen > constraints.maxTextLength) warnings.push(`Texto excede ${constraints.maxTextLength} chars (${textLen})`);
          if (qrCount > constraints.maxQuickReplies) warnings.push(`${qrCount} quick replies exceden el límite de ${constraints.maxQuickReplies}`);
          return (
            <>
          {/* Channel inline warnings */}
              {warnings.length > 0 && (
                <div className="space-y-1">
                  {warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-md border border-amber-500/15 bg-amber-500/5 px-2.5 py-2 text-[11px] text-foreground/80">
                      <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5 text-amber-500" />
                      <span>{w} <span className="text-muted-foreground">· {channel || "default"}</span></span>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground">Message Text</Label>
                  <span className={`text-[10px] ${textLen > constraints.maxTextLength ? "text-amber-600 font-semibold" : "text-muted-foreground"}`}>
                    {textLen}/{constraints.maxTextLength}
                  </span>
                </div>
                <Textarea
                  value={data.text || ""}
                  onChange={(e) => update("text", e.target.value)}
                  placeholder="Type your message here... Use @contact.name for variables"
                  className="min-h-[120px]"
                />
                <p className="text-[11px] text-muted-foreground">
                  Use @contact.name, @input.text, @results.value for dynamic content
                </p>
              </div>
              {renderListEditor("quick_replies", "Quick Replies", "Option")}
              {qrCount > 0 && constraints.maxQuickReplies > 0 && (
                <p className="text-[10px] text-muted-foreground">{qrCount}/{constraints.maxQuickReplies} para {channel || "default"}</p>
              )}
              <AttachmentsEditor
                attachments={data.attachments || []}
                onChange={(attachments) => update("attachments", attachments)}
                channel={channel}
              />
            </>
          );
        })()}

        {/* ─── WAIT FOR RESPONSE ─── */}
        {node.type === "waitResponse" && (
          <>
            <div className="space-y-2">
              <Label className="text-foreground">Save as Result</Label>
              <Input
                value={data.label || ""}
                onChange={(e) => update("label", e.target.value)}
                placeholder="Result name (e.g., user_choice)"
              />
            </div>
            {renderListEditor("categories", "Response Categories", "Category")}
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">
                An <strong>"Other"</strong> category is automatically added for unmatched responses.
              </p>
            </div>
          </>
        )}

        {/* ─── SPLIT BY EXPRESSION ─── */}
        {node.type === "splitExpression" && (
          <>
            <div className="space-y-2">
              <Label className="text-foreground">Expression Operand</Label>
              <Input
                value={data.operand || ""}
                onChange={(e) => update("operand", e.target.value)}
                placeholder="@input.text"
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Test Type</Label>
              <Select value={data.testType || "has_any_word"} onValueChange={(v) => update("testType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="has_any_word">Has any word</SelectItem>
                  <SelectItem value="has_all_words">Has all words</SelectItem>
                  <SelectItem value="has_phrase">Has phrase</SelectItem>
                  <SelectItem value="has_only_phrase">Has only phrase</SelectItem>
                  <SelectItem value="has_number">Has a number</SelectItem>
                  <SelectItem value="has_number_between">Number between</SelectItem>
                  <SelectItem value="has_number_lt">Number less than</SelectItem>
                  <SelectItem value="has_number_gt">Number greater than</SelectItem>
                  <SelectItem value="has_number_eq">Number equal to</SelectItem>
                  <SelectItem value="has_date">Has a date</SelectItem>
                  <SelectItem value="has_date_lt">Date before</SelectItem>
                  <SelectItem value="has_date_eq">Date equal to</SelectItem>
                  <SelectItem value="has_date_gt">Date after</SelectItem>
                  <SelectItem value="has_email">Has email</SelectItem>
                  <SelectItem value="has_phone">Has phone</SelectItem>
                  <SelectItem value="has_text">Has text</SelectItem>
                  <SelectItem value="has_pattern">Matches pattern (regex)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {renderListEditor("cases", "Cases", "Value")}
          </>
        )}

        {/* ─── SPLIT BY CONTACT FIELD ─── */}
        {node.type === "splitContactField" && (
          <>
            <div className="space-y-2">
              <Label className="text-foreground">Contact Field</Label>
              <Select value={data.operand || "@contact.name"} onValueChange={(v) => update("operand", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="@contact.name">Name</SelectItem>
                  <SelectItem value="@contact.language">Language</SelectItem>
                  <SelectItem value="@contact.channel">Channel</SelectItem>
                  <SelectItem value="@contact.urn">URN</SelectItem>
                  <SelectItem value="@contact.groups">Groups</SelectItem>
                  <SelectItem value="@contact.created_on">Created on</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {renderListEditor("cases", "Cases", "Value")}
          </>
        )}

        {/* ─── SPLIT BY RESULT ─── */}
        {node.type === "splitResult" && (
          <>
            <div className="space-y-2">
              <Label className="text-foreground">Flow Result</Label>
              <Input
                value={data.operand || ""}
                onChange={(e) => update("operand", e.target.value)}
                placeholder="@results.result_name"
                className="font-mono text-sm"
              />
            </div>
            {renderListEditor("cases", "Cases", "Value")}
          </>
        )}

        {/* ─── SPLIT BY RANDOM ─── */}
        {node.type === "splitRandom" && (
          <>
            <div className="space-y-2">
              <Label className="text-foreground">Number of Buckets</Label>
              <Input
                type="number"
                min={2}
                max={10}
                value={data.buckets || 2}
                onChange={(e) => update("buckets", parseInt(e.target.value) || 2)}
              />
              <p className="text-[11px] text-muted-foreground">
                Contacts will be randomly distributed across buckets
              </p>
            </div>
          </>
        )}

        {/* ─── SPLIT BY GROUP ─── */}
        {node.type === "splitGroup" && (
          <>
            <div className="space-y-2">
              <Label className="text-foreground">Group Name</Label>
              <Input
                value={data.groupName || ""}
                onChange={(e) => update("groupName", e.target.value)}
                placeholder="Group name"
              />
            </div>
          </>
        )}

        {/* ─── CALL WEBHOOK ─── */}
        {node.type === "webhook" && (
          <>
            <div className="space-y-2">
              <Label className="text-foreground">URL</Label>
              <Input
                value={data.url || ""}
                onChange={(e) => update("url", e.target.value)}
                placeholder="https://api.example.com/endpoint"
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Method</Label>
              <Select value={data.method || "GET"} onValueChange={(v) => update("method", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-foreground">Headers</Label>
                <Button variant="ghost" size="sm" onClick={addHeader}>
                  <Plus className="mr-1 h-3 w-3" /> Add
                </Button>
              </div>
              {Object.entries(data.headers || {}).map(([key, value], i) => (
                <div key={i} className="flex gap-1">
                  <Input
                    value={key}
                    onChange={(e) => updateHeader(key, e.target.value, value as string)}
                    placeholder="Header name"
                    className="w-1/2 text-xs"
                  />
                  <Input
                    value={value as string}
                    onChange={(e) => updateHeader(key, key, e.target.value)}
                    placeholder="Value"
                    className="w-1/2 text-xs"
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeHeader(key)} className="flex-shrink-0">
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Request Body (JSON)</Label>
              <Textarea
                value={data.body || ""}
                onChange={(e) => update("body", e.target.value)}
                placeholder='{"key": "@results.value"}'
                className="min-h-[100px] font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Save as Result</Label>
              <Input
                value={data.resultName || ""}
                onChange={(e) => update("resultName", e.target.value)}
                placeholder="webhook_result"
              />
            </div>

            <Separator />

            {/* Retry / Error Policy */}
            <div className="space-y-2">
              <Label className="text-foreground">Retry Policy</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground">Max retries</span>
                  <Select value={String(data.retryCount || "0")} onValueChange={(v) => update("retryCount", v)}>
                    <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground">Delay (seconds)</span>
                  <Select value={String(data.retryDelay || "2")} onValueChange={(v) => update("retryDelay", v)}>
                    <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1s</SelectItem>
                      <SelectItem value="2">2s</SelectItem>
                      <SelectItem value="5">5s</SelectItem>
                      <SelectItem value="10">10s</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Retries use linear backoff (delay × attempt). On exhaustion, follows "Failure" exit if available.
              </p>
            </div>
          </>
        )}

        {/* ─── SAVE FLOW RESULT ─── */}
        {node.type === "saveResult" && (
          <>
            <div className="space-y-2">
              <Label className="text-foreground">Result Name</Label>
              <Input
                value={data.resultName || ""}
                onChange={(e) => update("resultName", e.target.value)}
                placeholder="my_result"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Value</Label>
              <Input
                value={data.value || ""}
                onChange={(e) => update("value", e.target.value)}
                placeholder="@input.text"
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Category</Label>
              <Input
                value={data.category || ""}
                onChange={(e) => update("category", e.target.value)}
                placeholder="Category name (optional)"
              />
            </div>
          </>
        )}

        {/* ─── UPDATE CONTACT ─── */}
        {node.type === "updateContact" && (
          <>
            <div className="space-y-2">
              <Label className="text-foreground">Field</Label>
              <Select value={data.field || "name"} onValueChange={(v) => update("field", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="first_name">First Name</SelectItem>
                  <SelectItem value="language">Language</SelectItem>
                  <SelectItem value="channel">Channel</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Custom Field Name</Label>
              <Input
                value={data.customField || ""}
                onChange={(e) => update("customField", e.target.value)}
                placeholder="custom_field_name"
              />
              <p className="text-[11px] text-muted-foreground">
                Leave empty to use the field above, or type a custom field name
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Value</Label>
              <Input
                value={data.value || ""}
                onChange={(e) => update("value", e.target.value)}
                placeholder="@input.text"
                className="font-mono text-sm"
              />
            </div>
          </>
        )}

        {/* ─── ADD/REMOVE GROUP ─── */}
        {(node.type === "addGroup" || node.type === "removeGroup") && (
          <>
            <div className="space-y-2">
              <Label className="text-foreground">Group Name</Label>
              <Input
                value={data.groupName || ""}
                onChange={(e) => update("groupName", e.target.value)}
                placeholder="e.g. Subscribed, VIP, Opt-out"
              />
              <p className="text-[11px] text-muted-foreground">
                The name of the group to {node.type === "addGroup" ? "add the contact to" : "remove the contact from"}
              </p>
            </div>
          </>
        )}

        {/* ─── SEND EMAIL ─── */}
        {node.type === "sendEmail" && (
          <>
            <div className="space-y-2">
              <Label className="text-foreground">To (email addresses)</Label>
              <Input
                value={data.to || ""}
                onChange={(e) => update("to", e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Subject</Label>
              <Input
                value={data.subject || ""}
                onChange={(e) => update("subject", e.target.value)}
                placeholder="Email subject"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Body</Label>
              <Textarea
                value={data.body || ""}
                onChange={(e) => update("body", e.target.value)}
                placeholder="Email body text..."
                className="min-h-[100px]"
              />
            </div>
          </>
        )}

        {/* ─── CALL AI SERVICE ─── */}
        {node.type === "callAI" && (
          <>
            <div className="space-y-2">
              <Label className="text-foreground">AI Provider</Label>
              <Select value={data.provider || "openai"} onValueChange={(v) => update("provider", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI (ChatGPT)</SelectItem>
                  <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                  <SelectItem value="custom">Custom API</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">System Prompt</Label>
              <Textarea
                value={data.systemPrompt || ""}
                onChange={(e) => update("systemPrompt", e.target.value)}
                placeholder="You are a helpful assistant..."
                className="min-h-[80px]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">User Prompt / Input</Label>
              <Textarea
                value={data.prompt || ""}
                onChange={(e) => update("prompt", e.target.value)}
                placeholder="@input.text"
                className="min-h-[60px] font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Save as Result</Label>
              <Input
                value={data.resultName || ""}
                onChange={(e) => update("resultName", e.target.value)}
                placeholder="ai_response"
              />
            </div>
          </>
        )}

        {/* ─── ENTER ANOTHER FLOW ─── */}
        {node.type === "enterFlow" && (
          <>
            <div className="space-y-2">
              <Label className="text-foreground">Flow Name</Label>
              <Input
                value={data.flowName || ""}
                onChange={(e) => update("flowName", e.target.value)}
                placeholder="Name of the flow to enter"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Flow UUID</Label>
              <Input
                value={data.flowUuid || ""}
                onChange={(e) => update("flowUuid", e.target.value)}
                placeholder="UUID of the flow"
                className="font-mono text-sm"
              />
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">
                The contact will enter the specified flow. When that flow completes, they'll return to this point.
              </p>
            </div>
          </>
        )}

        {/* ─── OPEN TICKET ─── */}
        {node.type === "openTicket" && (
          <>
            <div className="space-y-2">
              <Label className="text-foreground">Ticketer</Label>
              <Select value={data.ticketer || "internal"} onValueChange={(v) => update("ticketer", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="zendesk">Zendesk</SelectItem>
                  <SelectItem value="mailgun">Mailgun</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Topic</Label>
              <Input
                value={data.topic || ""}
                onChange={(e) => update("topic", e.target.value)}
                placeholder="Support topic"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Body / Note</Label>
              <Textarea
                value={data.body || ""}
                onChange={(e) => update("body", e.target.value)}
                placeholder="Information for the agent..."
                className="min-h-[80px]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Assignee</Label>
              <Input
                value={data.assignee || ""}
                onChange={(e) => update("assignee", e.target.value)}
                placeholder="Agent email or ID"
              />
            </div>
          </>
        )}

        {/* ─── CALL ZAPIER ─── */}
        {node.type === "callZapier" && (
          <>
            <div className="space-y-2">
              <Label className="text-foreground">Zapier Webhook URL</Label>
              <Input
                value={data.url || ""}
                onChange={(e) => update("url", e.target.value)}
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Data to Send (JSON)</Label>
              <Textarea
                value={data.body || ""}
                onChange={(e) => update("body", e.target.value)}
                placeholder='{"contact": "@contact.name", "message": "@input.text"}'
                className="min-h-[100px] font-mono text-sm"
              />
            </div>
          </>
        )}

        {/* ─── SEND AIRTIME ─── */}
        {node.type === "sendAirtime" && (
          <>
            <div className="space-y-2">
              <Label className="text-foreground">Amount</Label>
              <Input
                type="number"
                value={data.amount || ""}
                onChange={(e) => update("amount", e.target.value)}
                placeholder="100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Currency</Label>
              <Select value={data.currency || "XOF"} onValueChange={(v) => update("currency", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="XOF">XOF (CFA Franc)</SelectItem>
                  <SelectItem value="XAF">XAF (Central African CFA)</SelectItem>
                  <SelectItem value="USD">USD (US Dollar)</SelectItem>
                  <SelectItem value="EUR">EUR (Euro)</SelectItem>
                  <SelectItem value="GHS">GHS (Ghanaian Cedi)</SelectItem>
                  <SelectItem value="NGN">NGN (Nigerian Naira)</SelectItem>
                  <SelectItem value="KES">KES (Kenyan Shilling)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">
                Airtime will be sent to the contact's phone number. Make sure your account has sufficient balance.
              </p>
            </div>
          </>
        )}

        {/* ─── ADD TO GROUP ─── */}
        {node.type === "addGroup" && (
          <>
            <div className="space-y-2">
              <Label className="text-foreground">Group Name</Label>
              <Input
                value={data.groupName || ""}
                onChange={(e) => update("groupName", e.target.value)}
                placeholder="e.g. Premium Users, Onboarding"
              />
            </div>
            <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/5 p-3">
              <p className="text-xs text-foreground/80">
                The contact will be added to this group. Groups are used for segmenting contacts and controlling flow logic via <span className="font-mono text-[11px] text-emerald-600">Split by Group</span>.
              </p>
            </div>
          </>
        )}

        {/* ─── REMOVE FROM GROUP ─── */}
        {node.type === "removeGroup" && (
          <>
            <div className="space-y-2">
              <Label className="text-foreground">Group Name</Label>
              <Input
                value={data.groupName || ""}
                onChange={(e) => update("groupName", e.target.value)}
                placeholder="e.g. Trial Users, Inactive"
              />
            </div>
            <div className="rounded-lg border border-orange-500/15 bg-orange-500/5 p-3">
              <p className="text-xs text-foreground/80">
                The contact will be removed from this group. If the contact is not in the group, this action has no effect.
              </p>
            </div>
          </>
        )}

        {/* ─── XP NODE EFFECTS ─── */}
        {node.type !== "moduleGroup" && (
          <>
            <Separator className="my-1" />
            <NodeEffectsEditor
              effects={(data.xpEffects as NodeEffect[]) || []}
              onChange={(effects) => update("xpEffects", effects)}
              availableEntities={availableEntities}
            />
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => onDelete(node.id)}
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete Node
        </Button>
      </div>
    </div>
  );
}
