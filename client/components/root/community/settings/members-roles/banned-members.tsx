"use client";

import React from "react";
import { format } from "date-fns";
import {
  Undo2,
  Ban,
  UserX,
  Calendar,
  AlertCircle
} from "lucide-react";

// Hooks & Types
import {
  useGetCommunityMembers,
  useUpdateMemberRole
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

interface Props {
  community: Community;
}

export default function MembersRolesBannedMembersSettings({ community }: Props) {
  const { data: bannedMembers, isLoading } = useGetCommunityMembers(community.id, "banned");
  const { mutate: updateRole, isPending: isUpdating } = useUpdateMemberRole();

  const handleUnban = (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to unban ${userName} and restore them as a member?`)) {
      updateRole({
        communityId: community.id,
        userId,
        data: { role: "member", permissions: {} },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-gray-500">
        <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
        <p>Loading banned users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="flex justify-between items-end border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <UserX className="w-5 h-5 text-red-600" />
            Banned Users
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Users who have been revoked access to the community.
          </p>
        </div>
        <div className="flex items-center gap-2">
           <Badge variant="destructive" className="px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 border-red-200">
             Banned: {bannedMembers?.length || 0}
           </Badge>
        </div>
      </div>

      {/* Modern Table List */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="py-4 pl-6 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                User
              </th>
              <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Ban Reason
              </th>
              <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 hidden md:table-cell">
                Banned Date
              </th>
              <th className="relative py-4 pl-3 pr-6 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {bannedMembers?.map((member) => {
              const user = member.user;
              if (!user) return null;

              return (
                <tr
                  key={member.id}
                  className="group transition-colors hover:bg-red-50/10"
                >
                  {/* USER INFO */}
                  <td className="py-4 pl-6 pr-3">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 border border-gray-200 grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                        <AvatarImage src={user.image || ""} alt={user.name} />
                        <AvatarFallback className="bg-red-50 text-red-600 font-bold">
                          {user.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-900 truncate">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* BAN REASON */}
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span className="text-sm text-gray-700 italic line-clamp-1 max-w-[250px]">
                        {member.banReason || "No specific reason provided"}
                      </span>
                    </div>
                  </td>

                  {/* DATE */}
                  <td className="px-3 py-4 hidden md:table-cell">
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                      {member.bannedAt
                        ? format(new Date(member.bannedAt), "MMM d, yyyy")
                        : "Unknown"}
                    </div>
                  </td>

                  {/* ACTIONS */}
                  <td className="py-4 pl-3 pr-6 text-right">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isUpdating}
                            onClick={() => handleUnban(member.userId, user.name)}
                            className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                          >
                            <Undo2 className="w-4 h-4 mr-2" />
                            Revoke Ban
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Restore membership access</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                </tr>
              );
            })}

            {bannedMembers?.length === 0 && (
              <tr>
                <td colSpan={4} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
                      <Ban className="h-6 w-6 text-green-500" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900">All Clear</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      There are no banned users in this community.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
