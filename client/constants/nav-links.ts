import {
  Home,
  Search,
  Bell,
  // MessageCircle,
  User,
  Settings,
  LogOut,
  Users,
} from "lucide-react";

export const NAV_TOP = [
  {
    title: "Home",
    href: "/home",
    icon: Home,
  },
  {
    title: "Communities",
    href: "/home/community",
    icon: Users,
  },
  {
    title: "Search",
    href: "/home/search",
    icon: Search,
  },
  {
    title: "Notifications",
    href: "/home/notifications",
    icon: Bell,
  },
  // {
  //   title: "Messages",
  //   href: "/messages",
  //   icon: MessageCircle,
  // },
];

export const NAV_BOTTOM = [
  {
    title: "Profile",
    href: "/home/profile",
    icon: User,
  },
  {
    title: "Settings",
    href: "/home/settings",
    icon: Settings,
  },
  {
    title: "Logout",
    href: "/logout",
    icon: LogOut,
  },
];
