"use client";

import { cn } from "@/lib/utils";
import { Bookmark, ThumbsDown, ThumbsUp } from "lucide-react";
import { useToggleReaction } from "@/lib/hooks/posts/useToggleReactions";
import {
  useToggleBookmark,
  useCheckIsBookmarked,
} from "@/lib/hooks/bookmarks/useBookmarks";
import { useQueryClient } from "@tanstack/react-query";

// Only the fields we actually use
type PostUserReaction = "thumbs_up" | "thumbs_down" | null;

interface PostReactionActionsProps {
  postId: string;
  userId?: string;
}

export default function PostReactionActions({
  postId,
  userId,
}: PostReactionActionsProps) {
  const queryClient = useQueryClient();

  // Get the current user reaction from the query cache
  const postData = queryClient.getQueryData<{ userReaction: PostUserReaction }>(["post", postId]);
  const userReaction = postData?.userReaction ?? null;

  const { data: isBookmarked = false, isPending: isBookmarkPending } =
    useCheckIsBookmarked(postId);

  const { mutate: toggleReaction, isPending: isReactionPending } = useToggleReaction();
  const { mutate: toggleBookmark } = useToggleBookmark();
  
  // Optimistically update the UI when toggling reactions
  const handleReactionClick = (reactionType: "thumbs_up" | "thumbs_down") => {
    if (!userId || isReactionPending) return;
    
    // Optimistically update the UI
    queryClient.setQueryData<{ userReaction: PostUserReaction }>(
      ["post", postId],
      (old) => ({
        ...old!,
        userReaction: old?.userReaction === reactionType ? null : reactionType,
      })
    );
    
    // Call the mutation
    toggleReaction({ postId, reactionType });
  };

  const isLiked = userReaction === "thumbs_up";
  const isDisliked = userReaction === "thumbs_down";

  return (
    <div
      className="flex items-center gap-4 select-none"
      onClick={(e) => e.stopPropagation()} // Stop parent navigation
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleReactionClick("thumbs_up");
        }}
        disabled={!userId || isReactionPending}
        className={cn(
          "p-2 rounded-full transition-all hover:bg-white/10",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          isLiked && "bg-white/10"
        )}
        aria-label="Like"
      >
        <ThumbsUp
          size={20}
          className={cn(
            "transition-colors",
            isLiked
              ? "fill-blue-500 text-blue-500"
              : "text-gray-400 hover:text-blue-500"
          )}
        />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleReactionClick("thumbs_down");
        }}
        disabled={!userId || isReactionPending}
        className={cn(
          "p-2 rounded-full transition-all hover:bg-white/10",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          isDisliked && "bg-white/10"
        )}
        aria-label="Dislike"
      >
        <ThumbsDown
          size={20}
          className={cn(
            "transition-colors",
            isDisliked
              ? "fill-red-500 text-red-500"
              : "text-gray-400 hover:text-red-500"
          )}
        />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!userId || isBookmarkPending) return;
          // Optimistically update the UI
          queryClient.setQueryData(
            ["bookmarks", "check", postId],
            { isBookmarked: !isBookmarked }
          );
          toggleBookmark(postId);
        }}
        disabled={!userId || isBookmarkPending}
        className={cn(
          "ml-auto p-2 rounded-full transition-all hover:bg-white/10",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          isBookmarked && "bg-white/10"
        )}
        aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
      >
        <Bookmark
          size={20}
          className={cn(
            "transition-colors",
            isBookmarked
              ? "fill-yellow-500 text-yellow-500"
              : "text-gray-400 hover:text-yellow-500"
          )}
        />
      </button>
    </div>
  );
}
