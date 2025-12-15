"use client";

import { useGetCommunity } from "@/lib/hooks/community/useCommunity";
import { FullSizeError, FullSizeLoader } from "../common/section-error-loading";
import CommunityRestricionPage from "./community-private-restriction";
import { CommunityHeader } from "./community-header";
import CommunityMain from "./community-main";

interface CommunityProps {
  slug: string;
}
export default function Community({ slug }: CommunityProps) {
  const { data: community, isLoading, error } = useGetCommunity(slug);
  console.log("this is community data", community);
  if (isLoading) {
    return <FullSizeLoader />;
  }

  if (error || !community) {
    return <FullSizeError />;
  }

  if (!community.currentUser?.isMember) {
    return <CommunityRestricionPage community={community} />;
  }

  return (
    <div className="size-full overflow-y-auto flex flex-col gap-4">
      <CommunityHeader community={community} />
      <CommunityMain community={community} />
    </div>
  );
}
