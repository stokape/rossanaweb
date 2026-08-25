import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Gift, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ValidateYapeCard } from "@/components/admin/ValidateYapeCard";
import { getOrderDetailForAdmin } from "@/lib/queries/admin/orders";
import { getSignedReceiptUrl } from "@/lib/queries/admin/receipt-url";
import { formatOrderStatus } from "@/lib/orderStatus";
import { formatSoles } from "@/lib/utils";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

// Detalle de pedido + Validar Yape (Sección 41).
export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrderDetailForAdmin(id);
  if (!order) notFound();

  const receiptUrl = order.receipt ? await getSignedReceiptUrl(order.receipt.fileUrl) : null;
  const whatsappHref = `https://wa.me/${order.buyerPhone.replace(/\D/g, "")}`;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/pedidos"
          className="inline-flex items-center gap-1 text-sm text-rossana-charcoal/60 hover:text-rossana-red"
        >
          <ArrowLeft className="size-4" /> Volver a pedidos
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-semibold text-rossana-charcoal md:text-3xl">
            Pedido #{order.orderNumber}
          </h1>
          <span className="text-sm font-medium text-rossana-charcoal">
            {formatOrderStatus(order.status)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-rossana-charcoal">Cliente</h2>
            <p className="text-sm text-rossana-charcoal">
              {order.buyerFirstName} {order.buyerLastName}
            </p>
            <p className="text-sm text-rossana-charcoal/60">{order.buyerEmail}</p>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-rossana-red hover:underline"
            >
              <MessageCircle className="size-4" /> {order.buyerPhone}
            </a>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-rossana-charcoal">Entrega</h2>
            <p className="text-sm text-rossana-charcoal">{order.shippingAddress}</p>
            <p className="text-sm text-rossana-charcoal/60">
              {order.shippingDistrict}, {order.shippingProvince}, {order.shippingDepartment}
            </p>
            {order.shippingReference && (
              <p className="mt-1 text-sm text-rossana-charcoal/60">Ref: {order.shippingReference}</p>
            )}
            {order.shippingInstructions && (
              <p className="text-sm text-rossana-charcoal/60">{order.shippingInstructions}</p>
            )}
          </Card>

          {order.isGift && (
            <Card className="flex flex-col gap-1 border-rossana-gold/40 p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-rossana-charcoal">
                <Gift className="size-4 text-rossana-gold" /> Es un regalo
              </h2>
              {order.giftRecipientName && (
                <p className="text-sm text-rossana-charcoal">Para: {order.giftRecipientName}</p>
              )}
              {order.giftRecipientPhone && (
                <p className="text-sm text-rossana-charcoal/60">{order.giftRecipientPhone}</p>
              )}
              {order.giftMessage && (
                <p className="mt-1 text-sm italic text-rossana-charcoal/70">“{order.giftMessage}”</p>
              )}
            </Card>
          )}

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-rossana-charcoal">Productos</h2>
            <div className="flex flex-col gap-2 text-sm">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-rossana-charcoal/70">
                    {item.productName} × {item.quantity}
                  </span>
                  <span className="text-rossana-charcoal">{formatSoles(item.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-col gap-1 border-t border-rossana-border pt-3 text-sm">
              <div className="flex justify-between text-rossana-charcoal/60">
                <span>Subtotal</span>
                <span>{formatSoles(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-rossana-charcoal/60">
                <span>Envío</span>
                <span>{formatSoles(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-rossana-charcoal">
                <span>Total</span>
                <span className="text-rossana-red">{formatSoles(order.total)}</span>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <ValidateYapeCard order={order} receiptUrl={receiptUrl} />
        </div>
      </div>
    </div>
  );
}
