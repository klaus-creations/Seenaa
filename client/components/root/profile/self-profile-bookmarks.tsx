/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import SinglePost from "../home/single-post";
import { useGetUserBookmarks } from "@/lib/hooks/bookmarks/useBookmarks";

export default function SelfProfileBookmarks() {
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  const { data, isLoading, isError, error } = useGetUserBookmarks({
    page,
    limit: LIMIT,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  // 2. Error State
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-red-500">
        <p>Error loading bookmarks</p>
        <p className="text-sm text-gray-500">{error?.message}</p>
      </div>
    );
  }

  // 3. Empty State
  // Assuming data structure: data.data is the array, data.meta is pagination info
  const bookmarks = data?.data || [];

  if (!bookmarks || bookmarks.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">No bookmarks found.</div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        {bookmarks.map((item: any) => {
          const post = item.post || item;
          return <SinglePost key={post.id || item.id} postData={post} />;
        })}
      </div>
    </div>
  );
}
