"use client";

import { useState } from "react";
import { useGetMyPosts } from "@/lib/hooks/posts/useGetPost";
import { Loader2 } from "lucide-react";
import SinglePost from "../home/single-post";

export default function SelfProfilePosts() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError } = useGetMyPosts({
    page,
    limit,
    // feedType is not required for "My Posts" endpoint
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 w-full">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-red-500 w-full">
        <p>Failed to load posts.</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm underline mt-2"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data?.posts || data.posts.length === 0) {
    return (
      <div className="text-center py-20 text-foreground-secondary w-full">
        <p className="text-lg font-bold text-foreground">No posts yet</p>
        <p className="text-sm mt-1">
          When you create posts, they will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {data.posts.map((post) => (
        <SinglePost key={post.id} postData={post} />
      ))}

      {/* Pagination Controls */}
      <div className="flex items-center justify-center gap-6 py-8 border-t border-border">
        <button
          disabled={page === 1}
          onClick={() => {
            setPage((p) => Math.max(1, p - 1));
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="text-sm font-medium text-secondary hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
        >
          Previous
        </button>

        <span className="text-xs text-foreground-secondary">Page {page}</span>

        <button
          disabled={!data.pagination.hasMore}
          onClick={() => {
            setPage((p) => p + 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="text-sm font-medium text-secondary hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
        >
          Next
        </button>
      </div>
    </div>
  );
}
