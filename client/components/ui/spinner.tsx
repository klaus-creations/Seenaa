import { LoaderIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cn("size-6 lg:size-8 animate-spin text-primary", className)}
      {...props}
    />
  );
}

export { Spinner };
