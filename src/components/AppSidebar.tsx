import {
  Home, Map, Smartphone, Hammer, Rocket,
  BookOpen, LayoutGrid, LayoutTemplate, Upload,
  Plug, Building2, Settings, Wrench,
  Archive, Globe as GlobIcon, Clock, Webhook,
  Download, ShieldCheck,
} from "lucide-react";
import wakaLogo from "@/assets/waka-logo.png";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
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
  { title: "Simulator", url: "/simulator", icon: Smartphone },
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

const legacyItems = [
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
  { label: "Legacy Tools", items: legacyItems },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent>
        {/* Logo / Brand */}
        <div className={`flex items-center gap-2 px-4 py-4 ${collapsed ? "justify-center" : ""}`}>
          <img src={wakaLogo} alt="WAKA XP" className="h-8 w-8 rounded-lg object-contain" />
          {!collapsed && (
            <div>
              <h1 className="text-sm font-bold text-foreground leading-none">WAKA XP</h1>
              <p className="text-[10px] text-muted-foreground">Experience Platform</p>
            </div>
          )}
        </div>

        {sections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
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
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        activeClassName="bg-primary/10 text-primary font-medium"
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
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
