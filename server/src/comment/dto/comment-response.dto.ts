export type ReactionType = 'thumbs_up' | 'thumbs_down' | null;

export class AuthorDto {
  id: string;
  name: string;
  image: string | null;
}

export class CommentResponseDto {
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
  userReaction: ReactionType;

  createdAt: Date;
  updatedAt: Date;
  editedAt: Date | null;
}

export class PaginatedCommentsDto {
  comments: CommentResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}
