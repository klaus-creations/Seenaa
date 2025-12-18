
"use client";

import { Users, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Community } from "@/types/community";
import { Button } from "@/components/ui/button";

interface CommunityHeaderProps {
  community: Community;
}

export const CommunityHeader = ({ community }: CommunityHeaderProps) => {
  const isCreator = community.currentUser?.role === "creator";
  const hasBanner = Boolean(community.banner);

  return (
    <div className="w-full shadow-sm h-[65%] md:h-[50%]  xl:h-[45%]">
      <div className="relative rounded-xl p-[2px] bg-gradient-to-r from-primary/45 to-secondary/50 dark:from-primary/2 dark:to-secondary/3 bg-background-secondary">
        <div className="relative h-32 sm:h-48 rounded-[10px] overflow-hidden bg-background flex items-center justify-center">
          {hasBanner ? (
            <Image
              src={community?.banner || ""}
              alt="Banner"
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="text-center px-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground-secondary">
                Community
              </h1>
            </div>
          )}
        </div>
      </div>

      <div className="w-full mx-auto">
        <div className="flex rounded-xl flex-col gap-4 sm:flex-row sm:items-end">
          <div className="relative sm:-mt-12 flex-shrink-0">
            <div className="p-[4px] bg-gradient-tor from-primary to-secondary shadow-md rounded-xl">
              <div className="h-24 w-24 sm:h-32 sm:w-32 bg-background rounded-xl flex items-center justify-center rouned-xl">
                <Image
                  alt="badge"
                  width={500}
                  height={500}
                  src={
                    community.avatar ||
                    "/images/choose-us.jpg"
                  }
                  className="size-full object-cover rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 pb-1">
            <h1 className="text-2xl font-bold">{community.name}</h1>
            <p className="text-sm text-foreground-tertiary">
              c/{community.slug}
            </p>

            <p className="mt-2 max-w-xl text-sm text-foreground/80">
              {community.description || (
                <span className="italic text-foreground-secondary">
                  No description provided for this community.
                </span>
              )}
            </p>
          </div>

          {/* Action */}
          <div className="flex gap-2">
                        {isCreator && (
            <Link
              href={`/home/community/${community.slug}/settings`}
              className=" rounded-full bg-background/70 backdrop-blur-md p-2 shadow hover:bg-background transition z-10"
            >
              <Settings size={20} />
            </Link>
          )}

            <Button variant="btn" className="rounded-full mr-4">
              <Link href={`/home/community/${community.slug}/new`}>
                New Post
              </Link>
            </Button>

          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-6 text-sm text-foreground-tertiary">
          <div className="flex items-center gap-1">
            <Users size={18} />
            <span className="font-semibold">{community.memberCount}</span>
            members
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                community.isPrivate ? "bg-yellow-500" : "bg-green-500"
              }`}
            />
            <span>
              {community.isPrivate ? "Private" : "Public"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

