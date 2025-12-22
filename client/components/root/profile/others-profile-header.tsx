"use client";

import React from "react";
import { useSession } from "@/lib/hooks/auth/useGetSession";
import { useGetUserProfile } from "@/lib/hooks/users/useUsers";
import { MapPin, CalendarDays, MoreHorizontal } from "lucide-react";
import FollowButton from "../common/follow-button";

// Shadcn UI Imports
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Custom Components
import ShowFollowers from "../follow/get-followers";
import ShowFollowing from "../follow/show-followings";

interface OthersProfileViewProps {
  username: string;
}

export default function OthersProfileView({
  username,
}: OthersProfileViewProps) {
  const { data: session } = useSession();
  const { data: user, isLoading, error } = useGetUserProfile(username);

  if (isLoading) return <ProfileSkeleton />;

  if (error || !user) {
    return (
      <div className="flex h-40 w-full items-center justify-center rounded-xl border border-dashed text-muted-foreground">
        <p className="text-sm">Profile not found or unavailable</p>
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
    <div className="w-full mx-auto px-4 py-6">
      {/* Header: Avatar and Follow Actions */}
      <div className="flex items-start justify-between mb-4">
        <Avatar className="h-20 w-20 md:h-32 md:w-32 shadow-sm border-none">
          <AvatarImage
            src={user.image || "/images/placeholder.jpg"}
            alt={user.name}
            className="object-cover"
          />
          <AvatarFallback className="text-xl bg-secondary text-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex gap-2">
          {/* Options Button (Modern Extra) */}
          <Button variant="outline" size="icon" className="rounded-full">
            <MoreHorizontal className="w-4 h-4" />
          </Button>

          {/* Follow Button (Desktop) */}
          {session?.user?.id && session.user.id !== user.id && (
            <div className="hidden md:block">
              <FollowButton
                followingId={user.id}
                followerId={session.user.id}
              />
            </div>
          )}
        </div>
      </div>

      {/* Profile Identity */}
      <div className="space-y-1">
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">
          {user.name}
        </h1>
        <p className="text-foreground-tertiary text-[15px]">
          @{user.displayUsername || user.username}
        </p>
      </div>

      {/* Bio */}
      <div className="mt-3">
        <p className="text-[15px] leading-normal whitespace-pre-wrap text-foreground-secondary">
          {user.bio || "No bio yet."}
        </p>
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-[14px] text-foreground-tertiary">
        {location && (
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
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

      {/* Stats Section (Integrated with your cool Dialogs) */}
      <div className="flex items-center gap-5 mt-4">
        <ShowFollowing count={user.followingCount} userId={user.id} />
        <ShowFollowers count={user.followerCount} userId={user.id} />
        <div className="flex gap-1 items-center">
          <span className="font-bold text-[15px]">{user.postsCount || 0}</span>
          <span className="text-muted-foreground text-[15px]">Posts</span>
        </div>
      </div>

      {/* Follow Button (Mobile only) */}
      {session?.user?.id && session.user.id !== user.id && (
        <div className="md:hidden mt-6">
          <FollowButton
            followingId={user.id}
            followerId={session.user.id}
            // Add a className prop to your FollowButton to allow "w-full" on mobile
          />
        </div>
      )}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <Skeleton className="h-20 w-20 md:h-32 md:w-32 rounded-full" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <div className="flex gap-4 mt-6">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
  );
}
