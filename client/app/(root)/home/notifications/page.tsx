import React from "react"
import Recommendations from "@/components/root/recommendations/recommendations"
import Notifications from "@/components/root/notifications/notifications"

export default function Page () {
    return <div className="w-full h-full overflow-hidden flex justify-around">
      <div className="w-full lg:w-[65%] 2xl:w-[40%] h-full">
        <Notifications />
      </div>
      <div className="w-[40%] 2xl:w-[30%] hidden lg:block h-full">
        <Recommendations />
      </div>
    </div>
}
