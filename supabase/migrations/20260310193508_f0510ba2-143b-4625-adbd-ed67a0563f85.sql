CREATE TABLE IF NOT EXISTS public.telegram_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id bigint NOT NULL,
  username text,
  first_name text,
  message_text text,
  direction text NOT NULL DEFAULT 'inbound',
  telegram_message_id bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.telegram_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all select on telegram_messages" ON public.telegram_messages FOR SELECT TO public USING (true);
CREATE POLICY "Allow all insert on telegram_messages" ON public.telegram_messages FOR INSERT TO public WITH CHECK (true);