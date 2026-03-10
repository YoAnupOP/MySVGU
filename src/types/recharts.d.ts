declare module "recharts" {
  import * as React from "react";

  export type LegendProps = {
    payload?: any[];
    verticalAlign?: "top" | "bottom" | "middle";
    [key: string]: unknown;
  };

  export const ResponsiveContainer: React.ComponentType<any>;
  export const Tooltip: React.ComponentType<any>;
  export const Legend: React.ComponentType<any>;
}
