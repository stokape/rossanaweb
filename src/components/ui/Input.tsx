import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm md:text-base font-medium text-rossana-charcoal"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            "h-12 md:h-[50px] w-full rounded-input border px-4 text-base",
            "bg-rossana-warm-white placeholder:text-rossana-charcoal/40",
            "focus:outline-none focus:ring-2 focus:ring-rossana-red/40 focus:border-rossana-red",
            error ? "border-danger" : "border-rossana-border",
            className,
          )}
          {...props}
        />
        {error ? (
          <p id={`${inputId}-error`} className="text-sm text-danger">
            {error}
          </p>
        ) : hint ? (
          <p className="text-sm text-rossana-charcoal/60">{hint}</p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";
