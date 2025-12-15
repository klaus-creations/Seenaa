
import { useGetCommunityRequests, useReviewJoinRequest } from "@/lib/hooks/community/useCommunity";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Check, X } from "lucide-react";

interface MembersRolesPendingRequestSettingsProps {
  communityId: string;
}

export default function MembersRolesPendingRequestSettings({
  communityId,
}: MembersRolesPendingRequestSettingsProps) {
  const { data, isLoading, isError } = useGetCommunityRequests(communityId);
  const reviewMutation = useReviewJoinRequest();
  console.log("These are pending Requests")
  console.log(data);

  const handleApprove = (requestId: string) => {
    reviewMutation.mutate({
      requestId,
      communityId,
      status: "approved",
    });
  };

  const handleReject = (requestId: string) => {
    reviewMutation.mutate({
      requestId,
      communityId,
      status: "rejected",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading pending requests…
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-destructive">Failed to load requests</p>;
  }

  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No pending join requests
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((request) => (
        <Card key={request.id} className="rounded-2xl">
          <CardHeader className="pb-2">
            <p className="text-sm font-medium">User ID</p>
            <p className="text-xs text-muted-foreground">
              {request.userId}
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {request.message && (
              <p className="text-sm text-muted-foreground">
                “{request.message}”
              </p>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                className="gap-1"
                disabled={reviewMutation.isPending}
                onClick={() => handleApprove(request.id)}
              >
                <Check className="h-4 w-4" /> Approve
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="gap-1"
                disabled={reviewMutation.isPending}
                onClick={() => handleReject(request.id)}
              >
                <X className="h-4 w-4" /> Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

