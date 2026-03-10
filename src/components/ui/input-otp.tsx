import * as React from "react";
import { Dot } from "lucide-react";

import { cn } from "@/lib/utils";

type InputOTPProps = React.HTMLAttributes<HTMLDivElement> & {
  containerClassName?: string;
};

const InputOTP = React.forwardRef<HTMLDivElement, InputOTPProps>(
  ({ className, containerClassName, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center gap-2 has-[:disabled]:opacity-50", containerClassName)}
      {...props}
    >
      <div className={cn("flex items-center gap-2 disabled:cursor-not-allowed", className)}>{children}</div>
    </div>
  ),
);
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex items-center", className)} {...props} />,
);
InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { index: number; char?: React.ReactNode; isActive?: boolean }
>(({ className, char, isActive, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
      isActive && "z-10 ring-2 ring-ring ring-offset-background",
      className,
    )}
    {...props}
  >
    {char}
  </div>
));
InputOTPSlot.displayName = "InputOTPSlot";

const InputOTPSeparator = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  (props, ref) => (
    <div ref={ref} role="separator" {...props}>
      <Dot />
    </div>
  ),
);
InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
