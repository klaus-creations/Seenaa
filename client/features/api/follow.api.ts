// src/features/api/follow.api.ts
import apiClient from "@/config/axios";
import {
  FollowActionResult,
  FollowStatusResponse,
  GetFollowsQueryDto,
  PaginatedFollows,
} from "@/types/follow";

// ==========================================
// API Requests
// ==========================================

// Follow a user
export const followUserRequest = async (targetUserId: string) => {
  const res = await apiClient.post<FollowActionResult>(
    `/users/${targetUserId}/follow`
  );
  return res.data;
};

// Unfollow a user
export const unfollowUserRequest = async (targetUserId: string) => {
  const res = await apiClient.delete<FollowActionResult>(
    `/users/${targetUserId}/follow`
  );
  return res.data;
};

// Get list of followers for a user
export const getFollowersRequest = async (
  userId: string,
  query: GetFollowsQueryDto
) => {
  const res = await apiClient.get<PaginatedFollows>(
    `/users/${userId}/followers`,
    { params: query }
  );
  return res.data;
};

// Get list of people a user follows (Following)
export const getFollowingRequest = async (
  userId: string,
  query: GetFollowsQueryDto
) => {
  const res = await apiClient.get<PaginatedFollows>(
    `/users/${userId}/following`,
    { params: query }
  );
  return res.data;
};

// Check if current logged-in user follows a specific target
export const getFollowStatusRequest = async (targetUserId: string) => {
  const res = await apiClient.get<FollowStatusResponse>(
    `/users/${targetUserId}/follow-status`
  );
  return res.data;
};
