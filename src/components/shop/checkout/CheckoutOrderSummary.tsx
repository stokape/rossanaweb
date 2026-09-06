"use client";

import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { formatSoles } from "@/lib/utils";
import { useCart } from "@/lib/cart/CartProvider";

interface CheckoutOrderSummaryProps {
  /** Costo de envío en vivo (Sección 27/28), calculado en CheckoutForm
   * a medida que el comprador llena su dirección. `cost: null` con
   * `attempted: true` significa que ya escribió su dirección pero no
   * hay ninguna zona configurada para ella — nunca se inventa un
   * monto, se muestra "a coordinar contigo". */
  shippingCost?: number | null;
  shippingLoading?: boolean;
  shippingAttempted?: boolean;
}

export function CheckoutOrderSummary({
  shippingCost = null,
  shippingLoading = false,
  shippingAttempted = false,
}: CheckoutOrderSummaryProps) {
  const { items, subtotal } = useCart();

  const shippingLabel = shippingLoading
    ? "Calculando..."
    : shippingCost != null
      ? formatSoles(shippingCost)
      : shippingAttempted
        ? "A coordinar contigo"
        : "Ingresa tu dirección";

  return (
    <Card className="flex flex-col gap-4 p-5">
      <h2 className="text-lg font-semibold text-rossana-charcoal">Tu pedido</h2>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-3 text-sm">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-[8px] bg-rossana-ivory">
              {item.imageUrl && (
                <Image src={item.imageUrl} alt={item.name} fill className="object-contain p-1" />
              )}
            </div>
            <div className="flex-1">
              <p className="line-clamp-1 font-medium text-rossana-charcoal">{item.name}</p>
              <p className="text-rossana-charcoal/50">Cantidad: {item.quantity}</p>
            </div>
            <span className="font-medium text-rossana-charcoal">
              {formatSoles(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 border-t border-rossana-border pt-4 text-sm">
        <div className="flex justify-between text-rossana-charcoal/70">
          <span>Subtotal</span>
          <span>{formatSoles(subtotal)}</span>
        </div>
        <div className="flex justify-between text-rossana-charcoal/70">
          <span>Envío</span>
          <span>{shippingLabel}</span>
        </div>
      </div>

      <div className="flex justify-between border-t border-rossana-border pt-4 text-base font-semibold">
        <span>Total</span>
        <span className="text-rossana-red">{formatSoles(subtotal + (shippingCost ?? 0))}</span>
      </div>
      {shippingAttempted && shippingCost == null && !shippingLoading && (
        <p className="-mt-2 text-xs text-rossana-charcoal/50">
          Aún no tenemos una tarifa para tu zona — te la confirmamos por WhatsApp antes de tu envío.
        </p>
      )}
    </Card>
  );
}
