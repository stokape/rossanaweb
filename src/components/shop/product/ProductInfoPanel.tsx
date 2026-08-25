import { Badge } from "@/components/ui/Badge";
import { formatSoles } from "@/lib/utils";
import type { ProductDetail } from "@/lib/queries/product-detail";

export function ProductInfoPanel({ product }: { product: ProductDetail }) {
  const hasDiscount = product.compareAtPrice != null && product.compareAtPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : 0;

  const characteristics = [
    { label: "Material", value: product.material },
    { label: "Color", value: product.color },
    { label: "Medidas", value: product.dimensions },
    { label: "Peso", value: product.weightGrams ? `${product.weightGrams} g` : null },
  ].filter((c) => !!c.value);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-rossana-charcoal md:text-3xl">
          {product.name}
        </h1>
        <p className="mt-1 text-sm text-rossana-charcoal/50">SKU: {product.sku}</p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-2xl font-semibold text-rossana-red">
          {formatSoles(product.price)}
        </span>
        {hasDiscount && (
          <>
            <span className="text-base text-rossana-charcoal/40 line-through">
              {formatSoles(product.compareAtPrice!)}
            </span>
            <Badge tone="red">-{discountPct}%</Badge>
          </>
        )}
      </div>

      {product.stockAvailable > 0 ? (
        product.stockAvailable <= 5 && (
          <Badge tone="warning" className="w-fit">
            ¡Últimas {product.stockAvailable} unidades!
          </Badge>
        )
      ) : (
        <Badge tone="danger" className="w-fit">
          Agotado
        </Badge>
      )}

      {product.shortDescription && (
        <p className="text-base text-rossana-charcoal/80">{product.shortDescription}</p>
      )}

      {product.description && (
        <div className="whitespace-pre-line text-sm leading-relaxed text-rossana-charcoal/70">
          {product.description}
        </div>
      )}

      {characteristics.length > 0 && (
        <div className="rounded-card border border-rossana-border p-4">
          <h2 className="mb-2 text-sm font-semibold text-rossana-charcoal">Características</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {characteristics.map((c) => (
              <div key={c.label} className="contents">
                <dt className="text-rossana-charcoal/50">{c.label}</dt>
                <dd className="text-rossana-charcoal">{c.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
