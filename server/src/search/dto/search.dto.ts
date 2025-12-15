/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  IsEnum,
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum SearchType {
  ALL = 'all',
  PEOPLE = 'people',
  COMMUNITY = 'community',
  POST = 'post',
}

export enum SortOption {
  RELEVANCE = 'relevance', // Default (Verified/Popular)
  NEWEST = 'newest', // CreatedAt desc
  POPULAR = 'popular', // Highest counters (Likes/Followers)
}

export enum DateRange {
  ALL_TIME = 'all',
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
}

export class SearchQueryDto {
  // --- Core ---
  @IsString()
  @IsOptional()
  q: string = ''; // Allow empty string for "Browse Mode"

  @IsOptional()
  @IsEnum(SearchType)
  type: SearchType = SearchType.ALL;

  @IsOptional()
  @IsEnum(SortOption)
  sortBy: SortOption = SortOption.RELEVANCE;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  limit: number = 20;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(0)
  offset: number = 0;

  // --- PEOPLE FILTERS ---
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  verifiedOnly?: boolean;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  minFollowers?: number;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isOnline?: boolean;

  // --- POST FILTERS ---
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  minLikes?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  minViews?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  hasMedia?: boolean; // Only posts with images

  @IsOptional()
  @IsEnum(DateRange)
  dateRange?: DateRange;

  // --- COMMUNITY FILTERS ---
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  minMembers?: number;
}
