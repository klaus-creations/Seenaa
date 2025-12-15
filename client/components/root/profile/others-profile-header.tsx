"use client";

import React from "react";
import { useSession } from "@/lib/hooks/auth/useGetSession";
import { useGetUserProfile } from "@/lib/hooks/users/useUsers";
import { MapPin, CalendarDays } from "lucide-react";
import FollowButton from "../common/follow-button";

// Shadcn UI Imports
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface OthersProfileViewProps {
  username: string;
}

export default function OthersProfileView({
  username,
}: OthersProfileViewProps) {
  const { data: session } = useSession();
  const { data: user, isLoading, error } = useGetUserProfile(username);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !user) {
    return (
      <div className="flex h-40 w-full items-center justify-center rounded-lg border border-dashed text-muted-foreground">
        <p>Failed to load profile data.</p>
      </div>
    );
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const location = [user.city, user.country].filter(Boolean).join(", ");
  console.log(user?.id);
  console.log(session?.user?.id);

  return (
    <div className="w-full overflow-hidden py-7">
      <div className="w-full flex justify-between items-start">
        <div className="flex items-start gap-5 w-full">
          {/* Avatar Section */}
          <div className="flex flex-col items-start gap-2">
            <Avatar className="size-24 lg:size-32 shadow-md">
              <AvatarImage
                src={user.image || "/images/placeholder.jpg"}
                alt={user.name}
                className="object-cover"
              />
              <AvatarFallback className="text-2xl md:text-3xl bg-blue-100 text-blue-700 font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-xl md:text-2xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground font-medium">
              {user.displayUsername || user.username}
            </p>
          </div>

          {/* Info Section */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 flex-1">
            <div className="space-y-1 w-full">
              <p className="max-w-xl text-sm md:text-base">
                {user.bio || "No Bio Yet."}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
                {location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <CalendarDays className="w-4 h-4" />
                  <span>
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Follow */}
              {session?.user?.id && (
                <div className="mt-5 hidden md:flex gap-3">
                  <FollowButton
                    followingId={user.id}
                    followerId={session.user.id}
                  />
                </div>
              )}
            </div>

            {/* Mobile Buttons */}
            {session?.user?.id && (
              <div className="md:hidden mt-4 w-full">
                <Button className="flex items-center gap-2 w-full">
                  Follow
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator className="my-2 lg:my-3" />

      {/* Stats Section */}
      <div className="flex items-center gap-3 lg:gap-5">
        <div className="flex gap-1 items-center cursor-pointer hover:opacity-80 transition-opacity">
          <span className="text-xs font-bold uppercase tracking-wider">
            {user.postsCount}
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Posts
          </span>
        </div>
        <div className="flex gap-1 items-center cursor-pointer hover:opacity-80 transition-opacity">
          <span className="text-xs font-bold uppercase tracking-wider">
            {user.followerCount}
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Followers
          </span>
        </div>
        <div className="flex gap-1 items-center cursor-pointer hover:opacity-80 transition-opacity">
          <span className="text-xs font-bold uppercase tracking-wider">
            {user.followingCount}
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Following
          </span>
        </div>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="w-full overflow-hidden border-none shadow-sm py-7">
      <div className="flex gap-5">
        <Skeleton className="h-24 w-24 md:h-32 md:w-32 rounded-full" />
        <div className="space-y-3 w-full">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-16 w-full max-w-md" />
          <div className="flex gap-4 pt-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}
