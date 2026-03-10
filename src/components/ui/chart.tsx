"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
    theme?: Record<string, string>;
  };
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
  }
>(({ className, config, children, ...props }, ref) => {
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        className={cn("flex aspect-video items-center justify-center rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500", className)}
        {...props}
      >
        {children}
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "ChartContainer";

function ChartStyle() {
  return null;
}

const ChartTooltip = ({ children }: React.PropsWithChildren) => <>{children}</>;

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: "line" | "dot" | "dashed";
    nameKey?: string;
    labelKey?: string;
  }
>(({ className, children, ...props }, ref) => {
  useChart();

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-slate-text shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
ChartTooltipContent.displayName = "ChartTooltipContent";

const ChartLegend = ({ children }: React.PropsWithChildren) => <>{children}</>;

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    hideIcon?: boolean;
    nameKey?: string;
    payload?: Array<{ value?: React.ReactNode; color?: string }>;
    verticalAlign?: "top" | "bottom" | "middle";
  }
>(({ className, payload, verticalAlign = "bottom", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center gap-4 text-xs text-gray-500",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className,
      )}
      {...props}
    >
      {payload?.map((item, index) => (
        <div key={`${item.value || index}`} className="flex items-center gap-1.5">
          <div
            className="h-2 w-2 rounded-[2px]"
            style={{ backgroundColor: item.color || "currentColor" }}
          />
          <span>{item.value}</span>
        </div>
      ))}
    </div>
  );
});
ChartLegendContent.displayName = "ChartLegendContent";

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};
