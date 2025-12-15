import { useGetCommentReplies } from "@/lib/hooks/comments/useComments";
import { Loader2 } from "lucide-react";
import CommentItem from "./comment-item";

interface ReplyListProps {
  commentId: string;
  postId: string;
  currentUserId: string | null;
}

export default function ReplyList({
  commentId,
  postId,
  currentUserId,
}: ReplyListProps) {
  const { data: replies, isLoading, isError } = useGetCommentReplies(commentId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
        <Loader2 className="w-3 h-3 animate-spin" /> Loading replies...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-xs text-red-500 py-2">Failed to load replies.</div>
    );
  }

  if (!replies || replies.length === 0) return null;

  return (
    <div className="flex flex-col">
      {replies.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          postId={postId}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}
