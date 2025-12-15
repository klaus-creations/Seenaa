import apiClient from "@/config/axios";
import {
  CommentResponseDto,
  CreateCommentDto,
  GetCommentsQueryDto,
  PaginatedComments,
  ReactionType,
  UpdateCommentDto,
} from "@/types/comments";


export const createCommentRequest = async (data: CreateCommentDto) => {
  const res = await apiClient.post<CommentResponseDto>("/comment", data);
  return res.data;
};

export const getPostCommentsRequest = async (
  postId: string,
  query: GetCommentsQueryDto
) => {
  const res = await apiClient.get<PaginatedComments>(
    `/comment/post/${postId}`,
    { params: query }
  );
  return res.data;
};

export const getCommentRepliesRequest = async (
  commentId: string,
  limit: number = 10,
  offset: number = 0
) => {
  const res = await apiClient.get<CommentResponseDto[]>(
    `/comment/${commentId}/replies`,
    {
      params: { limit, offset },
    }
  );
  return res.data;
};

export const getCommentRequest = async (commentId: string) => {
  const res = await apiClient.get<CommentResponseDto>(`/comment/${commentId}`);
  return res.data;
};

// Update a comment
export const updateCommentRequest = async (
  commentId: string,
  data: UpdateCommentDto
) => {
  const res = await apiClient.patch<CommentResponseDto>(
    `/comment/${commentId}`,
    data
  );
  return res.data;
};

export const deleteCommentRequest = async (commentId: string) => {
  const res = await apiClient.delete<{ message: string }>(
    `/comment/${commentId}`
  );
  return res.data;
};

export const toggleCommentReactionRequest = async (
  commentId: string,
  reactionType: ReactionType
) => {
  const res = await apiClient.post<{
    action: "added" | "removed" | "changed";
    reaction: ReactionType | null;
    counts: { thumbsUp: number; thumbsDown: number };
  }>(`/comment/${commentId}/reactions`, { reactionType });
  return res.data;
};

export const getCommentReactionsRequest = async (commentId: string) => {
  const res = await apiClient.get<{ thumbsUp: number; thumbsDown: number }>(
    `/comment/${commentId}/reactions`
  );
  return res.data;
};
