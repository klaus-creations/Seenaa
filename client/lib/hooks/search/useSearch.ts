import { useQuery, keepPreviousData } from "@tanstack/react-query";
import type { AxiosError } from "axios";

// API
import {
  searchRequest,
  getTrendingRequest,
  getPeopleSuggestionsRequest,
  getCommunitySuggestionsRequest,
} from "@/features/api/search.api";

// Types
import type { SearchQueryDto, SearchResponseDto } from "@/types/search";
import type { Community } from "@/types/community";

interface ApiErrorResponse {
  message: string;
  statusCode?: number;
}

// Main Search Hook
export const useSearch = (query: SearchQueryDto, enabled: boolean = true) => {
  return useQuery<SearchResponseDto, AxiosError<ApiErrorResponse>>({
    queryKey: ["search", query],
    queryFn: () => searchRequest(query),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
  });
};

// Trending Search Hook
export const useTrendingSearch = () => {
  return useQuery<SearchResponseDto, AxiosError<ApiErrorResponse>>({
    queryKey: ["search", "trending"],
    queryFn: getTrendingRequest,
    staleTime: 1000 * 60 * 5,
  });
};

// People Suggestions Hook
export const usePeopleSuggestions = () => {
  return useQuery<SearchResponseDto, AxiosError<ApiErrorResponse>>({
    queryKey: ["search", "suggestions", "people"],
    queryFn: getPeopleSuggestionsRequest,
    staleTime: 1000 * 60 * 10,
  });
};

// Community Suggestions Hook
export const useCommunitySuggestions = () => {
  return useQuery<Community[], AxiosError<ApiErrorResponse>>({
    queryKey: ["search", "suggestions", "communities"],
    queryFn: getCommunitySuggestionsRequest,
    staleTime: 1000 * 60 * 10, // Cache for 10 mins
  });
};
