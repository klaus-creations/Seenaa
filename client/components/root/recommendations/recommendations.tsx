import React from "react"
import SectionHeading from "../common/section-heading"
import PeopleRecommendations from "./people-recommendations"
import CommunityRecommendations from "./community-recommendations"

export default function Recommendations () {
    return <div className="size-full flex flex-col py-3 justify-between">
        <SectionHeading name="Recommendations" />
        <PeopleRecommendations />
        <CommunityRecommendations />
    </div>
}
