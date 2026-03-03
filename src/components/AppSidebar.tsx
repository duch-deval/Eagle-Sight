import {
  Home,
  Search,
  FileText,
  Download,
  Award,
  FolderOpen,
  Users,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Award Analysis", url: "/awards", icon: Search },
  { title: "Export Data", url: "/export", icon: Download },
  { title: "Watch List", url: "/AwardWatchlist", icon: FolderOpen },
  { title: "Points of Contact", url: "/points-of-contact", icon: FileText },
  { title: "Recipient Analysis", url: "/recipient-analysis", icon: Users },
];

const platformItems = [
  { title: "Weapons Platforms", url: "/platforms", icon: Award },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = (path: string) =>
    isActive(path)
      ? "bg-sidebar-accent/60 text-sidebar-accent-foreground font-medium border-l-2 border-l-sidebar-ring pl-2 text-xs py-1"
      : "hover:bg-sidebar-accent/30 text-[hsl(var(--sidebar-foreground))]/80 hover:text-sidebar-primary transition-all duration-200 text-xs py-1";



  return (
    <Sidebar
      className="bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))]"
      collapsible="icon"
    >

      <div className="flex items-center justify-center border-b border-sidebar-border h-16 px-2">
        <img
          src={`${import.meta.env.BASE_URL}eagle.png`}
          alt="Parts Life"
          className="h-10 w-auto object-contain"
        />
      </div>


      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="h-3.5 w-3.5" />
                      {!collapsed && <span className="truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Defense Systems</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {platformItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="h-3.5 w-3.5" />
                      {!collapsed && <span className="truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}