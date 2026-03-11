ALTER TABLE public.channel_connections
  ADD COLUMN IF NOT EXISTS health_status text NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS health_checked_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS health_error text;