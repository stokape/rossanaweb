import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type Tone = "red" | "gold" | "success" | "warning" | "danger" | "neutral";

const tones: Record<Tone, string> = {
  red: "bg-rossana-red text-rossana-warm-white",
  gold: "bg-rossana-gold text-rossana-charcoal",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  neutral: "bg-rossana-charcoal/5 text-rossana-charcoal",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-badge px-3 py-1 text-xs font-semibold",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
