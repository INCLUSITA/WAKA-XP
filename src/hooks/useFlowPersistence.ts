import { useState, useEffect, useCallback, useRef } from "react";
import { Node, Edge } from "@xyflow/react";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_ORG_ID } from "@/lib/constants";
import { Json } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface UseFlowPersistenceOptions {
  flowId: string | null;
  onFlowIdChange: (id: string) => void;
}

export function useFlowPersistence({ flowId, onFlowIdChange }: UseFlowPersistenceOptions) {
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
    async (nodes: Node[], edges: Edge[], name: string) => {
      setSaveStatus("saving");
      try {
        if (currentFlowId.current) {
          // UPDATE existing flow
          const { error } = await supabase
            .from("flows")
            .update({
              nodes: nodes as unknown as Json,
              edges: edges as unknown as Json,
              name,
            })
            .eq("id", currentFlowId.current);

          if (error) throw error;
        } else {
          // INSERT new flow
          const { data, error } = await supabase
            .from("flows")
            .insert({
              nodes: nodes as unknown as Json,
              edges: edges as unknown as Json,
              name,
              org_id: DEMO_ORG_ID,
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
    [onFlowIdChange]
  );

  const debouncedSave = useCallback(
    (nodes: Node[], edges: Edge[], name: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setSaveStatus("saving");
      debounceRef.current = setTimeout(() => {
        saveFlow(nodes, edges, name);
      }, 2000);
    },
    [saveFlow]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return { loadFlow, saveFlow, debouncedSave, saveStatus, isLoading };
}
