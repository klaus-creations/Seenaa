import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/hooks/auth/useGetSession";
import {
  useJoinCommunity,
  useLeaveCommunity,
} from "@/lib/hooks/community/useCommunity";
import type { Community } from "@/types/community";
import { constructFromSymbol } from "date-fns/constants";

interface JoinCommunityButtonProps {
  community: Community;
}

export default function JoinCommunityButton({
  community,
}: JoinCommunityButtonProps) {
  const { data: session, isLoading: sessionLoading } = useSession();

  const joinMutation = useJoinCommunity();
  const leaveMutation = useLeaveCommunity();

  const currentUser = community.currentUser;
  const isLoggedIn = !!session?.user?.id;

  console.log("from the join button");
  console.log(community);

  const isLoading =
    sessionLoading || joinMutation.isPending || leaveMutation.isPending;

  /* ----------------------------
   * 1. Loading
   * ---------------------------- */
  if (isLoading) {
    return <Button disabled>Loading...</Button>;
  }

  /* ----------------------------
   * 2. Not logged in
   * ---------------------------- */
  if (!isLoggedIn) {
    return <Button disabled>Login to Join</Button>;
  }

  /* ----------------------------
   * 3. Pending request
   * ---------------------------- */
  if (currentUser?.hasPendingRequest || currentUser?.status === "pending") {
    return (
      <Button disabled variant="secondary">
        Pending Approval
      </Button>
    );
  }

  /* ----------------------------
   * 4. Active member → Leave
   * ---------------------------- */
  if (currentUser?.isMember && currentUser?.status === "active") {
    return (
      <Button
        variant="destructive"
        onClick={() =>
          leaveMutation.mutate({
            communityId: community.id,
            slug: community.slug,
          })
        }
      >
        Leave
      </Button>
    );
  }

  /* ----------------------------
   * 5. Join / Request Join
   * ---------------------------- */
  const requiresApproval = community.isPrivate && community.requireApproval;

  return (
    <Button
      onClick={() =>
        joinMutation.mutate({
          communityId: community.id,
          slug: community.slug,
          data: {},
        })
      }
    >
      {requiresApproval ? "Request to Join" : "Join"}
    </Button>
  );
}
