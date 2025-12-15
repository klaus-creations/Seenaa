"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  useFollowUser,
  useUnfollowUser,
  useGetFollowStatus,
} from "@/lib/hooks/follow/useFollow";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  followerId: string;
  followingId: string;
  className?: string;
}

export default function FollowButton({
  followerId,
  followingId,
  className,
}: FollowButtonProps) {
  const router = useRouter();

  const { data: status, isLoading: isLoadingStatus } =
    useGetFollowStatus(followingId);

  const { mutate: follow, isPending: isFollowPending } = useFollowUser();
  const { mutate: unfollow, isPending: isUnfollowPending } = useUnfollowUser();

  const isLoadingAction = isFollowPending || isUnfollowPending;
  const isFollowing = status?.isFollowing;

  if (followerId === followingId) return null;

  const handleFollowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!followerId) {
      router.push("/login");
      return;
    }

    isFollowing
      ? unfollow({ targetUserId: followingId })
      : follow({ targetUserId: followingId });
  };

  if (isLoadingStatus) {
    return (
      <Button disabled size="sm" className={className}>
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex rounded-md p-0.5",
        "bg-linear-to-r from-primary to-secondary",
        className
      )}
    >
      <Button
        onClick={handleFollowClick}
        disabled={isLoadingAction}
        size="sm"
        className={cn(
          "bg-background hover:bg-background/90",
          "border-none",
          "text-primary",
          "transition-all"
        )}
      >
        {isLoadingAction ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isFollowing ? (
          "Following"
        ) : (
          "Follow"
        )}
      </Button>
    </div>
  );
}
