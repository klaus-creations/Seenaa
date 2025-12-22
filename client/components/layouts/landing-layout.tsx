import React from "react";
import LandingHeader from "../landing/common/landing-header";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="size-full  flex flex-col text-foreground overflow-y-auto">
      <LandingHeader />
      {children}
    </div>
  );
}
