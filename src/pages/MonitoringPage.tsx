import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { Activity, Zap, DollarSign, AlertTriangle, Clock, Cpu, TrendingUp, Hash } from "lucide-react";

interface UsageLog {
  id: string;
  created_at: string;
  model: string;
  latency_ms: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  estimated_cost_usd: number;
  status: string;
  error_message: string | null;
  tool_calls_count: number;
  iteration_count: number;
}

const PERIOD_OPTIONS = [
  { value: "24h", label: "Últimas 24h" },
  { value: "7d", label: "Últimos 7 días" },
  { value: "30d", label: "Últimos 30 días" },
];

const PIE_COLORS = ["hsl(160,60%,45%)", "hsl(200,70%,50%)", "hsl(280,60%,55%)", "hsl(40,80%,50%)", "hsl(0,60%,50%)"];

function getStartDate(period: string): string {
  const now = new Date();
  if (period === "24h") now.setHours(now.getHours() - 24);
  else if (period === "7d") now.setDate(now.getDate() - 7);
  else now.setDate(now.getDate() - 30);
  return now.toISOString();
}

export default function MonitoringPage() {
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [period, setPeriod] = useState("7d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const start = getStartDate(period);
      const { data, error } = await supabase
        .from("llm_usage_logs")
        .select("*")
        .gte("created_at", start)
        .order("created_at", { ascending: false })
        .limit(1000);
      if (!error && data) setLogs(data as unknown as UsageLog[]);
      setLoading(false);
    };
    fetchLogs();
  }, [period]);

  const stats = useMemo(() => {
    const totalRequests = logs.length;
    const errors = logs.filter(l => l.status === "error").length;
    const avgLatency = totalRequests > 0 ? Math.round(logs.reduce((s, l) => s + l.latency_ms, 0) / totalRequests) : 0;
    const totalTokens = logs.reduce((s, l) => s + l.total_tokens, 0);
    const totalCost = logs.reduce((s, l) => s + Number(l.estimated_cost_usd), 0);
    const totalToolCalls = logs.reduce((s, l) => s + l.tool_calls_count, 0);
    return { totalRequests, errors, avgLatency, totalTokens, totalCost, totalToolCalls };
  }, [logs]);

  const modelDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    logs.forEach(l => { map[l.model] = (map[l.model] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [logs]);

  const latencyOverTime = useMemo(() => {
    const buckets: Record<string, { sum: number; count: number; errors: number; cost: number }> = {};
    logs.forEach(l => {
      const key = period === "24h"
        ? new Date(l.created_at).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })
        : new Date(l.created_at).toLocaleDateString("es", { month: "short", day: "numeric" });
      if (!buckets[key]) buckets[key] = { sum: 0, count: 0, errors: 0, cost: 0 };
      buckets[key].sum += l.latency_ms;
      buckets[key].count++;
      buckets[key].cost += Number(l.estimated_cost_usd);
      if (l.status === "error") buckets[key].errors++;
    });
    return Object.entries(buckets)
      .map(([time, b]) => ({ time, avgLatency: Math.round(b.sum / b.count), requests: b.count, errors: b.errors, cost: +b.cost.toFixed(4) }))
      .reverse();
  }, [logs, period]);

  const costByModel = useMemo(() => {
    const map: Record<string, number> = {};
    logs.forEach(l => { map[l.model] = (map[l.model] || 0) + Number(l.estimated_cost_usd); });
    return Object.entries(map).map(([model, cost]) => ({ model, cost: +cost.toFixed(4) }));
  }, [logs]);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">WAKA LLM Monitoring</h1>
          <p className="text-sm text-muted-foreground mt-1">Métricas del WAKA LLM Gateway en tiempo real</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map(o => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Requests", value: stats.totalRequests, icon: Activity, color: "text-emerald-500" },
          { label: "Latencia media", value: `${stats.avgLatency}ms`, icon: Clock, color: "text-blue-500" },
          { label: "Tokens totales", value: stats.totalTokens.toLocaleString(), icon: Zap, color: "text-amber-500" },
          { label: "Coste estimado", value: `$${stats.totalCost.toFixed(4)}`, icon: DollarSign, color: "text-emerald-600" },
          { label: "Errores", value: stats.errors, icon: AlertTriangle, color: "text-red-500" },
          { label: "Tool calls", value: stats.totalToolCalls, icon: Cpu, color: "text-purple-500" },
        ].map((s) => (
          <Card key={s.label} className="border-border/40">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className={`h-4 w-4 ${s.color}`} />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Latency over time */}
        <Card className="lg:col-span-2 border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Latencia y Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={latencyOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" fontSize={11} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis yAxisId="left" fontSize={11} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis yAxisId="right" orientation="right" fontSize={11} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="avgLatency" name="Latencia (ms)" stroke="hsl(200,70%,50%)" strokeWidth={2} dot={false} />
                <Bar yAxisId="right" dataKey="requests" name="Requests" fill="hsl(160,60%,45%)" opacity={0.4} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Model distribution */}
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Hash className="h-4 w-4 text-purple-500" />
              Distribución por modelo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={modelDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {modelDistribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Cost by model */}
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            Coste por modelo (USD)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={costByModel}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="model" fontSize={12} tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis fontSize={11} tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="cost" name="Coste (USD)" fill="hsl(160,60%,45%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent logs table */}
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Últimas requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Cargando métricas...</p>
          ) : logs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Sin datos en el período seleccionado</p>
          ) : (
            <div className="max-h-[400px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Fecha</TableHead>
                    <TableHead className="text-xs">Modelo</TableHead>
                    <TableHead className="text-xs">Latencia</TableHead>
                    <TableHead className="text-xs">Tokens</TableHead>
                    <TableHead className="text-xs">Coste</TableHead>
                    <TableHead className="text-xs">Tools</TableHead>
                    <TableHead className="text-xs">Pasadas</TableHead>
                    <TableHead className="text-xs">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.slice(0, 100).map(l => (
                    <TableRow key={l.id}>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(l.created_at).toLocaleString("es", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-mono">{l.model}</Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono">{l.latency_ms}ms</TableCell>
                      <TableCell className="text-xs font-mono">
                        <span className="text-muted-foreground">{l.prompt_tokens}→</span>{l.completion_tokens}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-emerald-600">${Number(l.estimated_cost_usd).toFixed(5)}</TableCell>
                      <TableCell className="text-xs font-mono">{l.tool_calls_count}</TableCell>
                      <TableCell className="text-xs font-mono">{l.iteration_count}</TableCell>
                      <TableCell>
                        <Badge variant={l.status === "success" ? "default" : "destructive"} className="text-[10px]">
                          {l.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
