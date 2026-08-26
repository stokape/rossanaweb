import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatSoles } from "@/lib/utils";
import type { ProductSummary } from "@/lib/queries/catalog";

/** Card de producto (Sección 9). Vertical, imagen 1:1, sin deformar
 * fotografías (object-contain para no recortar piezas de joyería). */
export function ProductCard({ product }: { product: ProductSummary }) {
  const hasDiscount =
    product.compareAtPrice != null && product.compareAtPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : 0;

  return (
    <Card className="group relative flex flex-col overflow-hidden p-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <button
        type="button"
        aria-label="Agregar a favoritos"
        className="absolute right-4 top-4 z-10 rounded-badge bg-rossana-warm-white/90 p-2 text-rossana-charcoal/60 hover:text-rossana-red"
      >
        <Heart className="size-4" />
      </button>

      <Link href={`/productos/${product.slug}`} className="flex flex-col gap-3">
        <div className="relative aspect-square overflow-hidden rounded-[10px] bg-rossana-ivory">
          {hasDiscount && (
            <Badge tone="red" className="absolute left-2 top-2 z-10">
              -{discountPct}%
            </Badge>
          )}
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-contain p-4"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-rossana-charcoal/30">
              Sin foto todavía
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 px-1 pb-1">
          <h3 className="text-sm font-medium text-rossana-charcoal line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-rossana-red">
              {formatSoles(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-rossana-charcoal/40 line-through">
                {formatSoles(product.compareAtPrice!)}
              </span>
            )}
          </div>
          {product.stockAvailable <= 0 && (
            <span className="text-xs font-medium text-rossana-charcoal/50">Agotado</span>
          )}
        </div>
      </Link>
    </Card>
  );
}
