import { useState } from "react";
import { SearchQueryDto } from "@/types/search";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchFiltersProps {
  filters: SearchQueryDto;
  setFilter: (key: keyof SearchQueryDto, value: any) => void;
}

export const SearchFilters = ({ filters, setFilter }: SearchFiltersProps) => {
  const [open, setOpen] = useState(false);
  const type = filters.type || "all";

  const resetFilters = () => {
    setFilter("verifiedOnly", false);
    setFilter("minFollowers", 0);
    setFilter("minLikes", 0);
    setFilter("hasMedia", false);
    setFilter("dateRange", "all");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
          <Filter className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Filters</span>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Sort */}
          <div className="space-y-2">
            <Label className="text-sm">Sort by</Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => setFilter("sortBy", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* People filters */}
          {(type === "all" || type === "people") && (
            <>
              <div className="space-y-4">
                <Label className="text-sm">People</Label>
                <div className="flex items-center justify-between">
                  <Label htmlFor="verified" className="text-sm">
                    Verified only
                  </Label>
                  <Switch
                    id="verified"
                    checked={filters.verifiedOnly || false}
                    onCheckedChange={(checked) => setFilter("verifiedOnly", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">Min followers</Label>
                    <span className="text-sm">
                      {filters?.minFollowers && filters.minFollowers > 0 ? `${(filters.minFollowers / 1000).toFixed(0)}K+` : "Any"}
                    </span>
                  </div>
                  <Slider
                    value={[filters.minFollowers || 0]}
                    min={0}
                    max={100000}
                    step={1000}
                    onValueChange={([value]) => setFilter("minFollowers", value)}
                  />
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Post filters */}
          {(type === "all" || type === "post") && (
            <div className="space-y-4">
              <Label className="text-sm">Posts</Label>
              <div className="flex items-center justify-between">
                <Label htmlFor="media" className="text-sm">
                  Has media
                </Label>
                <Switch
                  id="media"
                  checked={filters.hasMedia || false}
                  onCheckedChange={(checked) => setFilter("hasMedia", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Time posted</Label>
                <Select
                  value={filters.dateRange}
                  onValueChange={(value) => setFilter("dateRange", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This week</SelectItem>
                    <SelectItem value="month">This month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={resetFilters}
          >
            Reset
          </Button>
          <DialogClose asChild>
            <Button className="flex-1" onClick={() => setOpen(false)}>
              Apply
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};
