"use client";

import React from "react";
import { format } from "date-fns";
import {
  Check,
  X,
  Clock,
  MessageSquareQuote,
  UserPlus,
  AlertTriangle
} from "lucide-react";

// Hooks & Types
import {
  useGetCommunityRequests,
  useReviewJoinRequest
} from "@/lib/hooks/community/useCommunity";
import { Community } from "@/types/community";

// Components
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  community: Community;
}

export default function MembersRolesPendingRequestSettings({ community }: Props) {
  const { data: requests, isLoading } = useGetCommunityRequests(community.id);
  const { mutate: reviewRequest, isPending: isReviewing } = useReviewJoinRequest();

  const handleReview = (requestId: string, status: "approved" | "rejected") => {
    reviewRequest({
      communityId: community.id,
      requestId,
      status,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-gray-500">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p>Loading pending requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats & Warning */}
      <div className="flex flex-col gap-4 border-b border-gray-100 pb-4">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-600" />
              Pending Requests
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Review users waiting to join your community.
            </p>
          </div>
          <Badge variant="secondary" className="px-3 py-1 text-sm">
            Pending: {requests?.length || 0}
          </Badge>
        </div>

        {!community.requireApproval && (
          <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle>Approval Disabled</AlertTitle>
            <AlertDescription className="text-amber-700/90 text-xs">
              "Require Join Approval" is currently turned off in settings. New users will join automatically without appearing here.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Requests List */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        <ul role="list" className="divide-y divide-gray-100">
          {requests?.map((request) => {
             const user = request.user;
             if (!user) return null;

             return (
              <li key={request.id} className="group p-4 sm:p-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">

                  {/* User Profile Area */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <Avatar className="h-12 w-12 border border-gray-200">
                      <AvatarImage src={user.image || ""} alt={user.name} />
                      <AvatarFallback className="bg-indigo-50 text-indigo-600 font-bold text-lg">
                        {user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user.name}
                        </p>
                        <span className="text-xs text-gray-400 font-normal">
                          @{user.username}
                        </span>
                      </div>

                      {/* Request Message */}
                      <div className="relative pl-3 border-l-2 border-indigo-100 bg-gray-50/50 rounded-r-md p-2">
                        <p className="text-sm text-gray-600 italic leading-relaxed">
                          {request.message ? (
                            `"${request.message}"`
                          ) : (
                            <span className="text-gray-400 not-italic">No message provided.</span>
                          )}
                        </p>
                      </div>

                      {/* Meta Data */}
                      <div className="flex items-center gap-3 text-xs text-gray-400 pt-1">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Requested {format(new Date(request.createdAt), "MMM d, p")}
                        </span>
                        {user.country && <span>• From {user.country}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="flex items-center gap-3 pt-2 sm:pt-0 pl-16 sm:pl-0">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => handleReview(request.id, "rejected")}
                            disabled={isReviewing}
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 text-red-600 border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-all rounded-full"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Reject Request</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => handleReview(request.id, "approved")}
                            disabled={isReviewing}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white border-none shadow-sm rounded-full px-4 gap-2"
                          >
                            <Check className="h-4 w-4" />
                            <span className="font-medium">Approve</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Approve Membership</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </li>
            );
          })}

          {requests?.length === 0 && (
            <li className="py-16 text-center">
              <div className="flex flex-col items-center justify-center text-gray-500">
                <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <MessageSquareQuote className="h-6 w-6 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900">Inbox Zero</h4>
                <p className="text-sm text-gray-400 mt-1 max-w-xs">
                  There are no pending join requests at the moment.
                </p>
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
