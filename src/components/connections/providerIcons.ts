import {
  MessageCircle, Send, Phone, Smartphone, Mail, Radio, type LucideIcon
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  MessageCircle,
  Send,
  Phone,
  Smartphone,
  Mail,
  Radio,
};

/** Resolve a Lucide icon component by name string from the provider registry */
export function getProviderIcon(name: string): LucideIcon {
  return iconMap[name] || Radio;
}
