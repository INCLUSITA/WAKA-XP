
-- Player conversations table
CREATE TABLE public.player_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  contact_urn text NOT NULL DEFAULT 'anonymous',
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  channel text NOT NULL DEFAULT 'waka_sovereign',
  data_mode text NOT NULL DEFAULT 'libre',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz NOT NULL DEFAULT now(),
  message_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Player messages table
CREATE TABLE public.player_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.player_conversations(id) ON DELETE CASCADE NOT NULL,
  direction text NOT NULL DEFAULT 'inbound',
  content text NOT NULL DEFAULT '',
  image_url text,
  blocks jsonb NOT NULL DEFAULT '{}'::jsonb,
  source text,
  ai_model text,
  ai_latency_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_player_conversations_session ON public.player_conversations(session_id);
CREATE INDEX idx_player_conversations_contact ON public.player_conversations(contact_urn);
CREATE INDEX idx_player_conversations_tenant ON public.player_conversations(tenant_id);
CREATE INDEX idx_player_messages_conversation ON public.player_messages(conversation_id);
CREATE INDEX idx_player_messages_created ON public.player_messages(created_at);

-- RLS
ALTER TABLE public.player_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_messages ENABLE ROW LEVEL SECURITY;

-- Public insert (player can be used without auth)
CREATE POLICY "Anyone can insert conversations" ON public.player_conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update conversations" ON public.player_conversations FOR UPDATE USING (true);
CREATE POLICY "Anyone can read conversations" ON public.player_conversations FOR SELECT USING (true);

CREATE POLICY "Anyone can insert messages" ON public.player_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read messages" ON public.player_messages FOR SELECT USING (true);

-- Realtime for analytics
ALTER PUBLICATION supabase_realtime ADD TABLE public.player_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.player_messages;
