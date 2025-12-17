"use client";

import React from "react";
import { FullSizeError, FullSizeLoader } from "../common/section-error-loading";
import { useGetCommunity } from "@/lib/hooks/community/useCommunity";
import CommunityRestricionPage from "./community-private-restriction";
import { useRouter } from "next/navigation";
import CommunitySettingsMain from "./community-settings-main";

export default function CommunitySettings({ slug }: { slug: string }) {
  const router = useRouter();

  const { data: community, isLoading, error } = useGetCommunity(slug);

  if (isLoading) {
    return <FullSizeLoader />;
  }

  if (error || !community) {
    return <FullSizeError />;
  }

  if (!community.currentUser?.isMember) {
    return <CommunityRestricionPage community={community} />;
  }

  if (community.currentUser?.role == "member") {
    router.push("/");
  }

  return (
    <div className="size-full space-y-2 overflow-y-auto relative">
      <CommunitySettingsMain comm={community} />
    </div>
  );
}
