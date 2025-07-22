"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Calendar, 
  Bot, 
  Bell 
} from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  const navigationItems = [
    { 
      path: "/dashboard", 
      label: "Dashboard", 
      icon: LayoutDashboard,
      isActive: pathname === "/" || pathname === "/dashboard"
    },
    { 
      path: "/timetable", 
      label: "Schedule", 
      icon: Calendar,
      isActive: pathname === "/timetable"
    },
    { 
      path: "/chatbot", 
      label: "AI Chat", 
      icon: Bot,
      isActive: pathname === "/chatbot"
    },
    { 
      path: "/announcements", 
      label: "Updates", 
      icon: Bell,
      isActive: pathname === "/announcements"
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card-white border-t border-gray-200 z-40">
      <div className="grid grid-cols-4 gap-1 p-2">
        {navigationItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <Button
              variant="ghost"
              className={`flex flex-col items-center py-2 px-1 h-auto space-y-1 w-full ${
                item.isActive 
                  ? "text-academic-blue bg-blue-50" 
                  : "text-gray-500 hover:text-academic-blue hover:bg-gray-50"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
