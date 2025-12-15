import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

// API calls
import {
  createCommentRequest,
  getPostCommentsRequest,
  getCommentRepliesRequest,
  updateCommentRequest,
  deleteCommentRequest,
  toggleCommentReactionRequest,
} from "@/features/api/comment.api";

// Types
import type {
  CommentResponseDto,
  PaginatedComments,
  GetCommentsQueryDto,
  CreateCommentDto,
  UpdateCommentDto,
  ReactionType,
} from "@/types/comments";

interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

// ==========================================
// QUERIES
// ==========================================

/**
 * Fetch top-level comments for a specific post
 */
export const useGetPostComments = (
  postId: string,
  query: GetCommentsQueryDto
) => {
  return useQuery<PaginatedComments, AxiosError<ApiErrorResponse>>({
    queryKey: ["comments", "post", postId, query],
    queryFn: () => getPostCommentsRequest(postId, query),
    enabled: !!postId,
    placeholderData: (previousData) => previousData, // Keeps list visible while fetching next page
  });
};

/**
 * Fetch replies for a specific comment
 */
export const useGetCommentReplies = (
  commentId: string,
  limit: number = 10,
  offset: number = 0
) => {
  return useQuery<CommentResponseDto[], AxiosError<ApiErrorResponse>>({
    queryKey: ["comments", "replies", commentId, { limit, offset }],
    queryFn: () => getCommentRepliesRequest(commentId, limit, offset),
    enabled: !!commentId,
  });
};

// ==========================================
// MUTATIONS
// ==========================================

/**
 * Create a new comment or reply
 */
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CommentResponseDto,
    AxiosError<ApiErrorResponse>,
    CreateCommentDto
  >({
    mutationFn: createCommentRequest,
    onSuccess: (newComment) => {
      // 1. Refresh the main comments list for this post
      queryClient.invalidateQueries({
        queryKey: ["comments", "post", newComment.postId],
      });

      // 2. Refresh the post details (to update the global commentCount)
      queryClient.invalidateQueries({
        queryKey: ["posts", newComment.postId],
      });

      // 3. If it's a reply, specifically refresh the parent's replies list
      if (newComment.parentCommentId) {
        queryClient.invalidateQueries({
          queryKey: ["comments", "replies", newComment.parentCommentId],
        });
      }
    },
  });
};

/**
 * Update an existing comment
 */
export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CommentResponseDto,
    AxiosError<ApiErrorResponse>,
    { commentId: string; data: UpdateCommentDto }
  >({
    mutationFn: ({ commentId, data }) => updateCommentRequest(commentId, data),
    onSuccess: (updatedComment) => {
      // Refresh post comments list
      queryClient.invalidateQueries({
        queryKey: ["comments", "post", updatedComment.postId],
      });

      // If reply, refresh specific thread
      if (updatedComment.parentCommentId) {
        queryClient.invalidateQueries({
          queryKey: ["comments", "replies", updatedComment.parentCommentId],
        });
      }
    },
  });
};

/**
 * Delete a comment
 */
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string },
    AxiosError<ApiErrorResponse>,
    { commentId: string; postId: string; parentCommentId?: string | null }
  >({
    mutationFn: ({ commentId }) => deleteCommentRequest(commentId),
    onSuccess: (_, variables) => {
      // 1. Refresh main comments list
      queryClient.invalidateQueries({
        queryKey: ["comments", "post", variables.postId],
      });

      // 2. Refresh post count
      queryClient.invalidateQueries({
        queryKey: ["posts", variables.postId],
      });

      // 3. If reply, refresh parent thread
      if (variables.parentCommentId) {
        queryClient.invalidateQueries({
          queryKey: ["comments", "replies", variables.parentCommentId],
        });
      }
    },
  });
};

/**
 * Toggle reaction (Like/Dislike)
 */
export const useToggleCommentReaction = () => {
  const queryClient = useQueryClient();

  return useMutation<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    AxiosError<ApiErrorResponse>,
    {
      commentId: string;
      reactionType: ReactionType;
      postId: string;
      parentCommentId?: string | null;
    }
  >({
    mutationFn: ({ commentId, reactionType }) =>
      toggleCommentReactionRequest(commentId, reactionType),
    onSuccess: (_, variables) => {
      // Refresh comments to show new counts/reaction state
      queryClient.invalidateQueries({
        queryKey: ["comments", "post", variables.postId],
      });

      if (variables.parentCommentId) {
        queryClient.invalidateQueries({
          queryKey: ["comments", "replies", variables.parentCommentId],
        });
      }
    },
  });
};
