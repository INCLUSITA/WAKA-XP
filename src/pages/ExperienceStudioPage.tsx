import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_TENANT_ID } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Sparkles, Loader2, Pencil, Copy, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-primary/15 text-primary",
  validated: "bg-chart-4/15 text-chart-4",
  candidate: "bg-accent/15 text-accent",
  live: "bg-primary/20 text-primary",
  archived: "bg-destructive/15 text-destructive",
};

export default function ExperienceStudioPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const navigate = useNavigate();

  const fetchExperiences = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("experiences")
      .select("*")
      .eq("tenant_id", DEMO_TENANT_ID)
      .order("updated_at", { ascending: false });

    if (error) {
      toast.error("Error loading experiences");
      console.error(error);
    } else {
      setExperiences((data as Experience[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const createExperience = async () => {
    if (!newName.trim()) {
      toast.error("Name is required");
      return;
    }
    const { error } = await supabase.from("experiences").insert({
      name: newName.trim(),
      description: newDesc.trim() || null,
      tenant_id: DEMO_TENANT_ID,
    });

    if (error) {
      toast.error("Error creating experience");
      return;
    }
    toast.success("Experience created");
    setShowCreate(false);
    setNewName("");
    setNewDesc("");
    fetchExperiences();
  };

  const duplicateExperience = async (exp: Experience) => {
    const { error } = await supabase.from("experiences").insert({
      name: `${exp.name} (copy)`,
      description: exp.description,
      tenant_id: DEMO_TENANT_ID,
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
        <Button size="sm" className="glow-primary font-medium" onClick={() => setShowCreate(true)}>
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
                  {activeExps.map((exp) => (
                    <Card key={exp.id} className="group glass border-gradient rounded-xl transition-all hover:scale-[1.01]">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-sm line-clamp-1">{exp.name}</CardTitle>
                          <div className="flex gap-1">
                            <Badge variant="secondary" className={`text-[10px] ${statusColors[exp.status] || ""}`}>
                              {exp.status}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {exp.environment}
                            </Badge>
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
                        {exp.tags.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {exp.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-[9px]">{tag}</Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="gap-1 pt-0">
                        <Button variant="ghost" size="sm" title="View">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Edit">
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
                  ))}
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
