import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Sparkles } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { APP_NAME, TOOLS } from "@/lib/tools-meta";

const NAV = [
  { title: "Dashboard", url: "/" as const, icon: LayoutDashboard },
  ...TOOLS.map((t) => ({ title: t.name, url: t.path, icon: t.icon })),
];

export function AppSidebar() {
  const { setOpenMobile, isMobile } = useSidebar();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-4">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => isMobile && setOpenMobile(false)}>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
            <Sparkles className="size-4.5" />
          </span>
          <span className="truncate font-display text-[15px] font-semibold leading-tight group-data-[collapsible=icon]:hidden">
            {APP_NAME}
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {NAV.map((item) => {
                const active = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                      className="h-10 rounded-xl data-[active=true]:bg-sidebar-accent data-[active=true]:font-semibold data-[active=true]:text-sidebar-accent-foreground"
                    >
                      <Link to={item.url} onClick={() => isMobile && setOpenMobile(false)}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3 group-data-[collapsible=icon]:hidden">
        <div className="rounded-xl bg-gradient-soft p-3 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Tip</p>
          <p className="mt-1">The more specific your details, the better the AI result.</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
