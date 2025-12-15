import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

// api call
import { deletePostRequest } from "@/features/api/post.api";

interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, AxiosError<ApiErrorResponse>, string>({
    mutationKey: ["delete-post"],

    mutationFn: (postId: string) => deletePostRequest(postId),

    onSuccess: (_, postId) => {
      console.log("✅ Post deleted successfully");

      // Invalidate the list so the deleted post disappears from the feed
      queryClient.invalidateQueries({ queryKey: ["posts"] });

      // Remove the specific post details from cache
      queryClient.removeQueries({ queryKey: ["posts", postId] });
    },

    onError: (error) => {
      if (error.response) {
        console.error("❌ Server error:", error.response.data);
      } else {
        console.error("❌ Error deleting post:", error.message);
      }
    },
  });
};
