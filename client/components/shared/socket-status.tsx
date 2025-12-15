"use client";

import { useSocket } from "@/lib/context/socket.context";

export const SocketStatus = () => {
  const { isConnected } = useSocket();

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          isConnected
            ? "bg-green-100 text-green-800 border border-green-200"
            : "bg-red-100 text-red-800 border border-red-200"
        }`}
      >
        Socket: {isConnected ? "Connected" : "Disconnected"}
      </div>
    </div>
  );
};
