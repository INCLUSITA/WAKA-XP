
-- Table for shareable demo links with tokens
CREATE TABLE public.demo_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL DEFAULT replace(gen_random_uuid()::text, '-', ''),
  title text NOT NULL,
  description text,
  demo_url text NOT NULL,
  demo_type text NOT NULL DEFAULT 'iframe',
  is_active boolean NOT NULL DEFAULT true,
  view_count integer NOT NULL DEFAULT 0,
  max_views integer,
  expires_at timestamptz,
  created_by uuid,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (token)
);

-- RLS: public read (anyone with token can view), authenticated write
ALTER TABLE public.demo_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active shares by token"
  ON public.demo_shares FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert shares"
  ON public.demo_shares FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update own shares"
  ON public.demo_shares FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Authenticated users can delete own shares"
  ON public.demo_shares FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- RPC to increment view count atomically
CREATE OR REPLACE FUNCTION public.increment_demo_share_view(share_token text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.demo_shares
  SET view_count = view_count + 1, updated_at = now()
  WHERE token = share_token AND is_active = true;
$$;
