"use client";

import {
  Shield,
  ShieldAlert,
  ArrowDown,
  ShieldCheck,
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

// Helper to format permission keys into readable text
const formatPermission = (key: string) => {
  return key
    .replace(/can/g, "")
    .replace(/([A-Z])/g, " $1")
    .trim();
};

export default function MembersRolesAdminsModeratorsSettings({ community }: Props) {
  const { data: admins, isLoading } = useGetCommunityMembers(community.id, "admin");
  const { mutate: updateRole, isPending: isUpdating } = useUpdateMemberRole();

  const handleDemote = (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to demote ${userName}? They will lose all administrative privileges.`)) {
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
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p>Loading leadership team...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="flex justify-between items-end border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            Admins & Moderators
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage the leadership team and their specific permissions.
          </p>
        </div>
        <div className="flex items-center gap-2">
           <Badge variant="secondary" className="px-3 py-1 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100">
             Admins: {admins?.length || 0}
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
                Role
              </th>
              <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Active Permissions
              </th>
              <th className="relative py-4 pl-3 pr-6 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {admins?.map((admin) => {
              const user = admin.user;
              if (!user) return null;

              // Parse permissions
              const activePermissions = Object.keys(admin.permissions || {}).filter(
                (k) => (admin.permissions as any)[k]
              );
              const hasAllPermissions = activePermissions.length === 0; // Assuming empty logic or handle explicitly

              return (
                <tr
                  key={admin.id}
                  className="group transition-colors hover:bg-blue-50/10"
                >
                  {/* USER INFO */}
                  <td className="py-4 pl-6 pr-3">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-10 w-10 border border-gray-200">
                          <AvatarImage src={user.image || ""} alt={user.name} />
                          <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">
                            {user.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {user.isOnline && (
                          <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
                        )}
                      </div>

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

                  {/* ROLE */}
                  <td className="px-3 py-4">
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 shadow-none">
                      Admin
                    </Badge>
                  </td>

                  {/* PERMISSIONS */}
                  <td className="px-3 py-4">
                    <div className="flex flex-wrap gap-1.5 max-w-xs">
                      {activePermissions.length > 0 ? (
                        activePermissions.map((perm) => (
                          <span
                            key={perm}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200"
                          >
                            {formatPermission(perm)}
                          </span>
                        ))
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          <Shield className="w-3 h-3 mr-1" />
                          Full Access
                        </span>
                      )}
                    </div>
                  </td>

                  {/* ACTIONS */}
                  <td className="py-4 pl-3 pr-6 text-right">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isUpdating}
                            onClick={() => handleDemote(admin.userId, user.name)}
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          >
                            <ArrowDown className="w-4 h-4 mr-2" />
                            Demote
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-orange-600 text-white border-orange-700">
                          <p>Revoke admin privileges</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                </tr>
              );
            })}

            {admins?.length === 0 && (
              <tr>
                <td colSpan={4} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <ShieldAlert className="h-6 w-6 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900">No Admins Defined</h4>
                    <p className="text-sm text-gray-400 mt-1 max-w-xs">
                      This community relies solely on the Creator for management.
                      Promote members to help you out!
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
