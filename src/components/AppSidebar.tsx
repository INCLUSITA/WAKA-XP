import {
  Home, Map, Sparkles, Hammer, Rocket, Smartphone,
  BookOpen, LayoutGrid, LayoutTemplate, Upload,
  Plug, Building2, Settings, 
  Archive, Globe as GlobIcon, Clock, Webhook,
  Download, ShieldCheck,
} from "lucide-react";
import wakaLogo from "@/assets/waka-logo.png";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const principalItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Journeys", url: "/journeys", icon: Map },
  { title: "Experience Studio", url: "/studio", icon: Sparkles },
  { title: "Builder", url: "/editor", icon: Hammer },
  { title: "Production", url: "/production", icon: Rocket },
];

const assetsItems = [
  { title: "Library", url: "/library", icon: BookOpen },
  { title: "Demos", url: "/demos", icon: LayoutGrid },
  { title: "Templates", url: "/templates", icon: LayoutTemplate },
  { title: "Imports", url: "/import", icon: Upload },
];

const infraItems = [
  { title: "Integrations", url: "/integrations", icon: Plug },
  { title: "Tenants", url: "/tenants", icon: Building2 },
  { title: "Settings", url: "/settings", icon: Settings },
];

const advancedItems = [
  { title: "Flow Dashboard", url: "/flows", icon: LayoutGrid },
  { title: "Archived", url: "/archived", icon: Archive },
  { title: "Globals", url: "/globals", icon: GlobIcon },
  { title: "Starts", url: "/starts", icon: Clock },
  { title: "Webhooks", url: "/webhooks", icon: Webhook },
  { title: "Export", url: "/export", icon: Download },
  { title: "Validate", url: "/validate", icon: ShieldCheck },
];

const sections = [
  { label: "Principal", items: principalItems },
  { label: "Assets & Resources", items: assetsItems },
  { label: "Infrastructure", items: infraItems },
  { label: "Advanced Tools", items: advancedItems },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarContent className="glass-subtle">
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 ${collapsed ? "justify-center" : ""}`}>
          <div className="relative">
            <img src={wakaLogo} alt="WAKA XP" className="h-8 w-8 rounded-lg object-contain" />
            <div className="absolute -inset-1 rounded-lg bg-primary/10 blur-sm -z-10" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-sm font-bold text-foreground leading-none tracking-wide">WAKA XP</h1>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase mt-0.5">Experience Platform</p>
            </div>
          )}
        </div>

        {sections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60 px-4">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground"
                        activeClassName="bg-primary/10 text-primary font-medium glow-subtle"
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span className="tracking-wide">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
