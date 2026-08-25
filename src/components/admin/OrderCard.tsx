import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatSoles } from "@/lib/utils";
import { formatOrderStatus } from "@/lib/orderStatus";
import type { AdminOrderSummary } from "@/lib/queries/admin/orders";

export function OrderCard({ order }: { order: AdminOrderSummary }) {
  return (
    <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-rossana-charcoal">Pedido #{order.orderNumber}</p>
        <p className="text-sm text-rossana-charcoal/70">{order.buyerName}</p>
        <p className="text-sm text-rossana-charcoal/60">
          {order.firstItemLabel}
          {order.extraItemsCount > 0 && ` y ${order.extraItemsCount} más`}
        </p>
        <p className="mt-1 text-base font-semibold text-rossana-red">{formatSoles(order.total)}</p>
      </div>

      <div className="flex flex-col items-start gap-3 sm:items-end">
        <span className="text-sm font-medium text-rossana-charcoal">
          {formatOrderStatus(order.status)}
        </span>
        <Button href={`/admin/pedidos/${order.id}`} variant="secondary" size="sm">
          VER PEDIDO
        </Button>
      </div>
    </Card>
  );
}
