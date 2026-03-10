import { Award } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { CommunityBadge } from "@/lib/community-shared";
import { cn } from "@/lib/utils";

const toneClasses = {
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  violet: "border-violet-200 bg-violet-50 text-violet-700",
} as const;

export function CommunityBadges({
  badges,
  className,
  limit,
}: {
  badges: CommunityBadge[];
  className?: string;
  limit?: number;
}) {
  const visibleBadges = typeof limit === "number" ? badges.slice(0, limit) : badges;

  if (visibleBadges.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {visibleBadges.map((badge) => (
        <Badge
          key={badge.key}
          variant="outline"
          title={badge.description}
          className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", toneClasses[badge.tone])}
        >
          <Award className="mr-1.5 h-3 w-3" />
          {badge.label}
        </Badge>
      ))}
    </div>
  );
}
