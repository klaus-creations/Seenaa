"use client";

import React, { useState } from "react";
import {
  Shield,
  Ban,
  MoreVertical,
  CheckCircle2,
  Users,
  CalendarDays,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";

import {
  useGetCommunityMembers,
  useBanMember,
  useUpdateMemberRole,
} from "@/lib/hooks/community/useCommunity";
import { Community } from "@/types/community";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FollowButton from "@/components/root/common/follow-button";
import { useSession } from "@/lib/hooks/auth/useGetSession";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FullSizeLoader } from "@/components/root/common/section-error-loading";

interface Props {
  community: Community;
}

interface PromoteDialogData {
  isOpen: boolean;
  userId: string;
  userName: string;
  currentRole: string;
}

interface BanDialogData {
  isOpen: boolean;
  userId: string;
  userName: string;
  reason: string;
}

export default function MembersRolesAllMembersSettings({ community }: Props) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id || "";

  const { data: members, isLoading } = useGetCommunityMembers(
    community.id,
    "all"
  );
  const { mutate: banMember } = useBanMember();
  const { mutate: updateRole } = useUpdateMemberRole();

  const [promoteDialog, setPromoteDialog] = useState<PromoteDialogData>({
    isOpen: false,
    userId: "",
    userName: "",
    currentRole: "",
  });

  const [banDialog, setBanDialog] = useState<BanDialogData>({
    isOpen: false,
    userId: "",
    userName: "",
    reason: "",
  });

  const handleBan = (userId: string, userName: string) => {
    setBanDialog({
      isOpen: true,
      userId,
      userName,
      reason: "",
    });
  };

  const confirmBan = () => {
    if (banDialog.reason.trim()) {
      banMember({
        communityId: community.id,
        userId: banDialog.userId,
        data: { reason: banDialog.reason.trim() },
      });
      setBanDialog({
        isOpen: false,
        userId: "",
        userName: "",
        reason: "",
      });
    }
  };

  const handlePromote = (
    userId: string,
    userName: string,
    currentRole: string
  ) => {
    setPromoteDialog({
      isOpen: true,
      userId,
      userName,
      currentRole,
    });
  };

  const confirmPromote = () => {
    const { userId, currentRole } = promoteDialog;
    const isPromoting = currentRole === "member";
    const newRole = isPromoting ? "admin" : "member";

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

    setPromoteDialog({
      isOpen: false,
      userId: "",
      userName: "",
      currentRole: "",
    });
  };

  const isPromoting = promoteDialog.currentRole === "member";
  const promoteActionText = isPromoting
    ? "Promote to Admin"
    : "Demote to Member";
  const userDisplayName = promoteDialog.userName || "this user";

  if (isLoading) {
    return (
      <div className="size-full">
        <FullSizeLoader />
      </div>
    );
  }

  return (
    <>
      <div className="size-full">
        {/* Header Info */}
        <div className="space-y-1 h-[10%]">
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            Community Members
          </h3>
          <p className="text-sm text-foreground-tertiary mt-1">
            {members?.length || 0} users are currently in this community.
          </p>
        </div>

        {/* Transparent List Layout */}
        <div className="flex flex-col">
          {members?.map((member) => {
            const user = member.user;
            if (!user) return null;

            return (
              <div
                key={member.id}
                className="flex items-center justify-between py-5 border-b last:border-0 hover:bg-accent/5 px-2 transition-colors -mx-2 rounded-lg"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="relative shrink-0">
                    <Avatar className="size-8 lg:size-10 border border-background">
                      <AvatarImage
                        src={user.image || "/images/profile-placeholder.svg"}
                        alt={user.name}
                      />
                      <AvatarFallback className="bg-primary/5 text-primary font-bold">
                        {user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {user.isOnline && (
                      <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
                    )}
                  </div>

                  {/* Info Column */}
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground-secondary truncate">
                        {user.name}
                      </span>
                      {user.isVerified && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 fill-blue-500/10" />
                      )}
                      <span className="text-xs text-foreground-tertiary hidden sm:inline">
                        •
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-secondary hidden sm:inline">
                        {member.role}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-foreground-tertiary mt-0.5">
                      <span>{user.username}</span>
                      <span className="w-1 h-1 rounded-full bg-foreground-tertiary/30" />
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {user.followerCount}
                      </div>
                      <div className="hidden md:flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        Joined {format(new Date(member.joinedAt), "MMM yyyy")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 sm:gap-4 ml-4">
                  <div className="hidden xs:block">
                    <FollowButton
                      followerId={currentUserId}
                      followingId={user.id}
                    />
                  </div>

                  {member.role !== "creator" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-foreground-tertiary"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-52 rounded-xl shadow-lg border"
                      >
                        <div className="px-2 py-1.5 text-[10px] font-bold text-foreground-tertiary uppercase tracking-wider">
                          Management
                        </div>
                        {member.role !== "admin" ? (
                          <DropdownMenuItem
                            onClick={() =>
                              handlePromote(
                                member.userId,
                                user.name,
                                member.role
                              )
                            }
                            className="text-primary font-medium focus:bg-primary/5 cursor-pointer"
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Promote to Admin
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() =>
                              handlePromote(
                                member.userId,
                                user.name,
                                member.role
                              )
                            }
                            className="text-foreground-secondary cursor-pointer"
                          >
                            <ShieldAlert className="mr-2 h-4 w-4" />
                            Demote to Member
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleBan(member.userId, user.name)}
                          className="text-foreground-secondary cursor-pointer"
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          Ban User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            );
          })}

          {/* Empty State */}
          {members?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Users className="h-12 w-12 mb-4 text-foreground-tertiary opacity-20" />
              <p className="text-lg font-bold text-foreground">
                No members yet
              </p>
              <p className="text-sm text-foreground-tertiary">
                Share your community link to get started.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Promote/Demote Dialog */}
      <Dialog
        open={promoteDialog.isOpen}
        onOpenChange={(open) =>
          setPromoteDialog((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isPromoting ? (
                <>
                  <Shield className="h-5 w-5 text-primary" />
                  Promote to Admin
                </>
              ) : (
                <>
                  <ShieldAlert className="h-5 w-5 text-orange-500" />
                  Demote to Member
                </>
              )}
            </DialogTitle>
            <DialogDescription className="pt-2">
              {isPromoting ? (
                <>
                  Are you sure you want to promote{" "}
                  <span className="font-semibold text-foreground">
                    {userDisplayName}
                  </span>{" "}
                  to Admin?
                  <div className="mt-3 p-3 bg-primary/5 rounded-lg">
                    <p className="text-sm font-medium text-primary">
                      Admins will be able to:
                    </p>
                    <ul className="text-sm text-foreground-tertiary mt-1 space-y-1 pl-4 list-disc">
                      <li>Manage community members</li>
                      <li>Delete posts and comments</li>
                      <li>Moderate content</li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  Are you sure you want to demote{" "}
                  <span className="font-semibold text-foreground">
                    {userDisplayName}
                  </span>{" "}
                  back to Member?
                  <div className="mt-3 p-3 bg-orange-50 rounded-lg dark:bg-orange-950/20">
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                      This user will lose admin privileges:
                    </p>
                    <ul className="text-sm text-foreground-tertiary mt-1 space-y-1 pl-4 list-disc">
                      <li>Can no longer manage members</li>
                      <li>Can no longer delete posts</li>
                      <li>Will become a regular member</li>
                    </ul>
                  </div>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() =>
                setPromoteDialog({
                  isOpen: false,
                  userId: "",
                  userName: "",
                  currentRole: "",
                })
              }
            >
              Cancel
            </Button>
            <Button
              onClick={confirmPromote}
              variant={isPromoting ? "default" : "destructive"}
              className={isPromoting ? "" : "bg-orange-500 hover:bg-orange-600"}
            >
              {promoteActionText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban Dialog */}
      <Dialog
        open={banDialog.isOpen}
        onOpenChange={(open) =>
          setBanDialog((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Ban User
            </DialogTitle>
            <DialogDescription className="pt-2">
              You are about to ban{" "}
              <span className="font-semibold text-foreground">
                {banDialog.userName}
              </span>{" "}
              from this community. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ban-reason" className="text-sm font-medium">
                Reason for banning <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="ban-reason"
                placeholder="Please provide a reason for banning this user..."
                value={banDialog.reason}
                onChange={(e) =>
                  setBanDialog((prev) => ({ ...prev, reason: e.target.value }))
                }
                className="min-h-[100px] resize-none"
              />
              <p className="text-xs text-foreground-tertiary">
                This reason will be recorded and visible to other admins.
              </p>
            </div>

            <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
              <p className="text-sm font-medium text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Consequences of banning:
              </p>
              <ul className="text-sm text-foreground-tertiary mt-1 space-y-1 pl-4 list-disc">
                <li>User will be removed from the community</li>
                <li>User will not be able to rejoin</li>
                <li>All their posts and comments will be hidden</li>
                <li>This action is permanent</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="flex flex-row justify-end gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setBanDialog({
                  isOpen: false,
                  userId: "",
                  userName: "",
                  reason: "",
                })
              }
            >
              Cancel
            </Button>
            <Button
              onClick={confirmBan}
              variant="destructive"
              disabled={!banDialog.reason.trim()}
            >
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
