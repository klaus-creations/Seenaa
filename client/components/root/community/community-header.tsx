"use client";
import { Users, Settings } from "lucide-react";

import Image from "next/image";
import { Community } from "@/types/community";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CommunityHeaderProps {
  community: Community;
}

export const CommunityHeader = ({ community }: CommunityHeaderProps) => {
  const isCreator = community.currentUser?.role === "creator";

  return (
    <div className="w-full  shadow-sm">
      {/* Banner */}
      <div className="h-32 w-full bg-linear-to-r from-primary/10 to-secondary/20 sm:h-48 rounded-lg relative">
        {community.banner && (
          <Image
            width={500}
            height={500}
            src={community.banner}
            alt="Banner"
            className="h-full w-full object-cover"
          />
        )}

        {isCreator && (
          <button className="text-foreground absolute top-6 right-6">
            <Link href={`/home/community/${community.slug}/settings`}>
              <Settings size={24} />
            </Link>
          </button>
        )}
      </div>

      <div className="w-full mx-auto px-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
          <div className="size-10 lg:szie-10 rounded-2xl border-4   shadow-md sm:-mt-12 sm:h-32 sm:w-32">
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-primary">
              <Image
                alt="badge"
                width={40}
                height={40}
                src={
                  community.avatar ||
                  "/images/community-profile-placeholder.png"
                }
                className="size-[80%] rounded-xl object-cover"
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pb-1">
            <h1 className="text-2xl font-bold">{community.name}</h1>
            <p className="text-sm text-gray-500">c/{community.slug}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant={"btn"} className="rounded-full">
              <Link href={`/home/community/${community.slug}/new`}>
                New Post
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-6 flex gap-6 text-sm text-foreground-tertiary">
          <div className="flex items-center gap-1">
            <Users size={18} />
            <span className="font-semibold">{community.memberCount}</span>{" "}
            members
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span>{community.isPrivate ? "Private" : "Public"} Group</span>
          </div>
        </div>
      </div>
    </div>
  );
};
