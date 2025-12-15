import React from "react";
import { Loader2, AlertCircle } from "lucide-react";

export function FullSizeLoader({ text = "Loading, please wait..." }) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 rounded-2xl px-8 py-6 shadow-sm bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground text-center">{text}</p>
      </div>
    </div>
  );
}

export function FullSizeError({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
}) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="max-w-md w-full flex flex-col items-center gap-4 rounded-2xl px-8 py-6 border bg-background shadow-sm">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-destructive/10">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
}
