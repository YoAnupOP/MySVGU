"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  GraduationCap, 
  Bell, 
  ChevronDown,
  LayoutDashboard,
  Calendar,
  Megaphone,
  Bot,
  LogOut,
  User
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    // PROTOTYPE MODE - Just redirect to landing page
    // TODO: Implement real logout when adding authentication
    window.location.href = "/landing";
  };

  const userName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Student';
  const userInitials = user?.firstName ? `${user.firstName[0]}${user.lastName?.[0] || ''}` : 'S';

  const navigationItems = [
    { 
      path: "/dashboard", 
      label: "Dashboard", 
      icon: LayoutDashboard,
      isActive: pathname === "/" || pathname === "/dashboard"
    },
    { 
      path: "/timetable", 
      label: "Timetable", 
      icon: Calendar,
      isActive: pathname === "/timetable"
    },
    { 
      path: "/announcements", 
      label: "Updates", 
      icon: Megaphone,
      isActive: pathname === "/announcements"
    },
    { 
      path: "/chatbot", 
      label: "AI Assistant", 
      icon: Bot,
      isActive: pathname === "/chatbot"
    },
  ];

  return (
    <nav className="bg-card-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <GraduationCap className="h-8 w-8 text-academic-blue mr-2" />
              <span className="text-xl font-bold text-slate-text">MySVGU</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {navigationItems.map((item) => (
                  <Link key={item.path} href={item.path}>
                    <Button
                      variant={item.isActive ? "default" : "ghost"}
                      className={`text-sm font-medium transition-colors ${
                        item.isActive 
                          ? "bg-academic-blue text-white hover:bg-deep-blue" 
                          : "text-slate-text hover:text-academic-blue"
                      }`}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          {/* Profile Section */}
          <div className="flex items-center space-x-4">
            
            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2 rounded-full text-slate-text hover:bg-gray-100 transition-colors"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </Button>
            
            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl} alt={userName} />
                    <AvatarFallback className="text-sm font-semibold bg-academic-blue text-white">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-slate-text hidden sm:block">
                    {userName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-slate-text">{userName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
