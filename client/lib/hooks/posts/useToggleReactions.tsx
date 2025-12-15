import { useMutation, useQueryClient } from "@tanstack/react-query";
import { togglePostReactionRequest } from "@/features/api/post.api";

interface ReactionParams {
  postId: string;
  reactionType: "thumbs_up" | "thumbs_down";
}

interface IPost {
  id: string;
  userReaction: "thumbs_up" | "thumbs_down" | null;
}

export const useToggleReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["toggle-reaction"],
    mutationFn: ({ postId, reactionType }: ReactionParams) =>
      togglePostReactionRequest(postId, reactionType),

    // Optimistic update — only touch userReaction
    onMutate: async ({ postId, reactionType }) => {
      await queryClient.cancelQueries({ queryKey: ["post", postId] });

      const previousPost = queryClient.getQueryData<IPost>(["post", postId]);

      queryClient.setQueryData<IPost | undefined>(["post", postId], (old) => {
        if (!old) return old;

        // If clicking the same reaction → remove it (toggle off)
        // If clicking different → switch to it
        const isRemoving = old.userReaction === reactionType;

        return {
          ...old,
          userReaction: isRemoving ? null : reactionType,
        };
      });

      return { previousPost };
    },

    // Rollback on error
    onError: (_err, { postId }, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(["post", postId], context.previousPost);
      }
    },

    // Always refetch after settled so counts (shown elsewhere) stay eventually correct
    onSettled: (_data, _error, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] }); // if you show counts in lists
    },
  });
};
