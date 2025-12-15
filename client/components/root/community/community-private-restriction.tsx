import React from "react";
import { Lock, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Community } from "@/types/community";
import JoinCommunityButton from "./join-community-btn";

interface CommunityRestricionPageProps {
  community: Community;
}

export default function CommunityRestricionPage({
  community,
}: CommunityRestricionPageProps) {
  const isPrivate = community.isPrivate;
  const isMember = community.currentUser?.isMember;

  return (
    <div className="w-full min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-xl w-full rounded-2xl border bg-background shadow-sm p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>

          <div className="flex-1">
            <h1 className="text-lg font-semibold leading-none">
              {community.name}
            </h1>
            <p className="text-sm text-muted-foreground">/{community.slug}</p>
          </div>
        </div>

        {/* Description */}
        {community.description && (
          <p className="text-sm text-muted-foreground">
            {community.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{community.memberCount} members</span>
          </div>

          <div className="text-muted-foreground">
            {community.postCount} posts
          </div>
        </div>

        {!isMember && (
          <div
            className={`rounded-xl border bg-linear-to-r from-primary/4 ${
              isPrivate ? "to-red-600/10" : "to-green-500/10"
            } p-4 text-sm`}
          >
            {isPrivate ? (
              <>
                <p className="font-medium">This community is private</p>
                <p className="text-muted-foreground mt-1">
                  You need to send a join request to access posts and
                  participate.
                  {community?.requireApproval &&
                    " Your request must be approved by a moderator."}
                </p>
              </>
            ) : (
              <>
                <p className="font-medium">This is a public community</p>
                <p className="text-muted-foreground mt-1">
                  Join this community to see posts, interact with members, and
                  participate in discussions.
                </p>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <Link
            href="/communities"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to communities
          </Link>

          {!isMember && <JoinCommunityButton community={community} />}
        </div>
      </div>
    </div>
  );
}
