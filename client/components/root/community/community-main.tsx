"use client";

import React, { useState } from "react";
import { Users, Grid3X3, MessageSquare, Filter, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Input } from "@/components/ui/input";

import { Community } from "@/types/community";
import { useGetPosts } from "@/lib/hooks/posts/useGetPosts";
import { FullSizeError } from "../common/section-error-loading";
import SinglePost from "../home/single-post";

// Mock data for demonstration

export default function CommunityMain({ community }: { community: Community }) {
  const [activeTab, setActiveTab] = useState("feed");
  const [searchQuery, setSearchQuery] = useState("");
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

  if (isLoading) {
    return <div>LOaindg</div>;
  }

  if (error) {
    return <FullSizeError />;
  }

  return (
    <div className="size-full">
      <div className="w-full mx-auto relative">
        <Card className="border">
          <CardContent className="">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full sm:w-auto grid-cols-3">
                <TabsTrigger value="feed" className="gap-2">
                  <Grid3X3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Feed</span>
                </TabsTrigger>
                <TabsTrigger value="posts" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">About</span>
                </TabsTrigger>
                <TabsTrigger value="members" className="gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Members</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="feed" className="space-y-6 mt-0 w-full lg:w-[65%] 2xl:w-[40%]">
                {postsData?.posts.map((post) => (
                  <SinglePost postData={post} key={post.id} />
                ))}
              </TabsContent>

              <TabsContent value="members" className="mt-0">
                Show Members Here
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
