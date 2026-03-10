"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { studentNavigation, isStudentNavigationActive } from "@/lib/student-navigation";
import { cn } from "@/lib/utils";

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="theme-mobile-nav fixed inset-x-0 bottom-0 z-40 border-t px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 backdrop-blur-xl lg:hidden">
      <div className="theme-mobile-nav-inner mx-auto grid max-w-xl grid-cols-5 gap-1 rounded-[1.75rem] border p-1.5 shadow-[0_18px_45px_rgba(15,42,94,0.16)]">
        {studentNavigation.map((item) => {
          const isActive = isStudentNavigationActive(pathname, item.path);
          return (
            <Link key={item.path} href={item.path} className="group">
              <div
                className={cn(
                  "flex flex-col items-center justify-center rounded-[1.2rem] px-1 py-2 text-[11px] font-semibold transition-all duration-200",
                  isActive
                    ? "bg-academic-blue text-white shadow-[0_15px_30px_rgba(49,107,255,0.25)]"
                    : "text-slate-500 group-hover:bg-white group-hover:text-academic-blue",
                )}
              >
                <item.icon className="mb-1 h-[18px] w-[18px]" />
                <span className="truncate">{item.mobileLabel}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
