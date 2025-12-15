import { useState } from "react";
import {
  useGetPostComments,
  useCreateComment,
} from "@/lib/hooks/comments/useComments";
import { MessageCircle, Loader2 } from "lucide-react";

// Components
import CommentItem from "./comment-item";
import CommentForm from "./comment-form";
import { useSession } from "@/lib/hooks/auth/useGetSession";

// Placeholder for auth (Replace with your actual auth hook)

interface CommentListProps {
  postId: string;
}

export default function CommentList({ postId }: CommentListProps) {
  const { data: userData } = useSession(); // Replace with real auth
  const [page, setPage] = useState(1);

  // 1. Fetch Comments
  const { data, isLoading, isError, isPlaceholderData } = useGetPostComments(
    postId,
    {
      page,
      limit: 10,
      sort: "newest", // or 'popular'
    }
  );

  // 2. Create Comment Mutation
  const { mutate: createComment, isPending: isCreating } = useCreateComment();

  const handleCreateComment = (content: string) => {
    if (!userData?.user) return alert("Please login to comment");
    createComment({ postId, content });
  };

  const hasComments = data?.comments && data.comments.length > 0;

  return (
    <div className="w-full rounded-xl shadow-sm border p-3  mx-auto xl:w-[38%] xl:h-full overflow-y-auto">
      {/* Header */}

      {/* Main Comment Input */}
      <div className="mb-3">
        <CommentForm
          onSubmit={handleCreateComment}
          isLoading={isCreating}
          placeholder="Share your thoughts..."
        />
      </div>

      <h3 className="text-lg mb-2 flex items-center gap-1 font-extrabold">
        Comments
        {data?.pagination.total ? (
          <span className=" text-xs  rounded-full">
            ({data.pagination.total})
          </span>
        ) : null}
      </h3>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}

      {isError && (
        <div className="text-center py-8 text-red-500 bg-red-50 rounded-lg">
          Failed to load comments. Please try again later.
        </div>
      )}

      {!isLoading && !hasComments && (
        <div className="text-center py-10 text-gray-400">
          <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-20" />
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}

      <div className="divide-y">
        {data?.comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            postId={postId}
            currentUserId={userData?.user?.id || null}
          />
        ))}
      </div>

      {data?.pagination.hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setPage((old) => old + 1)}
            disabled={isPlaceholderData}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline disabled:opacity-50"
          >
            {isPlaceholderData ? "Loading..." : "Load more comments"}
          </button>
        </div>
      )}
    </div>
  );
}
