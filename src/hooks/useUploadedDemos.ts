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

export function useUploadedDemos() {
  const [demos, setDemos] = useState<UploadedDemo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDemos = useCallback(async () => {
    const { data, error } = await supabase
      .from("uploaded_demos")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setDemos(data.map(rowToDemo));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDemos();
  }, [fetchDemos]);

  const saveDemo = useCallback(async (demo: UploadedDemo) => {
    const { error } = await supabase.from("uploaded_demos").upsert({
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
    if (!error) await fetchDemos();
    return !error;
  }, [fetchDemos]);

  const deleteDemo = useCallback(async (id: string) => {
    const { error } = await supabase.from("uploaded_demos").delete().eq("id", id);
    if (!error) await fetchDemos();
    return !error;
  }, [fetchDemos]);

  const updateStatus = useCallback(async (id: string, status: DemoStatus) => {
    const { error } = await supabase
      .from("uploaded_demos")
      .update({ status })
      .eq("id", id);
    if (!error) await fetchDemos();
    return !error;
  }, [fetchDemos]);

  const getDemo = useCallback(async (id: string): Promise<UploadedDemo | null> => {
    const { data, error } = await supabase
      .from("uploaded_demos")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return rowToDemo(data);
  }, []);

  return { demos, loading, saveDemo, deleteDemo, updateStatus, getDemo, refresh: fetchDemos };
}
