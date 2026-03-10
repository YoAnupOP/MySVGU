"use client";

import * as React from "react";
import { GripVertical } from "lucide-react";

import { cn } from "@/lib/utils";

const ResizablePanelGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className)}
      {...props}
    />
  ),
);
ResizablePanelGroup.displayName = "ResizablePanelGroup";

const ResizablePanel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("min-w-0 min-h-0", className)} {...props} />,
);
ResizablePanel.displayName = "ResizablePanel";

const ResizableHandle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { withHandle?: boolean }
>(({ withHandle, className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex w-px items-center justify-center bg-border data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full",
      className,
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </div>
));
ResizableHandle.displayName = "ResizableHandle";

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
