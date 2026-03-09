CREATE TABLE public.whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  direction text NOT NULL DEFAULT 'inbound',
  wa_message_id text,
  from_phone text,
  to_phone text,
  message_type text,
  body text,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read for whatsapp_messages" ON public.whatsapp_messages FOR SELECT USING (true);
CREATE POLICY "Allow service insert for whatsapp_messages" ON public.whatsapp_messages FOR INSERT WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_messages;