// Enums matching Backend
export type SearchType = "all" | "people" | "community" | "post";
export type SortOption = "relevance" | "newest" | "popular";
export type DateRange = "all" | "today" | "week" | "month";

// 🔍 The Query Object (What we send)
export interface SearchQueryDto {
  q?: string;
  type?: SearchType;
  sortBy?: SortOption;
  limit?: number;
  offset?: number;

  // People Filters
  verifiedOnly?: boolean;
  minFollowers?: number;
  country?: string;
  isOnline?: boolean;

  // Post Filters
  minLikes?: number;
  minViews?: number;
  hasMedia?: boolean;
  dateRange?: DateRange;

  // Community Filters
  minMembers?: number;
}

// 📦 The Result Objects (What we receive)
export interface UserSearchResult {
  id: string;
  name: string;
  username: string;
  image: string | null;
  bio: string;
  country: string | null;
  followerCount: number;
  isVerified: boolean;
  isOnline: boolean;
}

export interface CommunitySearchResult {
  id: string;
  name: string;
  slug: string;
  avatar: string | null;
  description: string | null;
  memberCount: number;
  postCount: number;
  isPrivate: boolean;
}

export interface PostSearchResult {
  id: string;
  content: string;
  images: string[] | null;
  thumbsUpCount: number;
  viewCount: number;
  createdAt: string;
  user: {
    id: string;
    username: string;
    name: string;
    image: string | null;
    isVerified: boolean;
  };
  community: {
    id: string;
    name: string;
    slug: string;
    avatar: string | null;
  } | null;
}

// 🏆 The Unified Response
export interface SearchResponseDto {
  people?: UserSearchResult[];
  communities?: CommunitySearchResult[];
  posts?: PostSearchResult[];
}
