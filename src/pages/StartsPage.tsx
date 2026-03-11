import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Loader2 } from "lucide-react";

interface FlowStart {
  id: string;
  flow_id: string;
  flow_name: string;
  contacts: number;
  date: string;
}

export default function StartsPage() {
  const navigate = useNavigate();
  const [flows, setFlows] = useState<{ id: string; name: string; created_at: string; nodes: unknown }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlows = async () => {
      const { data } = await supabase
        .from("flows")
        .select("id, name, created_at, nodes")
        .eq("tenant_id", DEMO_TENANT_ID)
        .neq("status", "archived")
        .order("created_at", { ascending: false });
      setFlows(data || []);
      setLoading(false);
    };
    fetchFlows();
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-2xl font-bold text-foreground">Flow Starts</h1>
      </div>
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : flows.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">No flows found</p>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3">Flow</th>
                <th className="px-6 py-3 text-center">Nodes</th>
                <th className="px-6 py-3 text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {flows.map((f) => (
                <tr
                  key={f.id}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => navigate(`/editor?id=${f.id}`)}
                >
                  <td className="px-6 py-3 text-sm font-medium text-primary hover:underline">{f.name}</td>
                  <td className="px-6 py-3 text-sm text-center text-muted-foreground">
                    {(f.nodes as any[])?.length || 0}
                  </td>
                  <td className="px-6 py-3 text-sm text-right text-muted-foreground">
                    {new Date(f.created_at).toLocaleString()}
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