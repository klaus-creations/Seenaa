"use client";

import React from "react";
import Link from "next/link";
import { useCommunitySuggestions } from "@/lib/hooks/search/useSearch"; // Adjust path
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

export default function CommunityRecommendations() {
  const { data: communities, isLoading } = useCommunitySuggestions();

  return (
    <div className="w-full h-[50%] flex flex-col gap-4 py-4">
      <div className="w-full h-[10%] flex items-end justify-between">
        <h3 className="text-lg text-foreground-secondary">
          Communities To Join
        </h3>

        <Link
          href={"/home/community"}
          className="text-sm underline text-foreground-tertiary"
        >
          Discover More
        </Link>
      </div>

      <div className="flex flex-col w-full h-[90%]">
        {isLoading ? (
          <RecommendationSkeleton />
        ) : (
          communities?.slice(0, 5).map((community) => (
            <Link
              key={community.id}
              href={`/home/community/${community.slug}`}
              className="flex items-center justify-between p-2 rounded-2xl hover:bg-secondary/40 transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-11 w-11 rounded-xl border-none">
                  <AvatarImage
                    src={
                      community.avatar || "/images/community-placeholder.png"
                    }
                    alt={community.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="rounded-xl bg-primary/5 text-primary text-xs font-bold">
                    {community.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-[15px] truncate group-hover:underline decoration-1">
                    {community.name}
                  </span>
                  <div className="flex items-center gap-1 text-muted-foreground text-[12px]">
                    <Users className="w-3.5 h-3.5" />
                    <span>
                      {community.memberCount.toLocaleString()} members
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="rounded-full font-bold h-8 px-4 border-primary/20 hover:border-primary hover:bg-primary hover:text-white transition-all ml-2"
              >
                Join
              </Button>
            </Link>
          ))
        )}

        {!isLoading && communities?.length === 0 && (
          <div className="size-full flex items-center justify-center">
            <p className="text-sm text-muted-foreground">
              No new suggestions found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function RecommendationSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 px-1 py-1"
        >
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}
