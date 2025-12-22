"use client";

import React from "react";
import { format } from "date-fns";
import {
  Check,
  X,
  Clock,
  MessageSquareQuote,
  UserPlus,
  AlertTriangle,
  MapPin,
} from "lucide-react";

// Hooks & Types
import {
  useGetCommunityRequests,
  useReviewJoinRequest,
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
import { FullSizeLoader } from "@/components/root/common/section-error-loading";

interface Props {
  community: Community;
}

export default function MembersRolesPendingRequestSettings({
  community,
}: Props) {
  const { data: requests, isLoading } = useGetCommunityRequests(community.id);
  const { mutate: reviewRequest, isPending: isReviewing } =
    useReviewJoinRequest();

  const handleReview = (requestId: string, status: "approved" | "rejected") => {
    reviewRequest({
      communityId: community.id,
      requestId,
      status,
    });
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
      <div className="flex flex-col gap-6 mb-8 min-h-[10%]">
        <div className="flex items-center justify-between border-b pb-6">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Join Requests
            </h3>
            <p className="text-sm text-foreground-secondary mt-1">
              Review users who want to participate in this community.
            </p>
          </div>
          <Badge
            variant="default"
            className="h-7 px-3 text-sm font-bold rounded-full"
          >
            {requests?.length || 0} Pending
          </Badge>
        </div>

        {!community.requireApproval && (
          <Alert className="border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-500 rounded-2xl">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="font-bold uppercase text-[10px] tracking-widest">
              Notice
            </AlertTitle>
            <AlertDescription className="text-xs opacity-90">
              Join Approval is currently disabled. New members join
              automatically.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Transparent List Layout */}
      <div className="flex flex-col">
        {requests?.map((request) => {
          const user = request.user;
          if (!user) return null;

          return (
            <div
              key={request.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between py-6 border-b last:border-0 hover:bg-accent/5 px-2 transition-colors -mx-2 rounded-xl"
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <Avatar className="h-12 w-12 border border-background">
                    <AvatarImage src={user.image || ""} alt={user.name} />
                    <AvatarFallback className="bg-primary/5 text-primary font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Content info */}
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground truncate">
                      {user.name}
                    </span>
                    <span className="text-xs text-foreground-tertiary">
                      @{user.username}
                    </span>
                  </div>

                  {/* Message Box - Minimalist social style */}
                  <div className="mt-2 text-sm text-foreground-secondary leading-relaxed border-l-2 border-primary/20 pl-3">
                    {request.message ? (
                      <span className="italic">"{request.message}"</span>
                    ) : (
                      <span className="text-foreground-tertiary text-xs">
                        No join message attached.
                      </span>
                    )}
                  </div>

                  {/* Metadata row */}
                  <div className="flex items-center gap-4 mt-3 text-[11px] text-foreground-tertiary">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3 h-3" />
                      {format(new Date(request.createdAt), "MMM d, h:mm a")}
                    </div>
                    {user.country && (
                      <div className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3" />
                        {user.country}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-4 sm:mt-0 sm:ml-4 self-end sm:self-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => handleReview(request.id, "rejected")}
                        disabled={isReviewing}
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="font-bold">
                      Decline
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => handleReview(request.id, "approved")}
                        disabled={isReviewing}
                        className="h-10 px-6 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="font-bold">
                      Accept Member
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {requests?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-full bg-accent/30 flex items-center justify-center mb-4">
              <MessageSquareQuote className="h-10 w-10 text-foreground-tertiary opacity-40" />
            </div>
            <p className="text-lg font-bold text-foreground">All Caught Up</p>
            <p className="text-sm text-foreground-tertiary max-w-xs mt-1">
              There are no pending join requests. You'll see new applications
              here as they arrive.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
