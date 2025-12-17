import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Check, X, FileText } from "lucide-react";
import { Community } from "@/types/community";
// Assuming these hooks exist in your project based on standard patterns
// If not, you would wrap your API calls here.
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/config/axios";

interface Props {
  community: Community;
}

interface PendingPost {
  id: string;
  content: string;
  author: { id: string; name: string; avatar?: string };
  createdAt: string;
}

export default function ContentModerationsPostApprovalSettings({ community }: Props) {
  const queryClient = useQueryClient();

  // --- 1. Fetch Pending Posts ---
  const { data: pendingPosts, isLoading } = useQuery<PendingPost[]>({
    queryKey: ["pending-posts", community.id],
    queryFn: async () => {
      // Endpoint expectation: GET /community/:id/posts?status=pending
      const res = await apiClient.get(`/community/${community.id}/posts`, {
        params: { status: "pending" },
      });
      return res.data;
    },
  });

  // --- 2. Approve/Reject Mutation ---
  const { mutate: reviewPost } = useMutation({
    mutationFn: async ({ postId, action }: { postId: string; action: "approve" | "reject" }) => {
      // Endpoint expectation: POST /posts/:id/review
      return apiClient.post(`/posts/${postId}/review`, { action });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-posts", community.id] });
    },
  });

  if (isLoading) return <div className="p-4 text-gray-500">Loading pending posts...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Post Approval Queue</h3>
        <p className="text-sm text-gray-500">
          Review posts before they appear in the community feed.
          {!community.requirePostApproval && (
             <span className="block mt-1 text-amber-600 text-xs">
               * Post approval is currently disabled in settings.
             </span>
          )}
        </p>
      </div>

      <div className="space-y-4">
        {pendingPosts?.map((post) => (
          <div key={post.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            {/* Header: Author & Time */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                  {post.author.name?.[0] || "U"}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{post.author.name || "Unknown User"}</p>
                  <p className="text-xs text-gray-500">
                    Submitted {formatDistanceToNow(new Date(post.createdAt))} ago
                  </p>
                </div>
              </div>
            </div>

            {/* Content Preview */}
            <div className="bg-gray-50 p-3 rounded text-sm text-gray-800 mb-4 whitespace-pre-wrap">
              {post.content}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t pt-3">
              <button
                onClick={() => reviewPost({ postId: post.id, action: "reject" })}
                className="flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
              >
                <X className="w-3 h-3 mr-1.5" />
                Reject
              </button>
              <button
                onClick={() => reviewPost({ postId: post.id, action: "approve" })}
                className="flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
              >
                <Check className="w-3 h-3 mr-1.5" />
                Approve
              </button>
            </div>
          </div>
        ))}

        {pendingPosts?.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">No posts waiting for approval.</p>
          </div>
        )}
      </div>
    </div>
  );
}
