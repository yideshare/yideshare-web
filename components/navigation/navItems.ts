import {
  Bookmark,
  Calendar,
  MessageSquare,
  PowerOffIcon,
  User,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  /** Rendered as a button rather than a link in the desktop nav. */
  isButton?: boolean;
}

/**
 * Primary navigation destinations, shared by the desktop nav and the mobile
 * menu so the two cannot drift apart.
 */
export const navItems: NavItem[] = [
  {
    title: "Feed",
    url: "/feed",
    icon: Calendar,
  },
  {
    title: "My Posts",
    url: "/your-rides",
    icon: User,
  },
  {
    title: "Saved Rides",
    url: "/bookmarks",
    icon: Bookmark,
  },
  {
    title: "Messages",
    url: "/messages",
    icon: MessageSquare,
  },
  {
    title: "Logout",
    url: "/api/auth/logout",
    icon: PowerOffIcon,
    isButton: true,
  },
];
