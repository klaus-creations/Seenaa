// src/features/hooks/useFollow.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

// API calls
import {
  followUserRequest,
  unfollowUserRequest,
  getFollowersRequest,
  getFollowingRequest,
  getFollowStatusRequest,
} from "@/features/api/follow.api";

// Types
import type {
  FollowActionResult,
  PaginatedFollows,
  GetFollowsQueryDto,
  FollowStatusResponse,
} from "@/types/follow";

interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

// ==========================================
// QUERIES
// ==========================================

/**
 * Fetch followers of a specific user
 */
export const useGetFollowers = (userId: string, query: GetFollowsQueryDto) => {
  return useQuery<PaginatedFollows, AxiosError<ApiErrorResponse>>({
    queryKey: ["users", "followers", userId, query],
    queryFn: () => getFollowersRequest(userId, query),
    enabled: !!userId,
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Fetch who a specific user is following
 */
export const useGetFollowing = (userId: string, query: GetFollowsQueryDto) => {
  return useQuery<PaginatedFollows, AxiosError<ApiErrorResponse>>({
    queryKey: ["users", "following", userId, query],
    queryFn: () => getFollowingRequest(userId, query),
    enabled: !!userId,
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Check if I am following a specific user
 * Useful for initializing the "Follow" button state on a profile page
 */
export const useGetFollowStatus = (targetUserId: string) => {
  return useQuery<FollowStatusResponse, AxiosError<ApiErrorResponse>>({
    queryKey: ["users", "status", targetUserId],
    queryFn: () => getFollowStatusRequest(targetUserId),
    enabled: !!targetUserId,
  });
};

// ==========================================
// MUTATIONS
// ==========================================

/**
 * Follow a user
 */
export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation<
    FollowActionResult,
    AxiosError<ApiErrorResponse>,
    { targetUserId: string }
  >({
    mutationFn: ({ targetUserId }) => followUserRequest(targetUserId),
    onSuccess: (data, variables) => {
      // 1. Invalidate the follow status for this specific user (updates the button)
      queryClient.invalidateQueries({
        queryKey: ["users", "status", variables.targetUserId],
      });

      // 2. Refresh the target user's followers list
      queryClient.invalidateQueries({
        queryKey: ["users", "followers", variables.targetUserId],
      });

      // 3. Refresh my own "following" list (Optional: if we know current user ID, we can target it specifically)
      queryClient.invalidateQueries({
        queryKey: ["users", "following"],
      });

      queryClient.invalidateQueries({
        queryKey: ["session"], // If you display counts in session
      });
    },
  });
};

/**
 * Unfollow a user
 */
export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation<
    FollowActionResult,
    AxiosError<ApiErrorResponse>,
    { targetUserId: string }
  >({
    mutationFn: ({ targetUserId }) => unfollowUserRequest(targetUserId),
    onSuccess: (data, variables) => {
      // 1. Invalidate status (Update Button)
      queryClient.invalidateQueries({
        queryKey: ["users", "status", variables.targetUserId],
      });

      // 2. Refresh target's followers list
      queryClient.invalidateQueries({
        queryKey: ["users", "followers", variables.targetUserId],
      });

      // 3. Refresh following lists
      queryClient.invalidateQueries({
        queryKey: ["users", "following"],
      });

      queryClient.invalidateQueries({
        queryKey: ["session"],
      });
    },
  });
};
