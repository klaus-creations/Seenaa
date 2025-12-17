"use client";

import React from "react";
import {
  Shield,
  Ban,
  MoreVertical,
  CheckCircle2,
  MapPin,
  MessageSquare,
  Users,
  CalendarDays,
  ShieldAlert,
} from "lucide-react";
import { format } from "date-fns";

// Hooks & Types
import {
  useGetCommunityMembers,
  useBanMember,
  useUpdateMemberRole,
} from "@/lib/hooks/community/useCommunity";
import { Community } from "@/types/community";

// Components
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import FollowButton from "@/components/root/common/follow-button"; // Adjust path if needed
import { useSession } from "@/lib/hooks/auth/useGetSession";

// NOTE: Replace this with your actual auth hook to get the current user's ID

interface Props {
  community: Community;
}

export default function MembersRolesAllMembersSettings({ community }: Props) {
  // 1. Get Current User ID (Required for Follow Button)
  const { data: session } = useSession();
  const currentUserId = session?.user?.id || "";

  // 2. Data Fetching
  const { data: members, isLoading } = useGetCommunityMembers(community.id, "all");
  const { mutate: banMember } = useBanMember();
  const { mutate: updateRole } = useUpdateMemberRole();

  // 3. Handlers
  const handleBan = (userId: string, userName: string) => {
    const reason = window.prompt(`Reason for banning ${userName}?`);
    if (reason) {
      banMember({ communityId: community.id, userId, data: { reason } });
    }
  };

  const handlePromote = (userId: string, currentRole: string) => {
    const isPromoting = currentRole === "member";
    const newRole = isPromoting ? "admin" : "member";
    const action = isPromoting ? "Promote to Admin" : "Demote to Member";

    if (window.confirm(`Are you sure you want to ${action}?`)) {
      updateRole({
        communityId: community.id,
        userId,
        data: {
          role: newRole,
          permissions: isPromoting
            ? { canManageMembers: true, canDeletePosts: true }
            : {},
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-gray-500">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p>Loading community members...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="flex justify-between items-end border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Community Members</h3>
          <p className="text-sm text-gray-500 mt-1">
            View and manage all active users.
          </p>
        </div>
        <div className="flex items-center gap-2">
           <Badge variant="secondary" className="px-3 py-1 text-sm">
             Total: {members?.length || 0}
           </Badge>
        </div>
      </div>

      {/* Modern Table List */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="py-4 pl-6 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                User Profile
              </th>
              <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 hidden md:table-cell">
                Stats
              </th>
              <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Role
              </th>
              <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 hidden lg:table-cell">
                Joined
              </th>
              <th className="relative py-4 pl-3 pr-6 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {members?.map((member) => {
              const user = member.user;
              if (!user) return null; // Safety check

              return (
                <tr
                  key={member.id}
                  className="group transition-colors hover:bg-gray-50/60"
                >
                  {/* USER INFO */}
                  <td className="py-4 pl-6 pr-3">
                    <div className="flex items-start gap-4">
                      {/* Avatar with Online Status */}
                      <div className="relative">
                        <Avatar className="h-10 w-10 border border-gray-200">
                          <AvatarImage src={user.image} alt={user.name} />
                          <AvatarFallback className="bg-indigo-50 text-indigo-600 font-bold">
                            {user.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {user.isOnline && (
                          <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-gray-900 truncate">
                            {user.name}
                          </span>
                          {user.isVerified && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 fill-blue-500/10" />
                          )}
                        </div>

                        <div className="text-xs text-gray-500 truncate flex items-center gap-2">
                          <span>@{user.username}</span>
                          {user.country && (
                            <>
                              <span className="w-0.5 h-0.5 rounded-full bg-gray-300"></span>
                              <span className="flex items-center gap-0.5">
                                <MapPin className="w-3 h-3" /> {user.country}
                              </span>
                            </>
                          )}
                        </div>

                        {user.bio && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-1 max-w-[200px]">
                            {user.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* STATS */}
                  <td className="px-3 py-4 hidden md:table-cell">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center text-xs text-gray-600" title="Followers">
                        <Users className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                        {user.followerCount}
                      </div>
                      <div className="flex items-center text-xs text-gray-600" title="Posts">
                        <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                        {user.postsCount}
                      </div>
                    </div>
                  </td>

                  {/* ROLE BADGE */}
                  <td className="px-3 py-4">
                    <Badge
                      variant="outline"
                      className={`
                        capitalize font-medium shadow-none
                        ${member.role === 'creator'
                          ? 'border-purple-200 bg-purple-50 text-purple-700'
                          : member.role === 'admin'
                          ? 'border-blue-200 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-gray-50 text-gray-600'}
                      `}
                    >
                      {member.role}
                    </Badge>
                  </td>

                  {/* JOINED DATE */}
                  <td className="px-3 py-4 hidden lg:table-cell">
                    <div className="flex items-center text-xs text-gray-500">
                      <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                      {format(new Date(member.joinedAt), "MMM d, yyyy")}
                    </div>
                  </td>

                  {/* ACTIONS */}
                  <td className="py-4 pl-3 pr-6 text-right">
                    <div className="flex items-center justify-end gap-3">

                      {/* Follow Button */}
                      <div className="w-24 flex justify-end">
                        <FollowButton
                          followerId={currentUserId}
                          followingId={user.id}
                        />
                      </div>

                      {/* Admin Actions Dropdown (Only if not Creator) */}
                      {member.role !== 'creator' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-700">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {member.role !== 'admin' ? (
                              <DropdownMenuItem
                                onClick={() => handlePromote(member.userId, member.role)}
                                className="text-indigo-600 focus:text-indigo-700 cursor-pointer"
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Promote to Admin
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handlePromote(member.userId, member.role)}
                                className="text-orange-600 focus:text-orange-700 cursor-pointer"
                              >
                                <ShieldAlert className="mr-2 h-4 w-4" />
                                Demote to Member
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                              onClick={() => handleBan(member.userId, user.name)}
                              className="text-red-600 focus:text-red-700 cursor-pointer focus:bg-red-50"
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Ban User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {members?.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Users className="h-10 w-10 mb-3 text-gray-300" />
                    <p className="text-sm font-medium">No members found</p>
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
