import { useState } from "react";
import { ArrowLeft, ExternalLink, CheckCircle, XCircle, Clock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface WebhookLogEntry {
  id: string;
  flowName: string;
  url: string;
  method: string;
  status: number;
  elapsed: number;
  timestamp: string;
  requestHeaders: Record<string, string>;
  requestBody: string;
  responseHeaders: Record<string, string>;
  responseBody: string;
}

// Generate sample data for demonstration
function generateSampleLogs(): WebhookLogEntry[] {
  const flows = [
    "WAKA INTER PROD FLUJO FR REGISTRO BASIC - WAKA PRO",
    "WAKA DEMO KYC + GEOLOCALIZACION TEST V1 FR",
    "nigeria HAUSA WAKA INTER PROD FLUJO REGISTRO BASIC",
  ];
  const urls = [
    "https://api.openai.com/v1/responses",
    "https://atcyynxxrbkydsilvrol.supabase.co/functions/v1/waka-core-api/clients",
    "https://atcyynxxrbkydsilvrol.supabase.co/functions/v1/waka-core-api/bots/acquire-service",
    "https://atcyynxxrbkydsilvrol.supabase.co/functions/v1/waka-core-api/documents/upload",
    "https://atcyynxxrbkydsilvrol.supabase.co/functions/v1/waka-core-api/credits/simulate",
    "https://atcyynxxrbkydsilvrol.supabase.co/functions/v1/waka-core-api/kyc/ocr/submit",
  ];
  const statuses = [200, 200, 200, 201, 201, 400, 409, 200, 200, 200];

  return Array.from({ length: 25 }, (_, i) => ({
    id: `log-${i}`,
    flowName: flows[i % flows.length],
    url: urls[i % urls.length],
    method: i % 3 === 0 ? "GET" : "POST",
    status: statuses[i % statuses.length],
    elapsed: Math.floor(Math.random() * 8000) + 500,
    timestamp: new Date(Date.now() - i * 300000).toLocaleString(),
    requestHeaders: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "User-Agent": "RapidProMailroom/26.1.54",
      "X-Api-Key": "waka_test_••••••••••",
    },
    requestBody: JSON.stringify(
      {
        full_name: "SAMPLE USER",
        document_type: "ID",
        phone: "+22612345678",
      },
      null,
      2
    ),
    responseHeaders: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    responseBody: JSON.stringify(
      {
        success: true,
        data: { id: `uuid-${i}`, status: "active" },
      },
      null,
      2
    ),
  }));
}

function StatusBadge({ status }: { status: number }) {
  if (status >= 200 && status < 300)
    return <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-600 font-mono">{status}</Badge>;
  if (status >= 400 && status < 500)
    return <Badge variant="outline" className="border-orange-500/30 bg-orange-500/10 text-orange-600 font-mono">{status}</Badge>;
  return <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-600 font-mono">{status}</Badge>;
}

function WebhookDetail({ log, onBack }: { log: WebhookLogEntry; onBack: () => void }) {
  const isError = log.status >= 400;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground">Flow Event</h2>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <span>Webhook Called</span>
            <span className="text-primary font-medium">{log.flowName}</span>
            <span>Date {log.timestamp}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Status */}
        <div className={`flex items-center gap-3 rounded-lg border p-4 ${isError ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}>
          {isError ? <XCircle className="h-5 w-5 text-red-500" /> : <CheckCircle className="h-5 w-5 text-green-500" />}
          <span className={`font-semibold ${isError ? "text-red-700" : "text-green-700"}`}>
            {isError ? "Error" : "Success"}
          </span>
          <span className="text-sm text-muted-foreground">{log.elapsed.toLocaleString()} ms</span>
          <span className="text-sm text-muted-foreground ml-auto">{log.timestamp}</span>
        </div>

        {/* Request */}
        <div className="rounded-lg border border-border">
          <div className="border-b border-border bg-muted/30 px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Request</span>
          </div>
          <pre className="overflow-x-auto p-4 text-xs font-mono text-foreground whitespace-pre-wrap">
            <span className="text-primary font-semibold">{log.method}</span> {log.url} HTTP/1.1{"\n"}
            {Object.entries(log.requestHeaders).map(([k, v]) => (
              <span key={k}>
                <span className="text-blue-600">{k}:</span> {v}{"\n"}
              </span>
            ))}
            {"\n"}{log.requestBody}
          </pre>
        </div>

        {/* Response */}
        <div className="rounded-lg border border-border">
          <div className="border-b border-border bg-muted/30 px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Response — HTTP {log.status}
            </span>
          </div>
          <pre className="overflow-x-auto p-4 text-xs font-mono text-foreground whitespace-pre-wrap">
            {Object.entries(log.responseHeaders).map(([k, v]) => (
              <span key={k}>
                <span className="text-blue-600">{k}:</span> {v}{"\n"}
              </span>
            ))}
            {"\n"}
            <span className={isError ? "text-red-600" : "text-green-700"}>{log.responseBody}</span>
          </pre>
        </div>
      </div>
    </div>
  );
}

export default function WebhookLogs() {
  const [logs] = useState<WebhookLogEntry[]>(generateSampleLogs);
  const [selectedLog, setSelectedLog] = useState<WebhookLogEntry | null>(null);
  const [search, setSearch] = useState("");

  const filteredLogs = logs.filter(
    (l) =>
      l.flowName.toLowerCase().includes(search.toLowerCase()) ||
      l.url.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedLog) {
    return (
      <div className="flex h-screen flex-col bg-background">
        <WebhookDetail log={selectedLog} onBack={() => setSelectedLog(null)} />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Webhooks</h1>
          <span className="text-sm text-muted-foreground">
            1 - {filteredLogs.length} of {logs.length}
          </span>
        </div>
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by flow or URL..."
            className="pl-9 max-w-md"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-6 py-3">Flow</th>
              <th className="px-6 py-3">URL</th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-right">Elapsed</th>
              <th className="px-6 py-3 text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredLogs.map((log) => (
              <tr
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className="cursor-pointer transition-colors hover:bg-muted/50"
              >
                <td className="px-6 py-3">
                  <span className="text-sm font-medium text-primary hover:underline">{log.flowName}</span>
                </td>
                <td className="px-6 py-3">
                  <span className="text-sm text-muted-foreground font-mono truncate block max-w-[400px]">
                    {log.url}
                  </span>
                </td>
                <td className="px-6 py-3 text-center">
                  <StatusBadge status={log.status} />
                </td>
                <td className="px-6 py-3 text-right text-sm text-muted-foreground">
                  {log.elapsed.toLocaleString()}ms
                </td>
                <td className="px-6 py-3 text-right text-sm text-muted-foreground">
                  {log.timestamp}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
