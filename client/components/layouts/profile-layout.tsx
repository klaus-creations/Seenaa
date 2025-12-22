"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import SelfProfileView from "../root/profile/self-profile-header";
import Recommendations from "../root/recommendations/recommendations";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="size-full  overflow-hidden lg:p-4 flex justify-around">
    <div className="size-full overflow-y-auto  h lg:w-[65%] 2xl:w-[40%]">
      <SelfProfileView />
      <ProfileSettingsSelect />
      <div className="w-full py-2">{children}</div>
      </div>

     <div className="w-[40%] 2xl:w-[30%] hidden lg:block h-full">
        <Recommendations />
      </div>
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
    <div className="w-full px-4 flex items-center  gap-2">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={cn(
              "h-6 lg:h-8 flex items-center justify-center cursor-pointer"
            )}
          >
            <div className="relative h-full flex items-center px-1">
              <span
                className={cn(
                  "text-[15px] transition-all",
                  isActive
                    ? "font-bold text-foreground"
                    : "font-medium text-foreground-secondary"
                )}
              >
                {tab.name}
              </span>

              {isActive && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
};
