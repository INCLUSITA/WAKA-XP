import { useState, useEffect, useCallback, useRef } from "react";
import { Node, Edge } from "@xyflow/react";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { TriggerRule } from "@/lib/triggerRules";
import { toast } from "sonner";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface UseFlowPersistenceOptions {
  flowId: string | null;
  onFlowIdChange: (id: string) => void;
  tenantId: string;
}

export function useFlowPersistence({ flowId, onFlowIdChange, tenantId }: UseFlowPersistenceOptions) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentFlowId = useRef<string | null>(flowId);

  currentFlowId.current = flowId;

  const loadFlow = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("flows")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      return {
        nodes: (data.nodes as unknown as Node[]) || [],
        edges: (data.edges as unknown as Edge[]) || [],
        name: data.name,
        status: data.status,
        triggerRules: ((data as any).trigger_rules as TriggerRule[]) || [],
      };
    } catch (err) {
      console.error("Error loading flow:", err);
      toast.error("Error al cargar el flujo");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveFlow = useCallback(
    async (nodes: Node[], edges: Edge[], name: string, triggerRules?: TriggerRule[]) => {
      if (!tenantId) {
        setSaveStatus("error");
        toast.error("No tenant context available");
        return;
      }
      setSaveStatus("saving");
      try {
        if (currentFlowId.current) {
          const updatePayload: Record<string, unknown> = {
            nodes: nodes as unknown as Json,
            edges: edges as unknown as Json,
            name,
          };
          if (triggerRules) updatePayload.trigger_rules = triggerRules as unknown as Json;
          const { error } = await supabase
            .from("flows")
            .update(updatePayload)
            .eq("id", currentFlowId.current);

          if (error) throw error;
        } else {
          const { data, error } = await supabase
            .from("flows")
            .insert({
              nodes: nodes as unknown as Json,
              edges: edges as unknown as Json,
              name,
              tenant_id: tenantId,
              trigger_rules: (triggerRules || []) as unknown as Json,
            })
            .select("id")
            .single();

          if (error) throw error;
          currentFlowId.current = data.id;
          onFlowIdChange(data.id);
        }
        setSaveStatus("saved");
      } catch (err) {
        console.error("Error saving flow:", err);
        setSaveStatus("error");
      }
    },
    [onFlowIdChange, tenantId]
  );

  const debouncedSave = useCallback(
    (nodes: Node[], edges: Edge[], name: string, triggerRules?: TriggerRule[]) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setSaveStatus("saving");
      debounceRef.current = setTimeout(() => {
        saveFlow(nodes, edges, name, triggerRules);
      }, 2000);
    },
    [saveFlow]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return { loadFlow, saveFlow, debouncedSave, saveStatus, isLoading };
}
