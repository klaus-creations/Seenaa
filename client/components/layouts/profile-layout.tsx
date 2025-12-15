"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import SelfProfileView from "../root/profile/self-profile-header";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="size-full">
      <SelfProfileView />
      <ProfileSettingsSelect />
      <div className="w-full py-2">{children}</div>
    </div>
  );
}

const ProfileSettingsSelect = function () {
  const pathname = usePathname();

  const tabs = [
    { name: "Profile", href: "/home/profile" },
    { name: "Settings", href: "/home/settings" },
  ];

  return (
    <div className="w-full flex items-center border-b gap-2">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={cn(
              "h-12 flex items-center justify-center cursor-pointer"
            )}
          >
            <div className="relative h-full flex items-center px-1">
              <span
                className={cn(
                  "text-[15px] transition-all",
                  isActive
                    ? "font-bold text-gray-900 dark:text-white"
                    : "font-medium text-gray-500 dark:text-gray-400"
                )}
              >
                {tab.name}
              </span>

              {isActive && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 rounded-full" />
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
};
