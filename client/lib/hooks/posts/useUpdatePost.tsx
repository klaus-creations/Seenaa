import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

// api call
import { updatePostRequest } from "@/features/api/post.api";

// types
import type { UpdatePostDto, PostResponseDto } from "@/types/posts";

interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

// Wrapper type because mutationFn only accepts one argument
interface UpdatePostParams {
  postId: string;
  data: UpdatePostDto;
}

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation<PostResponseDto, AxiosError<ApiErrorResponse>, UpdatePostParams>({
    mutationKey: ["update-post"],

    mutationFn: ({ postId, data }) => updatePostRequest(postId, data),

    onSuccess: (data) => {
      console.log("✅ Post updated successfully:", data);

      // Update the specific post in the cache immediately
      queryClient.setQueryData(["posts", data.id], data);

      // Optionally invalidate main feeds to reflect changes
      queryClient.invalidateQueries({ queryKey: ["posts"], exact: false });
    },

    onError: (error) => {
      if (error.response) {
        console.error("❌ Server error:", {
          status: error.response.status,
          data: error.response.data,
        });
      } else {
        console.error("❌ Error updating post:", error.message);
      }
    },
  });
};
