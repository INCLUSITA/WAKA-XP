import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { UploadedDemo, DemoStatus } from "@/demos/registry";

function rowToDemo(row: any): UploadedDemo {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    icon: row.icon,
    color: row.color,
    tags: row.tags || [],
    jsxSource: row.jsx_source,
    uploadedAt: row.created_at,
    status: row.status as DemoStatus,
    sourceId: row.source_id || undefined,
    sourceName: row.source_name || undefined,
  };
}

// Use type assertion to work with the uploaded_demos table
// which may not yet be in the auto-generated types
const demosTable = () => (supabase as any).from("uploaded_demos");

export function useUploadedDemos() {
  const [demos, setDemos] = useState<UploadedDemo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDemos = useCallback(async () => {
    try {
      const { data, error } = await demosTable()
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("[useUploadedDemos] fetch error:", error);
        setLoading(false);
        return;
      }
      setDemos((data || []).map(rowToDemo));
    } catch (e) {
      console.error("[useUploadedDemos] unexpected error:", e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDemos();
  }, [fetchDemos]);

  const saveDemo = useCallback(async (demo: UploadedDemo) => {
    const { error } = await demosTable().upsert({
      id: demo.id,
      title: demo.title,
      description: demo.description,
      icon: demo.icon,
      color: demo.color,
      tags: demo.tags,
      jsx_source: demo.jsxSource,
      status: demo.status,
      source_id: demo.sourceId || null,
      source_name: demo.sourceName || null,
    });
    if (error) {
      console.error("[useUploadedDemos] save error:", error);
      return false;
    }
    await fetchDemos();
    return true;
  }, [fetchDemos]);

  const deleteDemo = useCallback(async (id: string) => {
    const { error } = await demosTable().delete().eq("id", id);
    if (error) {
      console.error("[useUploadedDemos] delete error:", error);
      return false;
    }
    await fetchDemos();
    return true;
  }, [fetchDemos]);

  const updateStatus = useCallback(async (id: string, status: DemoStatus) => {
    const { error } = await demosTable()
      .update({ status })
      .eq("id", id);
    if (error) {
      console.error("[useUploadedDemos] updateStatus error:", error);
      return false;
    }
    await fetchDemos();
    return true;
  }, [fetchDemos]);

  const getDemo = useCallback(async (id: string): Promise<UploadedDemo | null> => {
    const { data, error } = await demosTable()
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) {
      console.error("[useUploadedDemos] getDemo error:", error);
      return null;
    }
    if (!data) return null;
    return rowToDemo(data);
  }, []);

  return { demos, loading, saveDemo, deleteDemo, updateStatus, getDemo, refresh: fetchDemos };
}
