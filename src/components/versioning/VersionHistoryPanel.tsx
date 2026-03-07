import { useState, useEffect } from "react";
import {
  AssetVersion,
  AssetType,
  VersionStatus,
  VersionEnvironment,
  useAssetVersions,
} from "@/hooks/useAssetVersions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  History,
  Save,
  RotateCcw,
  Copy,
  GitCompare,
  Pencil,
  StickyNote,
  ChevronRight,
  Star,
  Loader2,
  X,
} from "lucide-react";

// ── Status / Environment badges ──

const statusStyles: Record<VersionStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  validated: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  candidate: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  live: "bg-green-500/15 text-green-600 border-green-500/30",
  archived: "bg-muted text-muted-foreground/60",
};

const envStyles: Record<VersionEnvironment, string> = {
  draft: "bg-muted text-muted-foreground",
  sandbox: "bg-purple-500/15 text-purple-600 border-purple-500/30",
  production: "bg-green-500/15 text-green-600 border-green-500/30",
};

// ── Save Version Dialog ──

interface SaveVersionDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, note: string) => void;
  nextNumber: number;
  saving: boolean;
}

function SaveVersionDialog({ open, onClose, onSave, nextNumber, saving }: SaveVersionDialogProps) {
  const [name, setName] = useState(`v${nextNumber}`);
  const [note, setNote] = useState("");

  useEffect(() => {
    setName(`v${nextNumber}`);
    setNote("");
  }, [nextNumber, open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Guardar Versión
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Nombre de la versión</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`v${nextNumber}`}
              className="text-sm"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Nota explicativa (opcional)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Qué cambió, por qué, contexto..."
              className="text-sm resize-none"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button size="sm" onClick={() => onSave(name, note)} disabled={saving}>
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
            Guardar Versión
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Compare Dialog ──

interface CompareDialogProps {
  open: boolean;
  onClose: () => void;
  versionA: AssetVersion | null;
  versionB: AssetVersion | null;
}

function CompareDialog({ open, onClose, versionA, versionB }: CompareDialogProps) {
  if (!versionA || !versionB) return null;

  const metaA = {
    version_name: versionA.version_name,
    version_number: versionA.version_number,
    status: versionA.status,
    environment: versionA.environment,
    created_at: versionA.created_at,
    is_current: versionA.is_current,
  };
  const metaB = {
    version_name: versionB.version_name,
    version_number: versionB.version_number,
    status: versionB.status,
    environment: versionB.environment,
    created_at: versionB.created_at,
    is_current: versionB.is_current,
  };

  const snapshotA = JSON.stringify(versionA.snapshot_data, null, 2);
  const snapshotB = JSON.stringify(versionB.snapshot_data, null, 2);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="h-4 w-4" />
            Comparar Versiones
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 overflow-hidden">
          {/* Column A */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={statusStyles[versionA.status]}>
                {versionA.version_name}
              </Badge>
              {versionA.is_current && (
                <Badge className="bg-primary/15 text-primary text-[9px]">Current</Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              {Object.entries(metaA).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span>{k}</span>
                  <span className="font-mono">{String(v)}</span>
                </div>
              ))}
            </div>
            <ScrollArea className="h-[300px] rounded-md border border-border">
              <pre className="p-3 text-[10px] font-mono text-foreground whitespace-pre-wrap">
                {snapshotA}
              </pre>
            </ScrollArea>
          </div>
          {/* Column B */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={statusStyles[versionB.status]}>
                {versionB.version_name}
              </Badge>
              {versionB.is_current && (
                <Badge className="bg-primary/15 text-primary text-[9px]">Current</Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              {Object.entries(metaB).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span>{k}</span>
                  <span className="font-mono">{String(v)}</span>
                </div>
              ))}
            </div>
            <ScrollArea className="h-[300px] rounded-md border border-border">
              <pre className="p-3 text-[10px] font-mono text-foreground whitespace-pre-wrap">
                {snapshotB}
              </pre>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Inline Edit ──

function InlineEdit({
  value,
  onSave,
  placeholder,
  multiline,
}: {
  value: string;
  onSave: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (!editing) {
    return (
      <button
        onClick={() => { setDraft(value); setEditing(true); }}
        className="text-left text-xs text-muted-foreground hover:text-foreground transition-colors group flex items-center gap-1"
      >
        <span className={value ? "" : "italic"}>{value || placeholder || "Sin nota"}</span>
        <Pencil className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    );
  }

  const save = () => { onSave(draft); setEditing(false); };

  if (multiline) {
    return (
      <div className="space-y-1">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="text-xs resize-none"
          rows={2}
          autoFocus
          onBlur={save}
          onKeyDown={(e) => { if (e.key === "Escape") setEditing(false); }}
        />
      </div>
    );
  }

  return (
    <Input
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      className="h-6 text-xs"
      autoFocus
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") setEditing(false);
      }}
    />
  );
}

// ── Main Panel ──

interface VersionHistoryPanelProps {
  assetType: AssetType;
  assetId: string | null;
  getSnapshotData: () => Record<string, unknown>;
  onRestore: (data: Record<string, unknown>) => void;
  onDuplicate?: (data: Record<string, unknown>, sourceVersionId: string) => void;
}

export function VersionHistoryPanel({
  assetType,
  assetId,
  getSnapshotData,
  onRestore,
}: VersionHistoryPanelProps) {
  const {
    versions,
    loading,
    fetchVersions,
    createVersion,
    restoreVersion,
    renameVersion,
    updateNote,
  } = useAssetVersions(assetType, assetId);

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [compareA, setCompareA] = useState<AssetVersion | null>(null);
  const [compareB, setCompareB] = useState<AssetVersion | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (assetId) fetchVersions();
  }, [assetId, fetchVersions]);

  const handleSave = async (name: string, note: string) => {
    if (!assetId) return;
    setSaving(true);
    await createVersion({
      assetType,
      assetId,
      snapshotData: getSnapshotData(),
      versionName: name,
      versionNote: note || undefined,
    });
    setSaving(false);
    setShowSaveDialog(false);
  };

  const handleCompareSelect = (v: AssetVersion) => {
    if (!compareA) {
      setCompareA(v);
    } else if (!compareB) {
      setCompareB(v);
      setShowCompare(true);
    }
  };

  const nextNumber = versions.length > 0 ? versions[0].version_number + 1 : 1;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Versiones
          </span>
          <Badge variant="secondary" className="text-[9px] px-1.5">
            {versions.length}
          </Badge>
        </div>
        <Button
          size="sm"
          variant="default"
          className="h-7 text-xs"
          onClick={() => setShowSaveDialog(true)}
          disabled={!assetId}
        >
          <Save className="h-3 w-3 mr-1" />
          Guardar
        </Button>
      </div>

      {/* Compare mode indicator */}
      {compareA && !showCompare && (
        <div className="px-3 py-1.5 bg-primary/5 border-b border-primary/20 flex items-center justify-between">
          <span className="text-[10px] text-primary">
            Selecciona segunda versión para comparar
          </span>
          <button
            onClick={() => { setCompareA(null); setCompareB(null); }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Version list */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : versions.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <History className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">Sin versiones guardadas</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">
              Guarda tu primera versión para iniciar el historial
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {versions.map((v) => {
              const isExpanded = expanded === v.id;

              return (
                <div
                  key={v.id}
                  className={`px-3 py-2.5 transition-colors ${
                    v.is_current ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-muted/50"
                  } ${compareA?.id === v.id ? "ring-1 ring-primary/40" : ""}`}
                >
                  {/* Main row */}
                  <button
                    className="w-full text-left"
                    onClick={() => setExpanded(isExpanded ? null : v.id)}
                  >
                    <div className="flex items-center gap-2">
                      <ChevronRight
                        className={`h-3 w-3 text-muted-foreground transition-transform ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      />
                      <span className="text-xs font-medium text-foreground truncate flex-1">
                        {v.version_name}
                      </span>
                      {v.is_current && (
                        <Badge className="bg-primary/15 text-primary text-[8px] px-1 py-0">
                          Current
                        </Badge>
                      )}
                      {v.status === "live" && (
                        <Badge className="bg-green-500/15 text-green-600 text-[8px] px-1 py-0">
                          Live
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 ml-5">
                      <span className="text-[10px] text-muted-foreground">
                        v{v.version_number}
                      </span>
                      <span className="text-[10px] text-muted-foreground">·</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(v.created_at).toLocaleDateString()}
                      </span>
                      <Badge variant="outline" className={`text-[8px] px-1 py-0 ${statusStyles[v.status]}`}>
                        {v.status}
                      </Badge>
                      <Badge variant="outline" className={`text-[8px] px-1 py-0 ${envStyles[v.environment]}`}>
                        {v.environment}
                      </Badge>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="mt-2 ml-5 space-y-2">
                      {/* Editable name */}
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60">
                          Nombre
                        </span>
                        <InlineEdit
                          value={v.version_name}
                          onSave={(name) => renameVersion(v.id, name)}
                        />
                      </div>

                      {/* Editable note */}
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60 flex items-center gap-1">
                          <StickyNote className="h-2.5 w-2.5" /> Nota
                        </span>
                        <InlineEdit
                          value={v.version_note || ""}
                          onSave={(note) => updateNote(v.id, note)}
                          placeholder="Añadir nota explicativa..."
                          multiline
                        />
                      </div>

                      {/* Parent reference */}
                      {v.parent_version_id && (
                        <div className="text-[10px] text-muted-foreground/60 italic">
                          Derived from: {versions.find((p) => p.id === v.parent_version_id)?.version_name || "..."}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-1 pt-1">
                        {!v.is_current && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px] px-2"
                            onClick={() => restoreVersion(v.id, onRestore)}
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Restore
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[10px] px-2"
                          onClick={() => handleCompareSelect(v)}
                        >
                          <GitCompare className="h-3 w-3 mr-1" />
                          Compare
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Dialogs */}
      <SaveVersionDialog
        open={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={handleSave}
        nextNumber={nextNumber}
        saving={saving}
      />

      <CompareDialog
        open={showCompare}
        onClose={() => {
          setShowCompare(false);
          setCompareA(null);
          setCompareB(null);
        }}
        versionA={compareA}
        versionB={compareB}
      />
    </div>
  );
}
