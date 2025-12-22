import {  User } from "@/types/user";



export interface PaginatedFollows {
  data: User[];
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
  isSelf: boolean;
}

export interface FollowActionResult {
  message: string;
  isFollowing: boolean;
}
