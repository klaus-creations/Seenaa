import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";

// api call
import { getPostsRequest } from "@/features/api/post.api";

// types
import type { GetPostsQueryDto, PaginatedPosts } from "@/types/posts";

interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

export const useGetPosts = (queryParams: GetPostsQueryDto) => {
  return useQuery<PaginatedPosts, AxiosError<ApiErrorResponse>>({
    // Include queryParams in the key so it refetches when filters/page change
    queryKey: ["posts", queryParams],

    queryFn: () => getPostsRequest(queryParams),

    // Optional: Keep previous data while fetching new page for smoother transition
    placeholderData: (previousData) => previousData,
  });
};
