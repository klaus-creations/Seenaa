"use client";

import SectionHeading from "@/components/root/common/section-heading";
import { SearchBar } from "@/components/root/search/search-input";
import { SearchResults } from "@/components/root/search/search-results";
import { SearchTabs } from "@/components/root/search/search-tabs";
import { useSearchState } from "@/components/root/search/useSearch";
import { useSearch, useTrendingSearch } from "@/lib/hooks/search/useSearch";

export default function Search() {
  const { filters, debouncedQuery, setFilter } = useSearchState();

  const isSearching =
    (debouncedQuery && debouncedQuery.length > 0) || filters.type !== "all";

  const {
    data: searchData,
    isFetching,
    isPlaceholderData,
  } = useSearch({ ...filters, q: debouncedQuery }, true);

  const { data: trendingData, isLoading: isTrendingLoading } =
    useTrendingSearch();

  const displayData =
    isSearching && debouncedQuery
      ? searchData
      : debouncedQuery
      ? searchData
      : trendingData;

  const isLoading = isSearching
    ? isFetching && !isPlaceholderData
    : isTrendingLoading;

  return (
    <div className="w-full">
      <div className="w-full flex flex-col items-start gap-4">
        <SectionHeading name="Explore" />
        <SearchBar
          value={filters.q || ""}
          onChange={(val) => setFilter("q", val)}
        />
        <SearchTabs
          activeTab={filters.type || "all"}
          onChange={(val) => setFilter("type", val)}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <main className="flex-1">
          <SearchResults
            data={displayData || {}}
            isLoading={isLoading}
            type={filters.type || "all"}
          />
        </main>
      </div>
    </div>
  );
}
