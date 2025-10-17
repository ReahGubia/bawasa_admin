"use client"

import {
  BarChart3,
  Building2,
  CreditCard,
  Home,
  Users,
  Droplets,
  AlertTriangle,
  Activity,
} from "lucide-react"

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
} from "@/components/ui/sidebar"

// Menu items for admin dashboard
const items = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: Home,
  },
  {
    title: "User Management",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Meter Readings",
    url: "/admin/meter-readings",
    icon: Droplets,
  },
  {
    title: "Billing Management",
    url: "/admin/billing",
    icon: CreditCard,
  },
  {
    title: "Issues & Reports",
    url: "/admin/issues",
    icon: AlertTriangle,
  },
  {
    title: "Analytics & Reports",
    url: "/admin/analytics",
    icon: BarChart3,
  },
]

export function AdminSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Building2 className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-semibold">BAWASA Admin</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span>System Status: Online</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
