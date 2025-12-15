import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

// api call
import { createPostRequest } from "@/features/api/post.api";

// types
import type { PostResponseDto } from "@/types/posts";

interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  // CHANGE 1: Change the 3rd generic from CreatePostDto to FormData
  return useMutation<PostResponseDto, AxiosError<ApiErrorResponse>, FormData>({
    mutationKey: ["create-post"],

    // CHANGE 2: Update the argument type here too
    mutationFn: (data: FormData) => createPostRequest(data),

    onSuccess: (data) => {
      console.log("✅ Post created successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },

    onError: (error) => {
      if (error.response) {
        console.error("❌ Server error:", {
          status: error.response.status,
          data: error.response.data,
        });
      } else if (error.request) {
        console.error("❌ Network error: No response from server");
      } else {
        console.error("❌ Unexpected error:", error.message);
      }
    },
  });
};
