"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, GraduationCap, LogOut, Sparkles, User } from "lucide-react";

import ThemeToggle from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { isStudentNavigationActive, studentNavigation } from "@/lib/student-navigation";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const userName = user?.name || "Student";
  const userIdentifier = user?.studentId || "No ID";
  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((namePart: string) => namePart[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "S";

  return (
    <nav className="theme-nav sticky top-0 z-50 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-academic-blue to-blue-500 text-white shadow-[0_18px_35px_rgba(49,107,255,0.28)]">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <p className="font-display text-xl font-semibold text-slate-900">MySVGU</p>
              <p className="text-xs text-slate-500">Smart campus super-app</p>
            </div>
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            {studentNavigation.map((item) => {
              const isActive = isStudentNavigationActive(pathname, item.path);
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "h-10 rounded-full px-4 text-sm",
                      isActive
                        ? "bg-academic-blue text-white shadow-[0_18px_35px_rgba(49,107,255,0.22)]"
                        : "text-slate-600 hover:bg-blue-50 hover:text-academic-blue",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm md:flex">
            <Sparkles className="h-3.5 w-3.5 text-academic-blue" />
            Campus-ready
          </div>

          <ThemeToggle iconOnly className="rounded-full shadow-sm" />

          <Button
            variant="outline"
            size="icon"
            className="hidden rounded-full shadow-sm md:inline-flex"
          >
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-11 rounded-full px-2.5 shadow-sm sm:px-3.5"
              >
                <Avatar className="h-8 w-8 ring-2 ring-white">
                  <AvatarImage src={user?.profile?.avatarUrl} alt={userName} />
                  <AvatarFallback className="bg-gradient-to-br from-academic-blue to-blue-500 text-xs font-semibold text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold text-slate-900">{userName}</p>
                  <p className="text-xs text-slate-500">{userIdentifier}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 shadow-xl backdrop-blur-xl">
              <div className="rounded-2xl bg-slate-50/90 px-3 py-3">
                <p className="font-semibold text-slate-900">{userName}</p>
                <p className="text-xs text-slate-500">{userIdentifier}</p>
                <p className="mt-2 text-xs text-slate-600">Signed in to your smart student workspace.</p>
              </div>
              <DropdownMenuSeparator />
              <div className="px-1 py-1.5">
                <ThemeToggle className="w-full justify-start" />
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer rounded-xl">
                <User className="mr-2 h-4 w-4" />
                Profile settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer rounded-xl text-red-600 focus:text-red-600" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
