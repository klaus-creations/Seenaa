"use client";

import React from "react";
import Image from "next/image";
import { usePeopleSuggestions } from "@/lib/hooks/search/useSearch";
import FollowButton from "../common/follow-button";
import { useSession } from "@/lib/hooks/auth/useGetSession";
import Link from "next/link";

export default function PeopleRecommendations() {
  const { data, isLoading, isError } = usePeopleSuggestions();
  const { data: session, isLoading: sessionIsLoading } = useSession();
  console.log("this is suggestions", data);

  if (isLoading || sessionIsLoading) {
    console.log("Loading");
  }

  return (
    <div className="w-full h-[50%] flex flex-col gap-4 py-4">
      <div className="w-full flex items-end justify-between">
        <h3 className="text-lg text-foreground-secondary">People To Follow</h3>

        <Link
          href={"/home/people"}
          className="text-sm underline text-foreground-tertiary"
        >
          Discover More
        </Link>
      </div>

      {isLoading && (
        <div className="text-sm text-muted-foreground">
          Loading people suggestions...
        </div>
      )}

      {isError && (
        <div className="text-sm text-destructive">
          Failed to load people suggestions
        </div>
      )}

      {!isLoading && !data?.people?.length && (
        <div className="text-sm text-muted-foreground">
          No people suggestions available
        </div>
      )}

      <div className="flex flex-col gap-3 overflow-y-auto">
        {data?.people?.map((person) => (
          <div
            key={person.id}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition"
          >
            <div className="relative size-8 xl:size-9 rounded-full overflow-hidden bg-muted">
              <Image
                src={person.image || "/images/profile-placeholder.svg"}
                alt={person.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="font-medium truncate">{person.name}</p>
                {person.isVerified && (
                  <span className="text-primary text-xs">✔</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {person.followerCount} followers
              </p>
            </div>

            <div className="text-xs text-muted-foreground text-right">
              <FollowButton
                followingId={person?.id}
                followerId={session?.user.id}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
