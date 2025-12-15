// src/constants/navigation.ts
export const LANDING_NAV_ITEMS = [
  { label: "Features", href: "#features" },
  { label: "Communities", href: "#communities" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About", href: "/about" },
  { label: "Sign In", href: "/auth/sign-in", variant: "outline" as const },
  {
    label: "Join Free",
    href: "/auth/sign-up",
    variant: "default" as const,
    highlight: true,
  },
];
