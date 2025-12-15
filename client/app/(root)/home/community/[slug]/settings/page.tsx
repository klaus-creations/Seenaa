import CommunitySettings from "@/components/root/community/community-settings"
import React from "react"

export default async function ( { params } : { params: { params : Promise <{ slug: string}>}} ) {
    const { slug } = await params;

    return <CommunitySettings  slug={slug}/>
}
