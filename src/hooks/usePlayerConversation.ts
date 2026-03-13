/**
 * Hook: usePlayerConversation
 * Persists sovereign player conversations and messages to the database.
 * Provides session continuity and conversation history loading.
 */

import { useCallback, useRef, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { PlayerMessage } from "@/components/player/WakaSovereignPlayer";
import type { DataMode } from "@/components/player/dataMode";

const SESSION_KEY = "waka_player_session_id";

function getOrCreateSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `ses_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

interface ConversationState {
  conversationId: string | null;
  isLoading: boolean;
  messageCount: number;
}

export function usePlayerConversation(tenantId?: string) {
  const sessionId = useRef(getOrCreateSessionId());
  const [state, setState] = useState<ConversationState>({
    conversationId: null,
    isLoading: true,
    messageCount: 0,
  });
  const conversationIdRef = useRef<string | null>(null);

  // Resume or create conversation on mount
  useEffect(() => {
    resumeOrCreate();
  }, []);

  async function resumeOrCreate() {
    try {
      // Try to find existing conversation for this session
      const { data: existing } = await supabase
        .from("player_conversations")
        .select("id, message_count")
        .eq("session_id", sessionId.current)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        conversationIdRef.current = existing.id;
        setState({ conversationId: existing.id, isLoading: false, messageCount: existing.message_count });
        return;
      }

      // Create new conversation
      const { data: created, error } = await supabase
        .from("player_conversations")
        .insert({
          session_id: sessionId.current,
          tenant_id: tenantId || null,
          channel: "waka_sovereign",
        })
        .select("id")
        .single();

      if (error) {
        console.error("Failed to create conversation:", error);
        setState(s => ({ ...s, isLoading: false }));
        return;
      }

      conversationIdRef.current = created.id;
      setState({ conversationId: created.id, isLoading: false, messageCount: 0 });
    } catch (e) {
      console.error("Conversation init error:", e);
      setState(s => ({ ...s, isLoading: false }));
    }
  }

  // Load previous messages for this conversation
  const loadHistory = useCallback(async (): Promise<PlayerMessage[]> => {
    const convId = conversationIdRef.current;
    if (!convId) return [];

    const { data, error } = await supabase
      .from("player_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    if (error || !data) return [];

    return data.map((row: any) => {
      const blocks = (typeof row.blocks === "object" && row.blocks) || {};
      const msg: PlayerMessage = {
        id: row.id,
        text: row.content || "",
        direction: row.direction as "inbound" | "outbound",
        timestamp: new Date(row.created_at),
        source: row.source || undefined,
        imageUrl: row.image_url || undefined,
      };

      // Restore sovereign blocks from stored JSON
      if (blocks.menu) { msg.menu = blocks.menu; msg.menuTitle = blocks.menuTitle; }
      if (blocks.catalog) msg.catalog = blocks.catalog;
      if (blocks.inlineForm) msg.inlineForm = blocks.inlineForm;
      if (blocks.location) msg.location = blocks.location;
      if (blocks.payment) msg.payment = blocks.payment;
      if (blocks.rating) msg.rating = blocks.rating;
      if (blocks.training) msg.training = blocks.training;
      if (blocks.richCard) msg.richCard = blocks.richCard;
      if (blocks.certificate) msg.certificate = blocks.certificate;
      if (blocks.mediaCarousel) msg.mediaCarousel = blocks.mediaCarousel;
      if (blocks.quickReplies) msg.quickReplies = blocks.quickReplies;
      if (blocks.isSystemEvent) msg.isSystemEvent = true;

      return msg;
    });
  }, []);

  // Save a message to the database
  const saveMessage = useCallback(async (
    msg: PlayerMessage,
    extra?: { aiModel?: string; aiLatencyMs?: number }
  ) => {
    const convId = conversationIdRef.current;
    if (!convId) return;

    // Collect sovereign blocks into a single JSON
    const blocks: Record<string, any> = {};
    if (msg.menu) { blocks.menu = msg.menu; blocks.menuTitle = msg.menuTitle; }
    if (msg.catalog) blocks.catalog = msg.catalog;
    if (msg.inlineForm) blocks.inlineForm = msg.inlineForm;
    if (msg.location) blocks.location = msg.location;
    if (msg.payment) blocks.payment = msg.payment;
    if (msg.rating) blocks.rating = msg.rating;
    if (msg.training) blocks.training = msg.training;
    if (msg.richCard) blocks.richCard = msg.richCard;
    if (msg.certificate) blocks.certificate = msg.certificate;
    if (msg.mediaCarousel) blocks.mediaCarousel = msg.mediaCarousel;
    if (msg.quickReplies) blocks.quickReplies = msg.quickReplies;
    if (msg.isSystemEvent) blocks.isSystemEvent = true;

    // Don't persist large image data URLs — store a flag instead
    const imageUrl = msg.imageUrl?.startsWith("data:")
      ? "[image:inline]"
      : msg.imageUrl || null;

    const { error } = await supabase.from("player_messages").insert({
      conversation_id: convId,
      direction: msg.direction,
      content: msg.text,
      image_url: imageUrl,
      blocks,
      source: msg.source || null,
      ai_model: extra?.aiModel || null,
      ai_latency_ms: extra?.aiLatencyMs || null,
    });

    if (error) {
      console.error("Failed to save message:", error);
      return;
    }

    // Update conversation stats
    await supabase
      .from("player_conversations")
      .update({
        last_message_at: new Date().toISOString(),
        message_count: (state.messageCount || 0) + 1,
      })
      .eq("id", convId);

    setState(s => ({ ...s, messageCount: s.messageCount + 1 }));
  }, [state.messageCount]);

  // Update data mode on the conversation record
  const updateDataMode = useCallback(async (mode: DataMode) => {
    const convId = conversationIdRef.current;
    if (!convId) return;
    await supabase
      .from("player_conversations")
      .update({ data_mode: mode })
      .eq("id", convId);
  }, []);

  // Start a fresh conversation
  const startNewConversation = useCallback(async () => {
    const newSessionId = `ses_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem(SESSION_KEY, newSessionId);
    sessionId.current = newSessionId;

    const { data, error } = await supabase
      .from("player_conversations")
      .insert({
        session_id: newSessionId,
        tenant_id: tenantId || null,
        channel: "waka_sovereign",
      })
      .select("id")
      .single();

    if (!error && data) {
      conversationIdRef.current = data.id;
      setState({ conversationId: data.id, isLoading: false, messageCount: 0 });
    }
  }, [tenantId]);

  return {
    conversationId: state.conversationId,
    isLoading: state.isLoading,
    messageCount: state.messageCount,
    loadHistory,
    saveMessage,
    updateDataMode,
    startNewConversation,
  };
}
