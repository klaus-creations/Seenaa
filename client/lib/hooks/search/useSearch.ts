import { useQuery, keepPreviousData } from "@tanstack/react-query";
import type { AxiosError } from "axios";

// API
import {
  searchRequest,
  getTrendingRequest,
  getPeopleSuggestionsRequest,
} from "@/features/api/search.api";

// Types
import type { SearchQueryDto, SearchResponseDto } from "@/types/search";

interface ApiErrorResponse {
  message: string;
  statusCode?: number;
}

// ==========================================
// QUERIES
// ==========================================

/**
 * 🔍 Main Search Hook
 * Automatically refetches when any filter changes.
 */
export const useSearch = (query: SearchQueryDto, enabled: boolean = true) => {
  return useQuery<SearchResponseDto, AxiosError<ApiErrorResponse>>({
    // The queryKey includes every filter property.
    // React Query will trigger a refetch if ANY of these change.
    queryKey: ["search", query],

    queryFn: () => searchRequest(query),

    // Only run if enabled (e.g., user has typed at least 1 char, or we are in browse mode)
    enabled,

    // ✨ UX Magic: Keep showing previous results while fetching new ones
    // (prevents flickering/loading state when changing pages or filters)
    placeholderData: keepPreviousData,

    // Cache search results for 1 minute to save bandwidth on back-button navigation
    staleTime: 1000 * 60,
  });
};

/**
 * 🔥 Trending Hook
 * Fetches popular content for the initial search screen.
 */
export const useTrendingSearch = () => {
  return useQuery<SearchResponseDto, AxiosError<ApiErrorResponse>>({
    queryKey: ["search", "trending"],
    queryFn: getTrendingRequest,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes (trending doesn't change fast)
  });
};

/**
 * 👥 People Suggestions Hook
 */
export const usePeopleSuggestions = () => {
  return useQuery<
    Pick<SearchResponseDto, "people">,
    AxiosError<ApiErrorResponse>
  >({
    queryKey: ["search", "suggestions", "people"],
    queryFn: getPeopleSuggestionsRequest,
    staleTime: 1000 * 60 * 10, // Cache for 10 mins
  });
};
