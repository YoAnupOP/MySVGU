import * as React from "react";

import MobileNav from "@/components/mobile-nav";
import Navbar from "@/components/navbar";
import { cn } from "@/lib/utils";

export default function StudentShell({
  children,
  containerClassName,
}: {
  children: React.ReactNode;
  containerClassName?: string;
}) {
  return (
    <div className="app-shell">
      <div className="theme-shell-glow pointer-events-none absolute inset-0" />
      <Navbar />
      <MobileNav />
      <main className={cn("relative mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:py-8 lg:pb-12", containerClassName)}>
        {children}
      </main>
    </div>
  );
}
