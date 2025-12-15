// src/types/follow.ts

export interface FollowUserResponseDto {
  id: string;
  name: string;
  image: string | null;
  username?: string;
  bio?: string;
  isFollowing: boolean;
}

export interface PaginatedFollows {
  data: FollowUserResponseDto[];
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface GetFollowsQueryDto {
  limit?: number;
  page?: number;
}

export interface FollowStatusResponse {
  isFollowing: boolean;
}

export interface FollowActionResult {
  message: string;
  isFollowing: boolean;
}
