import React from "react";
import LandingHeader from "../landing/common/landing-header";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="size-full bg-[#F9F9F9] lex flex-col text-foreground overflow-y-auto">
      <LandingHeader />
      {children}
    </div>
  );
}
