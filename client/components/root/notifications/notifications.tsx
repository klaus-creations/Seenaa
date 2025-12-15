"use client";

import React from "react"
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getNotificationsRequest,
  markReadRequest,
} from "@/features/api/notifications.api";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { format } from "date-fns";
import { CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SectionHeading from "../common/section-heading";

export default function Notifications() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["notifications", "full-history"],
      queryFn: ({ pageParam = 0 }) => getNotificationsRequest(20, pageParam),
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === 20 ? allPages.length * 20 : undefined;
      },
    });


  console.log("This notifications data ");
  console.log(data)

  const markReadMutation = useMutation({
    mutationFn: markReadRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const handleNotificationClick = (notif: any) => {
    if (!notif.isRead) markReadMutation.mutate(notif.id);
    router.push(notif.actionUrl);
  };

  if (isLoading)
    return <div className="p-10 text-center">Loading history...</div>;

  return (
    <div className="w-full">
      <SectionHeading name="Notifications" />

      <div className="space-y-2">
        {data?.pages.map((group, i) => (
          <div key={i} className="space-y-2">
            {group.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`flex items-start gap-4 p-4 rounded-xl border transition cursor-pointer hover:shadow-md ${
                  notif.isRead
                    ? "border-primary/40"
                    : "bg-linear-to-r from-primary/2 to-secondary/3 border-primary"
                }`}
              >
                <Image
                  src={notif.actor.image || "/images/profile-placeholder.svg"}
                  alt={notif.actor.name}
                  width={30}
                  height={30}
                  className="size-7 lg:size-10 rounded-full object-cover border"
                />

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="text-foreground-secondary text-sm">
                      <span className="font-bold">{notif.actor.name}</span>{" "}
                      {notif.content}
                    </p>
                    {notif.isRead && (
                      <CheckCheck className="w-4 h-4 text-gray-300" />
                    )}
                  </div>

                  <div className="mt-2 text-xs text-foreground-tertiary">
                    {format(new Date(notif.createdAt), "PPP p")}{" "}
                  </div>
                </div>

                {!notif.isRead && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div ref={ref} className="py-8 text-center text-sm text-gray-500">
        {isFetchingNextPage
          ? "Loading more..."
          : hasNextPage
          ? "Scroll for more"
          : "No more notifications"}
      </div>
    </div>
  );
}
