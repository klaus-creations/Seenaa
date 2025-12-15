"use client";

import { useState } from "react";
import { useGetUserPosts } from "@/lib/hooks/posts/useGetPost";
import { Loader2 } from "lucide-react";
import SinglePost from "../home/single-post";

export default function OtherProfilePosts({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError } = useGetUserPosts(userId, {
    page,
    limit,
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
        <p className="text-sm mt-1">user dont have any posts yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full overflow-y-auto">
      {data.posts.map((post) => (
        <SinglePost key={post.id} postData={post} />
      ))}
    </div>
  );
}
