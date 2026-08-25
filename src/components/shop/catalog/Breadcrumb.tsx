import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-rossana-charcoal/60">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="size-3.5" aria-hidden />}
          {item.href ? (
            <Link href={item.href} className="hover:text-rossana-red">
              {item.label}
            </Link>
          ) : (
            <span className="text-rossana-charcoal">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
