"use client";

import React from "react";
import { format } from "date-fns";
import { Undo2, Ban, UserX, Calendar, AlertCircle } from "lucide-react";

// Hooks & Types
import {
  useGetCommunityMembers,
  useUpdateMemberRole,
} from "@/lib/hooks/community/useCommunity";
import { Community } from "@/types/community";

// Components
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FullSizeLoader } from "@/components/root/common/section-error-loading";

interface Props {
  community: Community;
}

export default function MembersRolesBannedMembersSettings({
  community,
}: Props) {
  const { data: bannedMembers, isLoading } = useGetCommunityMembers(
    community.id,
    "banned"
  );
  const { mutate: updateRole, isPending: isUpdating } = useUpdateMemberRole();

  const handleUnban = (userId: string, userName: string) => {
    if (
      window.confirm(
        `Are you sure you want to unban ${userName} and restore them as a member?`
      )
    ) {
      updateRole({
        communityId: community.id,
        userId,
        data: { role: "member", permissions: {} },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="size-full">
        <FullSizeLoader />
      </div>
    );
  }

  return (
    <div className="size-full">
      <div className="flex items-start justify-between border-b  h-[10%] ">
        <div className="h-full flex flex-col justify-start">
          <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center">
            Banned Users
          </h3>
          <p className="text-sm text-foreground-tertiary mt-1">
            Access-revoked users. You can restore their access at any time.
          </p>
        </div>
        <Badge
          variant="outline"
          className="h-7 px-3 text-destructive border-destructive/20 bg-destructive/5 font-bold rounded-full"
        >
          {bannedMembers?.length || 0} Banned
        </Badge>
      </div>

      <div className="h-[90%] flex flex-col">
        {bannedMembers?.map((member) => {
          const user = member.user;
          if (!user) return null;

          return (
            <div
              key={member.id}
              className="group flex flex-col md:flex-row md:items-center justify-between py-6 border-b last:border-0 hover:bg-destructive/[0.02] px-2 transition-colors -mx-2 rounded-xl"
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* Avatar (Grayscale to reflect banned status) */}
                <div className="relative shrink-0">
                  <Avatar className="h-12 w-12 grayscale opacity-70 border border-destructive/20 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                    <AvatarImage src={user.image || ""} alt={user.name} />
                    <AvatarFallback className="bg-destructive/10 text-destructive font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* User & Ban Info */}
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground truncate">
                      {user.name}
                    </span>
                    <span className="text-xs text-foreground-tertiary">
                      @{user.username}
                    </span>
                  </div>

                  {/* Ban Reason - Now integrated into the main info block */}
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-destructive font-medium italic">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span className="line-clamp-1 truncate">
                      {member.banReason || "No reason provided"}
                    </span>
                  </div>

                  {/* Banned Date Info */}
                  <div className="flex items-center gap-1 text-[11px] text-foreground-tertiary mt-2">
                    <Calendar className="w-3 h-3" />
                    <span>
                      Banned on{" "}
                      {member.bannedAt
                        ? format(new Date(member.bannedAt), "MMM d, yyyy")
                        : "Unknown date"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-end mt-4 md:mt-0 ml-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => handleUnban(member.userId, user.name)}
                        className="h-10 rounded-full text-primary hover:text-primary hover:bg-primary/10 font-bold px-4 transition-all"
                      >
                        <Undo2 className="w-4 h-4 mr-2" />
                        <span className="uppercase text-[11px] tracking-wider">
                          Revoke Ban
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-primary text-primary-foreground font-bold">
                      <p>Restore member access</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {bannedMembers?.length === 0 && (
          <div className="size-full flex flex-col items-center justify-center py-20 text-center">
            <p className="text-lg font-bold text-foreground">Clean Blacklist</p>
            <p className="text-sm text-foreground-tertiary max-w-xs mt-1">
              There are no banned users. Your community members are behaving
              well!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
