"use client";

import React, { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { UserItem } from "../common/user-item";
import { useGetFollowing } from "@/lib/hooks/follow/useFollow";
import { User } from "@/types/user";
import { Loader2 } from "lucide-react";

interface ShowFollowingProps {
  userId: string;
  count: number;
}

export default function ShowFollowing({ userId, count }: ShowFollowingProps) {
  const [page, setPage] = useState(1);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const { ref, inView } = useInView();

  const { data, isLoading, isFetching } = useGetFollowing(userId, {
    page,
    limit: 10,
  });

  // Append new users
  useEffect(() => {
    if (!data?.data) return;

    setAllUsers((prev) => {
      const newUsers = data.data.filter(
        (nu) => !prev.some((pu) => pu.id === nu.id)
      );
      return [...prev, ...newUsers];
    });
  }, [data]);

  // Load next page
  useEffect(() => {
    if (inView && data?.pagination?.hasMore && !isFetching) {
      setPage((prev) => prev + 1);
    }
  }, [inView, data?.pagination?.hasMore, isFetching]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex gap-1 items-center hover:underline decoration-1 underline-offset-4 transition-all">
          <span className="font-bold text-[15px]">{count}</span>
          <span className="text-muted-foreground text-[15px]">Following</span>
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[420px] p-0 gap-0 rounded-3xl overflow-hidden max-h-[85vh] flex flex-col">
        <DialogHeader className="p-4 border-b backdrop-blur-md sticky top-0 z-10">
          <DialogTitle className="text-center text-base font-bold">
            Following {count}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-2">
          {isLoading && allUsers.length === 0 ? (
            <div className="space-y-4 py-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          ) : (
            <>
              {allUsers.map((user) => (
                <UserItem key={user.id} user={user} />
              ))}

              {/* Intersection Observer */}
              <div
                ref={ref}
                className="h-10 flex items-center justify-center py-8"
              >
                {isFetching && (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                )}
              </div>

              {allUsers.length === 0 && !isLoading && (
                <div className="py-20 text-center">
                  <p className="font-bold text-xl">Not following anyone</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    When they follow people, they&apos;ll show up here.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
