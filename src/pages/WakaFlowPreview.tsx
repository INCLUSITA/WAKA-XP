import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Layers, Hammer, Sparkles, Eye, GitCompareArrows } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const SAMPLE_MODEL = {
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

export default function WakaFlowPreview() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("model");

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
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground tracking-tight">WakaFlow</h1>
              <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-semibold border-primary/30 text-primary">
                Preview
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Model-first journey design — the next evolution of WAKA XP</p>
          </div>
        </div>
      </motion.div>

      {/* Philosophy banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.35 }}
      >
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
          <TabsList className="w-full max-w-md">
            <TabsTrigger value="model" className="flex-1 gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              Model View
            </TabsTrigger>
            <TabsTrigger value="compare" className="flex-1 gap-1.5">
              <GitCompareArrows className="h-3.5 w-3.5" />
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
                {SAMPLE_MODEL.steps.map((step, i) => (
                  <div
                    key={step.id}
                    className="flex items-start gap-3 group"
                  >
                    {/* Step connector */}
                    <div className="flex flex-col items-center pt-1">
                      <div className={`h-7 w-7 rounded-full border flex items-center justify-center text-xs font-bold ${typeColors[step.type]}`}>
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
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{step.summary}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
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
                  <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary/60" />Generate executable flows from the model</div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 text-xs border-primary/30 text-primary hover:bg-primary/10"
                    onClick={() => setActiveTab("model")}
                  >
                    <Eye className="h-3 w-3 mr-1" /> View Model Preview
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
