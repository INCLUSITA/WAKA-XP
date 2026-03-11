import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type HealthStatus = "healthy" | "warning" | "error" | "unknown";

export interface HealthInfo {
  status: HealthStatus;
  checkedAt?: string;
  error?: string;
}

export function useConnectionHealth() {
  const [checking, setChecking] = useState<Record<string, boolean>>({});

  const runHealthCheck = async (connectionId: string): Promise<HealthInfo | null> => {
    setChecking((prev) => ({ ...prev, [connectionId]: true }));
    try {
      const { data, error } = await supabase.functions.invoke("connection-health-check", {
        body: { connection_id: connectionId },
      });
      if (error) throw error;
      toast({
        title: data.health_status === "healthy" ? "Connection healthy" : "Health check completed",
        description: data.health_error || undefined,
        variant: data.health_status === "error" ? "destructive" : "default",
      });
      return {
        status: data.health_status as HealthStatus,
        checkedAt: new Date().toISOString(),
        error: data.health_error || undefined,
      };
    } catch (e: any) {
      toast({ title: "Health check failed", description: e.message, variant: "destructive" });
      return null;
    } finally {
      setChecking((prev) => ({ ...prev, [connectionId]: false }));
    }
  };

  return { checking, runHealthCheck };
}
