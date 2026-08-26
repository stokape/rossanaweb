"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CartItemRow } from "@/components/shop/cart/CartItemRow";
import { CartSummary } from "@/components/shop/cart/CartSummary";
import { useCart } from "@/lib/cart/CartProvider";

// Carrito (Sección 25). El carrito de invitado vive en el navegador
// (ver ARCHITECTURE.md); por eso esta página es un Client Component.
export default function CarritoPage() {
  const { items, hydrated } = useCart();

  // El carrito vive en localStorage (Sección 25/ARCHITECTURE.md): no
  // existe hasta que el cliente hidrata. Mostrar un estado de carga en
  // vez de `null` evita un parpadeo en blanco (Sección 76).
  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-10 md:px-8" aria-busy="true">
        <div className="h-8 w-40 animate-pulse rounded bg-rossana-ivory" />
        <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[1fr_340px]">
          <div className="h-64 animate-pulse rounded-card bg-rossana-ivory" />
          <div className="h-64 animate-pulse rounded-card bg-rossana-ivory" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-4 px-4 py-24 text-center">
        <ShoppingBag className="size-12 text-rossana-charcoal/20" />
        <h1 className="font-display text-2xl font-semibold text-rossana-charcoal">
          Tu carrito está vacío
        </h1>
        <p className="max-w-sm text-rossana-charcoal/60">
          Descubre nuestra bisutería y agrega tus piezas favoritas.
        </p>
        <Button href="/productos" variant="primary">
          VER PRODUCTOS
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 md:px-8">
      <h1 className="font-display text-2xl font-semibold text-rossana-charcoal md:text-3xl">
        Carrito
      </h1>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[1fr_340px]">
        <div className="rounded-card border border-rossana-border bg-rossana-white px-5">
          {items.map((item) => (
            <CartItemRow key={item.productId} item={item} />
          ))}
        </div>

        <CartSummary />
      </div>
    </div>
  );
}
