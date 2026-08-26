import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-card border border-rossana-border bg-rossana-warm-white shadow-soft",
        className,
      )}
      {...props}
    />
  );
}
