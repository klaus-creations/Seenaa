"use client";

import { LANDING_NAV_ITEMS } from "@/constants/landing-nav-links";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useState } from "react";

export default function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b">
      <div className="backdrop-blur-lg bg-linear-to-r from-primary/5 to-secondary/10">
        <div className="container mx-auto">
          <div className="flex h-16 lg:h-20 items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <span className="text-2xl lg:text-3xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                Seenaa
              </span>
            </Link>

            <nav className="hidden lg:flex items-center space-x-1 text-gray-600">
              {LANDING_NAV_ITEMS.map((item) => (
                <Link key={item.label} href={item.href}>
                  <Button variant={item.variant || "ghost"}>
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/20 transition"
            >
              <Menu className="h-7 w-7" />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:lg-hidden border-t border-white/10 backdrop-blur-xl bg-white/80 dark:bg-black/80">
            <div className="container mx-auto px-6 py-6 space-y-3">
              {LANDING_NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block"
                >
                  <Button variant={item.variant || "ghost"}>
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
