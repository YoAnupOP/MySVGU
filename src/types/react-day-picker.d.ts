declare module "react-day-picker" {
  import * as React from "react";

  export interface DayPickerProps {
    className?: string;
    classNames?: Record<string, string>;
    components?: Record<string, React.ComponentType<any>>;
    showOutsideDays?: boolean;
    [key: string]: unknown;
  }

  export const DayPicker: React.ComponentType<DayPickerProps>;
}
