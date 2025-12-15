"use client";

import { useState } from "react";
import { useSession } from "@/lib/hooks/auth/useGetSession";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import SelfProfilePosts from "./self-profile-posts";
import SelfProfileBookmarks from "./self-profile-bookmarks";
// import SelfProfileReposts from "./self-profile-reposts";

type TabType = "posts" | "reposts" | "bookmarks";

export default function SelfProfile() {
  const router = useRouter();
  const { data: session, isLoading, error } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>("posts");

  if (isLoading) {
    // You might want a nice loading skeleton here later
    return (
      <div className="flex h-[50vh] w-full items-center justify-center text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  if (error || !session) {
    router.push("/");
    return null;
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: "posts", label: "Posts" },
    // { id: "reposts", label: "Reposts" },
    { id: "bookmarks", label: "Bookmarks" },
  ];

  return (
    <div className="w-full min-h-screen pb-20">
      <div className="sticky top-0 z-10 border-b border-border">
        <nav className="flex gap-3 w-full ">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="group relative flex items-center justify-center p-4 hover:bg-secondary/1 transition-colors cursor-pointer"
              >
                <span
                  className={cn(
                    "text-sm relative z-10 transition-all duration-200",
                    isActive
                      ? "font-bold text-secondary"
                      : "font-medium text-foreground-secondary group-hover:text-foreground"
                  )}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* CONTENT AREA */}
      <div className="w-full">
        {activeTab === "posts" && (
          <div className="animate-in fade-in duration-300">
            <SelfProfilePosts />
          </div>
        )}

        {/* {activeTab === "reposts" && (
          <div className="animate-in fade-in duration-300">
            <SelfProfileReposts />
          </div>
        )} */}

        {activeTab === "bookmarks" && (
          <div className="animate-in fade-in duration-300">
            <SelfProfileBookmarks />
          </div>
        )}
      </div>
    </div>
  );
}
