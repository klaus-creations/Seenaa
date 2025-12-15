import {
  useGetCommunityRequests,
  useReviewJoinRequest,
} from "@/lib/hooks/community/useCommunity";
import { Check, X } from "lucide-react";

export const AdminRequestList = ({ communityId }: { communityId: string }) => {
  const { data: requests, isLoading } = useGetCommunityRequests(communityId);
  const { mutate: review } = useReviewJoinRequest();

  if (isLoading)
    return <div className="p-4 text-center">Loading requests...</div>;
  if (!requests || requests.length === 0)
    return (
      <div className="p-8 text-center text-gray-500">No pending requests.</div>
    );

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 ">
      <div className="bg-gray-50 px-4 py-3 font-medium text-gray-700">
        Pending Join Requests
      </div>
      <div className="divide-y divide-gray-100">
        {requests.map((req) => (
          <div key={req.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-gray-900">User ID: {req.userId}</p>
              {req.message && (
                <p className="mt-1 text-sm text-gray-500">
                  &quot;{req.message}&quot;
                </p>
              )}
              <p className="text-xs text-gray-400">
                Requested: {new Date(req.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  review({ requestId: req.id, communityId, status: "approved" })
                }
                className="rounded-full bg-green-100 p-2 text-green-600 hover:bg-green-200"
                title="Approve"
              >
                <Check size={18} />
              </button>
              <button
                onClick={() =>
                  review({ requestId: req.id, communityId, status: "rejected" })
                }
                className="rounded-full bg-red-100 p-2 text-red-600 hover:bg-red-200"
                title="Reject"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
