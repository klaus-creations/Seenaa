"use client";

import { useState } from "react";
import { useGetCommunities } from "@/lib/hooks/community/useCommunity";
import { CommunityCard } from "@/components/root/community/community-card";
import { CreateCommunityModal } from "@/components/root/community/create-community";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CommunitiesPage() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: communities, isLoading } = useGetCommunities({ search });

  return (
    <div className="size-full lg:p-4 space-y-4">
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center h-[10%]">
        <div>
          <h1 className="text-xl font-bold">Communities</h1>
          <p className="mt-1 text-foreground-secondary">
            Discover and join groups matching your interests.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} variant={"btn"}>
          Create Community
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search communities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border  py-3 pl-10 pr-4 shadow-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl "></div>
          ))}
        </div>
      ) : communities?.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 ">
          <p className="text-lg font-medium text-gray-500">
            No communities found.
          </p>
          <button
            onClick={() => setSearch("")}
            className="text-blue-600 hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {communities?.map((community) => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>
      )}

      <CreateCommunityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
