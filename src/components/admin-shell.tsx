"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, LogOut, Shield } from "lucide-react";

import ThemeToggle from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { adminNavigation, isAdminNavigationActive } from "@/lib/admin-navigation";
import { cn } from "@/lib/utils";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const userName = user?.name || "Admin";
  const userInitials = userName
    .split(" ")
    .map((p: string) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="app-shell flex min-h-screen">
      {/* Sidebar */}
      <aside className="theme-nav sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r lg:flex">
        <div className="flex h-18 items-center gap-3 border-b px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-academic-blue to-blue-500 text-white shadow-[0_18px_35px_rgba(49,107,255,0.28)]">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">MySVGU</p>
            <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-academic-blue">
              <Shield className="h-3 w-3" />
              Admin Panel
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {adminNavigation.map((item) => {
            const isActive = isAdminNavigationActive(pathname, item.path);
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-academic-blue text-white shadow-[0_12px_25px_rgba(49,107,255,0.22)]"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-3">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3 dark:bg-slate-800/60">
            <Avatar className="h-9 w-9 ring-2 ring-white dark:ring-slate-700">
              <AvatarFallback className="bg-gradient-to-br from-academic-blue to-blue-500 text-xs font-semibold text-white">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{userName}</p>
              <p className="truncate text-xs text-slate-500">{user?.role || "ADMIN"}</p>
            </div>
            <ThemeToggle iconOnly className="h-8 w-8 rounded-lg" />
          </div>
          <Button
            variant="ghost"
            className="mt-2 w-full justify-start gap-2 text-sm text-slate-500 hover:text-red-600"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex flex-1 flex-col">
        <header className="theme-nav sticky top-0 z-50 flex h-14 items-center justify-between border-b px-4 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-academic-blue to-blue-500 text-white">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
              Admin Panel
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle iconOnly className="h-8 w-8 rounded-lg" />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Mobile nav tabs */}
        <div className="flex border-b lg:hidden">
          {adminNavigation.map((item) => {
            const isActive = isAdminNavigationActive(pathname, item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 py-3 text-xs font-semibold transition-all",
                  isActive
                    ? "border-b-2 border-academic-blue text-academic-blue"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <main className="relative flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
