import { useState, useRef } from "react";
import { Upload, Link2, X, CheckCircle2, Loader2, FileImage, FileText, FileAudio, FileVideo } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface MediaUploaderProps {
  value: { url: string; fileName?: string; source: "upload" | "url" };
  mediaType: string;
  onChange: (val: { url: string; fileName?: string; source: "upload" | "url" }) => void;
}

const MEDIA_ACCEPT: Record<string, string> = {
  image: "image/*",
  document: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt",
  audio: "audio/*",
  video: "video/*",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const MediaIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "image": return <FileImage className="h-4 w-4" />;
    case "document": return <FileText className="h-4 w-4" />;
    case "audio": return <FileAudio className="h-4 w-4" />;
    case "video": return <FileVideo className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
  }
};

export default function MediaUploader({ value, mediaType, onChange }: MediaUploaderProps) {
  const [mode, setMode] = useState<"upload" | "url">(value.source || "upload");
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(value.source === "url" ? value.url : "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({ title: "File too large", description: "Maximum 10MB per file.", variant: "destructive" });
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop() || "bin";
    const path = `structural-media/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage
      .from("flow-attachments")
      .upload(path, file, { contentType: file.type, upsert: false });

    if (error) {
      console.error("Upload error:", error);
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("flow-attachments")
      .getPublicUrl(path);

    onChange({ url: urlData.publicUrl, fileName: file.name, source: "upload" });
    setUploading(false);
    toast({ title: "✅ Uploaded", description: file.name });
    e.target.value = "";
  };

  const handleUrlConfirm = () => {
    const url = urlInput.trim();
    if (!url) return;
    onChange({ url, source: "url" });
  };

  const handleClear = () => {
    onChange({ url: "", source: "upload" });
    setUrlInput("");
  };

  const hasValue = !!value.url;

  return (
    <div className="space-y-2">
      {/* Mode tabs */}
      <div className="flex rounded-lg bg-white/5 p-0.5">
        <button
          onClick={() => setMode("upload")}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-semibold transition ${
            mode === "upload" ? "bg-teal-500/20 text-teal-400" : "text-white/30 hover:text-white/50"
          }`}
        >
          <Upload className="h-3 w-3" /> File
        </button>
        <button
          onClick={() => setMode("url")}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-semibold transition ${
            mode === "url" ? "bg-blue-500/20 text-blue-400" : "text-white/30 hover:text-white/50"
          }`}
        >
          <Link2 className="h-3 w-3" /> URL
        </button>
      </div>

      {/* Current value display */}
      {hasValue && (
        <div className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-2.5 py-2">
          <MediaIcon type={mediaType} />
          <div className="flex-1 min-w-0">
            {value.fileName ? (
              <p className="text-[11px] text-white/70 font-medium truncate">{value.fileName}</p>
            ) : (
              <p className="text-[11px] text-white/50 font-mono truncate">{value.url}</p>
            )}
            <p className="text-[9px] text-white/25">
              {value.source === "upload" ? "✅ Uploaded" : "🔗 External URL"}
            </p>
          </div>
          <button onClick={handleClear} className="rounded p-1 hover:bg-red-500/20 transition">
            <X className="h-3 w-3 text-red-400/60" />
          </button>
        </div>
      )}

      {/* Preview for images */}
      {hasValue && mediaType === "image" && (
        <div className="rounded-lg overflow-hidden border border-white/10 bg-white/5">
          <img
            src={value.url}
            alt="Preview"
            className="w-full h-24 object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>
      )}

      {/* Upload mode */}
      {mode === "upload" && !hasValue && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept={MEDIA_ACCEPT[mediaType] || "*/*"}
            className="hidden"
            onChange={handleFileSelect}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-white/10 py-4 text-white/30 hover:border-teal-500/30 hover:text-teal-400 hover:bg-teal-500/5 transition disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs font-semibold">Uploading…</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span className="text-xs font-semibold">Choose file</span>
              </>
            )}
          </button>
          <p className="text-[9px] text-white/20 text-center">Max 10MB · {MEDIA_ACCEPT[mediaType] || "Any file"}</p>
        </>
      )}

      {/* URL mode */}
      {mode === "url" && !hasValue && (
        <div className="flex gap-1.5">
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUrlConfirm()}
            placeholder="https://example.com/image.jpg"
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white placeholder-white/20 outline-none focus:border-blue-500/40 transition"
          />
          <button
            onClick={handleUrlConfirm}
            disabled={!urlInput.trim()}
            className="rounded-lg bg-blue-500/20 px-2.5 py-1.5 text-blue-400 hover:bg-blue-500/30 disabled:opacity-30 transition"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
