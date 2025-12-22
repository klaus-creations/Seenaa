import React from "react";
import PeopleRecommendations from "./people-recommendations";
import CommunityRecommendations from "./community-recommendations";

export default function Recommendations() {
  return (
    <div className="size-full flex flex-col justify-between">
      <PeopleRecommendations />
      <CommunityRecommendations />
    </div>
  );
}
