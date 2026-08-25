"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatSoles } from "@/lib/utils";
import { useCart } from "@/lib/cart/CartProvider";

/** Resumen del carrito (Sección 25). El envío se calcula recién en el
 * checkout (depende de departamento/provincia/distrito), así que aquí
 * se muestra como pendiente en vez de inventar un monto. */
export function CartSummary() {
  const { subtotal, totalCount } = useCart();

  return (
    <Card className="flex flex-col gap-4 p-5">
      <h2 className="text-lg font-semibold text-rossana-charcoal">Resumen</h2>

      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between text-rossana-charcoal/70">
          <span>Subtotal ({totalCount} {totalCount === 1 ? "producto" : "productos"})</span>
          <span>{formatSoles(subtotal)}</span>
        </div>
        <div className="flex justify-between text-rossana-charcoal/50">
          <span>Envío</span>
          <span>Se calcula en el siguiente paso</span>
        </div>
      </div>

      <div className="flex justify-between border-t border-rossana-border pt-4 text-base font-semibold text-rossana-charcoal">
        <span>Total</span>
        <span className="text-rossana-red">{formatSoles(subtotal)}</span>
      </div>

      <Button href="/checkout" variant="primary" className="w-full">
        FINALIZAR COMPRA
      </Button>
      <Button href="/productos" variant="tertiary" className="w-full justify-center">
        SEGUIR COMPRANDO
      </Button>
    </Card>
  );
}
