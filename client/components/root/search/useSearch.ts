import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import { useDebounce } from "@/lib/hooks/useDebounce"; // Ensure you have a debounce hook
import {
  SearchQueryDto,
  SearchType,
  SortOption,
  DateRange,
} from "@/types/search";

export const useSearchState = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // 1. Parse Current URL Params into our DTO
  const filters: SearchQueryDto = useMemo(() => {
    return {
      q: searchParams.get("q") || "",
      type: (searchParams.get("type") as SearchType) || "all",
      sortBy: (searchParams.get("sortBy") as SortOption) || "relevance",

      // People
      verifiedOnly: searchParams.get("verifiedOnly") === "true",
      minFollowers: Number(searchParams.get("minFollowers")) || undefined,

      // Posts
      minLikes: Number(searchParams.get("minLikes")) || undefined,
      hasMedia: searchParams.get("hasMedia") === "true",
      dateRange: (searchParams.get("dateRange") as DateRange) || "all",

      // Communities
      minMembers: Number(searchParams.get("minMembers")) || undefined,
    };
  }, [searchParams]);

  // 2. Debounce the text query for the API call
  const debouncedQuery = useDebounce(filters.q, 400);

  // 3. Helper to update URL without refreshing
  const setFilter = useCallback(
    (key: keyof SearchQueryDto, value: any) => {
      const params = new URLSearchParams(searchParams.toString());

      if (
        value === undefined ||
        value === null ||
        value === "" ||
        value === false ||
        value === "all"
      ) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  return { filters, debouncedQuery, setFilter };
};
