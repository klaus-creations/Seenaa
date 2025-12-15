"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useThemeContext } from "@/components/providers/theme-provider";
import { Sun, Moon } from "lucide-react";

export function ThemeTogglePopover() {
  const { isDarkMode, toggleTheme } = useThemeContext();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-background/[.] backdrop-blur-sm border border-border/10 hover:bg-background/60 transition-all text-foreground"
          aria-label="Toggle Theme"
        >
          {isDarkMode ? (
            <Moon className="size-4" />
          ) : (
            <Sun className="size-4" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-40 p-3 bg-background/80 backdrop-blur-md border-border/50 shadow-lg"
        align="end"
      >
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            onClick={() => !isDarkMode && toggleTheme()}
            className={`justify-start gap-2 h-8 px-2 text-xs font-normal ${
              !isDarkMode ? "bg-accent/50" : "hover:bg-accent/20"
            }`}
          >
            <Sun className="size-3.5 text-amber-500" />
            <span>Light</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => isDarkMode && toggleTheme()}
            className={`justify-start gap-2 h-8 px-2 text-xs font-normal ${
              isDarkMode ? "bg-accent/50" : "hover:bg-accent/20"
            }`}
          >
            <Moon className="size-3.5 text-slate-400" />
            <span>Dark</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
