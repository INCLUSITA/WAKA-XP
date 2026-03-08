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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { VersionHistoryPanel } from "@/components/versioning/VersionHistoryPanel";
import {
  Plus, Rocket, Loader2, Eye, Copy, Trash2, Archive, ArrowLeft,
  Hammer, Sparkles, History, MoreVertical, Search, ChevronRight,
  Link2, ExternalLink, CheckCircle2, ArrowUpRight, Undo2,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface ProductionCandidate {
  id: string;
  name: string;
  description: string | null;
  status: string;
  environment: string;
  experience_id: string | null;
  flow_id: string | null;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  experience_name?: string;
  flow_name?: string;
}

const statusColors: Record<string, string> = {
  candidate: "bg-amber-500/15 text-amber-600",
  validated: "bg-chart-4/15 text-chart-4",
  live: "bg-primary/15 text-primary",
  archived: "bg-muted text-muted-foreground",
};

const envColors: Record<string, string> = {
  draft: "border-muted-foreground/30 text-muted-foreground",
  sandbox: "border-amber-500/30 text-amber-600",
  production: "border-primary/30 text-primary",
};

// Status transition config
const statusTransitions: Record<string, { next?: { status: string; label: string; icon: typeof CheckCircle2 }; prev?: { status: string; label: string } }> = {
  candidate: {
    next: { status: "validated", label: "Mark as Validated", icon: CheckCircle2 },
  },
  validated: {
    next: { status: "live", label: "Promote to Live", icon: ArrowUpRight },
    prev: { status: "candidate", label: "Back to Candidate" },
  },
  live: {
    next: { status: "archived", label: "Archive", icon: Archive },
    prev: { status: "validated", label: "Back to Validated" },
  },
  archived: {
    prev: { status: "candidate", label: "Reactivate as Candidate" },
  },
};

// ── Status Transition Buttons ──
function StatusTransitionActions({
  candidate,
  onTransition,
  compact = false,
}: {
  candidate: ProductionCandidate;
  onTransition: (id: string, newStatus: string) => void;
  compact?: boolean;
}) {
  const transitions = statusTransitions[candidate.status];
  if (!transitions) return null;

  return (
    <div className={`flex items-center ${compact ? "gap-1" : "gap-2"}`}>
      {transitions.prev && (
        <Button
          variant="ghost"
          size="sm"
          className={`${compact ? "h-6 text-[10px] px-2" : "text-xs"} text-muted-foreground`}
          onClick={(e) => { e.stopPropagation(); onTransition(candidate.id, transitions.prev!.status); }}
        >
          <Undo2 className="h-3 w-3 mr-1" />
          {transitions.prev.label}
        </Button>
      )}
      {transitions.next && (
        <Button
          variant={compact ? "outline" : "default"}
          size="sm"
          className={`${compact ? "h-6 text-[10px] px-2 border-amber-500/30 text-amber-600" : "text-xs"}`}
          onClick={(e) => { e.stopPropagation(); onTransition(candidate.id, transitions.next!.status); }}
        >
          <transitions.next.icon className="h-3 w-3 mr-1" />
          {transitions.next.label}
        </Button>
      )}
    </div>
  );
}

// ── Candidate Detail ──

function CandidateDetail({
  candidate,
  onBack,
  onRefresh,
}: {
  candidate: ProductionCandidate;
  onBack: () => void;
  onRefresh: () => void;
}) {
  const navigate = useNavigate();
  const [showVersions, setShowVersions] = useState(false);

  const handleTransition = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("production_candidates").update({ status: newStatus }).eq("id", id);
    if (error) { toast.error("Error updating status"); return; }
    toast.success(`Status changed to ${newStatus}`);
    onRefresh();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 border-b border-border/50 bg-card/40 backdrop-blur-md px-5 py-3.5">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Button>
        <div className="flex-1">
          <h2 className="text-base font-bold text-foreground">{candidate.name}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="secondary" className={`text-[10px] ${statusColors[candidate.status] || ""}`}>
              {candidate.status}
            </Badge>
            <Badge variant="outline" className={`text-[10px] ${envColors[candidate.environment] || ""}`}>
              {candidate.environment}
            </Badge>
            <span className="text-[10px] text-muted-foreground">
              Updated {format(new Date(candidate.updated_at), "dd MMM yyyy, HH:mm")}
            </span>
          </div>
        </div>
        <StatusTransitionActions candidate={candidate} onTransition={handleTransition} />
        <Button variant="outline" size="sm" onClick={() => setShowVersions((v) => !v)} className="border-amber-500/40 text-amber-600 hover:bg-amber-500/10">
          <History className="mr-1 h-3.5 w-3.5" /> Versions
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          <Tabs defaultValue="overview">
            <TabsList className="bg-secondary/50 border border-border/50 mb-6">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="flow" className="text-xs">Flow</TabsTrigger>
              <TabsTrigger value="experience" className="text-xs">Experience</TabsTrigger>
              <TabsTrigger value="versions" className="text-xs">Versions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              {/* Status transitions card */}
              <Card className="glass border-gradient rounded-xl mb-6">
                <CardContent className="p-4">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Status Pipeline</p>
                  <div className="flex items-center gap-2">
                    {["candidate", "validated", "live", "archived"].map((s, i) => (
                      <div key={s} className="flex items-center gap-2">
                        <div className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                          candidate.status === s
                            ? `${statusColors[s]} ring-1 ring-offset-1 ring-offset-background`
                            : "bg-muted/50 text-muted-foreground/40"
                        }`}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </div>
                        {i < 3 && <ChevronRight className="h-3 w-3 text-muted-foreground/30" />}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <StatusTransitionActions candidate={candidate} onTransition={handleTransition} />
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                <Card className="glass border-gradient rounded-xl">
                  <CardContent className="p-4">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Status</p>
                    <Badge variant="secondary" className={`${statusColors[candidate.status] || ""}`}>
                      {candidate.status}
                    </Badge>
                  </CardContent>
                </Card>
                <Card className="glass border-gradient rounded-xl">
                  <CardContent className="p-4">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Environment</p>
                    <Badge variant="outline" className={`${envColors[candidate.environment] || ""}`}>
                      {candidate.environment}
                    </Badge>
                  </CardContent>
                </Card>
                <Card className="glass border-gradient rounded-xl">
                  <CardContent className="p-4">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Updated</p>
                    <p className="text-sm font-medium text-foreground">{format(new Date(candidate.updated_at), "dd MMM yyyy, HH:mm")}</p>
                  </CardContent>
                </Card>
              </div>

              {candidate.description && (
                <Card className="glass border-gradient rounded-xl mb-4">
                  <CardContent className="p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</p>
                    <p className="text-sm text-foreground">{candidate.description}</p>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="glass border-gradient rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-accent" />
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Linked Experience</p>
                    </div>
                    {candidate.experience_name ? (
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">{candidate.experience_name}</p>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/studio?id=${candidate.experience_id}`)}>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground/60">No experience linked</p>
                    )}
                  </CardContent>
                </Card>
                <Card className="glass border-gradient rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Hammer className="h-4 w-4 text-primary" />
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Linked Flow</p>
                    </div>
                    {candidate.flow_name ? (
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">{candidate.flow_name}</p>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/editor?id=${candidate.flow_id}`)}>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground/60">No flow linked</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="flow">
              {candidate.flow_name ? (
                <Card className="glass border-gradient rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-lg bg-primary/10 p-2"><Hammer className="h-5 w-5 text-primary" /></div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{candidate.flow_name}</p>
                      <p className="text-[10px] text-muted-foreground">Linked flow for this production candidate</p>
                    </div>
                  </div>
                  <Button onClick={() => navigate(`/editor?id=${candidate.flow_id}`)} className="glow-primary">
                    <Hammer className="mr-2 h-4 w-4" /> Open in Builder
                  </Button>
                </Card>
              ) : (
                <Card className="glass border-gradient rounded-xl p-8 text-center">
                  <Hammer className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
                  <p className="text-sm text-muted-foreground/60">No flow linked to this candidate yet.</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="experience">
              {candidate.experience_name ? (
                <Card className="glass border-gradient rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-lg bg-accent/10 p-2"><Sparkles className="h-5 w-5 text-accent" /></div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{candidate.experience_name}</p>
                      <p className="text-[10px] text-muted-foreground">Linked experience for this production candidate</p>
                    </div>
                  </div>
                  <Button onClick={() => navigate(`/studio?id=${candidate.experience_id}`)} variant="outline" className="border-accent/30 text-accent hover:bg-accent/5">
                    <Sparkles className="mr-2 h-4 w-4" /> Open in Experience Studio
                  </Button>
                </Card>
              ) : (
                <Card className="glass border-gradient rounded-xl p-8 text-center">
                  <Sparkles className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
                  <p className="text-sm text-muted-foreground/60">No experience linked to this candidate yet.</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="versions">
              <Card className="glass border-gradient rounded-xl overflow-hidden">
                <div className="h-[500px]">
                  <VersionHistoryPanel
                    assetType="production_candidate"
                    assetId={candidate.id}
                    getSnapshotData={() => ({
                      name: candidate.name,
                      description: candidate.description,
                      status: candidate.status,
                      environment: candidate.environment,
                      experience_id: candidate.experience_id,
                      flow_id: candidate.flow_id,
                    })}
                    onRestore={() => {
                      toast.success("Version restored");
                      onRefresh();
                    }}
                  />
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {showVersions && (
          <div className="w-80 border-l border-border bg-card shadow-xl">
            <VersionHistoryPanel
              assetType="production_candidate"
              assetId={candidate.id}
              getSnapshotData={() => ({
                name: candidate.name,
                description: candidate.description,
                status: candidate.status,
                environment: candidate.environment,
                experience_id: candidate.experience_id,
                flow_id: candidate.flow_id,
              })}
              onRestore={() => {
                toast.success("Version restored");
                onRefresh();
              }}
              onClose={() => setShowVersions(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Production Page ──

export default function ProductionPage() {
  const { tenantId } = useWorkspace();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get("id");
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState<ProductionCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("production_candidates")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("updated_at", { ascending: false });

    if (error) {
      toast.error("Error loading production candidates");
      console.error(error);
      setLoading(false);
      return;
    }

    const items = (data || []) as ProductionCandidate[];

    const expIds = [...new Set(items.filter(c => c.experience_id).map(c => c.experience_id!))];
    const flowIds = [...new Set(items.filter(c => c.flow_id).map(c => c.flow_id!))];

    const [expRes, flowRes] = await Promise.all([
      expIds.length > 0 ? supabase.from("experiences").select("id, name").in("id", expIds) : { data: [] },
      flowIds.length > 0 ? supabase.from("flows").select("id, name").in("id", flowIds) : { data: [] },
    ]);

    const expMap = Object.fromEntries((expRes.data || []).map(e => [e.id, e.name]));
    const flowMap = Object.fromEntries((flowRes.data || []).map(f => [f.id, f.name]));

    items.forEach(c => {
      c.experience_name = c.experience_id ? expMap[c.experience_id] : undefined;
      c.flow_name = c.flow_id ? flowMap[c.flow_id] : undefined;
    });

    setCandidates(items);
    setLoading(false);
  }, [tenantId]);

  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);

  const selectedCandidate = candidates.find(c => c.id === selectedId);

  if (selectedId && selectedCandidate) {
    return (
      <CandidateDetail
        candidate={selectedCandidate}
        onBack={() => setSearchParams({})}
        onRefresh={fetchCandidates}
      />
    );
  }

  const createCandidate = async () => {
    if (!newName.trim()) { toast.error("Name is required"); return; }
    const { data, error } = await supabase.from("production_candidates").insert({
      name: newName.trim(),
      description: newDesc.trim() || null,
      tenant_id: tenantId,
    }).select("id").single();
    if (error) { toast.error("Error creating candidate"); return; }
    toast.success("Production Candidate created");
    setShowCreate(false);
    setNewName("");
    setNewDesc("");
    fetchCandidates();
    if (data) setSearchParams({ id: data.id });
  };

  const duplicateCandidate = async (c: ProductionCandidate) => {
    const { error } = await supabase.from("production_candidates").insert({
      name: `${c.name} (copy)`,
      description: c.description,
      tenant_id: tenantId,
      experience_id: c.experience_id,
      flow_id: c.flow_id,
      status: "candidate",
      environment: c.environment,
    });
    if (error) { toast.error("Error duplicating"); return; }
    toast.success("Candidate duplicated");
    fetchCandidates();
  };

  const transitionStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("production_candidates").update({ status: newStatus }).eq("id", id);
    if (error) { toast.error("Error updating status"); return; }
    toast.success(`Status changed to ${newStatus}`);
    fetchCandidates();
  };

  const archiveCandidate = async (id: string) => {
    await transitionStatus(id, "archived");
  };

  const deleteCandidate = async (id: string) => {
    const { error } = await supabase.from("production_candidates").delete().eq("id", id);
    if (error) { toast.error("Error deleting"); return; }
    toast.success("Candidate deleted");
    fetchCandidates();
  };

  const filtered = candidates.filter(c => {
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const activeCandidates = filtered.filter(c => c.status !== "archived");
  const archivedCandidates = filtered.filter(c => c.status === "archived");

  // Summary stats
  const needsAttention = candidates.filter(c => c.status === "candidate").length;

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-3 border-b border-border/50 bg-card/40 backdrop-blur-md px-5 py-3.5">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground tracking-wide">Production</h1>
          <p className="text-[11px] text-muted-foreground">Manage production candidates, validation and readiness</p>
        </div>
        {needsAttention > 0 && (
          <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 text-[10px]">
            {needsAttention} awaiting validation
          </Badge>
        )}
        <WorkspaceContextBar compact />
        <Button size="sm" className="glow-primary font-medium ml-2" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1 h-3.5 w-3.5" /> New Candidate
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search candidates..."
              className="pl-8 h-8 text-xs"
            />
          </div>
          <div className="flex gap-1">
            {["all", "candidate", "validated", "live", "archived"].map(s => (
              <Button
                key={s}
                variant={filterStatus === s ? "default" : "outline"}
                size="sm"
                className="text-[10px] h-7 px-2.5"
                onClick={() => setFilterStatus(s)}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="bg-secondary/50 border border-border/50 mb-6">
              <TabsTrigger value="active" className="text-xs">Active ({activeCandidates.length})</TabsTrigger>
              <TabsTrigger value="archived" className="text-xs">Archived ({archivedCandidates.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {activeCandidates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Rocket className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-lg font-semibold text-foreground">No production candidates yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Create a candidate from here, or promote from Experience Studio or Builder</p>
                  <Button className="mt-4" onClick={() => setShowCreate(true)}>
                    <Plus className="mr-1 h-4 w-4" /> New Candidate
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {activeCandidates.map((c) => (
                    <Card
                      key={c.id}
                      className="group glass border-gradient rounded-xl transition-all hover:scale-[1.01] cursor-pointer"
                      onClick={() => setSearchParams({ id: c.id })}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-sm line-clamp-1">{c.name}</CardTitle>
                          <div className="flex gap-1">
                            <Badge variant="secondary" className={`text-[10px] ${statusColors[c.status] || ""}`}>{c.status}</Badge>
                            <Badge variant="outline" className={`text-[10px] ${envColors[c.environment] || ""}`}>{c.environment}</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        {c.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{c.description}</p>}
                        <div className="space-y-1">
                          {c.experience_name && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                              <Sparkles className="h-3 w-3 text-accent" />
                              <span className="truncate">{c.experience_name}</span>
                            </div>
                          )}
                          {c.flow_name && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                              <Hammer className="h-3 w-3 text-primary" />
                              <span className="truncate">{c.flow_name}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground/40 mt-2">
                          Updated {format(new Date(c.updated_at), "dd MMM yyyy, HH:mm")}
                        </p>
                      </CardContent>
                      <CardFooter className="gap-1 pt-0" onClick={(e) => e.stopPropagation()}>
                        <StatusTransitionActions candidate={c} onTransition={transitionStatus} compact />
                        <div className="ml-auto flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => duplicateCandidate(c)} title="Duplicate">
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm"><MoreVertical className="h-3.5 w-3.5" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSearchParams({ id: c.id })}>
                                <Eye className="mr-2 h-3.5 w-3.5" /> Open Detail
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => archiveCandidate(c.id)}>
                                <Archive className="mr-2 h-3.5 w-3.5" /> Archive
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => deleteCandidate(c.id)} className="text-destructive">
                                <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="archived">
              {archivedCandidates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">No archived candidates</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {archivedCandidates.map((c) => (
                    <Card key={c.id} className="opacity-60 glass border-gradient rounded-xl cursor-pointer" onClick={() => setSearchParams({ id: c.id })}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-sm">{c.name}</CardTitle>
                          <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground">archived</Badge>
                        </div>
                      </CardHeader>
                      <CardFooter className="pt-0" onClick={e => e.stopPropagation()}>
                        <StatusTransitionActions candidate={c} onTransition={transitionStatus} compact />
                      </CardFooter>
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
            <DialogTitle>New Production Candidate</DialogTitle>
            <DialogDescription>Create a new candidate for production readiness</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-foreground">Name</label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Onboarding KYC v2 — Production"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">Description (optional)</label>
              <Textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Notes about this production candidate..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={createCandidate}>Create Candidate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
