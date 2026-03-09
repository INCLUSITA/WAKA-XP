import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Inbox, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InboundMessage {
  id: string;
  from_phone: string;
  message_type: string;
  body: string;
  created_at: string;
  wa_message_id: string;
}

export function InboundMessages() {
  const [messages, setMessages] = useState<InboundMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("whatsapp_messages")
      .select("*")
      .eq("direction", "inbound")
      .order("created_at", { ascending: false })
      .limit(20);
    setMessages((data as InboundMessage[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();

    // Realtime subscription
    const channel = supabase
      .channel("whatsapp-inbound")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "whatsapp_messages",
          filter: "direction=eq.inbound",
        },
        (payload) => {
          setMessages((prev) => [payload.new as InboundMessage, ...prev].slice(0, 20));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              Inbound Messages
            </CardTitle>
            <CardDescription className="text-xs">
              Messages received via webhook (realtime)
            </CardDescription>
          </div>
          <Button size="sm" variant="ghost" onClick={fetchMessages} className="h-7 w-7 p-0">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>No inbound messages yet.</p>
            <p className="text-xs mt-1">Send a WhatsApp message to the business number to see it here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2"
              >
                <MessageSquare className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono font-medium text-foreground">
                      +{msg.from_phone}
                    </span>
                    <Badge variant="outline" className="text-[9px] px-1 py-0">
                      {msg.message_type}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 break-words">{msg.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
