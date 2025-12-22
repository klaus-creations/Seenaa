"use client";

import { Shield, ShieldAlert, ArrowDown, ShieldCheck } from "lucide-react";

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

const formatPermission = (key: string) => {
  return key
    .replace(/can/g, "")
    .replace(/([A-Z])/g, " $1")
    .trim();
};

export default function MembersRolesAdminsModeratorsSettings({
  community,
}: Props) {
  const { data: admins, isLoading } = useGetCommunityMembers(
    community.id,
    "admin"
  );
  const { mutate: updateRole, isPending: isUpdating } = useUpdateMemberRole();

  const handleDemote = (userId: string, userName: string) => {
    if (
      window.confirm(
        `Are you sure you want to demote ${userName}? They will lose all administrative privileges.`
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
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Admins & Moderators
          </h3>
          <p className="text-sm text-foreground-secondary mt-1">
            Users with elevated privileges to manage the community.
          </p>
        </div>
        <p className="text-secondary text-sm font-semibold ">
          {admins?.length == 1
            ? `${admins?.length} Admin`
            : `${admins?.length} Admins`}
        </p>
      </div>

      {/* List Container */}
      <div className="grid gap-4">
        {admins?.map((admin) => {
          const user = admin.user;
          if (!user) return null;

          const activePermissions = Object.keys(admin.permissions || {}).filter(
            (k) => (admin.permissions as any)[k]
          );

          return (
            <div
              key={admin.id}
              className="group relative flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-md hover:border-primary/20"
            >
              {/* User Identity Section */}
              <div className="flex items-center gap-4 flex-1">
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

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground truncate max-w-[150px] sm:max-w-none">
                      {user.name}
                    </span>
                    <p className="text-secondary">Admin</p>
                  </div>
                  <div className="text-xs text-foreground-tertiary">
                    {user.username}
                  </div>
                </div>
              </div>

              {/* Permissions Section */}
              {/* <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground-tertiary mb-2">
                  Active Capabilities
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {activePermissions.length > 0 ? (
                    activePermissions.map((perm) => (
                      <span
                        key={perm}
                        className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-secondary text-foreground border"
                      >
                        {formatPermission(perm)}
                      </span>
                    ))
                  ) : (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                      Full Root Access
                    </span>
                  )}
                </div>
              </div> */}

              {/* Action Section */}
              <div className="flex items-center justify-end gap-2 pt-4 md:pt-0 border-t md:border-none">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => handleDemote(admin.userId, user.name)}
                        className="h-9 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <ArrowDown className="w-4 h-4 mr-2" />
                        <span className="text-xs font-bold uppercase tracking-tight">
                          Demote
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-destructive text-destructive-foreground font-bold">
                      <p>Revoke all privileges</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {admins?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border border-dashed bg-accent/20">
            <div className="h-16 w-16 bg-background rounded-2xl shadow-sm flex items-center justify-center mb-4 ring-8 ring-accent/10">
              <ShieldAlert className="h-8 w-8 text-foreground-tertiary" />
            </div>
            <h4 className="text-lg font-bold text-foreground">
              Single Handed Management
            </h4>
            <p className="text-sm text-foreground-tertiary mt-2 max-w-sm">
              Currently, there are no other admins. Promoting trusted members
              helps keep the community safe and active.
            </p>
            <Button variant="outline" className="mt-6 rounded-full font-bold">
              Learn about roles
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
