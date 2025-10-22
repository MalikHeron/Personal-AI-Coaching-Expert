import * as React from "react"
import { NavLink } from "react-router-dom"
import { NavUser } from "@/components/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavGroup } from "./nav-group";
import { IconActivity, IconLayoutDashboard, IconLayoutDashboardFilled, IconSparkles, IconStretching, IconTreadmill } from "@tabler/icons-react";
import { SettingsDialog } from "../dialogs/settings-dialog";

// Sidebar data.
const data = {
  home: [
    {
      title: "Dashboard",
      url: "/home/dashboard",
      icon: IconLayoutDashboard,
      iconFilled: IconLayoutDashboardFilled,
    },
    {
      title: "Workouts",
      url: "/home/workouts",
      icon: IconTreadmill,
      iconFilled: IconTreadmill,
    },
    // {
    //   title: "Activity",
    //   url: "/home/activity",
    //   icon: IconActivity,
    //   iconFilled: IconActivity,
    // },
  ],
  platform: [
    {
      title: "AI Coach",
      url: "/home/ai-coach",
      icon: IconSparkles,
      iconFilled: IconSparkles,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <NavLink to='/home' className="flex items-center gap-2">
            <IconStretching className="!size-5" />
            <span className="text-base font-semibold tracking-widest">P.A.C.E</span>
          </NavLink>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavGroup label="Home" items={data.home} />
        {/* <NavGroup label="Platform" items={data.platform} /> */}
        {/* <SidebarGroup className="mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SettingsDialog />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}