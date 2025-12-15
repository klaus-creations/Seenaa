"use client";

import Link from "next/link";
import { NAV_TOP, NAV_BOTTOM } from "@/constants/nav-links";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { useSignOut } from "@/lib/hooks/auth/useSignOut";

export default function SideNav() {
  const router = useRouter();
  const pathname = usePathname(); // 1. Get current path
  const { mutate, isPending, error } = useSignOut();

  if (error) {
    console.error("Logout failed:", error);
  }

  async function handleLogout() {
    mutate(undefined, {
      onSuccess: () => {
        router.push("/");
        toast.success("Successfully signed out");
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (error: any) => {
        console.error("Registration failed:", error);
      },
    });
  }

  return (
    <aside className="size-full border-r flex flex-col justify-between py-6 px-3">
      {/* TOP NAV */}
      <nav className="flex flex-col gap-6 items-start">
        {NAV_TOP.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href; //

          return (
            <Link
              key={item.title}
              href={item.href}
              className={`flex items-center gap-3 transition tracking-[1px] ${
                isActive
                  ? "text-foreground font-bold"
                  : "text-foreground-tertiary medium"
              }`}
            >
              {/* <Icon className="size-5" /> */}
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* BOTTOM NAV */}
      <nav className="flex flex-col items-start gap-4">
        {NAV_BOTTOM.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href; // 2. Check if active

          // ✅ LOGOUT HANDLER
          if (item.href === "/logout") {
            return (
              <button
                key={item.title}
                onClick={handleLogout}
                disabled={isPending}
                className="flex items-center gap-3 transition disabled:opacity-50 text-foreground-secondary"
              >
                <Icon className="size-5" />
                <span>{isPending ? "Signing out..." : item.title}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.title}
              href={item.href}
              className={`flex items-center gap-3 transition ${
                isActive
                  ? "text-foreground font-bold"
                  : "text-foreground-tertiary font-medium"
              }`}
            >
              <Icon className="size-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
