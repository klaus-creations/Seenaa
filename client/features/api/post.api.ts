import apiClient from "@/config/axios";
import type { UpdatePostDto, GetPostsQueryDto } from "@/types/posts";
import type { PostResponseDto, PaginatedPosts } from "@/types/posts";

export const createPostRequest = async (data: FormData) => {
  const res = await apiClient.post<PostResponseDto>("/posts", data);
  return res.data;
};

export const updatePostRequest = async (
  postId: string,
  data: UpdatePostDto
) => {
  const res = await apiClient.patch<PostResponseDto>(`/posts/${postId}`, data);
  return res.data;
};

export const deletePostRequest = async (postId: string) => {
  const res = await apiClient.delete<{ message: string }>(`/posts/${postId}`);
  return res.data;
};

export const getPostsRequest = async (query: GetPostsQueryDto) => {
  const res = await apiClient.get<PaginatedPosts>("/posts", { params: query });
  return res.data;
};

export const getPostRequest = async (postId: string) => {
  const res = await apiClient.get<PostResponseDto>(`/posts/${postId}`);
  return res.data;
};

export const togglePostReactionRequest = async (
  postId: string,
  reactionType: "thumbs_up" | "thumbs_down"
) => {
  const res = await apiClient.post(`/posts/${postId}/reactions`, {
    reactionType,
  });
  return res.data;
};

export const getPostReactionsRequest = async (postId: string) => {
  const res = await apiClient.get(`/posts/${postId}/reactions`);
  return res.data;
};

export const getMyPostsRequest = async (query: GetPostsQueryDto) => {
  const res = await apiClient.get<PaginatedPosts>("/posts/me", {
    params: query,
  });
  return res.data;
};

export const getUserPostsRequest = async (
  userId: string,
  query: GetPostsQueryDto
) => {
  const res = await apiClient.get<PaginatedPosts>(`/posts/user/${userId}`, {
    params: query,
  });
  return res.data;
};
