import React from "react";
import HomeLayout from "@/components/layouts/home-layout";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="w-full bg-[#F9F9F9] dark:bg-[#0A0A0A]">
    <HomeLayout>{children}</HomeLayout>;
  </div>
}
