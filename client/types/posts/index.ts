export interface CreatePostDto {
  content: string;
  images?: string[];
  communityId?: string | null;
}

export interface UpdatePostDto {
  content?: string;
  images?: string[];
}

export interface GetPostsQueryDto {
  limit?: number;
  page?: number;
  feedType?: "for_you" | "trending" | "fresh" | "following";
  communityId?: string;
}

// src/types/posts/response.ts
export interface AuthorDto {
  id: string;
  name: string;
  image?: string | null;
  username: string;
}

export interface PostResponseDto {
  id: string;
  content: string;
  images?: string[];
  communityId?: string | null;
  viewCount: number;
  thumbsUpCount: number;
  thumbsDownCount: number;
  commentCount: number;
  shareCount: number;
  mentions?: string[];
  hashtags?: string[];
  isPinned: boolean;
  author: AuthorDto;
  userReaction?: "thumbs_up" | "thumbs_down" | null;
  createdAt: string;
  updatedAt: string;
  editedAt?: string | null;
}

export interface PaginatedPosts {
  posts: PostResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}
