import { useState } from "react";
import { 
  Home, 
  Search, 
  Building2, 
  FileText, 
  BarChart3, 
  Map, 
  Shield, 
  Target, 
  TrendingUp,
  Download,
  Award,
  Users,
  Globe,
  FolderOpen,
  MessageSquare
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
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium border-r-2 border-sidebar-primary"
      : "hover:bg-sidebar-accent text-[hsl(var(--sidebar-foreground))] hover:text-sidebar-primary";



  return (
    <Sidebar
      className={`${collapsed ? "w-14" : "w-64"} bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))]`}
      collapsible="icon"
    >

      <div className="flex items-center border-b pl-10 h-28">
        <img
          src={`${import.meta.env.BASE_URL}eagle.png`}
          alt="Parts Life"
          className="h-full w-auto object-contain"
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
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
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
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
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