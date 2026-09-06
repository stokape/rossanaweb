import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "tertiary" | "gold";
type Size = "default" | "sm";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  href?: undefined;
}

interface LinkButtonProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">,
    Pick<ButtonProps, "variant" | "size"> {
  href: string;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-button font-semibold " +
  "transition-[color,background-color,border-color,transform] duration-150 ease-[var(--ease-out)] " +
  "motion-safe:active:scale-[0.97] motion-reduce:transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-rossana-red focus-visible:ring-offset-2 disabled:opacity-50 " +
  "disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-rossana-red text-rossana-warm-white hover:bg-rossana-burgundy active:bg-rossana-burgundy",
  secondary:
    "bg-transparent border border-rossana-red text-rossana-red hover:bg-rossana-red hover:text-rossana-warm-white",
  tertiary:
    "bg-transparent text-rossana-red hover:underline underline-offset-4 px-2",
  gold: "bg-rossana-gold text-rossana-charcoal hover:bg-rossana-champagne hover:text-rossana-burgundy",
};

const sizes: Record<Size, string> = {
  default: "h-12 md:h-[52px] px-6 text-base",
  sm: "h-10 px-4 text-sm",
};

export function Button(props: ButtonProps | LinkButtonProps) {
  if ("href" in props && props.href) {
    const { href, variant = "primary", size = "default", className, children, ...anchorProps } = props;
    return (
      <Link
        href={href}
        className={cn(base, variants[variant], sizes[size], className)}
        {...anchorProps}
      >
        {children}
      </Link>
    );
  }

  const {
    variant = "primary",
    size = "default",
    loading = false,
    disabled,
    className,
    children,
    ...buttonProps
  } = props as ButtonProps;

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      aria-busy={loading}
      {...buttonProps}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
