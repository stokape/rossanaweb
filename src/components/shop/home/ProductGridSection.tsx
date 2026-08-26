import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/shop/ProductCard";
import type { ProductSummary } from "@/lib/queries/catalog";

interface ProductGridSectionProps {
  title: string;
  subtitle?: string;
  products: ProductSummary[];
  viewAllHref?: string;
  emptyMessage: string;
  tone?: "default" | "ivory";
}

/** Grilla de productos reutilizable para "Favoritos de Rossana"
 * (Sección 16), "Nuevos ingresos" y "Ofertas" (Sección 13). Nunca
 * rellena con productos falsos: si no hay datos, muestra un estado
 * vacío honesto (Sección 88). */
export function ProductGridSection({
  title,
  subtitle,
  products,
  viewAllHref,
  emptyMessage,
  tone = "default",
}: ProductGridSectionProps) {
  return (
    <section className={tone === "ivory" ? "bg-rossana-ivory" : undefined}>
      <div className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-rossana-charcoal md:text-3xl">
              {title}
            </h2>
            {subtitle && <p className="mt-2 text-rossana-charcoal/60">{subtitle}</p>}
          </div>
          {viewAllHref && products.length > 0 && (
            <Button href={viewAllHref} variant="tertiary" className="hidden sm:inline-flex">
              VER TODO
            </Button>
          )}
        </div>

        {products.length === 0 ? (
          <p className="rounded-card border border-dashed border-rossana-border bg-rossana-white px-6 py-10 text-center text-rossana-charcoal/50">
            {emptyMessage}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
