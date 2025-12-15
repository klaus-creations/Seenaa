import React from "react";
import SideNav from "../root/common/nav-bar";
import Header from "../root/common/header";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto h-screen flex flex-col  overflow-hidden text-foreground">
      <div className="w-full h-[6%]">
        <Header />
      </div>
      <div className="w-full h-[94%] overflow-hidden flex justify-between">
        <div className="w-[13%] 2xl:w-[12%] hidden lg:block h-full">
          {" "}
          <SideNav />{" "}
        </div>
        <div className="w-full lg:w-[90%] p-4 xl:p-8">{children}</div>
      </div>
    </div>
  );
}
