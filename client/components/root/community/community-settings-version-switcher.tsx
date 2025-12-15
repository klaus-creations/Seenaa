import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function CommunitySettingsVersionSwitcher() {

  return (
    <SidebarMenu>
      <SidebarMenuItem className="font-bold px-2 text-lg xl:text-xl">
        Community Settings
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
