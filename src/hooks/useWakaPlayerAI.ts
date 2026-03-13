/**
 * Hook: useWakaPlayerAI
 * Calls the sovereign AI intent engine and maps tool-call responses
 * to PlayerMessage sovereign blocks.
 */

import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { PlayerMessage } from "@/components/player/WakaSovereignPlayer";
import type { DataMode } from "@/components/player/dataMode";
import { toast } from "@/hooks/use-toast";

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export function useWakaPlayerAI() {
  const [isThinking, setIsThinking] = useState(false);
  const historyRef = useRef<ConversationMessage[]>([]);

  const sendToAI = useCallback(async (
    userText: string,
    dataMode: DataMode
  ): Promise<Partial<PlayerMessage> | null> => {
    // Add user message to history
    historyRef.current.push({ role: "user", content: userText });

    setIsThinking(true);
    try {
      const { data, error } = await supabase.functions.invoke("waka-player-ai", {
        body: {
          messages: historyRef.current,
          dataMode,
        },
      });

      if (error) {
        console.error("AI engine error:", error);
        toast({
          title: "Erreur IA",
          description: "Le moteur d'intelligence n'a pas pu répondre.",
          variant: "destructive",
        });
        return null;
      }

      // Add assistant response to history
      if (data.text) {
        historyRef.current.push({ role: "assistant", content: data.text });
      }

      // Map AI tool calls to PlayerMessage properties
      const msg: Partial<PlayerMessage> = {
        text: data.text || "",
        source: "WAKA NEXUS · IA",
      };

      const blocks = data.blocks || {};

      // Menu
      if (blocks.show_menu) {
        msg.menu = blocks.show_menu.options;
        msg.menuTitle = blocks.show_menu.title;
      }

      // Catalog
      if (blocks.show_catalog) {
        msg.catalog = {
          title: blocks.show_catalog.title,
          products: blocks.show_catalog.products,
        };
      }

      // Form
      if (blocks.show_form) {
        msg.inlineForm = {
          title: blocks.show_form.title,
          icon: blocks.show_form.icon,
          submitLabel: blocks.show_form.submit_label,
          fields: blocks.show_form.fields,
        };
      }

      // Payment
      if (blocks.show_payment) {
        msg.payment = {
          title: blocks.show_payment.title,
          icon: blocks.show_payment.icon,
          items: blocks.show_payment.items,
          total: blocks.show_payment.total,
          currency: blocks.show_payment.currency || "FCFA",
          methods: blocks.show_payment.methods || ["mobile_money"],
        };
      }

      // Location
      if (blocks.show_location) {
        msg.location = blocks.show_location;
      }

      // Training
      if (blocks.show_training) {
        msg.training = {
          title: blocks.show_training.title,
          modules: blocks.show_training.modules,
          overallProgress: blocks.show_training.overall_progress,
        };
      }

      // Rating
      if (blocks.show_rating) {
        msg.rating = {
          title: blocks.show_rating.title,
          type: blocks.show_rating.type,
        };
      }

      // Rich Card
      if (blocks.show_rich_card) {
        msg.richCard = {
          title: blocks.show_rich_card.title,
          description: blocks.show_rich_card.description,
          icon: blocks.show_rich_card.icon,
          actions: blocks.show_rich_card.actions,
        };
      }

      // Quick Replies
      if (blocks.suggest_quick_replies) {
        msg.quickReplies = blocks.suggest_quick_replies.replies;
      }

      return msg;
    } catch (e) {
      console.error("AI call failed:", e);
      toast({
        title: "Erreur réseau",
        description: "Impossible de contacter le moteur IA.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsThinking(false);
    }
  }, []);

  const resetHistory = useCallback(() => {
    historyRef.current = [];
  }, []);

  return { sendToAI, isThinking, resetHistory };
}
