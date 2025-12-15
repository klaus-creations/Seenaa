"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp, ThumbsDown, MessageSquare, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CommentResponseDto } from "@/types/comments";
import Image from "next/image";

// Hooks
import {
  useToggleCommentReaction,
  useDeleteComment,
  useCreateComment,
  useUpdateComment,
} from "@/lib/hooks/comments/useComments";

// Components
import CommentForm from "./comment-form";
import ReplyList from "./reply-list";

// Shadcn UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CommentItemProps {
  comment: CommentResponseDto;
  postId: string;
  currentUserId: string | null;
}

export default function CommentItem({
  comment,
  postId,
  currentUserId,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Mutations
  const { mutate: toggleReaction } = useToggleCommentReaction();
  const { mutate: deleteComment, isPending: isDeleting } = useDeleteComment();
  const { mutate: createReply, isPending: isReplyingPending } =
    useCreateComment();
  const { mutate: updateComment, isPending: isUpdating } = useUpdateComment();

  const isOwner = currentUserId === comment.author.id;

  // Logic
  const handleVote = (type: "thumbs_up" | "thumbs_down") => {
    if (!currentUserId) return; // Add login modal logic here if needed
    toggleReaction({
      commentId: comment.id,
      reactionType: type,
      postId,
      parentCommentId: comment.parentCommentId,
    });
  };

  const handleConfirmDelete = () => {
    deleteComment(
      {
        commentId: comment.id,
        postId,
        parentCommentId: comment.parentCommentId,
      },
      {
        onSuccess: () => setIsDeleteDialogOpen(false),
      }
    );
  };

  const handleReplySubmit = (content: string) => {
    createReply(
      { postId, content, parentCommentId: comment.id },
      {
        onSuccess: () => {
          setIsReplying(false);
          setShowReplies(true); // Auto open replies
        },
      }
    );
  };

  const handleEditSubmit = (content: string) => {
    updateComment(
      { commentId: comment.id, data: { content } },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  return (
    <>
      <div className="group">
        <div className="flex gap-3 py-4">
          {/* Avatar */}
          <div className="size-8 rounded-full overflow-hidden bg-primary flex items-center justify-center shrink-0">
            <Image
              src={comment.author.image || "/images/profile-placeholder.svg"}
              alt={comment.author.name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm text-foreground">
                {comment.author.name}
              </span>
              <span className="text-xs text-foreground-tertiary">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                }).replace(/^about\s/, "")}
              </span>
              {comment.editedAt && (
                <span className="text-xs text-foreground-tertiary">
                  (edited)
                </span>
              )}
            </div>

            {/* Content or Edit Form */}
            {isEditing ? (
              <div className="mb-2">
                <CommentForm
                  placeholder={comment.content}
                  onSubmit={handleEditSubmit}
                  isLoading={isUpdating}
                  onCancel={() => setIsEditing(false)}
                  autoFocus
                />
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap mb-2 text-foreground-secondary">
                {comment.content}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleVote("thumbs_up")}
                  className={cn(
                    "flex items-center gap-1 hover:text-secondary transition-colors",
                    comment.userReaction === "thumbs_up"
                      ? "text-secondary font-medium"
                      : "text-foreground-secondary"
                  )}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  {comment.thumbsUpCount > 0 && comment.thumbsUpCount}
                </button>
                <button
                  onClick={() => handleVote("thumbs_down")}
                  className={cn(
                    "flex items-center gap-1 hover:text-secondary transition-colors",
                    comment.userReaction === "thumbs_down"
                      ? "text-secondary font-medium"
                      : "text-foreground-secondary"
                  )}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  {comment.thumbsDownCount > 0 && comment.thumbsDownCount}
                </button>
              </div>

              {comment.depth < 2 && (
                <button
                  onClick={() => setIsReplying(!isReplying)}
                  className="hover:text-secondary text-foreground-secondary font-medium transition-colors"
                >
                  Reply
                </button>
              )}

              {isOwner && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="hover:text-secondary text-foreground-secondary transition-colors flex items-center gap-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="hover:text-red-500 text-foreground-secondary transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>

            {/* Reply Form */}
            {isReplying && (
              <div className="mt-3 pl-4 border-l-2 border-border">
                <CommentForm
                  onSubmit={handleReplySubmit}
                  isLoading={isReplyingPending}
                  placeholder={`Replying to ${comment.author.name}...`}
                  onCancel={() => setIsReplying(false)}
                  autoFocus
                />
              </div>
            )}

            {/* Show Replies Button */}
            {comment.replyCount > 0 && (
              <div className="mt-2">
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 transition-colors"
                >
                  <MessageSquare className="w-3 h-3" />
                  {showReplies
                    ? "Hide replies"
                    : `Show ${comment.replyCount} ${
                        comment.replyCount === 1 ? "reply" : "replies"
                      }`}
                </button>
              </div>
            )}

            {/* Nested Replies */}
            {showReplies && (
              <div className="mt-2 pl-4 border-l-2 border-border">
                <ReplyList
                  commentId={comment.id}
                  postId={postId}
                  currentUserId={currentUserId}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Comment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this comment? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
