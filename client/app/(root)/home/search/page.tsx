import React from "react"
import Recommendations from "@/components/root/recommendations/recommendations"
import Search from "@/components/root/search/search"

export default function Page () {
    return <div className="w-full h-full overflow-hidden flex justify-around">
      <div className="w-full lg:w-[65%] 2xl:w-[40%] h-full">
        <Search />
      </div>
      <div className="w-[40%] 2xl:w-[30%] hidden lg:block h-full">
        <Recommendations />
      </div>
    </div>
}
