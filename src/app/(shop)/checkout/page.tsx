"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckoutForm } from "@/components/shop/checkout/CheckoutForm";
import { CheckoutOrderSummary } from "@/components/shop/checkout/CheckoutOrderSummary";
import { CheckoutSteps } from "@/components/shop/checkout/CheckoutSteps";
import { useCart } from "@/lib/cart/CartProvider";

// Checkout invitado (Sección 26-28): sin pantalla de "¿tienes cuenta?",
// directo al formulario.
export default function CheckoutPage() {
  const { items, hydrated } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && items.length === 0) router.replace("/carrito");
  }, [hydrated, items.length, router]);

  if (!hydrated || items.length === 0) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-10 md:px-8" aria-busy="true">
        <div className="h-8 w-64 animate-pulse rounded bg-rossana-ivory" />
        <div className="mt-6 h-96 animate-pulse rounded-card bg-rossana-ivory" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 md:px-8">
      <CheckoutSteps current="datos" />
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_360px]">
        <CheckoutForm />
        <div className="md:order-last">
          <CheckoutOrderSummary />
        </div>
      </div>
    </div>
  );
}
