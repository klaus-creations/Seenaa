"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { LANDING_NAV_ITEMS } from "@/constants/landing-nav-links";

// Components
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import Logo from "@/components/shared/logo";
import { cn } from "@/lib/utils";

export default function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl transition-all">
      <div className="container mx-auto">
        <div className="relative flex h-16 items-center justify-between">

          <div className="flex items-center">
            <Logo />
          </div>

          <nav className="hidden lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:flex items-center gap-1">
            {LANDING_NAV_ITEMS.map((item) => (
              <Link key={item.label} href={item.href}>
                <Button
                  variant="ghost"
                  className="text-sm font-medium text-foreground-secondary hover:text-foreground hover:bg-transparent transition-colors rounded-full "
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <ThemeToggle />
                <Button variant="outline" className="rounded-full">
                  <Link href="/auth/sign-in">
                    Sign in
                  </Link>
                </Button>

                <Button variant="btn">
                  <Link href="/auth/sign-up">
                    Get Started
                  </Link>
                </Button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full hover:bg-secondary/50 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div
        className={cn(
          "lg:hidden fixed inset-x-0 bg-background border-b transition-all duration-300 ease-in-out",
          mobileMenuOpen ? "top-16 opacity-100 visible h-auto" : "top-[-100%] opacity-0 invisible h-0"
        )}
      >
        <div className="flex flex-col p-6 space-y-4">
          {LANDING_NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <hr className="border-border/50" />
          <div className="flex flex-col gap-3 pt-2">
            <Link href="/signin" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full rounded-xl py-6 font-bold">Sign in</Button>
            </Link>
            <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full rounded-xl py-6 font-bold">Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
