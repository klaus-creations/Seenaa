"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { useSocket } from "@/lib/context/socket.context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotificationsRequest,
  markAllReadRequest,
  markReadRequest,
} from "@/features/api/notifications.api";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import Image from "next/image";

export const NotificationBell = () => {
  const router = useRouter();
  const { unreadCount, resetUnreadCount } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch History (React Query)
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotificationsRequest(),
    enabled: isOpen, // Only fetch when dropdown opens (Optimization)
  });

  // Mark as Read Mutation
  const markReadMutation = useMutation({
    mutationFn: markReadRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      resetUnreadCount(); // Clear red badge locally
      markAllReadRequest(); // Tell backend we saw them
    }
  };

  const handleClickItem = (notif: any) => {
    markReadMutation.mutate(notif.id);
    setIsOpen(false);
    router.push(notif.actionUrl);
  };

  return (
    <div className="relative">
      {/* 🔔 The Icon */}
      <button
        onClick={handleOpen}
        className="p-2 rounded-full hover:bg-gray-100 relative transition"
      >
        <Bell className="w-6 h-6 text-gray-700" />

        {/* 🔴 The Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* 📜 The Dropdown List */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Notifications</h3>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {isLoading && (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            )}

            {notifications?.length === 0 && (
              <div className="p-8 text-center text-gray-500 text-sm">
                No notifications yet.
              </div>
            )}

            {notifications?.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleClickItem(notif)}
                className={`p-4 flex gap-3 hover:bg-gray-50 cursor-pointer transition border-b border-gray-100 ${
                  !notif.isRead ? "bg-blue-50/50" : ""
                }`}
              >
                {/* Avatar */}
                <Image
                  src={notif.actor.image || "/default-avatar.png"}
                  alt="hello world"
                  width={20}
                  height={20}
                  className="w-10 h-10 rounded-full object-cover"
                />

                {/* Content */}
                <div className="flex-1">
                  <p className="text-sm text-gray-800">
                    <span className="font-bold">{notif.actor.name}</span>{" "}
                    {notif.content}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(notif.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>

                {/* Blue Dot for unread */}
                {!notif.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop to close when clicking outside */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};
