import apiClient from "@/config/axios";
import type { SearchQueryDto, SearchResponseDto } from "@/types/search";
import { Community } from "@/types/community"; // Ensure you have this type

// Search Request Including with different query parameters
export const searchRequest = async (query: SearchQueryDto) => {
  const res = await apiClient.get<SearchResponseDto>("/search", {
    params: query,
  });
  return res.data;
};

// showing trendings on the search page
export const getTrendingRequest = async () => {
  const res = await apiClient.get<SearchResponseDto>("/search/trending");
  return res.data;
};

// Get people suggestions (who to follow)
export const getPeopleSuggestionsRequest = async () => {
  const res = await apiClient.get<SearchResponseDto>(
    "/search/suggestions/people"
  );
  return res.data;
};

// Get community suggestions (communities to join)
export const getCommunitySuggestionsRequest = async () => {
  const res = await apiClient.get<Community[]>(
    "/search/suggestions/communities"
  );
  return res.data;
};
