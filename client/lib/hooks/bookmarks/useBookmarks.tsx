
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserBookmarksRequest,
  checkIsBookmarkedRequest,
  toggleBookmarkRequest,
} from "@/features/api/bookmarks.api";

import type { AxiosError } from "axios";
import type {
  GetBookmarksQueryDto,
  PaginatedBookmarks,
} from "@/types/bookmarks";

// Shared error type
interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

export const useGetUserBookmarks = (query: GetBookmarksQueryDto) => {
  return useQuery<PaginatedBookmarks, AxiosError<ApiErrorResponse>>({
    queryKey: ["bookmarks", "list", query],
    queryFn: () => getUserBookmarksRequest(query),
    placeholderData: (previousData) => previousData, // keeps previous page while loading next
    staleTime: 1000 * 60, // optional: 1 minute
  });
};

export const useCheckIsBookmarked = (postId: string) => {
  return useQuery<boolean, AxiosError<ApiErrorResponse>>({
    queryKey: ["bookmarks", "check", postId],
    queryFn: () => checkIsBookmarkedRequest(postId).then((res) => res.isBookmarked),
    enabled: !!postId,
    staleTime: Infinity, // this rarely changes outside of toggle → we control it manually
    select: (data) => data, // already just a boolean
  });
};

export const useToggleBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation<
    any,
    AxiosError<ApiErrorResponse>,
    string, // postId
    {
      previousPost?: { isBookmarked: boolean };
      previousCheck?: boolean;
    }
  >({
    mutationFn: (postId) => toggleBookmarkRequest(postId),

    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["post", postId] });
      await queryClient.cancelQueries({ queryKey: ["bookmarks", "check", postId] });

      const previousPost = queryClient.getQueryData<{ isBookmarked: boolean }>([
        "post",
        postId,
      ]);
      const previousCheck = queryClient.getQueryData<{ isBookmarked: boolean }>([
        "bookmarks",
        "check",
        postId,
      ])?.isBookmarked;

      queryClient.setQueryData<{ isBookmarked: boolean } | undefined>(
        ["post", postId],
        (old) => old && { ...old, isBookmarked: !old.isBookmarked }
      );

      queryClient.setQueryData<{ isBookmarked: boolean } | undefined>(
        ["bookmarks", "check", postId],
        (old) => ({ isBookmarked: old ? !old.isBookmarked : true })
      );

      return { previousPost, previousCheck };
    },

    onError: (_err, postId, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(["post", postId], context.previousPost);
      }
      if (context?.previousCheck !== undefined) {
        queryClient.setQueryData(["bookmarks", "check", postId], {
          isBookmarked: context.previousCheck,
        });
      }
    },

    onSettled: (_data, _error, postId) => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks", "check", postId] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks", "list"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] }); // if your main feed caches posts
    },
  });
};
