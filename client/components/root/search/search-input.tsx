import {  X } from "lucide-react";
import { SearchFilters } from "./search-filters";
import { useSearchState } from "./useSearch";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
  const { filters, setFilter } = useSearchState()
  return (
    <div className="relative w-full  flex">
      <Input className="className w-full lg:w-[80%] xl:w-[70%] 2xl:w-[60%]" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Search people, communities, posts ..."/>
      <SearchFilters filters={filters} setFilter={setFilter} />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
        </button>
      )}
    </div>
  );
};
