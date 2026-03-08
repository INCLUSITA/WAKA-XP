import { lazy, ComponentType } from "react";

export type DemoStatus = "stable" | "sandbox" | "draft" | "approved";

export interface DemoEntry {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  tags: string[];
  component: React.LazyExoticComponent<ComponentType<any>>;
  isUploaded?: boolean;
  status?: DemoStatus;
}

export interface UploadedDemo {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  tags: string[];
  jsxSource: string;
  uploadedAt: string;
  status: DemoStatus;
  sourceId?: string;      // origin demo id if duplicated
  sourceName?: string;    // origin demo name
}

const STORAGE_KEY = "uploaded-demos";

export function getUploadedDemos(): UploadedDemo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const demos: UploadedDemo[] = raw ? JSON.parse(raw) : [];
    // Migrate old demos without status
    return demos.map((d) => ({ ...d, status: d.status || "stable" }));
  } catch {
    return [];
  }
}

export function saveUploadedDemo(demo: UploadedDemo): void {
  const demos = getUploadedDemos().filter((d) => d.id !== demo.id);
  demos.push(demo);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(demos));
}

export function deleteUploadedDemo(id: string): void {
  const demos = getUploadedDemos().filter((d) => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(demos));
}

export function updateDemoStatus(id: string, status: DemoStatus): void {
  const demos = getUploadedDemos().map((d) =>
    d.id === id ? { ...d, status } : d
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(demos));
}

export function duplicateDemoAsSandbox(source: UploadedDemo | DemoEntry, jsxSource: string): UploadedDemo {
  const timestamp = Date.now().toString(36);
  const newId = `${source.id}-sandbox-${timestamp}`;
  return {
    id: newId,
    title: `${source.title} (Sandbox)`,
    description: source.description,
    icon: source.icon,
    color: source.color,
    tags: [...source.tags],
    jsxSource,
    uploadedAt: new Date().toISOString(),
    status: "sandbox",
    sourceId: source.id,
    sourceName: source.title,
  };
}

export function generateDemoId(filename: string): string {
  return filename
    .replace(/\.(jsx|tsx|js|ts)$/i, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase()
    .replace(/^-|-$/g, "");
}

export const DEMO_STATUS_CONFIG: Record<DemoStatus, { label: string; color: string; bg: string; icon: string }> = {
  stable:   { label: "Stable",   color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30", icon: "🔒" },
  sandbox:  { label: "Sandbox",  color: "text-amber-400",   bg: "bg-amber-500/15 border-amber-500/30",    icon: "🧪" },
  draft:    { label: "Draft",    color: "text-slate-400",   bg: "bg-slate-500/15 border-slate-500/30",    icon: "📝" },
  approved: { label: "Approved", color: "text-blue-400",    bg: "bg-blue-500/15 border-blue-500/30",      icon: "✅" },
};

// Built-in demos
export const BUILTIN_DEMOS: DemoEntry[] = [
  {
    id: "moov-waka",
    title: "Moov Africa BF × WAKA",
    description:
      "Simulación completa de onboarding GSM→Moov Money, reactivación de cuentas, fibre óptica, agentes/marchands y operaciones wallet en Burkina Faso.",
    icon: "🇧🇫",
    color: "#003DA5",
    tags: ["WhatsApp", "KYC", "Moov Money", "Burkina Faso", "WAKA"],
    component: lazy(() => import("./MoovWakaDemo")),
    status: "stable",
  },
];
