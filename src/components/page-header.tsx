import * as React from "react";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  status?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  status,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("surface-panel-strong page-fade-in overflow-hidden p-6 sm:p-8", className)}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-4">
          {eyebrow ? <div className="hero-chip">{eyebrow}</div> : null}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl font-semibold text-slate-900 sm:text-4xl">{title}</h1>
              {status}
            </div>
            <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">{description}</p>
          </div>
        </div>
        {action ? <div className="flex shrink-0 items-center gap-3">{action}</div> : null}
      </div>
    </div>
  );
}
