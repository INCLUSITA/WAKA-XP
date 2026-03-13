/**
 * Hook: useSavedPlayerFlows
 * CRUD operations for player_saved_flows table.
 */

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import type { PlayerMessage } from "@/components/player/WakaSovereignPlayer";
import type { DataMode } from "@/components/player/dataMode";

export type FlowStatus = "stable" | "sandbox" | "production";

export interface SavedPlayerFlow {
  id: string;
  name: string;
  description: string;
  status: FlowStatus;
  dataMode: DataMode;
  messageCount: number;
  sourceId: string | null;
  sourceName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SavedPlayerFlowFull extends SavedPlayerFlow {
  conversationSnapshot: PlayerMessage[];
  scenarioConfig: Record<string, any>;
}

export function useSavedPlayerFlows() {
  const { tenantId } = useWorkspace();
  const [flows, setFlows] = useState<SavedPlayerFlow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFlows = useCallback(async () => {
    if (!tenantId) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from("player_saved_flows")
      .select("id, name, description, status, data_mode, message_count, source_id, source_name, created_at, updated_at")
      .eq("tenant_id", tenantId)
      .order("updated_at", { ascending: false });

    if (!error && data) {
      setFlows(data.map((r: any) => ({
        id: r.id,
        name: r.name,
        description: r.description || "",
        status: r.status as FlowStatus,
        dataMode: r.data_mode as DataMode,
        messageCount: r.message_count,
        sourceId: r.source_id,
        sourceName: r.source_name,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })));
    }
    setIsLoading(false);
  }, [tenantId]);

  useEffect(() => { loadFlows(); }, [loadFlows]);

  const saveFlow = useCallback(async (
    name: string,
    description: string,
    messages: PlayerMessage[],
    dataMode: DataMode,
    status: FlowStatus = "sandbox",
    scenarioConfig: Record<string, any> = {},
  ): Promise<string | null> => {
    if (!tenantId) return null;
    const { data: { session } } = await supabase.auth.getSession();

    const { data, error } = await supabase
      .from("player_saved_flows")
      .insert({
        tenant_id: tenantId,
        name,
        description,
        status,
        conversation_snapshot: messages as any,
        scenario_config: scenarioConfig as any,
        data_mode: dataMode,
        message_count: messages.length,
        created_by: session?.user?.id || null,
      })
      .select("id")
      .single();

    if (error) { console.error("Save flow error:", error); return null; }
    await loadFlows();
    return data.id;
  }, [tenantId, loadFlows]);

  const loadFlowFull = useCallback(async (flowId: string): Promise<SavedPlayerFlowFull | null> => {
    const { data, error } = await supabase
      .from("player_saved_flows")
      .select("*")
      .eq("id", flowId)
      .single();

    if (error || !data) return null;
    return {
      id: data.id,
      name: data.name,
      description: data.description || "",
      status: data.status as FlowStatus,
      dataMode: data.data_mode as DataMode,
      messageCount: data.message_count,
      sourceId: data.source_id,
      sourceName: data.source_name,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      conversationSnapshot: (data.conversation_snapshot as any) || [],
      scenarioConfig: (data.scenario_config as any) || {},
    };
  }, []);

  const updateFlowStatus = useCallback(async (flowId: string, status: FlowStatus) => {
    await supabase.from("player_saved_flows").update({ status }).eq("id", flowId);
    await loadFlows();
  }, [loadFlows]);

  const updateFlowName = useCallback(async (flowId: string, name: string) => {
    await supabase.from("player_saved_flows").update({ name }).eq("id", flowId);
    await loadFlows();
  }, [loadFlows]);

  const deleteFlow = useCallback(async (flowId: string) => {
    await supabase.from("player_saved_flows").delete().eq("id", flowId);
    await loadFlows();
  }, [loadFlows]);

  const cloneFlow = useCallback(async (flowId: string, newName: string): Promise<string | null> => {
    const full = await loadFlowFull(flowId);
    if (!full || !tenantId) return null;

    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase
      .from("player_saved_flows")
      .insert({
        tenant_id: tenantId,
        name: newName,
        description: full.description,
        status: "sandbox",
        conversation_snapshot: full.conversationSnapshot as any,
        scenario_config: full.scenarioConfig as any,
        data_mode: full.dataMode,
        message_count: full.messageCount,
        source_id: flowId,
        source_name: full.name,
        created_by: session?.user?.id || null,
      })
      .select("id")
      .single();

    if (error) return null;
    await loadFlows();
    return data.id;
  }, [tenantId, loadFlowFull, loadFlows]);

  return {
    flows,
    isLoading,
    loadFlows,
    saveFlow,
    loadFlowFull,
    updateFlowStatus,
    updateFlowName,
    deleteFlow,
    cloneFlow,
  };
}
