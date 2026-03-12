
-- Lightweight view log for shared demos
CREATE TABLE public.demo_share_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_id text NOT NULL,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  user_agent text,
  referrer text
);

ALTER TABLE public.demo_share_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a view (public page, no auth)
CREATE POLICY "Anyone can log a view"
  ON public.demo_share_views FOR INSERT
  TO public
  WITH CHECK (true);

-- Authenticated users can read view stats
CREATE POLICY "Authenticated can read views"
  ON public.demo_share_views FOR SELECT
  TO authenticated
  USING (true);
