
"use client";

import React, { useState } from "react";
import { Grid3X3, MessageSquare } from "lucide-react";

import { Community } from "@/types/community";
import { useGetPosts } from "@/lib/hooks/posts/useGetPosts";
import { FullSizeError, FullSizeLoader } from "../common/section-error-loading";
import SinglePost from "../home/single-post";
import CommunityAbout from "./community-about";

export default function CommunityMain({ community }: { community: Community }) {
  const [activeTab, setActiveTab] = useState<"feed" | "about">("feed");

  const {
    data: postsData,
    isLoading,
    error,
  } = useGetPosts({
    communityId: community?.id,
    feedType: "for_you",
    limit: 20,
    page: 1,
  });

  if (isLoading) return <FullSizeLoader />;
  if (error) return <FullSizeError />;

  return (
    <div className="relative w-full  min-h-[35vh] md:min-h-[50vh] xl:min-h-[55vh]">
      {/* large screen sizes */}
      <div className="hidden lg:flex gap-6 w-full">
        <div className="space-y-6 lg:w-[65%] 2xl:w-[50%]">
          {postsData?.posts.map((post) => (
            <SinglePost postData={post} key={post.id} />
          ))}
        </div>

        <aside className="lg:w-[30%] 2xl:w-[45%] shrink-0 ">
          <div className="sticky  top-0 rounded-lg border bg-background p-4">
            <CommunityAbout community={community} />
          </div>
        </aside>
      </div>

      <div className="lg:hidden px-4">
        <div className="flex border-b mb-4">
          <button
            onClick={() => setActiveTab("feed")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 border-b-2 ${
              activeTab === "feed"
                ? "border-blue-500 font-semibold"
                : "border-transparent text-muted-foreground"
            }`}
          >
            <Grid3X3 className="h-4 w-4" />
            Posts
          </button>

          <button
            onClick={() => setActiveTab("about")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 border-b-2 ${
              activeTab === "about"
                ? "border-blue-500 font-semibold"
                : "border-transparent text-muted-foreground"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            About
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "feed" && (
          <div className="space-y-6">
            {postsData?.posts.map((post) => (
              <SinglePost postData={post} key={post.id} />
            ))}
          </div>
        )}

        {activeTab === "about" && (
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-2">About</h3>
            <div>Show About Content Here</div>
          </div>
        )}
      </div>
    </div>
  );
}

