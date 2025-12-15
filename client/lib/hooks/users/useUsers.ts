import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

// API calls
import {
  searchUsersRequest,
  getMeRequest,
  updateProfileRequest,
  updatePreferencesRequest,
  getUserProfileRequest,
  recordProfileViewRequest,
} from "@/features/api/users.api";

// Types
import type {
  User,
  UpdateProfileDto,
  UpdatePreferencesDto,
  SearchUserResult,
} from "@/types/user";

interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

// ==========================================
// QUERIES
// ==========================================

/**
 * Search users
 */
export const useSearchUsers = (query: string) => {
  return useQuery<SearchUserResult[], AxiosError<ApiErrorResponse>>({
    queryKey: ["users", "search", query],
    queryFn: () => searchUsersRequest(query),
    enabled: !!query && query.length > 2, // Only search if query has 3+ chars
    staleTime: 1000 * 60, // Cache results for 1 minute
  });
};

/**
 * Get current logged-in user
 */
export const useGetMe = () => {
  return useQuery<User, AxiosError<ApiErrorResponse>>({
    queryKey: ["users", "me"],
    queryFn: getMeRequest,
    staleTime: 1000 * 60 * 5, // Keep 'me' fresh for 5 mins unless invalidated
  });
};

/**
 * Get public profile by username
 */
export const useGetUserProfile = (username: string) => {
  return useQuery<User, AxiosError<ApiErrorResponse>>({
    queryKey: ["users", "profile", username],
    queryFn: () => getUserProfileRequest(username),
    enabled: !!username,
  });
};

// ==========================================
// MUTATIONS
// ==========================================

/**
 * Update Profile Information (Bio, Display Name, etc)
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<
    User,
    AxiosError<ApiErrorResponse>,
    UpdateProfileDto
  >({
    mutationFn: updateProfileRequest,
    onSuccess: (updatedUser) => {
      // 1. Update the 'me' cache immediately
      queryClient.setQueryData(["users", "me"], updatedUser);

      // 2. Invalidate the public profile view for this user
      // (So if I view my own public profile, I see changes)
      queryClient.invalidateQueries({
        queryKey: ["users", "profile", updatedUser.username],
      });
    },
  });
};

/**
 * Update Preferences (Theme, Privacy, etc)
 */
export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();

  return useMutation<
    User,
    AxiosError<ApiErrorResponse>,
    UpdatePreferencesDto
  >({
    mutationFn: updatePreferencesRequest,
    onSuccess: (updatedUser) => {
      // 1. Update 'me' cache
      queryClient.setQueryData(["users", "me"], updatedUser);

      // 2. Invalidate public profile (e.g. if I hid my online status)
      queryClient.invalidateQueries({
        queryKey: ["users", "profile", updatedUser.username],
      });
    },
  });
};

/**
 * Record a profile view
 */
export const useRecordProfileView = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean },
    AxiosError<ApiErrorResponse>,
    string // The username
  >({
    mutationFn: recordProfileViewRequest,
    onSuccess: (_, username) => {
      // Optionally invalidate the profile to show the new view count immediately
      // We use 'exact: false' to catch potentially related queries
      queryClient.invalidateQueries({
        queryKey: ["users", "profile", username],
      });
    },
  });
};

