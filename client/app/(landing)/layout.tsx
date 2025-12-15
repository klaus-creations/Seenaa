import LandingLayout from "@/components/layouts/landing-layout";
import React from "react";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <LandingLayout> { children } </LandingLayout>
}
