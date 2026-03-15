/**
 * PlayerBuilderToolbar — Vertical toolbar between phone simulator and workbench.
 * Provides quick access to: insert blocks, version history, restart, undo, save.
 */

import { useState } from "react";
import {
  Plus, History, RotateCcw, Save, Undo2, Redo2,
  MessageSquare, CreditCard, FileText, Image, Phone,
  User, MapPin, Star, GraduationCap, Award, ShoppingCart,
  Smartphone, Wallet, FileCheck, Lock, LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { InsertableBlockType } from "./PlayerContextMenu";

interface VersionEntry {
  id: string;
  label: string;
  timestamp: string;
  messageCount: number;
}

interface PlayerBuilderToolbarProps {
  versionCount: number;
  versions: VersionEntry[];
  onInsertBlock: (type: InsertableBlockType) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onRestart: () => void;
  onSave: () => void;
  onRestoreVersion?: (versionId: string) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  activeFlowId: string | null;
}

const BLOCK_GROUPS = [
  {
    label: "Mensajes",
    items: [
      { type: "text" as InsertableBlockType, icon: MessageSquare, label: "Texto" },
      { type: "richCard" as InsertableBlockType, icon: LayoutGrid, label: "Rich Card" },
      { type: "menu" as InsertableBlockType, icon: LayoutGrid, label: "Menú" },
      { type: "quickReplies" as InsertableBlockType, icon: MessageSquare, label: "Quick Replies" },
    ],
  },
  {
    label: "Comercio",
    items: [
      { type: "catalog" as InsertableBlockType, icon: ShoppingCart, label: "Catálogo" },
      { type: "payment" as InsertableBlockType, icon: CreditCard, label: "Pago" },
      { type: "paymentConfirmation" as InsertableBlockType, icon: FileCheck, label: "Confirmación" },
    ],
  },
  {
    label: "Finanzas",
    items: [
      { type: "creditSimulation" as InsertableBlockType, icon: Wallet, label: "Crédito" },
      { type: "creditContract" as InsertableBlockType, icon: FileText, label: "Contrato" },
      { type: "clientStatus" as InsertableBlockType, icon: User, label: "Cliente" },
      { type: "momoAccount" as InsertableBlockType, icon: Smartphone, label: "MoMo" },
      { type: "servicePlans" as InsertableBlockType, icon: LayoutGrid, label: "Planes" },
      { type: "deviceLockConsent" as InsertableBlockType, icon: Lock, label: "Device Lock" },
    ],
  },
  {
    label: "Formularios",
    items: [
      { type: "inlineForm" as InsertableBlockType, icon: FileText, label: "Formulario" },
      { type: "location" as InsertableBlockType, icon: MapPin, label: "Ubicación" },
      { type: "rating" as InsertableBlockType, icon: Star, label: "Rating" },
    ],
  },
  {
    label: "Media & Canales",
    items: [
      { type: "mediaCarousel" as InsertableBlockType, icon: Image, label: "Carrusel" },
      { type: "training" as InsertableBlockType, icon: GraduationCap, label: "Training" },
      { type: "certificate" as InsertableBlockType, icon: Award, label: "Certificado" },
      { type: "voiceCall" as InsertableBlockType, icon: Phone, label: "WAKA Voice" },
      { type: "avatar" as InsertableBlockType, icon: User, label: "Avatar" },
    ],
  },
];

export function PlayerBuilderToolbar({
  versionCount,
  versions,
  onInsertBlock,
  onUndo,
  onRedo,
  onRestart,
  onSave,
  onRestoreVersion,
  canUndo = false,
  canRedo = false,
  activeFlowId,
}: PlayerBuilderToolbarProps) {
  const [activeTab, setActiveTab] = useState<"blocks" | "history" | null>(null);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col h-full border-l border-r border-border bg-card w-[280px] shrink-0">
        {/* Top action buttons */}
        <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTab === "blocks" ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setActiveTab(activeTab === "blocks" ? null : "blocks")}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Insertar bloque</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTab === "history" ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0 relative"
                onClick={() => setActiveTab(activeTab === "history" ? null : "history")}
              >
                <History className="h-4 w-4" />
                {versionCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-3.5 min-w-[14px] rounded-full bg-primary text-[8px] font-bold text-primary-foreground flex items-center justify-center px-0.5">
                    {versionCount}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Historial de versiones</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-5 mx-0.5" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onUndo} disabled={!canUndo}>
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Deshacer</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onRedo} disabled={!canRedo}>
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Rehacer</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-5 mx-0.5" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onRestart}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Reiniciar conversación</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onSave} disabled={!activeFlowId}>
                <Save className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Guardar</TooltipContent>
          </Tooltip>
        </div>

        {/* Panel content */}
        <ScrollArea className="flex-1">
          {activeTab === "blocks" && (
            <div className="p-3 space-y-4">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Insertar bloque soberano
              </p>
              {BLOCK_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1.5">{group.label}</p>
                  <div className="grid grid-cols-2 gap-1">
                    {group.items.map((item) => (
                      <button
                        key={item.type}
                        onClick={() => {
                          onInsertBlock(item.type);
                        }}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-[11px] font-medium text-foreground hover:bg-accent/50 transition-colors border border-transparent hover:border-border"
                      >
                        <item.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "history" && (
            <div className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Historial de versiones
                </p>
                <Badge variant="outline" className="text-[9px]">
                  {versionCount} cambios
                </Badge>
              </div>

              {versions.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-[11px] text-muted-foreground">
                    Los cambios se guardan automáticamente.
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    Cada edición crea un punto de restauración.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {versions.map((v, i) => (
                    <button
                      key={v.id}
                      onClick={() => onRestoreVersion?.(v.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left hover:bg-accent/50 transition-colors",
                        i === 0 && "bg-primary/5 border border-primary/20"
                      )}
                    >
                      <div className={cn(
                        "h-2 w-2 rounded-full shrink-0",
                        i === 0 ? "bg-primary" : "bg-muted-foreground/30"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-foreground truncate">{v.label}</p>
                        <p className="text-[9px] text-muted-foreground">
                          {v.timestamp} · {v.messageCount} msgs
                        </p>
                      </div>
                      {i === 0 && (
                        <Badge className="text-[8px] h-4 bg-primary/10 text-primary border-0">actual</Badge>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {!activeTab && (
            <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <p className="text-[12px] font-semibold text-foreground mb-1">Constructor de Experiencias</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Usa <strong>+</strong> para insertar bloques, <strong>doble-clic</strong> para editar mensajes,
                y <strong>clic derecho</strong> en el chat para más opciones.
              </p>
            </div>
          )}
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}
