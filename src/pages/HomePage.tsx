import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_ORG_ID } from "@/lib/constants";
import { Tables } from "@/integrations/supabase/types";
import { BUILTIN_DEMOS, getUploadedDemos } from "@/demos/registry";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Upload, Download, Sparkles, Hammer, Smartphone,
  Map, LayoutGrid, Rocket, ArrowRight, Search,
  MessageSquare, Phone, Bot, Globe, Instagram, Send,
  Plug, ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type Flow = Tables<"flows">;

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-primary/15 text-primary",
  archived: "bg-destructive/15 text-destructive",
};

const pipelineStages = [
  { label: "Idea", color: "bg-muted-foreground/20 text-muted-foreground" },
  { label: "Demo", color: "bg-accent/20 text-accent" },
  { label: "Validated", color: "bg-primary/20 text-primary" },
  { label: "Candidate", color: "bg-chart-4/20 text-chart-4" },
  { label: "Live", color: "bg-primary text-primary-foreground" },
];

const channels = [
  { label: "WhatsApp Guided", icon: MessageSquare },
  { label: "WhatsApp Hybrid", icon: MessageSquare },
  { label: "WhatsApp Conversational", icon: MessageSquare },
  { label: "Voice", icon: Phone },
  { label: "Avatar", icon: Bot },
  { label: "Telegram", icon: Send },
  { label: "Instagram", icon: Instagram },
  { label: "Web Agent", icon: Globe },
];

export default function HomePage() {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const uploadedDemos = getUploadedDemos();
  const allDemos = [...BUILTIN_DEMOS, ...uploadedDemos.map(d => ({ ...d, component: null as any }))];

  useEffect(() => {
    const fetchFlows = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("flows")
        .select("*")
        .eq("org_id", DEMO_ORG_ID)
        .neq("status", "archived")
        .order("updated_at", { ascending: false })
        .limit(10);
      setFlows(data || []);
      setLoading(false);
    };
    fetchFlows();
  }, []);

  const lastFlow = flows[0];
  const lastDemo = allDemos[allDemos.length - 1];

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">Waka XP</h1>
          <p className="text-xs text-muted-foreground">Design, simulate and operationalize intelligent experiences</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="h-8 w-48 rounded-md border border-input bg-background pl-8 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <Button size="sm" onClick={() => navigate("/journeys")}>
            <Plus className="mr-1 h-3.5 w-3.5" /> New Experience
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate("/import")}>
            <Download className="mr-1 h-3.5 w-3.5" /> Import TextIt
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate("/demos")}>
            <Upload className="mr-1 h-3.5 w-3.5" /> Upload JSX
          </Button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-8">

          {/* SECTION 1: Continue where you left off */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Continue where you left off
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Last Builder Flow */}
              {lastFlow && (
                <Card className="group cursor-pointer transition-shadow hover:shadow-md border-l-4 border-l-primary" onClick={() => navigate(`/editor?id=${lastFlow.id}`)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Hammer className="h-4 w-4 text-primary" />
                      <span className="text-[10px] font-medium text-muted-foreground uppercase">Last Builder Flow</span>
                    </div>
                    <CardTitle className="text-sm line-clamp-1">{lastFlow.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground">{(lastFlow.nodes as any[])?.length || 0} nodes</p>
                        <Badge variant="secondary" className={`text-[10px] ${statusColors[lastFlow.status]}`}>{lastFlow.status}</Badge>
                      </div>
                      <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100">
                        Open Builder <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Last JSX Demo */}
              {lastDemo && (
                <Card className="group cursor-pointer transition-shadow hover:shadow-md border-l-4 border-l-accent" onClick={() => navigate(`/demo/${lastDemo.id}`)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-accent" />
                      <span className="text-[10px] font-medium text-muted-foreground uppercase">Last JSX Demo</span>
                    </div>
                    <CardTitle className="text-sm line-clamp-1">{lastDemo.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">{lastDemo.tags?.slice(0, 2).join(", ")}</p>
                      <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100">
                        Open Simulator <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Last Journey (placeholder) */}
              <Card className="group cursor-pointer transition-shadow hover:shadow-md border-l-4 border-l-muted-foreground/30" onClick={() => navigate("/journeys")}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Map className="h-4 w-4 text-muted-foreground" />
                    <span className="text-[10px] font-medium text-muted-foreground uppercase">Journeys</span>
                  </div>
                  <CardTitle className="text-sm text-muted-foreground">No journeys yet</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">Create your first experience journey</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* SECTION 2: Create */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Create
            </h2>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { label: "New Experience", icon: Plus, color: "text-primary", to: "/journeys" },
                { label: "New Flow", icon: Hammer, color: "text-primary", to: "/editor" },
                { label: "New Demo", icon: Smartphone, color: "text-accent", to: "/demos" },
                { label: "Generate with AI", icon: Sparkles, color: "text-accent", to: "/journeys" },
                { label: "Import TextIt", icon: Download, color: "text-muted-foreground", to: "/import" },
                { label: "Upload JSX", icon: Upload, color: "text-muted-foreground", to: "/demos" },
              ].map((item) => (
                <Card
                  key={item.label}
                  className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] text-center py-4"
                  onClick={() => navigate(item.to)}
                >
                  <item.icon className={`h-6 w-6 mx-auto mb-2 ${item.color}`} />
                  <p className="text-xs font-medium text-foreground">{item.label}</p>
                </Card>
              ))}
            </div>
          </section>

          {/* SECTION 3: Active Assets */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Active Assets
            </h2>
            <Tabs defaultValue="flows">
              <TabsList>
                <TabsTrigger value="journeys">Journeys</TabsTrigger>
                <TabsTrigger value="flows">Flows</TabsTrigger>
                <TabsTrigger value="demos">Demos</TabsTrigger>
              </TabsList>

              <TabsContent value="journeys">
                <Card className="p-6 text-center">
                  <Map className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No journeys yet. Create your first experience.</p>
                  <Button size="sm" variant="outline" className="mt-3" onClick={() => navigate("/journeys")}>
                    <Plus className="mr-1 h-3.5 w-3.5" /> New Journey
                  </Button>
                </Card>
              </TabsContent>

              <TabsContent value="flows">
                {flows.length === 0 ? (
                  <Card className="p-6 text-center">
                    <Hammer className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No flows yet.</p>
                  </Card>
                ) : (
                  <div className="space-y-1">
                    {flows.slice(0, 5).map((flow) => (
                      <div
                        key={flow.id}
                        className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/editor?id=${flow.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <Hammer className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">{flow.name}</span>
                          <Badge variant="secondary" className={`text-[10px] ${statusColors[flow.status]}`}>{flow.status}</Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">{(flow.nodes as any[])?.length || 0} nodes</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(flow.updated_at), "dd MMM", { locale: es })}
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                    <Button variant="ghost" size="sm" className="w-full mt-1" onClick={() => navigate("/flows")}>
                      View all flows <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="demos">
                {allDemos.length === 0 ? (
                  <Card className="p-6 text-center">
                    <Smartphone className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No demos yet.</p>
                  </Card>
                ) : (
                  <div className="space-y-1">
                    {allDemos.slice(0, 5).map((demo) => (
                      <div
                        key={demo.id}
                        className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/demo/${demo.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-base">{demo.icon}</span>
                          <span className="text-sm font-medium text-foreground">{demo.title}</span>
                          {demo.tags?.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                          ))}
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    ))}
                    <Button variant="ghost" size="sm" className="w-full mt-1" onClick={() => navigate("/demos")}>
                      View all demos <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </section>

          {/* SECTION 4: Pipeline */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Pipeline
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {pipelineStages.map((stage, i) => (
                <div key={stage.label} className="flex items-center gap-2">
                  <div className={`rounded-lg px-4 py-3 text-center min-w-[120px] ${stage.color}`}>
                    <p className="text-xs font-semibold">{stage.label}</p>
                    <p className="text-lg font-bold mt-1">0</p>
                  </div>
                  {i < pipelineStages.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 5: Channels & Modalities */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Channels & Modalities
            </h2>
            <div className="flex flex-wrap gap-2">
              {channels.map((ch) => (
                <div
                  key={ch.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted"
                >
                  <ch.icon className="h-3 w-3" />
                  {ch.label}
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 6: Integration Readiness */}
          <section className="pb-8">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Integration Readiness
            </h2>
            <Card>
              <CardContent className="p-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: "Connectors Linked", value: "0", icon: Plug },
                    { label: "Mock Integrations", value: "0", icon: LayoutGrid },
                    { label: "Live Integrations", value: "0", icon: Rocket },
                    { label: "Production Readiness", value: "—", icon: Sparkles },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className="rounded-md bg-muted p-2">
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-foreground">{item.value}</p>
                        <p className="text-[10px] text-muted-foreground">{item.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
