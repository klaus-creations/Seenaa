import { PostResponseDto } from "../posts";

export interface GetBookmarksQueryDto {
  page?: number;
  limit?: number;
}

export interface PaginatedBookmarks {
  data: PostResponseDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface CheckBookmarkResponse {
  isBookmarked: boolean;
}

export interface ToggleBookmarkResponse {
  isBookmarked: boolean;
  message: string;
}
