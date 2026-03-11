import { Handle, Position, NodeProps } from "@xyflow/react";
import { MessageSquare, Paperclip, Image, FileText, Music, Video, File, Sparkles, FileCheck } from "lucide-react";
import { EntryNodeMarker } from "./EntryNodeMarker";

function AttachmentIcon({ mime }: { mime?: string }) {
  const cls = "h-3 w-3 text-muted-foreground";
  if (!mime) return <File className={cls} />;
  if (mime.startsWith("image")) return <Image className={cls} />;
  if (mime.startsWith("audio")) return <Music className={cls} />;
  if (mime.startsWith("video")) return <Video className={cls} />;
  if (mime.includes("pdf")) return <FileText className={cls} />;
  return <File className={cls} />;
}

export function SendMsgNode({ data, selected }: NodeProps) {
  const d = data as any;
  const isTemplate = d.message_type === "template";
  // Normalize attachments (legacy string[] or new object[])
  const attachments: { url: string; name?: string; mime?: string }[] = (d.attachments || []).map((a: any) =>
    typeof a === "string" ? { url: a } : a
  );

  return (
    <div
      className={`relative min-w-[220px] max-w-[320px] rounded-lg border bg-white shadow-md transition-all ${
        selected ? "ring-2 ring-node-send/50 shadow-lg" : "border-border/60"
      }`}
    >
      {d._isEntryNode && <EntryNodeMarker inferred={d._entryInferred} ambiguous={d._entryAmbiguous} />}
      {/* Header pill */}
      <div className="flex items-center gap-2 rounded-t-lg bg-node-send px-3 py-1.5">
        <MessageSquare className="h-3.5 w-3.5 text-primary-foreground" />
        <span className="text-xs font-bold tracking-wide text-primary-foreground uppercase">Send Message</span>
        {(d.xpEffects?.length > 0) && (
          <span className="flex items-center gap-0.5 rounded-full bg-white/20 px-1.5 py-0.5" title={`${d.xpEffects.length} XP effect(s)`}>
            <Sparkles className="h-2.5 w-2.5 text-primary-foreground" />
          </span>
        )}
        {attachments.length > 0 && (
          <span className="ml-auto flex items-center gap-0.5 rounded-full bg-white/20 px-1.5 py-0.5">
            <Paperclip className="h-3 w-3 text-primary-foreground" />
            <span className="text-[10px] font-semibold text-primary-foreground">{attachments.length}</span>
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-3 py-2.5">
        {isTemplate ? (
          <div className="flex items-center gap-1.5">
            <FileCheck className="h-3.5 w-3.5 text-primary" />
            <span className="text-[12px] font-medium text-foreground">{d.template_name || "No template"}</span>
            {d.template_language && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground uppercase">{d.template_language}</span>
            )}
          </div>
        ) : (
          <p className="text-[13px] leading-relaxed text-foreground line-clamp-4 whitespace-pre-wrap">
            {d.text || "No message configured"}
          </p>
        )}

        {/* Attachment badges */}
        {attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {attachments.map((att, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded border border-border/50 bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                <AttachmentIcon mime={att.mime} />
                <span className="max-w-[100px] truncate">{att.name || "file"}</span>
              </span>
            ))}
          </div>
        )}

        {d.quick_replies?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {d.quick_replies.map((r: string, i: number) => (
              <span key={i} className="rounded-full border border-node-send/30 bg-node-send/10 px-2.5 py-0.5 text-[11px] font-medium text-node-send">
                {r}
              </span>
            ))}
          </div>
        )}
      </div>

      <Handle type="target" position={Position.Top} className="!bg-node-send !w-2.5 !h-2.5 !border-2 !border-white !-top-1" />
      <Handle type="source" position={Position.Bottom} className="!bg-node-send !w-2.5 !h-2.5 !border-2 !border-white !-bottom-1" />
    </div>
  );
}
