
-- Insert WAKA DEMO tenant
INSERT INTO public.tenants (name, slug, display_name, country_code, channels, primary_color, timezone, logo_url)
VALUES (
  'WAKA Demo',
  'waka-demo',
  'WAKA Demo · Moov Africa',
  'BF',
  ARRAY['whatsapp', 'waka_sovereign', 'voice'],
  '#FF6B00',
  'Africa/Ouagadougou',
  NULL
)
ON CONFLICT (slug) DO NOTHING;

-- Create default workspace for WAKA DEMO tenant
INSERT INTO public.workspaces (tenant_id, name, slug, is_default)
SELECT id, 'Studio Principal', 'default', true
FROM public.tenants WHERE slug = 'waka-demo'
ON CONFLICT DO NOTHING;
