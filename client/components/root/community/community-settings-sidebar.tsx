
import * as React from "react"

import { CommunitySettingsVersionSwitcher } from "./community-settings-version-switcher"
import { useCommunitySettings } from "@/features/slices/community-settings"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "General Settings",
      items: [
        { title: "Community Info", url: "#" },
        { title: "Welcome Message", url: "#" },
        { title: "Community Rules", url: "#" },
        { title: "Privacy & Visibility", url: "#" },
      ],
    },
    {
      title: "Members & Roles",
      items: [
        { title: "All Members", url: "#" },
        { title: "Pending Requests", url: "#" },
        { title: "Banned Members", url: "#" },
        { title: "Moderators & Admins", url: "#" },
      ],
    },
    {
      title: "Content & Moderation",
      items: [
        { title: "Post Approval", url: "#" },
        { title: "Reported Posts", url: "#" },
        { title: "Blocked Words", url: "#" },
      ],
    },
  ],
}

export function CommunitySettingsSidebar(
  props: React.ComponentProps<typeof Sidebar>
) {
  const { activeSection, activeItem, setActive } =
    useCommunitySettings()

  return (
    <Sidebar {...props} className="bg-red-500">
      <SidebarHeader className="border-b px-4 py-3">
        <CommunitySettingsVersionSwitcher />
      </SidebarHeader>

      <SidebarContent className="gap-6 px-2 py-4 bg-transparent">
        {data.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {group.title}
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    activeSection === group.title &&
                    activeItem === item.title

                  return (
                    <SidebarMenuItem key={item.title} className="text-foreground-tertiary">
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        onClick={() =>
                          setActive(group.title, item.title)
                        }
                        className="text-sm"
                      >
                        <a href={item.url}>{item.title}</a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}

