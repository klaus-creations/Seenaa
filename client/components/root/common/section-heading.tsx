import React from "react"

interface SectionHeadingProps {
    name: string;
}
export default function SectionHeading( { name } : SectionHeadingProps) {
    return <div className="w-full h-14 flex items-center justify-between">
        <h2 className="text-xl lg:text-2xl"> { name } </h2>
    </div>
}
