"use client";

import { toast as sonnerToast } from "sonner";
import type * as React from "react";

export interface Toast {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
  action?: React.ReactNode;
}

export function useToast() {
  const toast = (props: Toast) => {
    if (props.variant === "destructive") {
      sonnerToast.error(props.title, {
        description: props.description,
      });
      return;
    }

    sonnerToast(props.title, {
      description: props.description,
    });
  };

  return {
    toast,
    toasts: [] as Array<Toast & { id: string }>,
  };
}
