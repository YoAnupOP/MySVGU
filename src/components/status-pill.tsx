import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const variantClasses = {
  live: "border-emerald-200 bg-emerald-50 text-emerald-700",
  progress: "border-blue-200 bg-blue-50 text-blue-700",
  coming: "border-amber-200 bg-amber-50 text-amber-700",
  spotlight: "border-white/40 bg-white/80 text-slate-700",
  online: "border-emerald-200 bg-emerald-50 text-emerald-700",
} as const;

export function StatusPill({
  children,
  variant = "spotlight",
  className,
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: keyof typeof variantClasses;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </Badge>
  );
}
