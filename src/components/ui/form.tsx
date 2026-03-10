"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

type FormFieldContextValue = {
  name?: string;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({});

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({ id: "" });

type FormProps = {
  children: React.ReactNode;
};

const Form = ({ children }: FormProps) => <>{children}</>;

const FormField = ({
  name,
  children,
  render,
}: {
  name: string;
  children?: React.ReactNode;
  render?: (props: { field: Record<string, never>; fieldState: { error?: undefined } }) => React.ReactNode;
}) => {
  return (
    <FormFieldContext.Provider value={{ name }}>
      {render ? render({ field: {}, fieldState: {} }) : children ?? null}
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const id = itemContext.id;

  return {
    id,
    name: fieldContext.name,
    formItemId: id ? `${id}-form-item` : undefined,
    formDescriptionId: id ? `${id}-form-item-description` : undefined,
    formMessageId: id ? `${id}-form-item-message` : undefined,
    error: undefined,
  };
};

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = React.useId();

    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={cn("space-y-2", className)} {...props} />
      </FormItemContext.Provider>
    );
  },
);
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { formItemId } = useFormField();

  return <Label ref={ref} className={cn(className)} htmlFor={formItemId} {...props} />;
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { formItemId, formDescriptionId, formMessageId } = useFormField();

    return (
      <div
        ref={ref}
        id={formItemId}
        aria-describedby={[formDescriptionId, formMessageId].filter(Boolean).join(" ") || undefined}
        className={className}
        {...props}
      />
    );
  },
);
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { formDescriptionId } = useFormField();

    return (
      <p ref={ref} id={formDescriptionId} className={cn("text-sm text-muted-foreground", className)} {...props} />
    );
  },
);
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    const { formMessageId } = useFormField();

    if (!children) {
      return null;
    }

    return (
      <p ref={ref} id={formMessageId} className={cn("text-sm font-medium text-destructive", className)} {...props}>
        {children}
      </p>
    );
  },
);
FormMessage.displayName = "FormMessage";

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
