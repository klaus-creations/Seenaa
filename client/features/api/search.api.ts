import apiClient from "@/config/axios";
import type { SearchQueryDto, SearchResponseDto } from "@/types/search";

/**
 * Main Search Request
 * Handles filtering, sorting, and pagination
 */
export const searchRequest = async (query: SearchQueryDto) => {
  const res = await apiClient.get<SearchResponseDto>("/search", {
    params: query,
  });
  return res.data;
};

/**
 * Get Trending / Discovery Content
 * Used for the "Empty State" before user types
 */
export const getTrendingRequest = async () => {
  const res = await apiClient.get<SearchResponseDto>("/search/trending");
  return res.data;
};

/**
 * Get People Suggestions
 * Used for "Who to follow" or sidebar
 */
export const getPeopleSuggestionsRequest = async () => {
  // We reuse the search response shape, but it will only contain 'people'
  const res = await apiClient.get<Pick<SearchResponseDto, "people">>(
    "/search/suggestions/people"
  );
  return res.data;
};
