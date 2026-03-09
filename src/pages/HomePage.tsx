import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { WorkspaceContextBar } from "@/components/WorkspaceContextBar";
import { Tables } from "@/integrations/supabase/types";
import { BUILTIN_DEMOS, getUploadedDemos } from "@/demos/registry";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Plus, Upload, Download, Sparkles, Hammer, Smartphone,
  Map, LayoutGrid, Rocket, ArrowRight, Search,
  MessageSquare, Phone, Bot, Globe, Instagram, Send,
  Plug, ChevronRight, Zap, Shield,
  Radio, Wifi, WifiOff, AlertCircle, Layers,
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
  { label: "Idea", icon: Sparkles, filterStatus: null },
  { label: "Demo", icon: Smartphone, filterStatus: null },
  { label: "Candidate", icon: Rocket, filterStatus: "candidate" },
  { label: "Validated", icon: Shield, filterStatus: "validated" },
  { label: "Live", icon: Zap, filterStatus: "live" },
];

const channels = [
  { label: "WhatsApp Guided", icon: MessageSquare, glow: "group-hover:shadow-[0_0_12px_hsla(160,84%,45%,0.2)]" },
  { label: "WhatsApp Hybrid", icon: MessageSquare, glow: "group-hover:shadow-[0_0_12px_hsla(160,84%,45%,0.2)]" },
  { label: "WA Conversational", icon: MessageSquare, glow: "group-hover:shadow-[0_0_12px_hsla(160,84%,45%,0.2)]" },
  { label: "Voice", icon: Phone, glow: "group-hover:shadow-[0_0_12px_hsla(270,70%,60%,0.2)]" },
  { label: "Avatar", icon: Bot, glow: "group-hover:shadow-[0_0_12px_hsla(270,70%,60%,0.2)]" },
  { label: "Telegram", icon: Send, glow: "group-hover:shadow-[0_0_12px_hsla(200,80%,55%,0.2)]" },
  { label: "Instagram", icon: Instagram, glow: "group-hover:shadow-[0_0_12px_hsla(340,70%,55%,0.2)]" },
  { label: "Web Agent", icon: Globe, glow: "group-hover:shadow-[0_0_12px_hsla(35,95%,55%,0.2)]" },
];

const wakaStack = [
  { label: "WAKA NEXUS", desc: "Integration Hub", status: "simulated" as const },
  { label: "WAKA AXIOM", desc: "Data & Analytics", status: "inactive" as const },
  { label: "WAKA VOICE", desc: "Voice AI Layer", status: "simulated" as const },
  { label: "WAKA CORE", desc: "Core Runtime", status: "connected" as const },
  { label: "WAKA CRM", desc: "Customer Relations", status: "inactive" as const },
];

const stackStatusConfig = {
  connected: { label: "Connected", icon: Wifi, className: "text-primary bg-primary/10" },
  simulated: { label: "Simulated", icon: Radio, className: "text-accent bg-accent/10" },
  inactive: { label: "Inactive", icon: WifiOff, className: "text-muted-foreground bg-muted" },
};

const createActions = [
  { label: "New Experience", icon: Plus, gradient: "from-primary to-primary/60" },
  { label: "New Flow", icon: Hammer, gradient: "from-primary/80 to-primary/40" },
  { label: "New Demo", icon: Smartphone, gradient: "from-accent to-accent/60" },
  { label: "AI Generate", icon: Sparkles, gradient: "from-accent/80 to-primary/60" },
  { label: "Import JSON", icon: Download, gradient: "from-muted-foreground/40 to-muted-foreground/20" },
  { label: "Upload JSX", icon: Upload, gradient: "from-muted-foreground/40 to-muted-foreground/20" },
];

const createRoutes = ["/studio", "/editor", "/demos", "/studio", "/import", "/demos"];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function HomePage() {
  const { tenantId } = useWorkspace();
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [experienceCount, setExperienceCount] = useState(0);
  const [candidateStats, setCandidateStats] = useState<{ candidate: number; validated: number; live: number }>({ candidate: 0, validated: 0, live: 0 });
  const [candidates, setCandidates] = useState<any[]>([]);
  const navigate = useNavigate();
  const uploadedDemos = getUploadedDemos();
  const allDemos = [...BUILTIN_DEMOS, ...uploadedDemos.map(d => ({ ...d, component: null as any }))];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [flowsRes, expRes, candRes] = await Promise.all([
        supabase.from("flows").select("*").eq("tenant_id", tenantId).neq("status", "archived").order("updated_at", { ascending: false }).limit(10),
        supabase.from("experiences").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId),
        supabase.from("production_candidates").select("*").eq("tenant_id", tenantId).order("updated_at", { ascending: false }),
      ]);
      setFlows(flowsRes.data || []);
      setExperienceCount(expRes.count || 0);
      const allCandidates = candRes.data || [];
      setCandidates(allCandidates);
      setCandidateStats({
        candidate: allCandidates.filter((c: any) => c.status === "candidate").length,
        validated: allCandidates.filter((c: any) => c.status === "validated").length,
        live: allCandidates.filter((c: any) => c.status === "live").length,
      });
      setLoading(false);
    };
    fetchData();
  }, [tenantId]);

  const lastFlow = flows[0];
  const lastDemo = allDemos[allDemos.length - 1];
  const needsAttention = candidateStats.candidate;

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/50 bg-card/40 backdrop-blur-md px-5 py-3.5">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground tracking-wide">Waka XP</h1>
          <p className="text-[11px] text-muted-foreground tracking-wide">Design, simulate and operationalize intelligent experiences</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input type="text" placeholder="Search experiences..." className="h-8 w-52 rounded-lg border border-border/50 bg-secondary/50 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/30 transition-all" />
          </div>
          <Button size="sm" className="glow-primary font-medium tracking-wide" onClick={() => navigate("/studio")}>
            <Plus className="mr-1 h-3.5 w-3.5" /> New Experience
          </Button>
          <Button size="sm" variant="outline" className="border-border/50 hover:border-primary/30 hover:bg-primary/5" onClick={() => navigate("/import")}>
            <Download className="mr-1 h-3.5 w-3.5" /> Import JSON
          </Button>
          <Button size="sm" variant="outline" className="border-border/50 hover:border-accent/30 hover:bg-accent/5" onClick={() => navigate("/demos")}>
            <Upload className="mr-1 h-3.5 w-3.5" /> Upload JSX
          </Button>
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 overflow-auto gradient-mesh">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">

          {/* WORKSPACE CONTEXT BAR */}
          <motion.section initial="hidden" animate="visible">
            <motion.div variants={fadeUp} custom={0}>
              <WorkspaceContextBar />
            </motion.div>
          </motion.section>

          {/* Continue where you left off */}
          <motion.section initial="hidden" animate="visible">
            <motion.h2 variants={fadeUp} custom={0} className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-[0.2em] mb-4">Continue where you left off</motion.h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lastFlow && (
                <motion.div variants={fadeUp} custom={1}>
                  <Card className="group cursor-pointer glass border-gradient rounded-xl transition-all duration-300 hover:scale-[1.01] glow-subtle" onClick={() => navigate(`/editor?id=${lastFlow.id}`)}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div className="rounded-md bg-primary/10 p-1.5"><Hammer className="h-3.5 w-3.5 text-primary" /></div>
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Last Builder Flow</span>
                        <Badge variant="outline" className="text-[8px] ml-auto border-primary/30 text-primary">Classic Builder</Badge>
                      </div>
                      <CardTitle className="text-sm line-clamp-1 mt-1">{lastFlow.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{(lastFlow.nodes as any[])?.length || 0} nodes</span>
                          <Badge variant="secondary" className={`text-[10px] ${statusColors[lastFlow.status]}`}>{lastFlow.status}</Badge>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {lastDemo && (
                <motion.div variants={fadeUp} custom={2}>
                  <Card className="group cursor-pointer glass border-gradient rounded-xl transition-all duration-300 hover:scale-[1.01]" onClick={() => navigate(`/demo/${lastDemo.id}`)}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div className="rounded-md bg-accent/10 p-1.5"><Smartphone className="h-3.5 w-3.5 text-accent" /></div>
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Last JSX Demo</span>
                      </div>
                      <CardTitle className="text-sm line-clamp-1 mt-1">{lastDemo.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {lastDemo.tags?.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-[10px] bg-accent/10 text-accent/80">{tag}</Badge>
                          ))}
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-accent transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              <motion.div variants={fadeUp} custom={3}>
                <Card className="group cursor-pointer glass rounded-xl transition-all duration-300 hover:scale-[1.01] border border-primary/20 bg-primary/[0.02]" onClick={() => navigate("/wakaflow")}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="rounded-md bg-primary/10 p-1.5"><Layers className="h-3.5 w-3.5 text-primary" /></div>
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">WakaFlow</span>
                      <Badge variant="outline" className="text-[8px] ml-auto border-primary/30 text-primary">Preview</Badge>
                    </div>
                    <CardTitle className="text-sm text-foreground mt-1">Model-first preview</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground/60">Explore the new journey design path</p>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.section>

          {/* Create */}
          <motion.section initial="hidden" animate="visible">
            <motion.h2 variants={fadeUp} custom={0} className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-[0.2em] mb-4">Create</motion.h2>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
              {createActions.map((item, i) => (
                <motion.div key={item.label} variants={fadeUp} custom={i + 1}>
                  <Card className="group cursor-pointer glass border-gradient rounded-xl text-center py-5 transition-all duration-300 hover:scale-[1.03] shimmer" onClick={() => navigate(createRoutes[i])}>
                    <div className={`mx-auto w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110`}>
                      <item.icon className="h-5 w-5 text-foreground" />
                    </div>
                    <p className="text-[11px] font-medium text-foreground/80 tracking-wide">{item.label}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Core Assets */}
          <motion.section initial="hidden" animate="visible">
            <motion.h2 variants={fadeUp} custom={0} className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-[0.2em] mb-4">Core Assets</motion.h2>
            <motion.div variants={fadeUp} custom={1}>
              <Tabs defaultValue="flows" className="w-full">
                <TabsList className="bg-secondary/50 border border-border/50">
                  <TabsTrigger value="experiences" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary tracking-wide text-xs">Experiences</TabsTrigger>
                  <TabsTrigger value="flows" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary tracking-wide text-xs">Flows</TabsTrigger>
                  <TabsTrigger value="demos" className="data-[state=active]:bg-accent/10 data-[state=active]:text-accent tracking-wide text-xs">Demos</TabsTrigger>
                  <TabsTrigger value="candidates" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-600 tracking-wide text-xs">
                    Candidates
                    {candidateStats.candidate + candidateStats.validated + candidateStats.live > 0 && (
                      <Badge variant="secondary" className="ml-1.5 text-[8px] bg-amber-500/15 text-amber-600 px-1">
                        {candidateStats.candidate + candidateStats.validated + candidateStats.live}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="experiences">
                  <Card className="glass border-gradient rounded-xl p-8 text-center">
                    <Sparkles className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
                    <p className="text-sm text-muted-foreground/60">
                      {experienceCount > 0 ? `${experienceCount} experience${experienceCount > 1 ? "s" : ""} in your workspace` : "No experiences yet."}
                    </p>
                    <Button size="sm" variant="outline" className="mt-4 border-border/50" onClick={() => navigate("/studio")}>
                      Open Experience Studio <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Card>
                </TabsContent>

                <TabsContent value="flows">
                  {flows.length === 0 ? (
                    <Card className="glass border-gradient rounded-xl p-8 text-center">
                      <Hammer className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
                      <p className="text-sm text-muted-foreground/60">No flows yet.</p>
                    </Card>
                  ) : (
                    <Card className="glass border-gradient rounded-xl overflow-hidden">
                      <div className="divide-y divide-border/30">
                        {flows.slice(0, 5).map((flow) => (
                          <div key={flow.id} className="flex items-center justify-between px-4 py-3 hover:bg-secondary/30 cursor-pointer transition-colors" onClick={() => navigate(`/editor?id=${flow.id}`)}>
                            <div className="flex items-center gap-3">
                              <div className="rounded-md bg-primary/10 p-1"><Hammer className="h-3 w-3 text-primary" /></div>
                              <span className="text-sm font-medium text-foreground">{flow.name}</span>
                              <Badge variant="secondary" className={`text-[10px] ${statusColors[flow.status]}`}>{flow.status}</Badge>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-muted-foreground/60">{(flow.nodes as any[])?.length || 0} nodes</span>
                              <span className="text-xs text-muted-foreground/40">{format(new Date(flow.updated_at), "dd MMM", { locale: es })}</span>
                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30" />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-border/30 p-2">
                        <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-primary" onClick={() => navigate("/flows")}>
                          View all flows <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="demos">
                  {allDemos.length === 0 ? (
                    <Card className="glass border-gradient rounded-xl p-8 text-center">
                      <Smartphone className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
                      <p className="text-sm text-muted-foreground/60">No demos yet.</p>
                    </Card>
                  ) : (
                    <Card className="glass border-gradient rounded-xl overflow-hidden">
                      <div className="divide-y divide-border/30">
                        {allDemos.slice(0, 5).map((demo) => (
                          <div key={demo.id} className="flex items-center justify-between px-4 py-3 hover:bg-secondary/30 cursor-pointer transition-colors" onClick={() => navigate(`/demo/${demo.id}`)}>
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{demo.icon}</span>
                              <span className="text-sm font-medium text-foreground">{demo.title}</span>
                              {demo.tags?.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-[10px] bg-accent/10 text-accent/70">{tag}</Badge>
                              ))}
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30" />
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-border/30 p-2">
                        <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-accent" onClick={() => navigate("/demos")}>
                          View all demos <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="candidates">
                  {candidates.filter((c: any) => c.status !== "archived").length === 0 ? (
                    <Card className="glass border-gradient rounded-xl p-8 text-center">
                      <Rocket className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
                      <p className="text-sm text-muted-foreground/60">No production candidates yet.</p>
                      <p className="text-[10px] text-muted-foreground/40 mt-1">Promote from Experience Studio or Builder to create candidates</p>
                      <Button size="sm" variant="outline" className="mt-4 border-border/50" onClick={() => navigate("/production")}>
                        Go to Production <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Card>
                  ) : (
                    <Card className="glass border-gradient rounded-xl overflow-hidden">
                      <div className="divide-y divide-border/30">
                        {candidates.filter((c: any) => c.status !== "archived").slice(0, 5).map((c: any) => (
                          <div key={c.id} className="flex items-center justify-between px-4 py-3 hover:bg-secondary/30 cursor-pointer transition-colors" onClick={() => navigate(`/production?id=${c.id}`)}>
                            <div className="flex items-center gap-3">
                              <div className="rounded-md bg-amber-500/10 p-1"><Rocket className="h-3 w-3 text-amber-600" /></div>
                              <span className="text-sm font-medium text-foreground">{c.name}</span>
                              <Badge variant="secondary" className={`text-[10px] ${
                                c.status === "candidate" ? "bg-amber-500/15 text-amber-600" :
                                c.status === "validated" ? "bg-chart-4/15 text-chart-4" :
                                c.status === "live" ? "bg-primary/15 text-primary" :
                                "bg-muted text-muted-foreground"
                              }`}>{c.status}</Badge>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-[10px]">{c.environment}</Badge>
                              <span className="text-xs text-muted-foreground/40">{format(new Date(c.updated_at), "dd MMM", { locale: es })}</span>
                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30" />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-border/30 p-2">
                        <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-amber-600" onClick={() => navigate("/production")}>
                          View all candidates <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </motion.div>
          </motion.section>

          {/* Pipeline */}
          <motion.section initial="hidden" animate="visible">
            <motion.div variants={fadeUp} custom={0} className="flex items-center gap-3 mb-4">
              <h2 className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-[0.2em]">Production Pipeline</h2>
              {needsAttention > 0 && (
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 text-[9px] gap-1">
                  <AlertCircle className="h-2.5 w-2.5" /> {needsAttention} awaiting validation
                </Badge>
              )}
            </motion.div>
            <motion.div variants={fadeUp} custom={1} className="flex gap-3 overflow-x-auto pb-2">
              {pipelineStages.map((stage, i) => {
                let count = 0;
                if (stage.filterStatus === "candidate") count = candidateStats.candidate;
                else if (stage.filterStatus === "validated") count = candidateStats.validated;
                else if (stage.filterStatus === "live") count = candidateStats.live;
                else if (stage.label === "Demo") count = allDemos.length;
                const isClickable = !!stage.filterStatus;
                return (
                  <div key={stage.label} className="flex items-center gap-3">
                    <div
                      className={`glass border-gradient rounded-xl px-5 py-4 text-center min-w-[130px] transition-all hover:scale-[1.03] ${isClickable ? "cursor-pointer" : "cursor-default"} ${
                        stage.filterStatus === "candidate" && count > 0 ? "ring-1 ring-amber-500/30" : ""
                      }`}
                      onClick={() => { if (isClickable) navigate("/production"); }}
                    >
                      <stage.icon className={`h-5 w-5 mx-auto mb-2 ${
                        stage.filterStatus === "live" && count > 0 ? "text-primary" :
                        stage.filterStatus === "validated" && count > 0 ? "text-chart-4" :
                        stage.filterStatus === "candidate" && count > 0 ? "text-amber-600" :
                        "text-muted-foreground/60"
                      }`} />
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">{stage.label}</p>
                      <p className="text-2xl font-bold text-foreground/80 mt-1">{count}</p>
                    </div>
                    {i < pipelineStages.length - 1 && <div className="w-6 h-px bg-gradient-to-r from-border/60 to-border/20" />}
                  </div>
                );
              })}
            </motion.div>
          </motion.section>

          {/* Channels */}
          <motion.section initial="hidden" animate="visible">
            <motion.h2 variants={fadeUp} custom={0} className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-[0.2em] mb-4">Channels & Modalities</motion.h2>
            <motion.div variants={fadeUp} custom={1} className="flex flex-wrap gap-2">
              {channels.map((ch) => (
                <div key={ch.label} className={`group inline-flex items-center gap-2 rounded-full glass border-gradient px-4 py-2 text-xs text-muted-foreground/70 transition-all duration-300 cursor-default hover:text-foreground ${ch.glow}`}>
                  <ch.icon className="h-3.5 w-3.5" /><span className="tracking-wide">{ch.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.section>

          {/* WAKA Stack */}
          <motion.section initial="hidden" animate="visible">
            <motion.h2 variants={fadeUp} custom={0} className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-[0.2em] mb-4">Connected WAKA Stack</motion.h2>
            <motion.div variants={fadeUp} custom={1}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {wakaStack.map((layer) => {
                  const cfg = stackStatusConfig[layer.status];
                  return (
                    <Card key={layer.label} className="glass border-gradient rounded-xl p-4 transition-all hover:scale-[1.02]">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[11px] font-bold text-foreground tracking-wide">{layer.label}</p>
                        <cfg.icon className={`h-3.5 w-3.5 ${cfg.className.split(" ")[0]}`} />
                      </div>
                      <p className="text-[10px] text-muted-foreground/60 mb-2">{layer.desc}</p>
                      <Badge variant="secondary" className={`text-[9px] ${cfg.className}`}>{cfg.label}</Badge>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          </motion.section>

          {/* Integration Readiness */}
          <motion.section initial="hidden" animate="visible" className="pb-10">
            <motion.h2 variants={fadeUp} custom={0} className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-[0.2em] mb-4">Integration Readiness</motion.h2>
            <motion.div variants={fadeUp} custom={1}>
              <Card className="glass border-gradient rounded-xl">
                <CardContent className="p-5">
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      { label: "Connectors Linked", value: "0", icon: Plug, color: "text-primary" },
                      { label: "Mock Integrations", value: "0", icon: LayoutGrid, color: "text-accent" },
                      { label: "Live Integrations", value: "0", icon: Rocket, color: "text-chart-4" },
                      { label: "Production Readiness", value: candidateStats.live > 0 ? `${candidateStats.live} live` : "—", icon: Shield, color: "text-chart-3" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-4">
                        <div className="rounded-xl bg-secondary/50 p-3"><item.icon className={`h-5 w-5 ${item.color}/60`} /></div>
                        <div>
                          <p className="text-xl font-bold text-foreground/80">{item.value}</p>
                          <p className="text-[10px] text-muted-foreground/50 tracking-wide">{item.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
