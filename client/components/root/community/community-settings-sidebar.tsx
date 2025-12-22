"use client";

import * as React from "react";
import { useCommunitySettings } from "@/features/slices/community-settings";
import { CommunitySettingsVersionSwitcher } from "./community-settings-version-switcher";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

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
      ],
    },
  ],
};

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  className?: string;
}

export function CommunitySettingsSidebar({
  isOpen,
  setIsOpen,
  className,
}: SidebarProps) {
  const { activeSection, activeItem, setActive } = useCommunitySettings();

  const handleNavClick = (section: string, item: string) => {
    setActive(section, item);
    if (window.innerWidth < 1024) {
      setIsOpen(false); // Close sidebar on mobile after selection
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-background z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div className="flex items-center justify-between border-b h-[7%]">
          <CommunitySettingsVersionSwitcher />
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 lg:hidden rounded-md "
          >
            <X size={20} />
          </button>
        </div>

        <nav className="overflow-y-auto space-y-5 py-4">
          {data.navMain.map((group) => (
            <div key={group.title} className="space-y-2 border-b pb-2">
              <h3 className=" text-sm font-bold uppercase tracking-wider text-foreground-tertiary px-4 ">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive =
                    activeSection === group.title && activeItem === item.title;

                  return (
                    <button
                      key={item.title}
                      onClick={() => handleNavClick(group.title, item.title)}
                      className={cn(
                        "w-full text-left rounded-md text-sm transition-colors cursor-pointer px-4",
                        isActive
                          ? "font-bold text-foreground"
                          : "text-foreground-secondary hover:font-bold hover:text-foreground transition-all duration-300"
                      )}
                    >
                      {item.title}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
