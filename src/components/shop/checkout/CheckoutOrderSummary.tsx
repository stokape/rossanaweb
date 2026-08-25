"use client";

import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { formatSoles } from "@/lib/utils";
import { useCart } from "@/lib/cart/CartProvider";

export function CheckoutOrderSummary() {
  const { items, subtotal } = useCart();

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
      <div className="flex justify-between border-t border-rossana-border pt-4 text-base font-semibold">
        <span>Subtotal</span>
        <span className="text-rossana-red">{formatSoles(subtotal)}</span>
      </div>
      <p className="text-xs text-rossana-charcoal/50">El envío se calcula al confirmar tu pedido.</p>
    </Card>
  );
}
