"use client";

import { ReactNode } from "react";
import { ReactQueryProvider } from "./tanstack-provider";
import { ThemeProvider } from "./theme-provider";
import { SocketProvider } from "@/lib/context/socket.context";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ReactQueryProvider>
      <SocketProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </SocketProvider>
    </ReactQueryProvider>
  );
}
