"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types/user";
import { BadgeCheck } from "lucide-react";
import Link from "next/link";
import FollowButton from "./follow-button";
import { useSession } from "@/lib/hooks/auth/useGetSession";

export function UserItem({ user }: { user: User }) {
  const { data: session, isLoading, error } = useSession();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="flex items-start justify-between py-4 transition-colors border-b">
      <Link
        href={`/home/people/${user.username}`}
        className="flex gap-3 flex-1 group"
      >
        <Avatar className="h-10 w-10 border">
          <AvatarImage
            src={user.image || "/images/profile-placeholder.svg"}
            alt={user.name}
          />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="font-bold text-[15px] group-hover:underline underline-offset-2">
              {user.name}
            </span>
            {user.isVerified && (
              <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500" />
            )}
          </div>
          <span className="text-muted-foreground text-sm">
            {user.followerCount} Followers
          </span>
          <p className="text-[14px] text-foreground/80 line-clamp-1 mt-0.5 max-w-[200px] md:max-w-[300px]">
            {user.bio}
          </p>
        </div>
      </Link>

      <FollowButton followerId={session?.user.id} followingId={user.id} />
    </div>
  );
}
