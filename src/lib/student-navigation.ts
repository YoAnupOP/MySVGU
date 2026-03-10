import {
  BellRing,
  Bot,
  CalendarDays,
  LayoutDashboard,
  MessageSquareText,
  type LucideIcon,
} from "lucide-react";

export interface StudentNavigationItem {
  path: string;
  label: string;
  mobileLabel: string;
  icon: LucideIcon;
}

export const studentNavigation: StudentNavigationItem[] = [
  {
    path: "/dashboard",
    label: "Dashboard",
    mobileLabel: "Home",
    icon: LayoutDashboard,
  },
  {
    path: "/asksvgu",
    label: "AskSVGU",
    mobileLabel: "AskSVGU",
    icon: MessageSquareText,
  },
  {
    path: "/chatbot",
    label: "SVGU AI",
    mobileLabel: "AI",
    icon: Bot,
  },
  {
    path: "/timetable",
    label: "Timetable",
    mobileLabel: "Schedule",
    icon: CalendarDays,
  },
  {
    path: "/announcements",
    label: "Updates",
    mobileLabel: "Updates",
    icon: BellRing,
  },
];

export function isStudentNavigationActive(pathname: string | null, itemPath: string) {
  if (!pathname) {
    return false;
  }

  if (itemPath === "/dashboard") {
    return pathname === "/" || pathname === "/dashboard";
  }

  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}
