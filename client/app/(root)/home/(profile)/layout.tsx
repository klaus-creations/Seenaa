import React from "react";
import ProfileLayout from "@/components/layouts/profile-layout";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ProfileLayout>{children}</ProfileLayout>;
}
