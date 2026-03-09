import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight, Layers, Hammer, Sparkles, Eye, GitCompareArrows,
  AlertTriangle, CheckCircle2, Info, Download, Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { mapWakaFlowToTextIt, type WakaFlowModel, type MapperResult } from "@/lib/wakaflowMapper";
import { downloadJson } from "@/lib/flowExport";

const SAMPLE_MODEL: WakaFlowModel = {
  journey: "Moov Africa – Airtime Purchase",
  version: "0.1-preview",
  steps: [
    { id: "greet", label: "Greeting", type: "message", summary: "Welcome the user, present menu" },
    { id: "select", label: "Select Product", type: "input", summary: "User picks airtime amount" },
    { id: "confirm", label: "Confirm", type: "decision", summary: "Validate selection, ask confirmation" },
    { id: "execute", label: "Execute", type: "action", summary: "Call API, send airtime" },
    { id: "receipt", label: "Receipt", type: "message", summary: "Send confirmation receipt" },
  ],
};

const typeColors: Record<string, string> = {
  message: "bg-primary/10 text-primary border-primary/20",
  input: "bg-accent/60 text-accent-foreground border-accent",
  decision: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  action: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
};

const statusConfig = {
  clean: { label: "Clean", icon: CheckCircle2, className: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" },
  mapped_with_warnings: { label: "Mapped with warnings", icon: AlertTriangle, className: "text-amber-600 bg-amber-500/10 border-amber-500/20" },
  partial: { label: "Partial mapping", icon: AlertTriangle, className: "text-orange-600 bg-orange-500/10 border-orange-500/20" },
};

export default function WakaFlowPreview() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("model");

  const mapperResult: MapperResult = useMemo(() => mapWakaFlowToTextIt(SAMPLE_MODEL), []);

  const stCfg = statusConfig[mapperResult.status];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Layers className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground tracking-tight">WakaFlow</h1>
              <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-semibold border-primary/30 text-primary">
                Preview
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Model-first journey design — the next evolution of WAKA XP</p>
          </div>
          <Badge variant="outline" className={`text-[10px] gap-1.5 ${stCfg.className}`}>
            <stCfg.icon className="h-3 w-3" />
            {stCfg.label}
          </Badge>
        </div>
      </motion.div>

      {/* Philosophy banner */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15, duration: 0.35 }}>
        <Card className="border-dashed border-primary/20 bg-primary/[0.03]">
          <CardContent className="py-4 px-5 flex items-start gap-4">
            <GitCompareArrows className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="space-y-1 text-sm">
              <p className="font-medium text-foreground">From flow-first to model-first</p>
              <p className="text-muted-foreground leading-relaxed">
                WakaFlow lets you define <em>what</em> a journey does before deciding <em>how</em> each step is wired.
                Your existing flows and simulator remain fully available — WakaFlow adds a higher-level lens on top.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.35 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full max-w-lg">
            <TabsTrigger value="model" className="flex-1 gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              Model View
            </TabsTrigger>
            <TabsTrigger value="mapper" className="flex-1 gap-1.5">
              <GitCompareArrows className="h-3.5 w-3.5" />
              TextIt Mapper
              {mapperResult.warnings.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-[9px] bg-amber-500/15 text-amber-600 px-1.5">
                  {mapperResult.warnings.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="compare" className="flex-1 gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              Compare Paths
            </TabsTrigger>
          </TabsList>

          {/* Model View */}
          <TabsContent value="model" className="mt-4 space-y-3">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{SAMPLE_MODEL.journey}</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      WakaFlow model v{SAMPLE_MODEL.version} · {SAMPLE_MODEL.steps.length} steps
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">Sample</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {SAMPLE_MODEL.steps.map((step, i) => {
                  const stepWarnings = mapperResult.warnings.filter((w) => w.stepId === step.id);
                  return (
                    <div key={step.id} className="flex items-start gap-3 group">
                      {/* Step connector */}
                      <div className="flex flex-col items-center pt-1">
                        <div className={`h-7 w-7 rounded-full border flex items-center justify-center text-xs font-bold ${typeColors[step.type] || "bg-muted text-muted-foreground border-border"}`}>
                          {i + 1}
                        </div>
                        {i < SAMPLE_MODEL.steps.length - 1 && (
                          <div className="w-px h-6 bg-border/60 mt-1" />
                        )}
                      </div>
                      {/* Step content */}
                      <div className="flex-1 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{step.label}</span>
                          <Badge variant="outline" className="text-[10px] capitalize">{step.type}</Badge>
                          {stepWarnings.length > 0 && (
                            <AlertTriangle className="h-3 w-3 text-amber-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{step.summary}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mapper Status */}
          <TabsContent value="mapper" className="mt-4 space-y-4">
            {/* Mapper summary card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      WakaFlow → TextIt Mapping
                      <Badge variant="outline" className={`text-[10px] gap-1 ${stCfg.className}`}>
                        <stCfg.icon className="h-3 w-3" />
                        {stCfg.label}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      {mapperResult.mapped} of {mapperResult.total} steps mapped · {mapperResult.warnings.length} warning{mapperResult.warnings.length !== 1 ? "s" : ""}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1.5"
                    onClick={() => downloadJson(mapperResult.export, `wakaflow-${SAMPLE_MODEL.journey.replace(/\s+/g, "-").toLowerCase()}.json`)}
                  >
                    <Download className="h-3 w-3" />
                    Export JSON
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Step mapping results */}
                <div className="space-y-1.5">
                  {SAMPLE_MODEL.steps.map((step) => {
                    const warns = mapperResult.warnings.filter((w) => w.stepId === step.id);
                    const isMapped = warns.length === 0 || warns.every((w) => w.level === "info");
                    return (
                      <div key={step.id} className="flex items-center gap-3 text-xs px-3 py-2 rounded-lg bg-secondary/30">
                        {isMapped ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        )}
                        <span className="font-medium text-foreground flex-1">{step.label}</span>
                        <Badge variant="outline" className="text-[9px] capitalize">{step.type}</Badge>
                        {isMapped ? (
                          <span className="text-emerald-600 text-[10px]">Mapped</span>
                        ) : (
                          <span className="text-amber-600 text-[10px]">With warnings</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Warnings */}
            {mapperResult.warnings.length > 0 && (
              <Card className="border-amber-500/20 bg-amber-500/[0.02]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Warnings
                  </CardTitle>
                  <CardDescription className="text-xs">
                    These steps mapped with notes — the current export path remains fully available.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {mapperResult.warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs">
                      {w.level === "info" ? (
                        <Info className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <span className="font-medium text-foreground">{w.stepLabel}:</span>{" "}
                        <span className="text-muted-foreground">{w.message}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Safety note */}
            <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-secondary/20 px-4 py-3">
              <Shield className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">Your current export path is safe.</span>{" "}
                The existing Builder → TextIt export works independently. WakaFlow mapping is an additive path — use whichever fits your workflow.
              </p>
            </div>
          </TabsContent>

          {/* Compare Paths */}
          <TabsContent value="compare" className="mt-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Current path */}
              <Card className="border-border/60">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Hammer className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-sm">Current Path</CardTitle>
                  </div>
                  <CardDescription className="text-xs">Flow editor + JSX fragments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />Wire nodes visually in the Builder</div>
                  <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />Test in the Simulator</div>
                  <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />Export as TextIt JSON</div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 text-xs"
                    onClick={() => navigate("/editor")}
                  >
                    Open Builder <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>

              {/* WakaFlow path */}
              <Card className="border-primary/30 bg-primary/[0.02]">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm">WakaFlow Path</CardTitle>
                    <Badge variant="outline" className="text-[9px] uppercase tracking-widest border-primary/30 text-primary">New</Badge>
                  </div>
                  <CardDescription className="text-xs">Model-first journey design</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary/60" />Define journey steps as a model</div>
                  <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary/60" />Preview the experience structure</div>
                  <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary/60" />Map to TextIt with clear warnings</div>
                  <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary/60" />Generate executable flows from the model</div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 text-xs border-primary/30 text-primary hover:bg-primary/10"
                    onClick={() => setActiveTab("mapper")}
                  >
                    <Eye className="h-3 w-3 mr-1" /> View Mapper Status
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
