import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";

// api calls
import {
  getPostRequest,
  getMyPostsRequest,
  getUserPostsRequest,
} from "@/features/api/post.api";

// types
import type {
  PostResponseDto,
  PaginatedPosts,
  GetPostsQueryDto,
} from "@/types/posts";

interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

/**
 * Fetch a single post by ID
 */
export const useGetPost = (postId: string) => {
  return useQuery<PostResponseDto, AxiosError<ApiErrorResponse>>({
    queryKey: ["posts", postId],
    queryFn: () => getPostRequest(postId),
    enabled: !!postId,
  });
};

/**
 * ✅ NEW: Fetch current user's posts
 */
export const useGetMyPosts = (query: GetPostsQueryDto) => {
  return useQuery<PaginatedPosts, AxiosError<ApiErrorResponse>>({
    queryKey: ["posts", "me", query],
    queryFn: () => getMyPostsRequest(query),
    placeholderData: (previousData) => previousData, // Keeps list visible while fetching next page
  });
};

/**
 * ✅ NEW: Fetch specific user's posts (for profiles)
 */
export const useGetUserPosts = (userId: string, query: GetPostsQueryDto) => {
  return useQuery<PaginatedPosts, AxiosError<ApiErrorResponse>>({
    queryKey: ["posts", "user", userId, query],
    queryFn: () => getUserPostsRequest(userId, query),
    enabled: !!userId,
    placeholderData: (previousData) => previousData,
  });
};
