import Image from "next/image";
import Link from "next/link";
import type { CategorySummary } from "@/lib/queries/catalog";

export function CategoryCard({ category }: { category: CategorySummary }) {
  return (
    <Link
      href={`/categorias/${category.slug}`}
      className="group flex flex-col items-center gap-3 text-center"
    >
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-card border border-rossana-border bg-rossana-ivory">
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 33vw, 16vw"
          />
        ) : (
          <span className="font-display text-2xl italic text-rossana-gold">
            {category.name.charAt(0)}
          </span>
        )}
      </div>
      <span className="text-sm font-medium text-rossana-charcoal group-hover:text-rossana-red">
        {category.name}
      </span>
    </Link>
  );
}
