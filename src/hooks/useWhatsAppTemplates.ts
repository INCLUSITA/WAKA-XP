import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WhatsAppTemplate {
  id: string;
  name: string;
  language: string;
  category: string;
  body_text: string;
  parameter_count: number;
  status: string;
}

export function useWhatsAppTemplates(tenantId?: string) {
  return useQuery({
    queryKey: ["whatsapp-templates", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_templates" as any)
        .select("*")
        .eq("tenant_id", tenantId!)
        .order("name");
      if (error) throw error;
      return (data || []) as unknown as WhatsAppTemplate[];
    },
  });
}
