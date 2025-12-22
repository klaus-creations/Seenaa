"use client";

import React from "react";
import { useGetMe } from "@/lib/hooks/users/useUsers";
import { MapPin, CalendarDays, Settings } from "lucide-react";

// Shadcn UI Imports
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import ShowFollowers from "../follow/get-followers";
import ShowFollowing from "../follow/show-followings";

export default function SelfProfileView() {
  const { data: user, isLoading, error } = useGetMe();

  if (isLoading) return <ProfileSkeleton />;

  if (error || !user) {
    return (
      <div className="flex h-40 w-full items-center justify-center rounded-xl border border-dashed text-muted-foreground">
        <p className="text-sm">Profile unavailable</p>
      </div>
    );
  }

  const initials =
    user.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";
  const location = [user.city, user.country].filter(Boolean).join(", ");

  return (
    <div className="w-full  mx-auto px-4 py-6">
      <div className="flex items-start justify-between mb-4">
        <Avatar className="h-20 w-20 md:h-32 md:w-32  shadow-sm">
          <AvatarImage
            src={user.image || "/images/placeholder.jpg"}
            alt={user.name}
            className="object-cover"
          />
          <AvatarFallback className="text-xl bg-secondary">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="rounded-full font-semibold px-6 hidden md:flex"
          >
            <Link href={"/home/edit-profile"}>Edit profile</Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full md:hidden"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="">
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">
          {user.name}
        </h1>
        <p className="text-foreground-tertiary text-[15px]">
          {user.displayUsername || user.username}
        </p>
      </div>

      <p className="text-[15px] leading-normal whitespace-pre-wrap text-foreground-secondary">
        {user.bio || "No bio yet."}
      </p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-[14px] text-foreground-tertiary">
        {location && (
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-foreground-tertiary">
          <CalendarDays className="w-4 h-4" />
          <span>
            Joined{" "}
            {new Date(user.createdAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Stats Section */}
      <div className="flex items-center gap-5 mt-4">
        <ShowFollowing count={user.followingCount} userId={user.id} />
        <ShowFollowers count={user.followerCount} userId={user.id} />
        <div className="flex gap-1 items-center">
          <span className="font-bold text-[15px]">{user.postsCount || 0}</span>
          <span className="text-muted-foreground text-[15px]">Posts</span>
        </div>
      </div>

      {/* Mobile-only Edit Button (Matches Instagram style) */}
      <Button
        variant="outline"
        className="w-full mt-6 rounded-lg font-bold md:hidden"
      >
        Edit profile
      </Button>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <Skeleton className="h-20 w-20 md:h-32 md:w-32 rounded-full" />
        <Skeleton className="h-10 w-28 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex gap-4 mt-6">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
  );
}
