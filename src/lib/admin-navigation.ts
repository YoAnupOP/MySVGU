import {
  BellRing,
  LayoutDashboard,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavigationItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

export const adminNavigation: AdminNavigationItem[] = [
  {
    path: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    path: "/admin/announcements",
    label: "Announcements",
    icon: BellRing,
  },
  {
    path: "/admin/users",
    label: "Users",
    icon: Users,
  },
];

export function isAdminNavigationActive(pathname: string | null, itemPath: string) {
  if (!pathname) return false;
  if (itemPath === "/admin") return pathname === "/admin";
  return pathname.startsWith(itemPath);
}
