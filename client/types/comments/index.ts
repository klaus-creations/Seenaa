export interface CreateCommentDto {
  postId: string;
  content: string;
  parentCommentId?: string;
}

export interface UpdateCommentDto {
  content: string;
}

export interface GetCommentsQueryDto {
  page?: number;
  limit?: number;
  sort?: "newest" | "popular";
}

export interface AuthorDto {
  id: string;
  name: string;
  image: string | null;
}

export type ReactionType = "thumbs_up" | "thumbs_down";

export interface CommentResponseDto {
  id: string;
  postId: string;
  parentCommentId: string | null;
  content: string;
  thumbsUpCount: number;
  thumbsDownCount: number;
  replyCount: number;
  depth: number;
  mentions: string[] | null;
  author: AuthorDto;
  userReaction: ReactionType | null;
  createdAt: string;
  updatedAt: string;
  editedAt: string | null;
}

export interface PaginatedComments {
  comments: CommentResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}
