import { lazy, ComponentType } from "react";

export interface DemoEntry {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  tags: string[];
  component: React.LazyExoticComponent<ComponentType<any>>;
  isUploaded?: boolean;
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
}

const STORAGE_KEY = "uploaded-demos";

export function getUploadedDemos(): UploadedDemo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
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

export function generateDemoId(filename: string): string {
  return filename
    .replace(/\.(jsx|tsx|js|ts)$/i, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase()
    .replace(/^-|-$/g, "");
}

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
  },
];
