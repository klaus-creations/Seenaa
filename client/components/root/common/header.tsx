"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useSession } from "@/lib/hooks/auth/useGetSession";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { data: session, isLoading } = useSession();
  console.log("Session Data in Header:", session);

  const getInitials = (name: string) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "U";
  };

  return (
    <header
      className="size-full flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4
     py-3 sticky top-0 z-50 bg-primary/1 backdrop-blur"
    >
      {/* --- Left Side: Logo --- */}
      <Link href={"/"} className="flex items-center gap-2 group">
        <span className="text-xl font-bold text-primary flex items-center gap-1">
          Seenaa
        </span>
      </Link>

      <div className="flex items-center gap-4">
        {isLoading ? (
          // Loading Skeleton
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        ) : session ? (
          // Authenticated State
          <>
            <NotificationButton count={3} />
            <UserProfile session={session} getInitials={getInitials} />
          </>
        ) : (
          // Unauthenticated State
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

function NotificationButton({ count = 0 }: { count?: number }) {
  return (
    <Link
      href="/home/notifications"
      className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
      aria-label="Notifications"
    >
      <Bell className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-950">
          {count}
        </span>
      )}
    </Link>
  );
}

function UserProfile({
  session,
  getInitials,
}: {
  session: any;
  getInitials: (name: string) => string;
}) {
  const user = session?.user || session;


  return (
    <div className="flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-gray-800">
      <div className="hidden md:flex flex-col items-end">
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {user?.name || "User"}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {user?.displayUsername || "@username"}
        </span>
      </div>

      <Avatar className="h-9 w-9 border border-gray-200 dark:border-gray-700 cursor-default">
        <AvatarImage
          src={user?.avatarUrl || user?.image}
          alt={user?.name || "User"}
          className="object-cover"
        />
        <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100">
          {getInitials(user?.name || "")}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
