import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  Loader2, Search, ArrowUpDown, ArrowUp, ArrowDown,
  ChevronRight, Layers,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { WorkspaceContextBar } from "@/components/WorkspaceContextBar";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type SortKey = "name" | "nodes" | "updated_at" | "status";
type SortDir = "asc" | "desc";

interface FlowRow {
  id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
  nodes: unknown;
  description: string | null;
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-primary/15 text-primary",
  archived: "bg-destructive/15 text-destructive",
};

export default function StartsPage() {
  const navigate = useNavigate();
  const { tenantId } = useWorkspace();
  const [flows, setFlows] = useState<FlowRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("updated_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    const fetchFlows = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("flows")
        .select("id, name, status, created_at, updated_at, nodes, description")
        .eq("tenant_id", tenantId)
        .neq("status", "archived")
        .order("updated_at", { ascending: false });
      setFlows((data as FlowRow[]) || []);
      setLoading(false);
    };
    fetchFlows();
  }, [tenantId]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  };

  const filtered = useMemo(() => {
    let list = flows;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.description?.toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "nodes":
          cmp =
            ((a.nodes as any[])?.length || 0) -
            ((b.nodes as any[])?.length || 0);
          break;
        case "updated_at":
          cmp =
            new Date(a.updated_at).getTime() -
            new Date(b.updated_at).getTime();
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [flows, search, sortKey, sortDir]);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col)
      return <ArrowUpDown className="h-3 w-3 text-muted-foreground/40" />;
    return sortDir === "asc" ? (
      <ArrowUp className="h-3 w-3 text-primary" />
    ) : (
      <ArrowDown className="h-3 w-3 text-primary" />
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border px-4 py-3 flex items-center gap-3">
        <SidebarTrigger />
        <h1 className="text-lg font-bold text-foreground">Flow Starts</h1>
        <div className="ml-auto flex items-center gap-3">
          <WorkspaceContextBar compact />
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-border px-6 py-3 flex items-center gap-3">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar flujos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} {filtered.length === 1 ? "flujo" : "flujos"}
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Layers className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-foreground">
              {search ? "Sin resultados" : "No hay flujos"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {search
                ? "Intenta con otro término de búsqueda"
                : "Crea tu primer flujo desde el Flow Dashboard"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 gap-1.5 text-xs font-semibold uppercase tracking-wider hover:bg-transparent hover:text-foreground"
                    onClick={() => toggleSort("name")}
                  >
                    Nombre <SortIcon col="name" />
                  </Button>
                </th>
                <th className="px-6 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 gap-1.5 text-xs font-semibold uppercase tracking-wider hover:bg-transparent hover:text-foreground"
                    onClick={() => toggleSort("status")}
                  >
                    Estado <SortIcon col="status" />
                  </Button>
                </th>
                <th className="px-6 py-3 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 gap-1.5 text-xs font-semibold uppercase tracking-wider hover:bg-transparent hover:text-foreground"
                    onClick={() => toggleSort("nodes")}
                  >
                    Nodos <SortIcon col="nodes" />
                  </Button>
                </th>
                <th className="px-6 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 gap-1.5 text-xs font-semibold uppercase tracking-wider hover:bg-transparent hover:text-foreground ml-auto"
                    onClick={() => toggleSort("updated_at")}
                  >
                    Actualizado <SortIcon col="updated_at" />
                  </Button>
                </th>
                <th className="px-6 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((f) => (
                <tr
                  key={f.id}
                  className="hover:bg-muted/50 cursor-pointer group transition-colors"
                  onClick={() => navigate(`/editor?id=${f.id}`)}
                >
                  <td className="px-6 py-3">
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {f.name}
                    </span>
                    {f.description && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                        {f.description}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${statusColors[f.status] || ""}`}
                    >
                      {f.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-3 text-sm text-center text-muted-foreground">
                    {(f.nodes as any[])?.length || 0}
                  </td>
                  <td className="px-6 py-3 text-sm text-right text-muted-foreground">
                    {format(new Date(f.updated_at), "dd MMM yyyy, HH:mm", {
                      locale: es,
                    })}
                  </td>
                  <td className="px-6 py-3">
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
