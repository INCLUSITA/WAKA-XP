import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  MessageSquare, Send, Phone, Loader2, CheckCircle2, XCircle,
  Clock, AlertTriangle, Plus, X, Info, Copy,
} from "lucide-react";
import { InboundMessages } from "@/components/whatsapp/InboundMessages";

type SendStatus = "idle" | "sending" | "sent" | "accepted" | "failed";

interface SendResult {
  status: SendStatus;
  waMessageId?: string;
  error?: string;
  timestamp: string;
}

export default function WhatsAppTestPage() {
  const [phone, setPhone] = useState("");
  const [messageType, setMessageType] = useState<"text" | "interactive_buttons">("text");
  const [text, setText] = useState("");
  const [buttons, setButtons] = useState<string[]>([]);
  const [newButton, setNewButton] = useState("");
  const [sendStatus, setSendStatus] = useState<SendStatus>("idle");
  const [history, setHistory] = useState<SendResult[]>([]);

  const addButton = () => {
    if (newButton.trim() && buttons.length < 3) {
      setButtons((b) => [...b, newButton.trim().slice(0, 20)]);
      setNewButton("");
    }
  };

  const removeButton = (i: number) => setButtons((b) => b.filter((_, idx) => idx !== i));

  const handleSend = async () => {
    if (!phone.trim()) {
      toast({ title: "Phone required", description: "Enter a destination phone number.", variant: "destructive" });
      return;
    }
    if (!text.trim() && messageType === "text") {
      toast({ title: "Message required", description: "Enter the message text.", variant: "destructive" });
      return;
    }

    setSendStatus("sending");

    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-send", {
        body: {
          phone: phone.trim(),
          message_type: messageType,
          text: text.trim(),
          ...(messageType === "interactive_buttons" && { buttons }),
        },
      });

      if (error) throw error;

      if (data?.success) {
        const waId = data?.data?.messages?.[0]?.id || "";
        setSendStatus("accepted");
        const result: SendResult = {
          status: "accepted",
          waMessageId: waId,
          timestamp: new Date().toLocaleTimeString(),
        };
        setHistory((h) => [result, ...h]);
        toast({ title: "✅ Message accepted", description: `ID: ${waId || "sent"}` });
      } else {
        const errMsg = data?.data?.error?.message || data?.error || "Unknown error";
        setSendStatus("failed");
        const result: SendResult = {
          status: "failed",
          error: errMsg,
          timestamp: new Date().toLocaleTimeString(),
        };
        setHistory((h) => [result, ...h]);
        toast({ title: "❌ Send failed", description: errMsg, variant: "destructive" });
      }
    } catch (err: any) {
      setSendStatus("failed");
      const result: SendResult = {
        status: "failed",
        error: err.message,
        timestamp: new Date().toLocaleTimeString(),
      };
      setHistory((h) => [result, ...h]);
      toast({ title: "❌ Error", description: err.message, variant: "destructive" });
    }

    setTimeout(() => setSendStatus("idle"), 3000);
  };

  const statusIcon = {
    idle: null,
    sending: <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />,
    sent: <Clock className="h-4 w-4 text-amber-500" />,
    accepted: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
    failed: <XCircle className="h-4 w-4 text-destructive" />,
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <SidebarTrigger />
        <MessageSquare className="h-5 w-5 text-emerald-500" />
        <h1 className="text-lg font-bold text-foreground">WhatsApp Test</h1>
        <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-500">
          360dialog · Phase 1
        </Badge>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Webhook URL */}
          <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
            <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div className="space-y-1 flex-1">
              <p className="font-medium text-foreground">Webhook URL for 360dialog</p>
              <div className="flex items-center gap-2">
                <code className="text-[11px] text-muted-foreground font-mono bg-muted px-2 py-1 rounded break-all">
                  {`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-webhook`}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-webhook`);
                    toast({ title: "Copied!" });
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-muted-foreground text-xs">
                Set this URL in 360dialog Hub → your number → Webhook settings.
              </p>
            </div>
          </div>

          {/* 24h window notice */}
          <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="font-medium text-foreground">24-hour conversation window</p>
              <p className="text-muted-foreground text-xs">
                Free-form text and interactive messages work only within <strong>24 hours</strong> of the customer's last message.
                Outside this window, you must use approved <strong>template messages</strong> (not yet available in this panel).
              </p>
            </div>
          </div>

          {/* Send card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="h-4 w-4" />
                Send Test Message
              </CardTitle>
              <CardDescription>
                Send a WhatsApp message via 360dialog. The API key is stored securely server-side.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs">Destination phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="226XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-9 font-mono text-sm"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">Include country code, no +. Example: 22670000000</p>
              </div>

              {/* Message type */}
              <div className="space-y-1.5">
                <Label className="text-xs">Message type</Label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMessageType("text")}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                      messageType === "text"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    📝 Text
                  </button>
                  <button
                    onClick={() => setMessageType("interactive_buttons")}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                      messageType === "interactive_buttons"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    🔘 Reply Buttons
                  </button>
                </div>
              </div>

              {/* Text */}
              <div className="space-y-1.5">
                <Label htmlFor="text" className="text-xs">
                  {messageType === "interactive_buttons" ? "Body text" : "Message text"}
                </Label>
                <Textarea
                  id="text"
                  placeholder="Hello from WAKA XP..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={3}
                  className="text-sm"
                />
              </div>

              {/* Buttons (interactive) */}
              {messageType === "interactive_buttons" && (
                <div className="space-y-2">
                  <Label className="text-xs">Reply buttons (max 3)</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {buttons.map((b, i) => (
                      <Badge key={i} variant="secondary" className="gap-1 pr-1">
                        {b}
                        <button onClick={() => removeButton(i)}>
                          <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {buttons.length < 3 && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Button label"
                        value={newButton}
                        onChange={(e) => setNewButton(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addButton()}
                        className="text-sm h-8"
                        maxLength={20}
                      />
                      <Button size="sm" variant="outline" onClick={addButton} className="h-8 px-2">
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Interactive messages only work inside the 24h service window.
                  </p>
                </div>
              )}

              {/* Send button */}
              <Button
                onClick={handleSend}
                disabled={sendStatus === "sending"}
                className="w-full gap-2"
              >
                {sendStatus === "sending" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {sendStatus === "sending" ? "Sending..." : "Send via WhatsApp"}
              </Button>
            </CardContent>
          </Card>

          {/* Send history */}
          {history.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Send History</CardTitle>
                <CardDescription className="text-xs">Recent sends from this session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {history.map((r, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-xs ${
                        r.status === "accepted"
                          ? "border-emerald-500/20 bg-emerald-500/5"
                          : "border-destructive/20 bg-destructive/5"
                      }`}
                    >
                      {statusIcon[r.status]}
                      <span className="text-muted-foreground">{r.timestamp}</span>
                      {r.waMessageId && (
                        <code className="text-[10px] text-foreground/60 font-mono truncate max-w-[200px]">
                          {r.waMessageId}
                        </code>
                      )}
                      {r.error && (
                        <span className="text-destructive truncate max-w-[300px]">{r.error}</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
