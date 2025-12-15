import apiClient from "@/config/axios";
import {
  User,
  UpdateProfileDto,
  UpdatePreferencesDto,
  SearchUserResult,
} from "@/types/user";

export const searchUsersRequest = async (query: string) => {
  const res = await apiClient.get<SearchUserResult[]>("/user/search", {
    params: { q: query },
  });
  return res.data;
};

export const getMeRequest = async () => {
  const res = await apiClient.get<User>("/user/me");
  return res.data;
};

export const updateProfileRequest = async (data: UpdateProfileDto) => {
  const res = await apiClient.patch<User>("/user/me/profile", data);
  return res.data;
};

export const updatePreferencesRequest = async (data: UpdatePreferencesDto) => {
  const res = await apiClient.patch<User>("/user/me/preferences", data);
  return res.data;
};

export const getUserProfileRequest = async (username: string) => {
  const res = await apiClient.get<User>(`/user/${username}`);
  return res.data;
};

export const recordProfileViewRequest = async (username: string) => {
  const res = await apiClient.post<{ success: boolean }>(
    `/user/${username}/view`
  );
  return res.data;
};
