
-- 1. Create enums for the versioning system
CREATE TYPE public.asset_type AS ENUM (
  'experience',
  'demo',
  'flow',
  'production_candidate'
);

CREATE TYPE public.version_status AS ENUM (
  'draft',
  'validated',
  'candidate',
  'live',
  'archived'
);

CREATE TYPE public.version_environment AS ENUM (
  'draft',
  'sandbox',
  'production'
);

-- 2. Create the universal asset_versions table
CREATE TABLE public.asset_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type public.asset_type NOT NULL,
  asset_id uuid NOT NULL,
  version_number integer NOT NULL,
  version_name text NOT NULL DEFAULT '',
  version_note text,
  snapshot_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  status public.version_status NOT NULL DEFAULT 'draft',
  environment public.version_environment NOT NULL DEFAULT 'draft',
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  is_current boolean NOT NULL DEFAULT false,
  parent_version_id uuid REFERENCES public.asset_versions(id) ON DELETE SET NULL,
  UNIQUE (asset_type, asset_id, version_number)
);

-- 3. Indexes for performance
CREATE INDEX idx_asset_versions_asset ON public.asset_versions (asset_type, asset_id);
CREATE INDEX idx_asset_versions_tenant ON public.asset_versions (tenant_id);
CREATE INDEX idx_asset_versions_current ON public.asset_versions (asset_type, asset_id, is_current) WHERE is_current = true;

-- 4. Enable RLS
ALTER TABLE public.asset_versions ENABLE ROW LEVEL SECURITY;

-- Open policies for pre-auth phase (matching flows table pattern)
CREATE POLICY "Allow all select on asset_versions"
  ON public.asset_versions FOR SELECT
  USING (true);

CREATE POLICY "Allow all insert on asset_versions"
  ON public.asset_versions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all update on asset_versions"
  ON public.asset_versions FOR UPDATE
  USING (true);

CREATE POLICY "Allow all delete on asset_versions"
  ON public.asset_versions FOR DELETE
  USING (true);

-- 5. Function to get next version number for an asset
CREATE OR REPLACE FUNCTION public.next_asset_version_number(
  _asset_type public.asset_type,
  _asset_id uuid
)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(MAX(version_number), 0) + 1
  FROM public.asset_versions
  WHERE asset_type = _asset_type AND asset_id = _asset_id
$$;

-- 6. Function to mark a version as current (and unmark others)
CREATE OR REPLACE FUNCTION public.set_current_version(
  _version_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _asset_type public.asset_type;
  _asset_id uuid;
BEGIN
  SELECT asset_type, asset_id INTO _asset_type, _asset_id
  FROM public.asset_versions WHERE id = _version_id;

  UPDATE public.asset_versions
  SET is_current = false
  WHERE asset_type = _asset_type AND asset_id = _asset_id AND is_current = true;

  UPDATE public.asset_versions
  SET is_current = true
  WHERE id = _version_id;
END;
$$;
