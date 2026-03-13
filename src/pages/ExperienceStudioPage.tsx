import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { WorkspaceContextBar } from "@/components/WorkspaceContextBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Sparkles, Loader2, Pencil, Copy, Trash2, Eye, ArrowLeft,
  Hammer, Smartphone, Rocket, History, Link2, Unlink, ExternalLink, ChevronRight, BrainCircuit,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { VersionHistoryPanel } from "@/components/versioning/VersionHistoryPanel";
import { ExperienceContextTab } from "@/components/experience/ExperienceContextTab";
import { Tables } from "@/integrations/supabase/types";

interface Experience {
  id: string;
  name: string;
  description: string | null;
  status: string;
  environment: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  tenant_id: string;
}

type Flow = Tables<"flows">;

interface CandidateBasic {
  id: string;
  name: string;
  status: string;
  environment: string;
  updated_at: string;
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-primary/15 text-primary",
  validated: "bg-chart-4/15 text-chart-4",
  candidate: "bg-amber-500/15 text-amber-600",
  live: "bg-primary/20 text-primary",
  archived: "bg-destructive/15 text-destructive",
};

// ── Experience Detail View ──

function ExperienceDetail({
  experience,
  onBack,
  onRefresh,
}: {
  experience: Experience;
  onBack: () => void;
  onRefresh: () => void;
}) {
  const { tenantId } = useWorkspace();
  const navigate = useNavigate();
  const [linkedFlows, setLinkedFlows] = useState<Flow[]>([]);
  const [unlinkedFlows, setUnlinkedFlows] = useState<Flow[]>([]);
  const [candidates, setCandidates] = useState<CandidateBasic[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);

  const fetchFlows = useCallback(async () => {
    const [linkedRes, unlinkedRes] = await Promise.all([
      supabase
        .from("flows")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("experience_id", experience.id)
        .order("updated_at", { ascending: false }),
      supabase
        .from("flows")
        .select("*")
        .eq("tenant_id", tenantId)
        .is("experience_id", null)
        .neq("status", "archived")
        .order("updated_at", { ascending: false }),
    ]);
    setLinkedFlows(linkedRes.data || []);
    setUnlinkedFlows(unlinkedRes.data || []);
  }, [tenantId, experience.id]);

  const fetchCandidates = useCallback(async () => {
    const { data } = await supabase
      .from("production_candidates")
      .select("id, name, status, environment, updated_at")
      .eq("experience_id", experience.id)
      .neq("status", "archived")
      .order("updated_at", { ascending: false });
    setCandidates((data as CandidateBasic[]) || []);
  }, [experience.id]);

  useEffect(() => {
    fetchFlows();
    fetchCandidates();
  }, [fetchFlows, fetchCandidates]);

  const linkFlow = async (flowId: string) => {
    const { error } = await supabase
      .from("flows")
      .update({ experience_id: experience.id })
      .eq("id", flowId);
    if (error) {
      toast.error("Error linking flow");
      return;
    }
    toast.success("Flow linked to experience");
    fetchFlows();
  };

  const unlinkFlow = async (flowId: string) => {
    const { error } = await supabase
      .from("flows")
      .update({ experience_id: null })
      .eq("id", flowId);
    if (error) {
      toast.error("Error unlinking flow");
      return;
    }
    toast.success("Flow unlinked");
    fetchFlows();
  };

  const handlePromote = async (selectedFlowId?: string) => {
    const { data, error } = await supabase.from("production_candidates").insert({
      name: `${experience.name} — Candidate`,
      experience_id: experience.id,
      flow_id: selectedFlowId || null,
      tenant_id: experience.tenant_id,
    }).select("id").single();
    if (error) { toast.error("Error creating candidate"); return; }
    toast.success("Production Candidate created");
    fetchCandidates();
    navigate(`/production?id=${data.id}`);
  };

  const onPromoteClick = () => {
    if (linkedFlows.length === 0) {
      // No flows — promote with experience only
      handlePromote();
    } else if (linkedFlows.length === 1) {
      // Single flow — auto-select
      handlePromote(linkedFlows[0].id);
    } else {
      // Multiple flows — show selection dialog
      setShowPromoteDialog(true);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Detail header */}
      <div className="flex items-center gap-3 border-b border-border/50 bg-card/40 backdrop-blur-md px-5 py-3.5">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Button>
        <div className="flex-1">
          <h2 className="text-base font-bold text-foreground">{experience.name}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="secondary" className={`text-[10px] ${statusColors[experience.status] || ""}`}>
              {experience.status}
            </Badge>
            <Badge variant="outline" className="text-[10px]">{experience.environment}</Badge>
            <span className="text-[10px] text-muted-foreground">
              Updated {format(new Date(experience.updated_at), "dd MMM yyyy, HH:mm")}
            </span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onPromoteClick} className="border-amber-500/40 text-amber-600 hover:bg-amber-500/10">
          <Rocket className="mr-1 h-3.5 w-3.5" /> Promote to Candidate
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowVersions((v) => !v)} className="border-amber-500/40 text-amber-600 hover:bg-amber-500/10">
          <History className="mr-1 h-3.5 w-3.5" /> Versions
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 overflow-auto p-6">
          <Tabs defaultValue="overview">
            <TabsList className="bg-secondary/50 border border-border/50 mb-6">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="context" className="text-xs flex items-center gap-1"><BrainCircuit className="h-3 w-3" />Context</TabsTrigger>
              <TabsTrigger value="demos" className="text-xs">Demos</TabsTrigger>
              <TabsTrigger value="flows" className="text-xs">Flows ({linkedFlows.length})</TabsTrigger>
              <TabsTrigger value="candidates" className="text-xs">Candidates ({candidates.length})</TabsTrigger>
              <TabsTrigger value="versions" className="text-xs">Versions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid gap-4 sm:grid-cols-3 mb-6">
                <Card className="glass border-gradient rounded-xl">
                  <CardContent className="p-4 text-center">
                    <Smartphone className="h-6 w-6 mx-auto text-accent mb-2" />
                    <p className="text-lg font-bold text-muted-foreground/40">—</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Demos</p>
                    <p className="text-[9px] text-muted-foreground/40 mt-0.5 italic">Not linked yet</p>
                  </CardContent>
                </Card>
                <Card className="glass border-gradient rounded-xl">
                  <CardContent className="p-4 text-center">
                    <Hammer className="h-6 w-6 mx-auto text-primary mb-2" />
                    <p className="text-2xl font-bold text-foreground">{linkedFlows.length}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Flows</p>
                  </CardContent>
                </Card>
                <Card className="glass border-gradient rounded-xl">
                  <CardContent className="p-4 text-center">
                    <Rocket className="h-6 w-6 mx-auto text-amber-600 mb-2" />
                    <p className="text-2xl font-bold text-foreground">{candidates.length}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Candidates</p>
                  </CardContent>
                </Card>
              </div>

              {experience.description && (
                <Card className="glass border-gradient rounded-xl mb-4">
                  <CardContent className="p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</p>
                    <p className="text-sm text-foreground">{experience.description}</p>
                  </CardContent>
                </Card>
              )}

              {experience.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {experience.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="context">
              <ExperienceContextTab experienceId={experience.id} />
            </TabsContent>

            <TabsContent value="demos">
              <Card className="glass border-gradient rounded-xl p-8 text-center">
                <Smartphone className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
                <p className="text-sm text-muted-foreground/60">Demo ↔ Experience linking coming next</p>
                <p className="text-[10px] text-muted-foreground/40 mt-1">Demos exist independently for now. This relationship will be connected in a future iteration.</p>
              </Card>
            </TabsContent>

            <TabsContent value="flows">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Linked Flows</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setShowLinkDialog(true)} className="text-xs gap-1">
                      <Link2 className="h-3 w-3" /> Link existing Flow
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => navigate("/editor")} className="text-xs gap-1">
                      <Plus className="h-3 w-3" /> New Flow
                    </Button>
                  </div>
                </div>

                {linkedFlows.length === 0 ? (
                  <Card className="glass border-gradient rounded-xl p-8 text-center">
                    <Hammer className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
                    <p className="text-sm text-muted-foreground/60">No flows linked yet.</p>
                    <p className="text-[10px] text-muted-foreground/40 mt-1">Link existing flows or create new ones</p>
                  </Card>
                ) : (
                  <Card className="glass border-gradient rounded-xl overflow-hidden">
                    <div className="divide-y divide-border/30">
                      {linkedFlows.map((flow) => (
                        <div key={flow.id} className="flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors">
                          <div
                            className="flex items-center gap-3 flex-1 cursor-pointer"
                            onClick={() => navigate(`/editor?id=${flow.id}`)}
                          >
                            <div className="rounded-md bg-primary/10 p-1"><Hammer className="h-3 w-3 text-primary" /></div>
                            <span className="text-sm font-medium text-foreground">{flow.name}</span>
                            <Badge variant="secondary" className={`text-[10px] ${statusColors[flow.status]}`}>{flow.status}</Badge>
                            <span className="text-xs text-muted-foreground/60">{(flow.nodes as unknown as any[])?.length || 0} nodes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/editor?id=${flow.id}`)} title="Open in Builder">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => unlinkFlow(flow.id)} title="Unlink from experience">
                              <Unlink className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>

              {/* Link Flow Dialog */}
              <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Link Flow to Experience</DialogTitle>
                    <DialogDescription>Select an unlinked flow to associate with "{experience.name}"</DialogDescription>
                  </DialogHeader>
                  <div className="max-h-72 overflow-auto space-y-1 py-2">
                    {unlinkedFlows.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">All flows are already linked to an experience.</p>
                    ) : (
                      unlinkedFlows.map((flow) => (
                        <div
                          key={flow.id}
                          className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                          onClick={() => {
                            linkFlow(flow.id);
                            setShowLinkDialog(false);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <Hammer className="h-3.5 w-3.5 text-primary" />
                            <span className="text-sm font-medium">{flow.name}</span>
                            <Badge variant="secondary" className={`text-[10px] ${statusColors[flow.status]}`}>{flow.status}</Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">{(flow.nodes as unknown as any[])?.length || 0} nodes</span>
                        </div>
                      ))
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowLinkDialog(false)}>Cancel</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="candidates">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Production Candidates</p>
                  <Button size="sm" variant="outline" onClick={onPromoteClick} className="text-xs gap-1 border-amber-500/30 text-amber-600">
                    <Rocket className="h-3 w-3" /> Create Candidate
                  </Button>
                </div>

                {candidates.length === 0 ? (
                  <Card className="glass border-gradient rounded-xl p-8 text-center">
                    <Rocket className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
                    <p className="text-sm text-muted-foreground/60">No production candidates yet.</p>
                    <p className="text-[10px] text-muted-foreground/40 mt-1">Promote this experience to create a candidate</p>
                  </Card>
                ) : (
                  <Card className="glass border-gradient rounded-xl overflow-hidden">
                    <div className="divide-y divide-border/30">
                      {candidates.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between px-4 py-3 hover:bg-secondary/30 cursor-pointer transition-colors"
                          onClick={() => navigate(`/production?id=${c.id}`)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="rounded-md bg-amber-500/10 p-1"><Rocket className="h-3 w-3 text-amber-600" /></div>
                            <span className="text-sm font-medium text-foreground">{c.name}</span>
                            <Badge variant="secondary" className={`text-[10px] ${statusColors[c.status] || ""}`}>{c.status}</Badge>
                            <Badge variant="outline" className="text-[10px]">{c.environment}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground/40">{format(new Date(c.updated_at), "dd MMM yyyy")}</span>
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="versions">
              <Card className="glass border-gradient rounded-xl overflow-hidden">
                <div className="h-[500px]">
                  <VersionHistoryPanel
                    assetType="experience"
                    assetId={experience.id}
                    getSnapshotData={() => ({
                      name: experience.name,
                      description: experience.description,
                      status: experience.status,
                      environment: experience.environment,
                      tags: experience.tags,
                    })}
                    onRestore={() => {
                      toast.success("Experience version restored");
                      onRefresh();
                    }}
                  />
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Side version panel */}
        {showVersions && (
          <div className="w-80 border-l border-border bg-card shadow-xl">
            <VersionHistoryPanel
              assetType="experience"
              assetId={experience.id}
              getSnapshotData={() => ({
                name: experience.name,
                description: experience.description,
                status: experience.status,
                environment: experience.environment,
                tags: experience.tags,
              })}
              onRestore={() => {
                toast.success("Experience version restored");
                onRefresh();
              }}
              onClose={() => setShowVersions(false)}
            />
          </div>
        )}
      </div>

      {/* Promote flow selection dialog */}
      <Dialog open={showPromoteDialog} onOpenChange={setShowPromoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Flow for Candidate</DialogTitle>
            <DialogDescription>This experience has {linkedFlows.length} linked flows. Select which flow to include in the production candidate.</DialogDescription>
          </DialogHeader>
          <div className="max-h-72 overflow-auto space-y-1 py-2">
            {linkedFlows.map((flow) => (
              <div
                key={flow.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                onClick={() => {
                  setShowPromoteDialog(false);
                  handlePromote(flow.id);
                }}
              >
                <div className="flex items-center gap-2">
                  <Hammer className="h-3.5 w-3.5 text-primary" />
                  <span className="text-sm font-medium">{flow.name}</span>
                  <Badge variant="secondary" className={`text-[10px] ${statusColors[flow.status]}`}>{flow.status}</Badge>
                </div>
                <span className="text-xs text-muted-foreground">{(flow.nodes as unknown as any[])?.length || 0} nodes</span>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPromoteDialog(false)}>Cancel</Button>
            <Button variant="ghost" onClick={() => { setShowPromoteDialog(false); handlePromote(); }} className="text-xs text-muted-foreground">
              Skip — no flow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Main Studio Page ──

export default function ExperienceStudioPage() {
  const { tenantId } = useWorkspace();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get("id");

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [flowCountMap, setFlowCountMap] = useState<Record<string, number>>({});
  const [candidateCountMap, setCandidateCountMap] = useState<Record<string, number>>({});
  const navigate = useNavigate();

  const fetchExperiences = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("experiences")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("updated_at", { ascending: false });

    if (error) {
      toast.error("Error loading experiences");
      console.error(error);
    } else {
      setExperiences((data as Experience[]) || []);
      if (data && data.length > 0) {
        const ids = data.map((e) => e.id);
        const [flowsRes, candRes] = await Promise.all([
          supabase.from("flows").select("id, experience_id").in("experience_id", ids),
          supabase.from("production_candidates").select("id, experience_id").in("experience_id", ids).neq("status", "archived"),
        ]);
        if (flowsRes.data) {
          const counts: Record<string, number> = {};
          flowsRes.data.forEach((f) => {
            if (f.experience_id) counts[f.experience_id] = (counts[f.experience_id] || 0) + 1;
          });
          setFlowCountMap(counts);
        }
        if (candRes.data) {
          const counts: Record<string, number> = {};
          candRes.data.forEach((c) => {
            if (c.experience_id) counts[c.experience_id] = (counts[c.experience_id] || 0) + 1;
          });
          setCandidateCountMap(counts);
        }
      }
    }
    setLoading(false);
  }, [tenantId]);

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  const selectedExp = experiences.find((e) => e.id === selectedId);

  // If detail view
  if (selectedId && selectedExp) {
    return (
      <ExperienceDetail
        experience={selectedExp}
        onBack={() => setSearchParams({})}
        onRefresh={fetchExperiences}
      />
    );
  }

  const createExperience = async () => {
    if (!newName.trim()) {
      toast.error("Name is required");
      return;
    }
    const { data, error } = await supabase.from("experiences").insert({
      name: newName.trim(),
      description: newDesc.trim() || null,
      tenant_id: tenantId,
    }).select("id").single();

    if (error) {
      toast.error("Error creating experience");
      return;
    }
    toast.success("Experience created");
    setShowCreate(false);
    setNewName("");
    setNewDesc("");
    fetchExperiences();
    if (data) setSearchParams({ id: data.id });
  };

  const duplicateExperience = async (exp: Experience) => {
    const { error } = await supabase.from("experiences").insert({
      name: `${exp.name} (copy)`,
      description: exp.description,
      tenant_id: tenantId,
      tags: exp.tags,
    });
    if (error) {
      toast.error("Error duplicating");
      return;
    }
    toast.success("Experience duplicated");
    fetchExperiences();
  };

  const deleteExperience = async (id: string) => {
    const { error } = await supabase.from("experiences").delete().eq("id", id);
    if (error) {
      toast.error("Error deleting");
      return;
    }
    toast.success("Experience deleted");
    fetchExperiences();
  };

  const activeExps = experiences.filter((e) => e.status !== "archived");
  const archivedExps = experiences.filter((e) => e.status === "archived");

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-3 border-b border-border/50 bg-card/40 backdrop-blur-md px-5 py-3.5">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground tracking-wide">Experience Studio</h1>
          <p className="text-[11px] text-muted-foreground">Design, compose and manage experiences across channels</p>
        </div>
        <WorkspaceContextBar compact />
        <Button size="sm" className="glow-primary font-medium ml-2" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1 h-3.5 w-3.5" /> New Experience
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="bg-secondary/50 border border-border/50 mb-6">
              <TabsTrigger value="active" className="text-xs">Active ({activeExps.length})</TabsTrigger>
              <TabsTrigger value="archived" className="text-xs">Archived ({archivedExps.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {activeExps.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Sparkles className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-lg font-semibold text-foreground">No experiences yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Create your first experience to get started</p>
                  <Button className="mt-4" onClick={() => setShowCreate(true)}>
                    <Plus className="mr-1 h-4 w-4" /> Create Experience
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {activeExps.map((exp) => {
                    const candCount = candidateCountMap[exp.id] || 0;
                    return (
                      <Card
                        key={exp.id}
                        className="group glass border-gradient rounded-xl transition-all hover:scale-[1.01] cursor-pointer"
                        onClick={() => setSearchParams({ id: exp.id })}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-sm line-clamp-1">{exp.name}</CardTitle>
                            <div className="flex gap-1">
                              <Badge variant="secondary" className={`text-[10px] ${statusColors[exp.status] || ""}`}>
                                {exp.status}
                              </Badge>
                              <Badge variant="outline" className="text-[10px]">{exp.environment}</Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          {exp.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{exp.description}</p>
                          )}
                          <p className="text-[10px] text-muted-foreground/60">
                            Updated {format(new Date(exp.updated_at), "dd MMM yyyy, HH:mm")}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground/50">
                            <span className="flex items-center gap-1 text-muted-foreground/30 italic"><Smartphone className="h-3 w-3" /> —</span>
                            <span className="flex items-center gap-1"><Hammer className="h-3 w-3" /> {flowCountMap[exp.id] || 0} flows</span>
                            <span className="flex items-center gap-1"><Rocket className="h-3 w-3" /> {candCount} candidates</span>
                          </div>
                        </CardContent>
                        <CardFooter className="gap-1 pt-0" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" title="View" onClick={() => setSearchParams({ id: exp.id })}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Edit" onClick={() => setSearchParams({ id: exp.id })}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => duplicateExperience(exp)} title="Duplicate">
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteExperience(exp.id)} title="Delete">
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="archived">
              {archivedExps.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">No archived experiences</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {archivedExps.map((exp) => (
                    <Card key={exp.id} className="opacity-60">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{exp.name}</CardTitle>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Experience</DialogTitle>
            <DialogDescription>Create a new experience in your workspace</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-foreground">Name</label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Onboarding KYC Moov BF"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">Description (optional)</label>
              <Textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Brief description of this experience..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={createExperience}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
