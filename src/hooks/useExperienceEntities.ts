import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export interface ExperienceEntity {
  id: string;
  experience_id: string | null;
  tenant_id: string;
  name: string;
  entity_type: string;
  description: string | null;
  data_schema: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export function useExperienceEntities(experienceId?: string) {
  const { tenantId } = useWorkspace();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["experience-entities", tenantId, experienceId],
    enabled: !!tenantId,
    queryFn: async () => {
      let q = supabase
        .from("experience_entities")
        .select("*")
        .eq("tenant_id", tenantId!)
        .order("created_at", { ascending: true });

      if (experienceId) {
        q = q.eq("experience_id", experienceId);
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as ExperienceEntity[];
    },
  });

  const createEntity = useMutation({
    mutationFn: async (entity: {
      name: string;
      entity_type: string;
      description?: string;
      experience_id?: string;
      data_schema?: Record<string, unknown>;
    }) => {
      const row: Record<string, unknown> = {
        name: entity.name,
        entity_type: entity.entity_type,
        tenant_id: tenantId!,
      };
      if (entity.description) row.description = entity.description;
      if (entity.experience_id) row.experience_id = entity.experience_id;
      if (entity.data_schema) row.data_schema = entity.data_schema;

      const { data, error } = await supabase
        .from("experience_entities")
        .insert(row as any)
        .select()
        .single();
      if (error) throw error;
      return data as ExperienceEntity;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["experience-entities"] }),
  });

  const updateEntity = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ExperienceEntity> & { id: string }) => {
      const { data, error } = await supabase
        .from("experience_entities")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as ExperienceEntity;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["experience-entities"] }),
  });

  const deleteEntity = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("experience_entities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["experience-entities"] }),
  });

  return { ...query, entities: query.data ?? [], createEntity, updateEntity, deleteEntity };
}
