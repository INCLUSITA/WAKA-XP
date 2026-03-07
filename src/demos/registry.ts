import { lazy, ComponentType } from "react";

export interface DemoEntry {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  tags: string[];
  component: React.LazyExoticComponent<ComponentType<any>>;
}

export const DEMOS: DemoEntry[] = [
  {
    id: "moov-waka",
    title: "Moov Africa BF × WAKA",
    description: "Simulación completa de onboarding GSM→Moov Money, reactivación de cuentas, fibre óptica, agentes/marchands y operaciones wallet en Burkina Faso.",
    icon: "🇧🇫",
    color: "#003DA5",
    tags: ["WhatsApp", "KYC", "Moov Money", "Burkina Faso", "WAKA"],
    component: lazy(() => import("./MoovWakaDemo")),
  },
];
