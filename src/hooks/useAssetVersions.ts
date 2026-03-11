import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AssetType = "experience" | "demo" | "flow" | "production_candidate";
export type VersionStatus = "draft" | "validated" | "candidate" | "live" | "archived";
export type VersionEnvironment = "draft" | "sandbox" | "production";

export interface AssetVersion {
  id: string;
  asset_type: AssetType;
  asset_id: string;
  version_number: number;
  version_name: string;
  version_note: string | null;
  snapshot_data: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  status: VersionStatus;
  environment: VersionEnvironment;
  tenant_id: string;
  is_current: boolean;
  parent_version_id: string | null;
}

interface CreateVersionParams {
  assetType: AssetType;
  assetId: string;
  snapshotData: Record<string, unknown>;
  versionName?: string;
  versionNote?: string;
  status?: VersionStatus;
  environment?: VersionEnvironment;
  parentVersionId?: string;
}

export function useAssetVersions(assetType: AssetType, assetId: string | null, tenantId: string) {
  const [versions, setVersions] = useState<AssetVersion[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchVersions = useCallback(async () => {
    if (!assetId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("asset_versions")
      .select("*")
      .eq("asset_type", assetType)
      .eq("asset_id", assetId)
      .order("version_number", { ascending: false });

    if (error) {
      console.error("Error fetching versions:", error);
      toast.error("Error al cargar versiones");
    } else {
      setVersions((data as unknown as AssetVersion[]) || []);
    }
    setLoading(false);
  }, [assetType, assetId]);

  const createVersion = useCallback(async (params: CreateVersionParams) => {
    if (!tenantId) {
      toast.error("No tenant context available");
      return null;
    }

    const { data: nextNum } = await supabase.rpc("next_asset_version_number", {
      _asset_type: params.assetType,
      _asset_id: params.assetId,
    });

    const versionNumber = (nextNum as number) || 1;
    const defaultName = params.versionName || `v${versionNumber}`;

    const { data, error } = await supabase
      .from("asset_versions")
      .insert({
        asset_type: params.assetType,
        asset_id: params.assetId,
        version_number: versionNumber,
        version_name: defaultName,
        version_note: params.versionNote || null,
        snapshot_data: params.snapshotData as any,
        status: params.status || "draft",
        environment: params.environment || "draft",
        tenant_id: tenantId,
        is_current: true,
        parent_version_id: params.parentVersionId || null,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error creating version:", error);
      toast.error("Error al crear versión");
      return null;
    }

    await supabase.rpc("set_current_version", { _version_id: data.id });

    toast.success(`Versión ${defaultName} guardada`);
    await fetchVersions();
    return data as unknown as AssetVersion;
  }, [fetchVersions, tenantId]);

  const restoreVersion = useCallback(async (
    versionId: string,
    onRestore: (snapshotData: Record<string, unknown>) => void
  ) => {
    const version = versions.find((v) => v.id === versionId);
    if (!version) return;

    await createVersion({
      assetType: version.asset_type,
      assetId: version.asset_id,
      snapshotData: version.snapshot_data,
      versionName: `Restored from: ${version.version_name}`,
      versionNote: `Restaurado desde v${version.version_number} (${version.version_name})`,
      status: "draft",
      environment: "draft",
      parentVersionId: version.id,
    });

    onRestore(version.snapshot_data);
    toast.success(`Restaurada versión: ${version.version_name}`);
  }, [versions, createVersion]);

  const duplicateVersion = useCallback(async (
    versionId: string,
    newAssetId: string
  ) => {
    const version = versions.find((v) => v.id === versionId);
    if (!version) return null;

    return await createVersion({
      assetType: version.asset_type,
      assetId: newAssetId,
      snapshotData: version.snapshot_data,
      versionName: `Fork from: ${version.version_name}`,
      versionNote: `Duplicado desde ${version.asset_id} v${version.version_number}`,
      status: "draft",
      environment: "draft",
      parentVersionId: version.id,
    });
  }, [versions, createVersion]);

  const renameVersion = useCallback(async (versionId: string, newName: string) => {
    const { error } = await supabase
      .from("asset_versions")
      .update({ version_name: newName })
      .eq("id", versionId);

    if (error) {
      toast.error("Error al renombrar");
      return;
    }
    toast.success("Versión renombrada");
    await fetchVersions();
  }, [fetchVersions]);

  const updateNote = useCallback(async (versionId: string, note: string) => {
    const { error } = await supabase
      .from("asset_versions")
      .update({ version_note: note })
      .eq("id", versionId);

    if (error) {
      toast.error("Error al actualizar nota");
      return;
    }
    await fetchVersions();
  }, [fetchVersions]);

  const updateStatus = useCallback(async (versionId: string, status: VersionStatus) => {
    const { error } = await supabase
      .from("asset_versions")
      .update({ status })
      .eq("id", versionId);

    if (error) {
      toast.error("Error al actualizar estado");
      return;
    }
    await fetchVersions();
  }, [fetchVersions]);

  return {
    versions,
    loading,
    fetchVersions,
    createVersion,
    restoreVersion,
    duplicateVersion,
    renameVersion,
    updateNote,
    updateStatus,
  };
}
