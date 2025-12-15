"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { NotificationDto } from "@/features/api/notifications.api";
import { useSession } from "../hooks/auth/useGetSession";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  unreadCount: number;
  resetUnreadCount: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  unreadCount: 0,
  resetUnreadCount: () => {},
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { data } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const user = data?.user || null;

  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) {
      console.log("🔴 No user found, skipping socket connection");
      return;
    }

    console.log("🔄 Attempting to connect to socket with user:", user.id);

    const newSocket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5500",
      {
        query: { userId: user.id },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }
    );

    newSocket.on("connect", () => {
      console.log("🟢 Connected to Notification Gateway");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("🔴 Disconnected");
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
      setIsConnected(false);
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
      setIsConnected(true);
    });

    newSocket.on("reconnect_error", (error) => {
      console.error("❌ Socket reconnection error:", error);
    });

    newSocket.on("notification", (newNotification: NotificationDto) => {
      console.log("📨 Received notification:", newNotification);

      try {
        const audio = new Audio("/sounds/pop.mp3");
        audio.play().catch(() => {
          console.log("Notification sound not available");
        });
      } catch (error) {
        console.log("Could not play notification sound");
      }

      setUnreadCount((prev) => prev + 1);

      // Update React Query cache
      queryClient.setQueryData(
        ["notifications"],
        (oldData: NotificationDto[] = []) => {
          return [newNotification, ...oldData];
        }
      );

      // Also invalidate to refresh from server
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      toast(newNotification.actor.name, {
        description: newNotification.content,
        action: {
          label: "View",
          onClick: () => (window.location.href = newNotification.actionUrl),
        },
      });
    });

    queueMicrotask(() => setSocket(newSocket));

    return () => {
      console.log("🔌 Disconnecting socket");
      newSocket.disconnect();
    };
  }, [user]);

  const resetUnreadCount = () => setUnreadCount(0);

  return (
    <SocketContext.Provider
      value={{ socket, isConnected, unreadCount, resetUnreadCount }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
