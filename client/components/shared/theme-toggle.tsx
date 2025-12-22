"use client";

import * as React from "react";
import { Moon, Sun, Check } from "lucide-react";
import { useTheme } from "@/features/slices/theme"; // Adjust path to your Zustand store

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { isDarkMode, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Prevent hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true);
    // Apply the class to document for Tailwind's dark: selector
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="rounded-full w-9 h-9">
        <Sun className="h-[1.2rem] w-[1.2rem] opacity-0" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full w-9 h-9 focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-secondary/50 transition-colors"
        >
          {isDarkMode ? (
            <Moon className="h-[1.1rem] w-[1.1rem] transition-all" />
          ) : (
            <Sun className="h-[1.1rem] w-[1.1rem] transition-all" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[130px] rounded-xl p-1 shadow-lg border-muted/40">
        <DropdownMenuItem
          onClick={() => setTheme(false)}
          className="flex items-center justify-between cursor-pointer rounded-lg px-3 py-2 text-sm font-medium"
        >
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <span>Light</span>
          </div>
          {!isDarkMode && <Check className="h-4 w-4 opacity-70" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme(true)}
          className="flex items-center justify-between cursor-pointer rounded-lg px-3 py-2 text-sm font-medium"
        >
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            <span>Dark</span>
          </div>
          {isDarkMode && <Check className="h-4 w-4 opacity-70" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
