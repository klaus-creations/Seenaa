"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import SinglePost from "./single-post";
import { useGetPosts } from "@/lib/hooks/posts/useGetPosts";
import type { GetPostsQueryDto } from "@/types/posts";
import { AlertCircle, RefreshCw, PenSquare } from "lucide-react";

interface IQuery {
  query: string;
}

type FeedType = "for_you" | "trending" | "following";

export default function LeftHome({ query }: IQuery) {
  const [feedType, setFeedType] = useState<FeedType>("for_you");

  console.log("Current Query:", query);

  const queryParams: GetPostsQueryDto = {
    page: 1,
    limit: 10,
    feedType: feedType,
  };

  const {
    data: postsData,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useGetPosts(queryParams);

  if (isError) {
    return (
      <div className="size-full lg:w-[65%] 2xl:w-[70%] overflow-y-auto flex flex-col items-start border">
        <FilterFeed selectedType={feedType} onSelectType={setFeedType} />

        <div className="w-full flex-1 flex flex-col items-center justify-center gap-4 py-10">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Failed to load posts
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {error instanceof Error ? error.message : "Something went wrong"}
            </p>
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="gap-2"
            disabled={isRefetching}
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`}
            />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full lg:w-[65%] 2xl:w-[40%] overflow-y-auto flex flex-col items-start ">
      {/* Sticky Header with Tabs */}
      <FilterFeed selectedType={feedType} onSelectType={setFeedType} />

      <div className="w-full flex flex-col">
        {isLoading ? (
          <PostSkeleton />
        ) : postsData?.posts && postsData.posts.length > 0 ? (
          <>
            {postsData.posts.map((post) => (
              <div
                key={post.id}
                className="border-b border-gray-200 dark:border-gray-800"
              >
                <SinglePost postData={post} />
              </div>
            ))}

            {/* Load more indicator */}
            {postsData.pagination.hasMore && (
              <div className="w-full py-6 text-center">
                <Button
                  variant="ghost"
                  className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  onClick={() => {
                    console.log("Load more posts logic here");
                  }}
                >
                  Show more
                </Button>
              </div>
            )}

            {/* End of feed message */}
            {!postsData.pagination.hasMore && (
              <div className="w-full py-8 text-center">
                <p className="text-gray-500 text-sm">
                  You&apos;re all caught up!
                </p>
              </div>
            )}
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

interface FilterFeedProps {
  selectedType: FeedType;
  onSelectType: (type: FeedType) => void;
}

const FilterFeed = ({ selectedType, onSelectType }: FilterFeedProps) => {
  const tabs: { label: string; value: FeedType }[] = [
    { label: "For you", value: "for_you" },
    { label: "Following", value: "following" },
    { label: "Trending", value: "trending" },
  ];

  return (
    <div className="w-full border-b">
      <div className="flex w-full items-center justify-around h-[53px]">
        {tabs.map((tab) => {
          const isActive = selectedType === tab.value;
          return (
            <div
              key={tab.value}
              onClick={() => onSelectType(tab.value)}
              className="flex-1 h-full flex items-center justify-center cursor-pointer transition-colors relative"
            >
              <div className="relative h-full flex items-center justify-center px-2">
                <span
                  className={`${
                    isActive
                      ? "font-bold text-gray-900 dark:text-white"
                      : "font-medium text-gray-500 dark:text-gray-400"
                  } text-[15px]`}
                >
                  {tab.label}
                </span>

                {/* The Blue Underline Indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full w-full min-w-14" />
                )}
              </div>
            </div>
          );
        })}

        <div className="sm:hidden px-4">
          <Link href="/home/new">
            <PenSquare className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

const PostSkeleton = () => {
  return (
    <div className="flex flex-col w-full">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="w-full p-4 border-b border-gray-200 dark:border-gray-800"
        >
          <div className="flex gap-3">
            <div className="shrink-0">
              <Skeleton className="w-10 h-10 rounded-full" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-64 w-full rounded-xl mt-2" />
              <div className="flex justify-between pt-2 max-w-md">
                <Skeleton className="h-6 w-12 rounded-full" />
                <Skeleton className="h-6 w-12 rounded-full" />
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const EmptyState = () => {
  return (
    <div className="w-full py-20 flex flex-col items-center justify-center gap-4">
      <div className="text-center px-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          No posts yet
        </h3>
        <p className="text-gray-500 mt-2 max-w-sm mx-auto">
          There are no posts in this feed right now. Be the first to post or
          check another tab!
        </p>
      </div>
      <Button asChild className="mt-4 rounded-full px-6 font-bold">
        <Link href="/home/new">Create Post</Link>
      </Button>
    </div>
  );
};
