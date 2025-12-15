import apiClient from "@/config/axios";
import {
  CheckBookmarkResponse,
  GetBookmarksQueryDto,
  PaginatedBookmarks,
  ToggleBookmarkResponse,
} from "@/types/bookmarks";

export const toggleBookmarkRequest = async (postId: string) => {
  const res = await apiClient.post<ToggleBookmarkResponse>(
    `/bookmarks/${postId}`
  );
  return res.data;
};

export const getUserBookmarksRequest = async (query: GetBookmarksQueryDto) => {
  const res = await apiClient.get<PaginatedBookmarks>("/bookmarks", {
    params: query,
  });
  return res.data;
};

export const checkIsBookmarkedRequest = async (postId: string) => {
  const res = await apiClient.get<CheckBookmarkResponse>(
    `/bookmarks/${postId}/check`
  );
  return res.data;
};
