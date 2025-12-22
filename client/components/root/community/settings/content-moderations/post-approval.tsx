"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Check,
  X,
  FileText,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Quote,
} from "lucide-react";
import { Community } from "@/types/community";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/config/axios";

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

interface PendingPost {
  id: string;
  content: string;
  author: { id: string; name: string; avatar?: string; username?: string };
  createdAt: string;
}

export default function ContentModerationsPostApprovalSettings({
  community,
}: Props) {
  const queryClient = useQueryClient();

  const { data: pendingPosts, isLoading } = useQuery<PendingPost[]>({
    queryKey: ["pending-posts", community.id],
    queryFn: async () => {
      const res = await apiClient.get(`/community/${community.id}/posts`, {
        params: { status: "pending" },
      });
      return res.data;
    },
  });

  const { mutate: reviewPost, isPending: isReviewing } = useMutation({
    mutationFn: async ({
      postId,
      action,
    }: {
      postId: string;
      action: "approve" | "reject";
    }) => {
      return apiClient.post(`/posts/${postId}/review`, { action });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pending-posts", community.id],
      });
    },
  });

  if (isLoading) {
    return (
      <div className="size-full">
        <FullSizeLoader />
      </div>
    );
  }

  return (
    <div className="size-full">
      <div className="flex flex-col gap-2 mb-8 min-h-[10%] ">
        <div className="flex items-center justify-between border-b pb-6">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Approval Queue
            </h3>
            <p className="text-sm text-foreground-secondary mt-1">
              Ensure community quality by reviewing posts before they go live.
            </p>
          </div>
          <p className="text-secondary text-sm font-bold">
            {pendingPosts?.length || 0} Pending
          </p>
        </div>

        {!community.requirePostApproval && (
          <Alert className="border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-500 rounded-2xl">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="font-bold uppercase text-[10px] tracking-widest">
              Post Approval Disabled
            </AlertTitle>
            <AlertDescription className="text-xs opacity-90">
              Posts are currently being published instantly. Enable Require Post
              Approval in Privacy settings to use this queue.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Transparent Feed List */}
      <div className="flex flex-col">
        {pendingPosts?.map((post) => (
          <div
            key={post.id}
            className="flex flex-col py-8 border-b last:border-0 hover:bg-accent/5 px-2 transition-colors -mx-2 rounded-2xl"
          >
            {/* Post Metadata / Author Row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-background">
                  <AvatarImage
                    src={post.author.avatar}
                    alt={post.author.name}
                  />
                  <AvatarFallback className="bg-primary/5 text-primary font-bold">
                    {post.author.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground leading-tight">
                    {post.author.name}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-foreground-tertiary">
                    <Clock className="w-3 h-3" />
                    <span>
                      {formatDistanceToNow(new Date(post.createdAt))} ago
                    </span>
                  </div>
                </div>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="p-2 text-foreground-tertiary bg-accent/30 rounded-full">
                      <Quote size={14} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="font-bold text-xs">
                    Awaiting Moderation
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Content Preview - Accent border left */}
            <div className="ml-1 pl-6 border-l-2 border-primary/20">
              <p className="text-sm text-foreground-secondary leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button
                variant="ghost"
                size="sm"
                disabled={isReviewing}
                onClick={() =>
                  reviewPost({ postId: post.id, action: "reject" })
                }
                className="h-9 rounded-full text-destructive hover:bg-destructive/10 font-bold text-[11px] uppercase tracking-wider px-5"
              >
                <X className="w-4 h-4 mr-1.5" />
                Reject
              </Button>

              <Button
                size="sm"
                disabled={isReviewing}
                onClick={() =>
                  reviewPost({ postId: post.id, action: "approve" })
                }
                className="h-9 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[11px] uppercase tracking-wider px-6 shadow-sm shadow-primary/20"
              >
                <Check className="w-4 h-4 mr-1.5" />
                Approve Post
              </Button>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {pendingPosts?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-full bg-accent/30 flex items-center justify-center mb-4">
              <FileText className="h-10 w-10 text-foreground-tertiary opacity-40" />
            </div>
            <p className="text-lg font-bold text-foreground">Inbox is Empty</p>
            <p className="text-sm text-foreground-tertiary max-w-xs mt-1">
              Everything is in order. All community posts have been reviewed and
              processed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
