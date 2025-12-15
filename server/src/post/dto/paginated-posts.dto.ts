import { IsOptional, IsInt, Min, Max, IsEnum, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { PostResponseDto } from './post-response.dto';

export enum FeedType {
  FOR_YOU = 'for_you', // Algorithm-based
  FOLLOWING = 'following', // Chronological from followed users
  TRENDING = 'trending', // Hot posts last 24h
  FRESH = 'fresh', // Newest first
}

export class GetPostsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsEnum(FeedType)
  feedType?: FeedType = FeedType.FOR_YOU;

  @IsOptional()
  @IsUUID()
  communityId?: string; // Filter by community
}

export class PaginatedPostsResponseDto {
  posts: PostResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}
