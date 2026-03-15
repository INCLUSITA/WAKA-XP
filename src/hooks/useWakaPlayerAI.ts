/**
 * Hook: useWakaPlayerAI
 * Calls the sovereign AI intent engine and maps tool-call responses
 * to PlayerMessage sovereign blocks. Supports multimodal (text + image).
 *
 * Reads persona/tools/knowledge from PlayerContextProvider when available.
 */

import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { PlayerMessage } from "@/components/player/WakaSovereignPlayer";
import type { DataMode } from "@/components/player/dataMode";
import { toast } from "@/hooks/use-toast";
import { usePlayerContext } from "@/contexts/PlayerContextProvider";

interface ConversationMessage {
  role: "user" | "assistant";
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

export function useWakaPlayerAI() {
  const [isThinking, setIsThinking] = useState(false);
  const historyRef = useRef<ConversationMessage[]>([]);
  const flowContextRef = useRef<string | null>(null);

  // Read context from PlayerContextProvider (graceful fallback)
  const playerContext = usePlayerContext();

  const setFlowContext = useCallback((ctx: string | null) => {
    flowContextRef.current = ctx;
  }, []);

  const sendToAI = useCallback(async (
    userText: string,
    dataMode: DataMode,
    imageDataUrl?: string
  ): Promise<Partial<PlayerMessage> | null> => {
    // Build multimodal content if image present
    if (imageDataUrl) {
      const parts: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
        { type: "image_url", image_url: { url: imageDataUrl } },
      ];
      if (userText) {
        parts.unshift({ type: "text", text: userText });
      } else {
        parts.unshift({ type: "text", text: "L'utilisateur a envoyé cette image. Analyse-la et réponds contextuellement." });
      }
      historyRef.current.push({ role: "user", content: parts });
    } else {
      historyRef.current.push({ role: "user", content: userText });
    }

    setIsThinking(true);
    try {
      // Build enriched context from PlayerContextProvider
      const enrichedContext = buildEnrichedContext(playerContext, flowContextRef.current);

      const { data, error } = await supabase.functions.invoke("waka-player-ai", {
        body: {
          messages: historyRef.current,
          dataMode,
          flowContext: enrichedContext || undefined,
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

      if (blocks.show_menu) {
        msg.menu = blocks.show_menu.options;
        msg.menuTitle = blocks.show_menu.title;
      }
      if (blocks.show_catalog) {
        msg.catalog = { title: blocks.show_catalog.title, products: blocks.show_catalog.products };
      }
      if (blocks.show_form) {
        msg.inlineForm = {
          title: blocks.show_form.title, icon: blocks.show_form.icon,
          submitLabel: blocks.show_form.submit_label, fields: blocks.show_form.fields,
        };
      }
      if (blocks.show_payment) {
        msg.payment = {
          title: blocks.show_payment.title, icon: blocks.show_payment.icon,
          items: blocks.show_payment.items, total: blocks.show_payment.total,
          currency: blocks.show_payment.currency || "FCFA",
          methods: blocks.show_payment.methods || ["mobile_money"],
        };
      }
      if (blocks.show_location) msg.location = blocks.show_location;
      if (blocks.show_training) {
        msg.training = {
          title: blocks.show_training.title, modules: blocks.show_training.modules,
          overallProgress: blocks.show_training.overall_progress,
        };
      }
      if (blocks.show_rating) msg.rating = { title: blocks.show_rating.title, type: blocks.show_rating.type };
      if (blocks.show_rich_card) {
        msg.richCard = {
          title: blocks.show_rich_card.title, description: blocks.show_rich_card.description,
          icon: blocks.show_rich_card.icon, actions: blocks.show_rich_card.actions,
        };
      }
      if (blocks.suggest_quick_replies) msg.quickReplies = blocks.suggest_quick_replies.replies;
      if (blocks.show_credit_simulation) {
        msg.creditSimulation = {
          title: blocks.show_credit_simulation.title,
          product_name: blocks.show_credit_simulation.product_name,
          amount: blocks.show_credit_simulation.amount,
          term: blocks.show_credit_simulation.term,
          frequency: blocks.show_credit_simulation.frequency,
          monthly_payment: blocks.show_credit_simulation.monthly_payment,
          total_cost: blocks.show_credit_simulation.total_cost,
          interest_rate: blocks.show_credit_simulation.interest_rate,
          icon: blocks.show_credit_simulation.icon,
          actions: blocks.show_credit_simulation.actions,
        };
      }
      if (blocks.show_client_status) {
        msg.clientStatus = {
          client_name: blocks.show_client_status.client_name,
          voice_id: blocks.show_client_status.voice_id,
          phone: blocks.show_client_status.phone,
          active_credits: blocks.show_client_status.active_credits,
          total_balance: blocks.show_client_status.total_balance,
          next_payment_date: blocks.show_client_status.next_payment_date,
          next_payment_amount: blocks.show_client_status.next_payment_amount,
          icon: blocks.show_client_status.icon,
        };
      }
      if (blocks.show_momo_card) {
        msg.momoAccount = {
          title: blocks.show_momo_card.title,
          account_number: blocks.show_momo_card.account_number,
          account_type: blocks.show_momo_card.account_type,
          status: blocks.show_momo_card.status,
          message: blocks.show_momo_card.message,
          icon: blocks.show_momo_card.icon,
          actions: blocks.show_momo_card.actions,
        };
      }
      if (blocks.show_service_plans) {
        msg.servicePlans = {
          title: blocks.show_service_plans.title,
          category: blocks.show_service_plans.category,
          plans: blocks.show_service_plans.plans,
          message: blocks.show_service_plans.message,
          icon: blocks.show_service_plans.icon,
        };
      }
      if (blocks.show_payment_confirmation) {
        msg.paymentConfirmation = {
          title: blocks.show_payment_confirmation.title,
          status: blocks.show_payment_confirmation.status,
          amount_paid: blocks.show_payment_confirmation.amount_paid,
          remaining_balance: blocks.show_payment_confirmation.remaining_balance,
          credit_voice_id: blocks.show_payment_confirmation.credit_voice_id,
          payment_date: blocks.show_payment_confirmation.payment_date,
          next_payment_date: blocks.show_payment_confirmation.next_payment_date,
          next_payment_amount: blocks.show_payment_confirmation.next_payment_amount,
          message: blocks.show_payment_confirmation.message,
          icon: blocks.show_payment_confirmation.icon,
          actions: blocks.show_payment_confirmation.actions,
        };
      }
      if (blocks.show_credit_contract) {
        msg.creditContract = {
          title: blocks.show_credit_contract.title,
          credit_voice_id: blocks.show_credit_contract.credit_voice_id,
          credit_type: blocks.show_credit_contract.credit_type,
          amount: blocks.show_credit_contract.amount,
          term: blocks.show_credit_contract.term,
          frequency: blocks.show_credit_contract.frequency,
          monthly_payment: blocks.show_credit_contract.monthly_payment,
          status: blocks.show_credit_contract.status,
          status_explanation: blocks.show_credit_contract.status_explanation,
          device_lock: blocks.show_credit_contract.device_lock,
          product_name: blocks.show_credit_contract.product_name,
          next_steps: blocks.show_credit_contract.next_steps,
          icon: blocks.show_credit_contract.icon,
          actions: blocks.show_credit_contract.actions,
        };
      }
      if (blocks.show_device_lock_consent) {
        msg.deviceLockConsent = {
          title: blocks.show_device_lock_consent.title,
          device_name: blocks.show_device_lock_consent.device_name,
          amount: blocks.show_device_lock_consent.amount,
          message: blocks.show_device_lock_consent.message,
          icon: blocks.show_device_lock_consent.icon,
        };
      }

      return msg;
    } catch (e) {
      console.error("AI call failed:", e);
      toast({ title: "Erreur réseau", description: "Impossible de contacter le moteur IA.", variant: "destructive" });
      return null;
    } finally {
      setIsThinking(false);
    }
  }, []);

  const resetHistory = useCallback(() => { historyRef.current = []; }, []);

  return { sendToAI, isThinking, resetHistory, setFlowContext, flowContext: flowContextRef.current };
}
