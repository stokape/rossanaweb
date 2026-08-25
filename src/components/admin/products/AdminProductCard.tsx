import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatSoles } from "@/lib/utils";
import type { AdminProductSummary } from "@/lib/queries/admin/products";

const STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
};

export function AdminProductCard({ product }: { product: AdminProductSummary }) {
  return (
    <Card className="flex items-center gap-4 p-4">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-[8px] bg-rossana-ivory">
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt={product.name} fill className="object-contain p-1" />
        ) : (
          <div className="flex h-full items-center justify-center text-[9px] text-rossana-charcoal/30">
            Sin foto
          </div>
        )}
      </div>

      <div className="flex-1">
        <p className="font-medium text-rossana-charcoal">{product.name}</p>
        <p className="text-sm text-rossana-charcoal/60">{formatSoles(product.price)}</p>
        <div className="mt-1 flex flex-wrap gap-2">
          <Badge tone="neutral">{STATUS_LABEL[product.status] ?? product.status}</Badge>
          <Badge tone={product.lowStock ? "warning" : "neutral"}>
            Stock: {product.stockAvailable}
          </Badge>
        </div>
      </div>

      <Button href={`/admin/productos/${product.id}/editar`} variant="secondary" size="sm">
        EDITAR
      </Button>
    </Card>
  );
}
